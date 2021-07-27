//******************************************************************************************************
//  HomeController.cs - Gbtc
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
//  07/26/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************


using GSF.Data;
using GSF.Data.Model;
using Newtonsoft.Json;
using SOE.Model.NonLinearTimeLine;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace SOEService.Controllers
{
    [RoutePrefix("api/Home")]
    public class HomeController : ApiController
    {
        [HttpGet, Route("{date}/{level}")]
        public IHttpActionResult Get(string date, string level)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
				string sql;

				if (level == "System")
				{
					sql = $@"
						DECLARE @date DATE = {{0}}
						SELECT 
							System,
							COUNT(DISTINCT Circuit) as Circuit,
							COUNT(DISTINCT Meter) as Meter,
							COUNT(SOEs) as SOEs,
							COUNT(DISTINCT Incidents) as Incidents,
							CAST(MAX(LTE) as INT) as LTE,
							CONVERT(Decimal(10,3),MAX(PQS)) as PQS,
							COUNT(DISTINCT Faults) as Faults,
							COUNT(DISTINCT Files) as Files,
							SUM(COALESCE([G1 Research],0)) as [G1 Research],
							SUM(COALESCE([G2 Switching],0)) as[G2 Switching],
							SUM(COALESCE([G3 Faults],0)) as[G3 Faults],
							SUM(COALESCE([G4 Power Quality],0)) as[G4 Power Quality],
							SUM(COALESCE([G5 Artifacts/Harmonics],0)) as [G5 Artifacts/Harmonics],
							SUM(COALESCE([G6 MinMaxAvg/History],0)) as [G6 MinMaxAvg/History],
							SUM(COALESCE([G7 Reports],0)) as [G7 Reports],
							SUM(COALESCE([G8 Predictive],0)) as [G8 Predictive],
							SUM(COALESCE([G9 Other],0)) as [G9 Other],
							SUM(COALESCE([G1 Research],0) + COALESCE([G2 Switching],0) +COALESCE([G3 Faults],0) +COALESCE([G4 Power Quality],0) +COALESCE([G5 Artifacts/Harmonics],0) +COALESCE([G6 MinMaxAvg/History],0) +COALESCE([G7 Reports],0) +COALESCE([G8 Predictive],0) +COALESCE([G9 Other],0)) as AllPlots

						FROM (
						SELECT
							System.Name as System,
							Circuit.Name as Circuit,
							Meter.AssetKey as Meter,
							Incident.ID as Incidents,
							Incident.LTE,
							Incident.PQS,
							IncidentAttribute.ID as Faults,
							Event.FileGroupID as Files,
							SOE.ID as SOEs,
							MatlabGroup.Name as MatlabGroup
						FROM
							Incident JOIN
							Meter ON Incident.MeterID = Meter.ID JOIN
							Circuit ON Meter.CircuitID = Circuit.ID JOIN
							System on Circuit.SystemID = System.ID LEFT JOIN
							IncidentAttribute on IncidentAttribute.IncidentID = Incident.ID  AND IncidentAttribute.FaultType IS NOT NULL LEFT JOIN
							Event on Event.IncidentID = Incident.ID LEFT JOIN
							SOEIncident on SOEIncident.IncidentID = Incident.ID LEFT JOIN
							SOE ON SOE.ID = SOEIncident.SOEID LEFT JOIN
							NLTImages ON NLTImages.EventID = Event.ID LEFT JOIN
							MatlabGroup ON NLTImages.GroupID = MatlabGroup.ID
						WHERE
							CAST(Incident.StartTime as DATE) =  @date
							) as tbl
						PIVOT(
							COUNT(tbl.MatlabGroup)
							For tbl.MatlabGroup IN ([G1 Research],[G2 Switching],[G3 Faults],[G4 Power Quality],[G5 Artifacts/Harmonics],[G6 MinMaxAvg/History],[G7 Reports],[G8 Predictive],[G9 Other])
						) as pvt
						GROUP BY
							System                ";

				}
				else if (level == "Circuit")
				{
					sql = $@"
						DECLARE @date DATE = {{0}}
						SELECT 
							System,
							Circuit,
							COUNT(DISTINCT Meter) as Meter,
							COUNT(SOEs) as SOEs,
							COUNT(DISTINCT Incidents) as Incidents,
							CAST(MAX(LTE) as INT) as LTE,
							CONVERT(Decimal(10,3),MAX(PQS)) as PQS,
							COUNT(DISTINCT Faults) as Faults,
							COUNT(DISTINCT Files) as Files,
							SUM(COALESCE([G1 Research],0)) as [G1 Research],
							SUM(COALESCE([G2 Switching],0)) as[G2 Switching],
							SUM(COALESCE([G3 Faults],0)) as[G3 Faults],
							SUM(COALESCE([G4 Power Quality],0)) as[G4 Power Quality],
							SUM(COALESCE([G5 Artifacts/Harmonics],0)) as [G5 Artifacts/Harmonics],
							SUM(COALESCE([G6 MinMaxAvg/History],0)) as [G6 MinMaxAvg/History],
							SUM(COALESCE([G7 Reports],0)) as [G7 Reports],
							SUM(COALESCE([G8 Predictive],0)) as [G8 Predictive],
							SUM(COALESCE([G9 Other],0)) as [G9 Other],
							SUM(COALESCE([G1 Research],0) + COALESCE([G2 Switching],0) +COALESCE([G3 Faults],0) +COALESCE([G4 Power Quality],0) +COALESCE([G5 Artifacts/Harmonics],0) +COALESCE([G6 MinMaxAvg/History],0) +COALESCE([G7 Reports],0) +COALESCE([G8 Predictive],0) +COALESCE([G9 Other],0)) as AllPlots

						FROM (
						SELECT
							System.Name as System,
							Circuit.Name as Circuit,
							Meter.AssetKey as Meter,
							Incident.ID as Incidents,
							Incident.LTE,
							Incident.PQS,
							IncidentAttribute.ID as Faults,
							Event.FileGroupID as Files,
							SOE.ID as SOEs,
							MatlabGroup.Name as MatlabGroup
						FROM
							Incident JOIN
							Meter ON Incident.MeterID = Meter.ID JOIN
							Circuit ON Meter.CircuitID = Circuit.ID JOIN
							System on Circuit.SystemID = System.ID LEFT JOIN
							IncidentAttribute on IncidentAttribute.IncidentID = Incident.ID  AND IncidentAttribute.FaultType IS NOT NULL LEFT JOIN
							Event on Event.IncidentID = Incident.ID LEFT JOIN
							SOEIncident on SOEIncident.IncidentID = Incident.ID LEFT JOIN
							SOE ON SOE.ID = SOEIncident.SOEID LEFT JOIN
							NLTImages ON NLTImages.EventID = Event.ID LEFT JOIN
							MatlabGroup ON NLTImages.GroupID = MatlabGroup.ID
						WHERE
							CAST(Incident.StartTime as DATE) =  @date
							) as tbl
						PIVOT(
							COUNT(tbl.MatlabGroup)
							For tbl.MatlabGroup IN ([G1 Research],[G2 Switching],[G3 Faults],[G4 Power Quality],[G5 Artifacts/Harmonics],[G6 MinMaxAvg/History],[G7 Reports],[G8 Predictive],[G9 Other])
						) as pvt
						GROUP BY
							System, Circuit
                ";

				}
				else
				{
					sql = $@"
						DECLARE @date DATE = {{0}}
						SELECT 
							System,
							Circuit,
							Meter,
							COUNT(SOEs) as SOEs,
							COUNT(DISTINCT Incidents) as Incidents,
							CAST(MAX(LTE) as INT) as LTE,
							CONVERT(Decimal(10,3),MAX(PQS)) as PQS,
							COUNT(DISTINCT Faults) as Faults,
							COUNT(DISTINCT Files) as Files,
							SUM(COALESCE([G1 Research],0)) as [G1 Research],
							SUM(COALESCE([G2 Switching],0)) as[G2 Switching],
							SUM(COALESCE([G3 Faults],0)) as[G3 Faults],
							SUM(COALESCE([G4 Power Quality],0)) as[G4 Power Quality],
							SUM(COALESCE([G5 Artifacts/Harmonics],0)) as [G5 Artifacts/Harmonics],
							SUM(COALESCE([G6 MinMaxAvg/History],0)) as [G6 MinMaxAvg/History],
							SUM(COALESCE([G7 Reports],0)) as [G7 Reports],
							SUM(COALESCE([G8 Predictive],0)) as [G8 Predictive],
							SUM(COALESCE([G9 Other],0)) as [G9 Other],
							SUM(COALESCE([G1 Research],0) + COALESCE([G2 Switching],0) +COALESCE([G3 Faults],0) +COALESCE([G4 Power Quality],0) +COALESCE([G5 Artifacts/Harmonics],0) +COALESCE([G6 MinMaxAvg/History],0) +COALESCE([G7 Reports],0) +COALESCE([G8 Predictive],0) +COALESCE([G9 Other],0)) as AllPlots

						FROM (
						SELECT
							System.Name as System,
							Circuit.Name as Circuit,
							Meter.AssetKey as Meter,
							Incident.ID as Incidents,
							Incident.LTE,
							Incident.PQS,
							IncidentAttribute.ID as Faults,
							Event.FileGroupID as Files,
							SOE.ID as SOEs,
							MatlabGroup.Name as MatlabGroup
						FROM
							Incident JOIN
							Meter ON Incident.MeterID = Meter.ID JOIN
							Circuit ON Meter.CircuitID = Circuit.ID JOIN
							System on Circuit.SystemID = System.ID LEFT JOIN
							IncidentAttribute on IncidentAttribute.IncidentID = Incident.ID  AND IncidentAttribute.FaultType IS NOT NULL LEFT JOIN
							Event on Event.IncidentID = Incident.ID LEFT JOIN
							SOEIncident on SOEIncident.IncidentID = Incident.ID LEFT JOIN
							SOE ON SOE.ID = SOEIncident.SOEID LEFT JOIN
							NLTImages ON NLTImages.EventID = Event.ID LEFT JOIN
							MatlabGroup ON NLTImages.GroupID = MatlabGroup.ID
						WHERE
							CAST(Incident.StartTime as DATE) =  @date
							) as tbl
						PIVOT(
							COUNT(tbl.MatlabGroup)
							For tbl.MatlabGroup IN ([G1 Research],[G2 Switching],[G3 Faults],[G4 Power Quality],[G5 Artifacts/Harmonics],[G6 MinMaxAvg/History],[G7 Reports],[G8 Predictive],[G9 Other])
						) as pvt
						GROUP BY
							System, Circuit, Meter

                ";
				}
				DataTable table = connection.RetrieveData(sql, date);
                return Ok(table);
            }

        }



    }
}