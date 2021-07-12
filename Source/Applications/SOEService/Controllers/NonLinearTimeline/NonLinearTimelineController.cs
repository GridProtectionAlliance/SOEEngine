//******************************************************************************************************
//  NonLinearTimelineController.cs - Gbtc
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
//  07/12/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************


using GSF.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace SOEService.Controllers
{
    [RoutePrefix("api/NonLinearTimeline")]
    public class NonLinearTimelineController : ApiController
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
                DataTable table = connection.RetrieveData($@"
                    SELECT 
	                    SOE.ID, SOE.Name, SOE.StartTime,SOE.EndTime, System.Name as System, 
	                    COUNT(DISTINCT Circuit.ID) as Circuits, COUNT(DISTINCT Meter.ID) as Devices, COUNT(DISTINCT Event.ID) as Waveforms,
	                    CAST(DATEDIFF(MILLISECOND, SOE.StartTime, SOE.EndTime) as FLOAT)/1000 as Duration,SOE.Status, SOE.TimeWindows
                    FROM 
	                    SOE join 
	                    soeincident on soe.id = soeincident.soeid JOIN
	                    Incident ON SOEIncident.IncidentID = Incident.ID JOIN
	                    Event ON Incident.ID = Event.IncidentID JOIN
	                    Meter on Meter.ID = Incident.MeterID JOIn
	                    Circuit ON Circuit.ID = Meter.CircuitID JOIN
	                    System ON System.ID = Circuit.SystemID
                    WHERE
                        SOE.StartTime BETWEEN {{0}} AND {{1}} AND 
                        SOE.EndTime BETWEEN {{0}} AND {{1}}
                    GROUP BY
                     SOE.ID, SOE.Name, SOE.StartTime,  SOE.EndTime, System.Name, CAST(DATEDIFF(MILLISECOND, SOE.StartTime, SOE.EndTime) as FLOAT)/1000,SOE.Status, SOE.TimeWindows
                ", start, end);
                return Ok(table);
            }
            
        }
    }
}