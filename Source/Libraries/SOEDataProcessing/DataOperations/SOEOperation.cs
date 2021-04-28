//******************************************************************************************************
//  SOEOperation.cs - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  04/06/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************


using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using GSF;
using GSF.Data;
using SOEDataProcessing.DataResources;
using SOEDataProcessing.DataSets;
using GSF.Data.Model;
using SOE.Model;
using System.Data;
using DbSOE = SOE.Model.SOE;
using System.Threading;

namespace SOEDataProcessing.DataOperations
{
    public class SOEOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Fields
        private double m_timeTolerance;
        private static Mutex s_mutex = new Mutex();

        #endregion

        #region [ Constructors ]
        static SOEOperation() {
        }

        #endregion

        #region [ Properties ]

        [Setting]
        public double TimeTolerance
        {
            get
            {
                return m_timeTolerance;
            }
            set
            {
                m_timeTolerance = value;
            }
        }

        #endregion

        #region [ Methods ]
        public override void Execute(MeterDataSet meterDataSet)
        {
            s_mutex.WaitOne(TimeSpan.FromMinutes(5));
            try
            {
                using (AdoDataConnection connection = meterDataSet.CreateDbConnection())
                {
                    TableOperations<Event> eventTable = new TableOperations<Event>(connection);
                    Event evt = eventTable.QueryRecordWhere("MeterID = {0} AND StartTime = {1} AND Endtime = {2}", meterDataSet.Meter.ID, meterDataSet.FileGroup.DataStartTime.ToString("yyyy-MM-dd HH:mm:ss.fffffff"), meterDataSet.FileGroup.DataEndTime.ToString("yyyy-MM-dd HH:mm:ss.fffffff"));

                    if (evt == null) return;

                    TableOperations<Incident> incidentTable = new TableOperations<Incident>(connection);
                    Incident incident1 = incidentTable.QueryRecordWhere("ID = {0}", evt.IncidentID);
                    DataTable query = connection.RetrieveData("SELECT * FROM GetNearbyIncidentsByCircuit({0},{1},{2},{3})", meterDataSet.Meter.CircuitID, incident1.StartTime, incident1.EndTime, m_timeTolerance);

                    IEnumerable<Incident> incidents = query.Select().Select(row => incidentTable.LoadRecord(row));

                    if (incidents.Count() == 0) return; // if no icidents reported, unlikely 
                    else if (incidents.Select(i => i.MeterID).Distinct().Count() <= 3) return;  // SOE must include more than 3 devices

                    DateTime startTime = incidents.OrderBy(x => x.StartTime).First().StartTime;
                    DateTime endTime = incidents.OrderBy(x => x.EndTime).Last().EndTime;

                    if (endTime.Subtract(startTime).TotalSeconds <= 3) return; // SOE must be longer than 3 seconds

                    TableOperations<SOEIncident> soeIncidentTable = new TableOperations<SOEIncident>(connection);
                    TableOperations<DbSOE> soeTable = new TableOperations<DbSOE>(connection);

                    IEnumerable<SOEIncident> sOEIncidents = soeIncidentTable.QueryRecordsWhere($"IncidentID IN ({string.Join(",", incidents.Select(i => i.ID))})");
                    IEnumerable<DbSOE> soes = new List<DbSOE>();
                    if (sOEIncidents.Count() > 0)
                        soes = soeTable.QueryRecordsWhere($"ID IN ({string.Join(",", sOEIncidents.Select(i => i.SOEID).Distinct())}) AND Name IS NULL");

                    if (soes.Count() == 0)  // if there are no current soes, simply create one and add incidents to it.
                        CreateNewSOE(startTime, endTime, incidents);
                    else if (soes.Count() == 1)  // if there is soe, either update it or split it into two
                    {
                        DbSOE soe = soes.First();
                        IEnumerable<SOEIncident> incsAlreadyAttr = sOEIncidents.Where(x => x.SOEID == soe.ID);

                        if (incsAlreadyAttr.Select(x => incidents.Select(y => y.ID).Contains(x.IncidentID)).All(x => x))  // if all incidents already attributed to SOE exist in new set of incidents 
                        {
                            AddNewSOEIncidents(incidents.Where(x => !incsAlreadyAttr.Select(y => y.IncidentID).Contains(x.ID)), soe.ID);
                            // update soe record to match new incident window
                            UpdateSOE(soe, startTime, endTime);
                        }
                        else
                        {  // if matches criteria, split soe into multiple SOEs  

                            // Get incidents that are attributed to SOE Record but did not return in list from Stored Procedure
                            IEnumerable<Incident> incsAlreadyAttrRecords = incidentTable.QueryRecordsWhere($"ID IN ({string.Join(",", incsAlreadyAttr.Select(i => i.IncidentID))})");

                            IEnumerable<Incident> excludedIncidents = incsAlreadyAttrRecords.Where(x => !incidents.Select(y => y.ID).Contains(x.ID));
                            int countOfExcluded = excludedIncidents.Select(x => x.MeterID).Distinct().Count();
                            DateTime exStartTime = excludedIncidents.OrderBy(x => x.StartTime).First().StartTime;
                            DateTime exEndTime = excludedIncidents.OrderBy(x => x.EndTime).Last().EndTime;

                            if (exEndTime.Subtract(exStartTime).TotalSeconds <= 3 || countOfExcluded <= 3) // if the excluded incidents do not meet requiremnts for a new soe 
                            {
                                // remove all exluded events
                                RemoveSOEIncidents(excludedIncidents, incsAlreadyAttr, soe.ID);

                                // add all included events not accounted for
                                AddNewSOEIncidents(incidents.Where(x => !incsAlreadyAttr.Select(y => y.IncidentID).Contains(x.ID)), soe.ID);

                                // update soe record to match new incident window
                                UpdateSOE(soe, startTime, endTime);

                            }
                            else if (exStartTime <= startTime) // if the excluded incidents happened first, let them keep old SOE record and create a new one for included incidents
                            {
                                // remove all included events
                                RemoveSOEIncidents(incidents.Where(x => !incsAlreadyAttr.Select(y => y.IncidentID).Contains(x.ID)), incsAlreadyAttr, soe.ID);

                                // update soe record to match new incident window
                                UpdateSOE(soe, exStartTime, exEndTime);

                                // create new record for set of incidents
                                CreateNewSOE(startTime, endTime, incidents);
                            }
                            else // if the included incidents happened first, let them keep old SOE record and create a new one for excluded incidents
                            {
                                // remove all excluded incidents
                                RemoveSOEIncidents(excludedIncidents, incsAlreadyAttr, soe.ID);

                                // add all included events not accounted for
                                AddNewSOEIncidents(incidents.Where(x => !incsAlreadyAttr.Select(y => y.IncidentID).Contains(x.ID)), soe.ID);

                                // update soe record to match new incident window
                                UpdateSOE(soe, startTime, endTime);

                                // create new record for set of incidents
                                CreateNewSOE(exStartTime, exEndTime, excludedIncidents);
                            }
                        }
                    }
                    else
                    {  // if there are multiple SOEs that include incidents we need to remove them from the old SOEs and put them in a new SOE
                        bool soeExists = false;
                        foreach (DbSOE soe in soes)
                        {
                            IEnumerable<SOEIncident> incidentsForSOE = sOEIncidents.Where(x => x.SOEID == soe.ID);
                            IEnumerable<Incident> incidentsForSOERecords = incidentTable.QueryRecordsWhere($"ID IN ({string.Join(",", incidentsForSOE.Select(i => i.IncidentID))})");
                            IEnumerable<Incident> excludedIncidents = incidentsForSOERecords.Where(x => !incidents.Select(y => y.ID).Contains(x.ID));
                            int countOfExcluded = excludedIncidents.Select(x => x.MeterID).Distinct().Count();
                            DateTime exStartTime = excludedIncidents.OrderBy(x => x.StartTime).First().StartTime;
                            DateTime exEndTime = excludedIncidents.OrderBy(x => x.EndTime).Last().EndTime;

                            if (exEndTime.Subtract(exStartTime).TotalSeconds <= 3 || countOfExcluded <= 3) // if the excluded incidents do not meet requiremnts to exist as soe remove them and use this soe for new incidents
                            {
                                // remove all exluded events
                                RemoveSOEIncidents(excludedIncidents, incidentsForSOE, soe.ID);

                                if (!soeExists) // if you havent already created an soe for the incidents, shim them here
                                {
                                    // add all included events not accounted for
                                    AddNewSOEIncidents(incidents.Where(x => !incidentsForSOE.Select(y => y.IncidentID).Contains(x.ID)), soe.ID);

                                    // update soe record to match new incident window
                                    UpdateSOE(soe, startTime, endTime);

                                    soeExists = true;
                                }
                            }
                            else
                            {
                                // remove all included events and  update SOE metadata
                                RemoveSOEIncidents(incidents, incidentsForSOE, soe.ID);
                                UpdateSOE(soe, exStartTime, exEndTime);

                            }


                        }

                        // if we didn't shim the incidents into an old SOE record, create a new one here
                        if (!soeExists)
                        {
                            CreateNewSOE(startTime, endTime, incidents);
                        }

                    }

                }
            }
            finally
            {
                CleanupSOE();
                s_mutex.ReleaseMutex();
            }
        }

