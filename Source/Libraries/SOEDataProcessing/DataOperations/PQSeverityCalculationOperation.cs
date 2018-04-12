//******************************************************************************************************
//  PQSeverityCalculationOperation.cs - Gbtc
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
using SOEDataProcessing.DataResources;
using SOEDataProcessing.DataAnalysis;
using System.Configuration;

namespace SOEDataProcessing.DataOperations
{
    public class PQSeverityCalculationOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Fields
        private double m_systemFrequency;
        #endregion

        #region [ Properties ]

        [Setting]
        public double SystemFrequency
        {
            get
            {
                return m_systemFrequency;
            }
            set
            {
                m_systemFrequency = value;
            }
        }
        #endregion

        #region [ Methods ]

        public override void Execute(MeterDataSet meterDataSet)
        {
            Log.Info("Calculating PQ Severity for file.");

            using (AdoDataConnection connection = meterDataSet.CreateDbConnection())
            {
                Load(connection, meterDataSet);
            }
        }

        private void Load(AdoDataConnection connection, MeterDataSet meterDataSet)
        {
            DataGroupsResource dataGroupsResource = meterDataSet.GetResource<DataGroupsResource>();

            TableOperations<Incident> incidentAdapter = new TableOperations<Incident>(connection);
            Incident incident = incidentAdapter.QueryRecordWhere("ID IN (SELECT DISTINCT IncidentID FROM Event WHERE FileGroupID = {0})", meterDataSet.FileGroup.ID);
            if (incident == null) return;

            string query = @"SELECT
	                            RotatedCycleData.Timestamp, RotatedCycleData.VXARMS, RotatedCycleData.VXBRMS, RotatedCycleData.VXCRMS, SOEPoint.UpState, Line.VoltageKV
                             FROM
	                             Event JOIN
	                             Meter ON Event.MeterID = Meter.ID JOIN
                                 Line ON Event.LineID = Line.ID JOIN
	                             RotatedCycleData ON Event.ID = RotatedCycleData.EventID LEFT JOIN
	                             SOEPoint ON RotatedCycleData.ID = SOEPoint.CycleDataID
                             WHERE Event.IncidentID = {0}
                             Order BY RotatedCycleData.Timestamp";

            DataTable table = connection.RetrieveData(query, incident.ID);

            double valueA = 0;
            double valueB = 0;
            double valueC = 0;
            string previousState = string.Empty;

            foreach (DataRow row in table.Rows) {
                int index = table.Rows.IndexOf(row);
                double nominal = (double)row["VoltageKV"] * 1000.0D / Math.Sqrt(3.0D);
                double perUnitA = (double)row["VXARMS"] / nominal;
                double perUnitB = (double)row["VXBRMS"] / nominal;
                double perUnitC = (double)row["VXCRMS"] / nominal;
                string state = row["UpState"].ToString();

                if (state == string.Empty && previousState == string.Empty)
                    continue;
                else if (state == string.Empty && previousState != string.Empty)
                    state = previousState;
                else
                    previousState = state;

                valueA += GetDisturbanceEnergyForCycle('A', state, perUnitA);
                valueB += GetDisturbanceEnergyForCycle('B', state, perUnitB);
                valueC += GetDisturbanceEnergyForCycle('C', state, perUnitC);

            }
            incident.PQS = (new List<double>() { valueA, valueB, valueC }).Max();
            incidentAdapter.UpdateRecord(incident);
        }

        private double GetDisturbanceEnergyForCycle(char phase, string state, double perUnitValue)
        {
            int phaseState;
            switch (phase)
            {              
                case 'A':
                    phaseState = int.Parse(state[0].ToString());
                    break;
                case 'B':
                    phaseState = int.Parse(state[2].ToString());
                    break;
                case 'C':
                    phaseState = int.Parse(state[1].ToString());
                    break;
                default:
                    return 0;
                
            }

            if (phaseState == 1)
                return 0;
            else if (phaseState == 3)
                return (perUnitValue * perUnitValue - 1) / SystemFrequency;
            else
                return (1 - perUnitValue * perUnitValue) / SystemFrequency;

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
