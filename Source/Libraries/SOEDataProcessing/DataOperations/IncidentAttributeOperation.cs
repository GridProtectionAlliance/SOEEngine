//******************************************************************************************************
//  IncidentAttributeOperation.cs - Gbtc
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
//  06/15/2016 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System.Data.SqlClient;
using System.Linq;
using GSF.Data;
using SOEDataProcessing.Database;
using SOEDataProcessing.Database.MeterDataTableAdapters;
using SOEDataProcessing.DataResources;
using SOEDataProcessing.DataSets;
using static SOEDataProcessing.Database.MeterData;

namespace SOEDataProcessing.DataOperations
{
    public class IncidentAttributeOperation : DataOperationBase<MeterDataSet>
    {
        private MeterDataSet m_meterDataSet;

        public override void Prepare(DbAdapterContainer dbAdapterContainer)
        {
        }

        public override void Execute(MeterDataSet meterDataSet)
        {
            m_meterDataSet = meterDataSet;
        }

        public override void Load(DbAdapterContainer dbAdapterContainer)
        {
            CycleDataResource cycleDataResource = CycleDataResource.GetResource(m_meterDataSet, dbAdapterContainer);
            IncidentTableAdapter incidentAdapter = dbAdapterContainer.GetAdapter<IncidentTableAdapter>();
            IncidentAttributeDataTable incidentAttributeTable = new IncidentAttributeDataTable();

            object[] incidentIDs = cycleDataResource.DataGroups
                .Select(dataGroup => incidentAdapter.GetIDByTime(m_meterDataSet.Meter.ID, dataGroup.StartTime))
                .Where(incidentID => incidentID.HasValue)
                .Select(incidentID => incidentID.GetValueOrDefault())
                .Distinct()
                .Cast<object>()
                .ToArray();

            if (!incidentIDs.Any())
                return;

            string formatString = string.Join(",", incidentIDs.Select((id, index) => $"{{{index}}}"));

            using (AdoDataConnection connection = new AdoDataConnection(dbAdapterContainer.Connection, typeof(SqlDataAdapter), false))
            {
                connection.ExecuteNonQuery(
                    $"WITH IMaxCycleData AS " +
                    $"( " +
                    $"    SELECT " +
                    $"        *, " +
                    $"        CASE " +
                    $"            WHEN IARMS > IBRMS AND IARMS > ICRMS THEN IARMS " +
                    $"            WHEN IBRMS > ICRMS THEN IBRMS " +
                    $"            ELSE ICRMS " +
                    $"        END AS IMax " +
                    $"    FROM RotatedCycleData " +
                    $"), MaxMin AS " +
                    $"( " +
                    $"    SELECT " +
                    $"        IncidentID, " +
                    $"        MAX(IMax) AS IMax, " +
                    $"        MAX(IARMS) AS IAMax, " +
                    $"        MAX(IBRMS) AS IBMax, " +
                    $"        MAX(ICRMS) AS ICMax, " +
                    $"        MAX(IRRMS) AS IRMax, " +
                    $"        CASE WHEN MAX(VXARMS) > MAX(VYARMS) THEN MAX(VXARMS) ELSE MAX(VYARMS) END AS VAMax, " +
                    $"        CASE WHEN MAX(VXBRMS) > MAX(VYBRMS) THEN MAX(VXBRMS) ELSE MAX(VYBRMS) END AS VBMax, " +
                    $"        CASE WHEN MAX(VXCRMS) > MAX(VYCRMS) THEN MAX(VXCRMS) ELSE MAX(VYCRMS) END AS VCMax, " +
                    $"        CASE WHEN MIN(VXARMS) < MIN(VYARMS) THEN MIN(VXARMS) ELSE MIN(VYARMS) END AS VAMin, " +
                    $"        CASE WHEN MIN(VXBRMS) < MIN(VYBRMS) THEN MIN(VXBRMS) ELSE MIN(VYBRMS) END AS VBMin, " +
                    $"        CASE WHEN MIN(VXCRMS) < MIN(VYCRMS) THEN MIN(VXCRMS) ELSE MIN(VYCRMS) END AS VCMin " +
                    $"    FROM " +
                    $"        IMaxCycleData JOIN " +
                    $"        Event ON IMaxCycleData.EventID = Event.ID " +
                    $"    GROUP BY IncidentID " +
                    $"), CycleDataFaultType AS " +
                    $"( " +
                    $"    SELECT  " +
                    $"        Event.IncidentID, " +
                    $"        ( " +
                    $"            SELECT TOP 1 FaultType " +
                    $"            FROM " +
                    $"                SOEPoint JOIN " +
                    $"                CycleData ON SOEPoint.CycleDataID = CycleData.ID JOIN " +
                    $"                Event InnerEvent ON CycleData.EventID = InnerEvent.ID " +
                    $"            WHERE " +
                    $"                InnerEvent.IncidentID = Event.IncidentID AND " +
                    $"                CycleData.Timestamp <= IMaxCycleData.Timestamp " +
                    $"            ORDER BY CycleData.Timestamp DESC " +
                    $"        ) AS FaultType, " +
                    $"        IMaxCycleData.IMax " +
                    $"    FROM " +
                    $"        IMaxCycleData JOIN " +
                    $"        Event ON IMaxCycleData.EventID = Event.ID " +
                    $"), IncidentAttribute0 AS " +
                    $"( " +
                    $"    SELECT " +
                    $"        MaxMin.IncidentID, " +
                    $"        ( " +
                    $"            SELECT TOP 1 FaultType " +
                    $"            FROM CycleDataFaultType " +
                    $"            WHERE " +
                    $"                MaxMin.IncidentID = CycleDataFaultType.IncidentID AND " +
                    $"                MaxMin.IMax = CycleDataFaultType.IMax " +
                    $"        ) AS FaultType, " +
                    $"        MaxMin.IAMax, " +
                    $"        MaxMin.IBMax, " +
                    $"        MaxMin.ICMax, " +
                    $"        MaxMin.IRMax, " +
                    $"        MaxMin.VAMax, " +
                    $"        MaxMin.VBMax, " +
                    $"        MaxMin.VCMax, " +
                    $"        MaxMin.VAMin, " +
                    $"        MaxMin.VBMin, " +
                    $"        MaxMin.VCMin " +
                    $"    FROM MaxMin " +
                    $"    WHERE MaxMin.IncidentID IN ({formatString}) " +
                    $") " +
                    $"MERGE INTO IncidentAttribute AS Target " +
                    $"USING IncidentAttribute0 AS Source " +
                    $"ON Source.IncidentID = Target.IncidentID " +
                    $"WHEN MATCHED THEN " +
                    $"    UPDATE SET " +
                    $"        FaultType = Source.FaultType, " +
                    $"        IAMax = Source.IAMax, " +
                    $"        IBMax = Source.IBMax, " +
                    $"        ICMax = Source.ICMax, " +
                    $"        IRMax = Source.IRMax, " +
                    $"        VAMax = Source.VAMax, " +
                    $"        VBMax = Source.VBMax, " +
                    $"        VCMax = Source.VCMax, " +
                    $"        VAMin = Source.VAMin, " +
                    $"        VBMin = Source.VBMin, " +
                    $"        VCMin = Source.VCMin " +
                    $"WHEN NOT MATCHED THEN " +
                    $"    INSERT (IncidentID, FaultType, IAMax, IBMax, ICMax, IRMax, VAMax, VBMax, VCMax, VAMin, VBMin, VCMin) " +
                    $"    VALUES (Source.IncidentID, Source.FaultType, Source.IAMax, Source.IBMax, Source.ICMax, Source.IRMax, Source.VAMax, Source.VBMax, Source.VCMax, Source.VAMin, Source.VBMin, Source.VCMin);", incidentIDs);
            }
        }
    }
}