        private void CleanupSOE()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                TableOperations<DbSOE> soeTable = new TableOperations<DbSOE>(connection);

                IEnumerable<DbSOE> soes = soeTable.QueryRecordsWhere("ID NOT IN (SELECT SOEID FROM SOEIncident)");
                foreach (DbSOE soe in soes)
                    soeTable.DeleteRecord(soe);
            }

        }



        private void CreateNewSOE(DateTime startTime, DateTime endTime, IEnumerable<Incident> incidents) {
            using(AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                TableOperations<DbSOE> soeTable = new TableOperations<DbSOE>(connection);

                DbSOE newSoe = new DbSOE();
                newSoe.StartTime = startTime;
                newSoe.EndTime = endTime;
                newSoe.Name = null;
                newSoe.Status = "MakeReplay";
                soeTable.AddNewRecord(newSoe);
                int soeID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");

                AddNewSOEIncidents(incidents, soeID);

            }

        }

        private void UpdateSOE(DbSOE soe, DateTime startTime, DateTime endTime) {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                TableOperations<DbSOE> soeTable = new TableOperations<DbSOE>(connection);

                soe.StartTime = startTime;
                soe.EndTime = endTime;
                soe.Status = "MakeReplay";
                soeTable.UpdateRecord(soe);
            }

        }

        private void AddNewSOEIncidents(IEnumerable<Incident> incidents, int soeID ) {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                TableOperations<SOEIncident> soeIncidentTable = new TableOperations<SOEIncident>(connection);

                foreach (Incident incident in incidents)
                {
                    SOEIncident record = new SOEIncident();
                    record.SOEID = soeID;
                    record.IncidentID = incident.ID;
                    soeIncidentTable.AddNewRecord(record);
                }

            }

        }

        private void RemoveSOEIncidents(IEnumerable<Incident> incidents, IEnumerable<SOEIncident> soeIncidents, int soeID)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                TableOperations<SOEIncident> soeIncidentTable = new TableOperations<SOEIncident>(connection);

                foreach (Incident incident in incidents)
                {
                    SOEIncident record = soeIncidents.First(x => x.SOEID == soeID && x.IncidentID == incident.ID);
                    if (record != null)
                        soeIncidentTable.DeleteRecord(record);
                }
            }

        }

        #endregion
    }
}
