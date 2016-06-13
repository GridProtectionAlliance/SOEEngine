//******************************************************************************************************
//  IncidentOperation.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  05/18/2016 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using GSF;
using GSF.Data;
using SOEDataProcessing.Database;
using SOEDataProcessing.Database.MeterDataTableAdapters;
using SOEDataProcessing.DataResources;
using SOEDataProcessing.DataSets;

namespace SOEDataProcessing.DataOperations
{
    public class IncidentOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Nested Types
        private class Incident
        {
            public DateTime StartTime;
            public DateTime EndTime;
            public List<MeterData.IncidentRow> ExistingIncidents = new List<MeterData.IncidentRow>();
        }

        // Fields
        private double m_timeTolerance;

        private DbAdapterContainer m_dbAdapterContainer;
        private List<Incident> m_incidents;
        private int m_meterID;

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

        public override void Prepare(DbAdapterContainer dbAdapterContainer)
        {
            m_dbAdapterContainer = dbAdapterContainer;
            m_incidents = new List<Incident>();
        }

        public override void Execute(MeterDataSet meterDataSet)
        {
            CycleDataResource cycleDataResource = CycleDataResource.GetResource(meterDataSet, m_dbAdapterContainer);
            DateTime startTime = cycleDataResource.DataGroups.Min(dataGroup => dataGroup.StartTime);
            DateTime endTime = cycleDataResource.DataGroups.Max(dataGroup => dataGroup.EndTime);

            IncidentTableAdapter incidentAdapter = m_dbAdapterContainer.GetAdapter<IncidentTableAdapter>();
            MeterData.IncidentDataTable incidentTable = incidentAdapter.GetNearbyIncidents(meterDataSet.Meter.ID, startTime, endTime, m_timeTolerance);

            IEnumerable<Range<DateTime>> ranges = incidentTable.Select(incident => ToRange(incident.StartTime, incident.EndTime))
                .Concat(cycleDataResource.DataGroups.Select(dataGroup => ToRange(dataGroup.StartTime, dataGroup.EndTime)));

            m_incidents = Range<DateTime>.MergeAllOverlapping(ranges)
                .Select(ToIncident)
                .ToList();

            foreach (Incident incident in m_incidents)
                incident.ExistingIncidents = incidentTable.Where(row => Overlaps(incident, row)).ToList();

            m_meterID = meterDataSet.Meter.ID;
        }

        public override void Load(DbAdapterContainer dbAdapterContainer)
        {
            MeterData.IncidentDataTable incidentTable = new MeterData.IncidentDataTable();

            foreach (Incident incident in m_incidents)
            {
                if (incident.ExistingIncidents.Count == 0 || incident.ExistingIncidents.Count > 1)
                    incidentTable.AddIncidentRow(m_meterID, incident.StartTime, incident.EndTime);
            }

            BulkLoader bulkLoader = new BulkLoader();
            bulkLoader.Connection = dbAdapterContainer.Connection;
            bulkLoader.CommandTimeout = dbAdapterContainer.CommandTimeout;
            bulkLoader.Load(incidentTable);

            List<Incident> expand = m_incidents
                .Where(incident => incident.ExistingIncidents.Count == 1)
                .ToList();

            List<Incident> cleanup = m_incidents
                .Where(incident => incident.ExistingIncidents.Count > 1)
                .ToList();

            if (expand.Count == 0 && cleanup.Count == 0)
                return;

            using (AdoDataConnection database = new AdoDataConnection(dbAdapterContainer.Connection, typeof(SqlDataAdapter), false))
            {
                foreach (Incident incident in expand)
                    database.ExecuteNonQuery("UPDATE Incident SET StartTime = {0}, EndTime = {1} WHERE ID = {2}", incident.StartTime, incident.EndTime, incident.ExistingIncidents[0].ID);

                foreach (Incident incident in cleanup)
                {
                    string incidentIDs = string.Join(",", incident.ExistingIncidents.Select(inc => inc.ID));
                    database.ExecuteNonQuery($"UPDATE Event SET IncidentID = (SELECT ID FROM Incident WHERE StartTime = {{0}} AND EndTime = {{1}}) WHERE IncidentID IN ({incidentIDs})", incident.StartTime, incident.EndTime);
                }

                if (cleanup.Count > 0)
                {
                    string allIncidentIDs = string.Join(",", cleanup
                        .SelectMany(incident => incident.ExistingIncidents)
                        .Select(incident => incident.ID));

                    database.ExecuteNonQuery($"DELETE FROM Incident WHERE ID IN ({allIncidentIDs})");
                }
            }
        }

        private Range<DateTime> ToRange(DateTime startTime, DateTime endTime)
        {
            DateTime start = startTime.AddSeconds(-m_timeTolerance / 2.0D);
            DateTime end = endTime.AddSeconds(m_timeTolerance / 2.0D);
            return new Range<DateTime>(start, end);
        }

        private Incident ToIncident(Range<DateTime> range)
        {
            return new Incident()
            {
                StartTime = range.Start.AddSeconds(m_timeTolerance / 2.0D),
                EndTime = range.End.AddSeconds(-m_timeTolerance / 2.0D)
            };
        }

        private bool Overlaps(Incident incident, MeterData.IncidentRow row)
        {
            Range<DateTime> incidentRange = ToRange(incident.StartTime, incident.EndTime);
            Range<DateTime> timeRange = ToRange(row.StartTime, row.EndTime);
            return incidentRange.Overlaps(timeRange);
        }

        #endregion
    }
}
