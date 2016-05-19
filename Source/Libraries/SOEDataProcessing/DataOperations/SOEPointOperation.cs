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
using SOEDataProcessing.Database;
using SOEDataProcessing.Database.MeterDataTableAdapters;
using SOEDataProcessing.DataSets;

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

        public override void Prepare(DbAdapterContainer dbAdapterContainer)
        {
        }

        public override void Execute(MeterDataSet meterDataSet)
        {
            m_fileGroupID = meterDataSet.FileGroup.ID;
            m_orientation = meterDataSet.Meter.Orientation;
        }

        public override void Load(DbAdapterContainer dbAdapterContainer)
        {
            EventTableAdapter eventAdapter = dbAdapterContainer.GetAdapter<EventTableAdapter>();
            MeterData.EventDataTable eventTable = eventAdapter.GetDataByFileGroup(m_fileGroupID);
            MeterData.SOEPointDataTable soePointTable = new MeterData.SOEPointDataTable();
            MeterData.RotatedCycleDataDataTable cycleDataTable;
            string query;

            using (AdoDataConnection database = new AdoDataConnection(dbAdapterContainer.Connection, typeof(SqlDataAdapter), false))
            {
                List<int> incidentIDs = Enumerable.Select(eventTable, row => row.IncidentID).Distinct().ToList();
                query = $"SELECT * FROM Event WHERE IncidentID IN ({string.Join(",", incidentIDs)})";
                eventTable = new MeterData.EventDataTable();
                eventTable.Merge(database.RetrieveData(query));

                string eventIDs = string.Join(",", Enumerable.Select(eventTable, row => row.ID));
                database.ExecuteNonQuery($"DELETE FROM SOEPoint WHERE CycleDataID IN (SELECT ID FROM CycleData WHERE EventID IN ({eventIDs}))");

                query = $"SELECT " +
                        $"    Event.ID, " +
                        $"    Line.VoltageKV " +
                        $"FROM " +
                        $"    Event JOIN " +
                        $"    Line ON Event.LineID = Line.ID " +
                        $"WHERE Event.ID IN ({eventIDs})";

                Dictionary<int, double> lineKVLookup = database.RetrieveData(query).Rows
                    .Cast<DataRow>()
                    .ToDictionary(row => row.ConvertField<int>("ID"), row => row.ConvertField<double>("VoltageKV"));

                foreach (int incidentID in incidentIDs)
                {
                    string previousState = null;

                    query = $"SELECT * FROM RotatedCycleData WHERE EventID IN (SELECT ID FROM Event WHERE IncidentID = {incidentID}) ORDER BY Timestamp";
                    cycleDataTable = new MeterData.RotatedCycleDataDataTable();
                    cycleDataTable.Merge(database.RetrieveData(query));

                    foreach (MeterData.RotatedCycleDataRow row in cycleDataTable)
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

                        string breakerElementA =
                            (upState[0] == 0) ? "5" :
                            (downState[0] == 0) ? "0" :
                            (row.IARMS < 700.0D) ? "1" :
                            "4";

                        string breakerElementC =
                            (upState[1] == 0) ? "5" :
                            (downState[1] == 0) ? "0" :
                            (row.ICRMS < 700.0D) ? "1" :
                            "4";

                        string breakerElementB =
                            (upState[2] == 0) ? "5" :
                            (downState[2] == 0) ? "0" :
                            (row.IBRMS < 700.0D) ? "1" :
                            "4";

                        string statusElement =
                            ((object)faultType != null) ? "11" :
                            (upState != "000" && downState.Contains("0")) ? "03" :
                            "00";

                        string state = upState + downState + statusElement + breakerElementA + breakerElementB + breakerElementC;

                        if (state != previousState)
                            soePointTable.AddSOEPointRow(row.ID, statusElement, breakerElementA, breakerElementB, breakerElementC, upState, downState, faultType);

                        previousState = state;
                    }
                }
            }

            BulkLoader bulkLoader = new BulkLoader();
            bulkLoader.Connection = dbAdapterContainer.Connection;
            bulkLoader.CommandTimeout = dbAdapterContainer.CommandTimeout;
            bulkLoader.Load(soePointTable);
        }

        private string GetVoltageState(double rms, double lineKV)
        {
            double nominal = lineKV * 1000.0D / Math.Sqrt(3.0D);
            double perUnit = rms / nominal;

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
