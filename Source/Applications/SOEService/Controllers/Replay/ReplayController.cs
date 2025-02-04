//******************************************************************************************************
//  ReplayController.cs - Gbtc
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
//  04/13/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Data;
using System.Globalization;
using System.Web.Http;
using GSF.Data;

namespace SOEService.Controllers
{
    [RoutePrefix("api/Replay")]
    public class ReplayController: ApiController
    {
        [HttpGet, Route("{date}/{stepSize:int}/{units}")]
        public IHttpActionResult GetReplay(string date, int stepSize, string units)
        {
            DateTime start = DateTime.ParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture);
            DateTime end;

            if (units == "days")
                end = start.AddDays(stepSize);
            else if (units == "weeks")
                end = start.AddDays(stepSize * 7);
            else if (units == "months")
                end = start.AddMonths(stepSize);
            else
                end = start.AddYears(stepSize);

            using (AdoDataConnection connection = new AdoDataConnection("systemSettings")) {
                DataTable table = connection.RetrieveData(@"
                WITH CircuitGrouping AS
                (
                    SELECT
                        SOE.ID SOEID,
                        Circuit.ID CircuitID,
                        COUNT(DISTINCT Meter.ID) Devices,
                        COUNT(DISTINCT Event.ID) Waveforms,
                        COUNT(DISTINCT SOELog.ID) StateChanges
                    FROM
                        SOE JOIN
                        SOEIncident ON SOE.id = SOEIncident.SOEID JOIN
                        Incident ON SOEIncident.IncidentID = Incident.ID JOIN
                        Event ON Incident.ID = Event.IncidentID JOIN
                        Meter ON Meter.ID = Incident.MeterID LEFT OUTER JOIN
                        Meter NormalParent ON Meter.ParentNormalID = NormalParent.ID LEFT OUTER JOIN
                        Meter AlternateParent ON Meter.ParentAlternateID = AlternateParent.ID JOIN
                        Circuit ON
                            Meter.CircuitID = Circuit.ID OR
                            NormalParent.CircuitID = Circuit.ID OR
                            AlternateParent.CircuitID = Circuit.ID LEFT OUTER JOIN
                        SOELog ON SOELog.EventID = Event.ID
                    GROUP BY
                        SOE.ID,
                        Circuit.ID
                ),
                SystemGrouping AS
                (
                    SELECT
                        CircuitGrouping.SOEID,
                        System.ID SystemID,
                        STRING_AGG(Circuit.Name, ', ') WITHIN GROUP(ORDER BY CircuitGrouping.StateChanges DESC) CircuitList,
                        COUNT(*) Circuits,
                        SUM(CircuitGrouping.Devices) Devices,
                        SUM(CircuitGrouping.Waveforms) Waveforms
                    FROM
                        CircuitGrouping JOIN
                        Circuit ON CircuitGrouping.CircuitID = Circuit.ID JOIN
                        System ON Circuit.SystemID = System.ID
                    GROUP BY
                        CircuitGrouping.SOEID,
                        System.ID
                )
                SELECT
                    SOE.ID,
                    SOE.Name,
                    SOE.StartTime,
                    SOE.EndTime,
                    System.Name System,
                    SystemGrouping.CircuitList,
                    SystemGrouping.Circuits,
                    SystemGrouping.Devices,
                    SystemGrouping.Waveforms,
                    DATEDIFF(MILLISECOND, SOE.StartTime, SOE.EndTime) / 1000.0 Duration,
                    SOE.Status,
                    SOE.TimeWindows
                FROM
                    SystemGrouping JOIN
                    SOE ON SystemGrouping.SOEID = SOE.ID JOIN
                    System ON SystemGrouping.SystemID = System.ID
                WHERE
                    SOE.StartTime BETWEEN {0} AND {1} AND
                    SOE.EndTime BETWEEN {0} AND {1}
                ", start, end);
                return Ok(table);
            }
            
        }
    }
}