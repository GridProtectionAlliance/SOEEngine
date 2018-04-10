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

namespace SOEDataProcessing.DataOperations
{
    public class SOEPointOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Fields
        private int m_fileGroupID;
        private string m_orientation;

        #endregion

        #region [ Methods ]

        public override void Execute(MeterDataSet meterDataSet)
        {
            m_fileGroupID = meterDataSet.FileGroup.ID;
            m_orientation = meterDataSet.Meter.Orientation;
            using (AdoDataConnection connection = meterDataSet.CreateDbConnection())
            {
                Load(connection);
            }
        }

        private void Load(AdoDataConnection connection)
        {
            TableOperations<Event> eventAdapter = new TableOperations<Event>(connection);
            TableOperations<SOEPoint> soePointAdapter = new TableOperations<SOEPoint>(connection);
            TableOperations<CycleData> cycleDataAdapter = new TableOperations<CycleData>(connection);
            TableOperations<RotatedCycleData> rotatedCycleDataAdapter = new TableOperations<RotatedCycleData>(connection);

            IEnumerable<Event> eventTable = eventAdapter.QueryRecordsWhere("FileGroupID = {0}", m_fileGroupID);
            string query;

            List<int> incidentIDs = eventTable.Select(row => row.IncidentID).Distinct().ToList();
            if (incidentIDs.Any())
            {
                eventTable = eventAdapter.QueryRecordsWhere($"IncidentID IN ({string.Join(", ", incidentIDs)})");

                string eventIDs = string.Join(",", Enumerable.Select(eventTable, row => row.ID));
                connection.ExecuteNonQuery($"DELETE FROM SOEPoint WHERE CycleDataID IN (SELECT ID FROM CycleData WHERE EventID IN ({eventIDs}))");

                query = $"SELECT " +
                        $"    Event.ID, " +
                        $"    Line.VoltageKV " +
                        $"FROM " +
                        $"    Event JOIN " +
                        $"    Line ON Event.LineID = Line.ID " +
                        $"WHERE Event.ID IN ({eventIDs})";

                Dictionary<int, double> lineKVLookup = connection.RetrieveData(query).Rows
                    .Cast<DataRow>()
                    .ToDictionary(row => row.ConvertField<int>("ID"), row => row.ConvertField<double>("VoltageKV"));

                List<RotatedCycleData> cycleDataTable = new List<RotatedCycleData>();
                foreach (int incidentID in incidentIDs)
                {
                    string previousState = null;
                    cycleDataTable.AddRange(rotatedCycleDataAdapter.QueryRecordsWhere("EventID IN (SELECT ID FROM Event WHERE IncidentID = {0})", incidentID).OrderBy(x => x.Timestamp));

                    foreach (RotatedCycleData row in cycleDataTable)
                    {
                        double lineKV;

                        if (!lineKVLookup.TryGetValue(row.EventID, out lineKV))
                            continue;

                        string xState =
                            GetVoltageState(row.VXARMS, lineKV) +
                            GetVoltageState(row.VXCRMS, lineKV) +
                            GetVoltageState(row.VXBRMS, lineKV);

                        string yState =
                            GetVoltageState(row.VYARMS, lineKV) +
                            GetVoltageState(row.VYCRMS, lineKV) +
                            GetVoltageState(row.VYBRMS, lineKV);

                        string upState = (m_orientation == "XY") ? xState : yState;
                        string downState = (m_orientation == "XY") ? yState : xState;

                        string faultType =
                            (row.IARMS > 700.0D && row.ICRMS > 700.0D && row.IBRMS > 700.0D && row.IRRMS > 300.0D) ? "ACBN" :
                            (row.IARMS > 700.0D && row.ICRMS > 700.0D && row.IBRMS > 700.0D) ? "ACB" :
                            (row.IARMS > 700.0D && row.ICRMS > 700.0D && row.IRRMS > 700.0D) ? "ACN" :
                            (row.ICRMS > 700.0D && row.IBRMS > 700.0D && row.IRRMS > 700.0D) ? "CBN" :
                            (row.IARMS > 700.0D && row.IBRMS > 700.0D && row.IRRMS > 700.0D) ? "ABN" :
                            (row.IARMS > 700.0D && row.ICRMS > 700.0D) ? "AC" :
                            (row.ICRMS > 700.0D && row.IBRMS > 700.0D) ? "CB" :
                            (row.IARMS > 700.0D && row.IBRMS > 700.0D) ? "AB" :
                            (row.IARMS > 700.0D) ? "AN" :
                            (row.ICRMS > 700.0D) ? "CN" :
                            (row.IBRMS > 700.0D) ? "BN" :
                            null;

                        char breakerElementA =
                            (upState[0] == '0') ? '5' :
                            (downState[0] == '0') ? '0' :
                            (row.IARMS < 700.0D) ? '1' :
                            '4';

                        char breakerElementC =
                            (upState[1] == '0') ? '5' :
                            (downState[1] == '0') ? '0' :
                            (row.ICRMS < 700.0D) ? '1' :
                            '4';

                        char breakerElementB =
                            (upState[2] == '0') ? '5' :
                            (downState[2] == '0') ? '0' :
                            (row.IBRMS < 700.0D) ? '1' :
                            '4';

                        string statusElement =
                            ((object)faultType != null) ? "11" :
                            (upState != "000" && downState.Contains("0")) ? "03" :
                            "00";

                        string state = upState + downState + statusElement + breakerElementA + breakerElementB + breakerElementC;

                        if (state != previousState)
                            soePointAdapter.AddNewRecord(new SOEPoint()
                            {
                                CycleDataID = row.ID,
                                StatusElement = statusElement,
                                BreakerElementA = breakerElementA,
                                BreakerElementB = breakerElementB,
                                BreakerElementC = breakerElementC,
                                UpState = upState,
                                DownState = downState,
                                FaultType = faultType
                            });

                        previousState = state;
                    }
                }
            }
        }

        private string GetVoltageState(double? rms, double lineKV)
        {
            if (rms == null) return "1";

            double nominal = lineKV * 1000.0D / Math.Sqrt(3.0D);
            double perUnit = (double)rms / nominal;

            if (perUnit <= 0.1D)
                return "0";

            if (perUnit <= 0.9D)
                return "2";

            if (perUnit >= 1.1D)
                return "3";

            return "1";
        }

        #endregion
    }
}
