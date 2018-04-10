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
using System.Linq;
using GSF.Data;
using SOEDataProcessing.DataResources;
using SOEDataProcessing.DataSets;
using System.Collections;
using SOE.Model;
using GSF.Data.Model;
using System.Collections.Generic;
using SOEDataProcessing.DataAnalysis;
using System.Data;
using System;

namespace SOEDataProcessing.DataOperations
{
    public class IncidentAttributeOperation : DataOperationBase<MeterDataSet>
    {
        private MeterDataSet m_meterDataSet;

        public override void Execute(MeterDataSet meterDataSet)
        {
            m_meterDataSet = meterDataSet;
            Load();
        }

        private void Load()
        {
            CycleDataResource cycleDataResource = m_meterDataSet.GetResource<CycleDataResource>();

            using (AdoDataConnection connection = m_meterDataSet.Meter.ConnectionFactory())
            {
                TableOperations<Incident> incidentTable = new TableOperations<Incident>(connection);
                List<object> incidents = new List<object>();
                foreach (DataGroup dg in cycleDataResource.DataGroups) {
                    Incident incident = incidentTable.QueryRecordWhere("MeterID = {0} AND {1} Between StartTime AND EndTime", m_meterDataSet.Meter.ID, ToDateTime2(connection, dg.StartTime));
                    if(incident != null)
                        incidents.Add(incident.ID);
                }
                if (!incidents.Any())
                    return;

                string formatString = string.Join(",", incidents.Select((id, index) => $"{{{index}}}"));

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
                    $"        CASE WHEN MAX(VYARMS) IS NULL THEN MAX(VXARMS) WHEN MAX(VXARMS) > MAX(VYARMS) THEN MAX(VXARMS) ELSE MAX(VYARMS) END AS VAMax, " +
                    $"        CASE WHEN MAX(VYBRMS) IS NULL THEN MAX(VXBRMS) WHEN MAX(VXBRMS) > MAX(VYBRMS) THEN MAX(VXBRMS) ELSE MAX(VYBRMS) END AS VBMax, " +
                    $"        CASE WHEN MAX(VYCRMS) IS NULL THEN MAX(VXCRMS) WHEN MAX(VXCRMS) > MAX(VYCRMS) THEN MAX(VXCRMS) ELSE MAX(VYCRMS) END AS VCMax, " +
                    $"        CASE WHEN MIN(VYARMS) IS NULL THEN MIN(VXARMS) WHEN MIN(VXARMS) < MIN(VYARMS) THEN MIN(VXARMS) ELSE MIN(VYARMS) END AS VAMin, " +
                    $"        CASE WHEN MIN(VYBRMS) IS NULL THEN MIN(VXBRMS) WHEN MIN(VXBRMS) < MIN(VYBRMS) THEN MIN(VXBRMS) ELSE MIN(VYBRMS) END AS VBMin, " +
                    $"        CASE WHEN MIN(VYCRMS) IS NULL THEN MIN(VXCRMS) WHEN MIN(VXCRMS) < MIN(VYCRMS) THEN MIN(VXCRMS) ELSE MIN(VYCRMS) END AS VCMin " +
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
                    $"    VALUES (Source.IncidentID, Source.FaultType, Source.IAMax, Source.IBMax, Source.ICMax, Source.IRMax, Source.VAMax, Source.VBMax, Source.VCMax, Source.VAMin, Source.VBMin, Source.VCMin);", incidents.ToArray());
            }
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

    }
}
