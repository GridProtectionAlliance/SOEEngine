//******************************************************************************************************
//  SOEPointOperation.cs - Gbtc
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
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using GSF.Data;
using SOEDataProcessing.DataSets;
using SOE.Model;
using GSF.Data.Model;
using GSF;
using log4net;

namespace SOEDataProcessing.DataOperations
{
    public class LTECalculationOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Fields

        #endregion

        #region [ Methods ]

        public override void Execute(MeterDataSet meterDataSet)
        {
            Log.Info("Calculating LTE for file.");

            using (AdoDataConnection connection = meterDataSet.CreateDbConnection())
            {
                Load(connection, meterDataSet);
            }
        }

        private void Load(AdoDataConnection connection, MeterDataSet meterDataSet)
        {
            TableOperations<Incident> incidentAdapter = new TableOperations<Incident>(connection);
            Incident incident = incidentAdapter.QueryRecordWhere("ID IN (SELECT DISTINCT IncidentID FROM Event WHERE FileGroupID = {0})", meterDataSet.FileGroup.ID);
            if (incident == null) return;

            string query = @"SELECT CycleData.TimeStamp, SOEPoint.FaultType
                             FROM
                                 Event JOIN
                                 CycleData ON Event.id = CycleData.EventID JOIN
                                 SOEPoint ON CycleData.ID = SOEPoint.CycleDataID
                             WHERE Event.IncidentID = " + incident.ID + @"
                             ORDER BY CycleData.Timestamp";

            DataTable table = connection.RetrieveData(query);

            DateTime start = default(DateTime);
            double? value = null;

            foreach (DataRow row in table.Rows) {
                if (start == default(DateTime) && row["FaultType"].ToString() != "")
                    start = (DateTime)row["TimeStamp"];
                else if (start != default(DateTime) && row["FaultType"].ToString() == "") {
                    DateTime end = (DateTime)row["TimeStamp"];
                    string query2 = @"SELECT MAX(I1RMS) as I1RMS, MAX(I2RMS)as I2RMS, MAX(I3RMS) as I3RMS
                                      FROM 
	                                      Event JOIN
	                                      CycleData ON Event.ID = CycleData.EventID
                                      WHERE Event.IncidentID = {0} AND CycleData.TimeStamp BETWEEN {1} AND {2}
                                        ";
                    DataTable table2 = connection.RetrieveData(query2, incident.ID, ToDateTime2(connection,start), ToDateTime2(connection, end));
                    double max = table2.Select().Select(x => new List<double>(){ (double)x["I1RMS"], (double)x["I2RMS"], (double)x["I3RMS"]}).FirstOrDefault().Max();
                    double calc = max * max * (end - start).TotalSeconds;
                    if (value == null || calc > value) value = calc;

                    start = default(DateTime);
                }
                else
                    continue;
            }

            incident.LTE = value;
            incidentAdapter.UpdateRecord(incident);
        }

        private IDbDataParameter ToDateTime2(AdoDataConnection connection, DateTime dateTime)
        {
            using (IDbCommand command = connection.Connection.CreateCommand())
            {
                IDbDataParameter parameter = command.CreateParameter();
                parameter.DbType = DbType.DateTime2;
                parameter.Value = dateTime;
                return parameter;
            }
        }

        #endregion

        #region [ Static ]

        // Static Fields
        private static readonly ILog Log = LogManager.GetLogger(typeof(LTECalculationOperation));

        #endregion

    }
}
