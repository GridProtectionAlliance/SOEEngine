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
using System.Data;
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
							SUM(COALESCE([G1 Vector Plot],0)) as [G1 Vector Plot],
							SUM(COALESCE([G2 IEEE 1668 Ridethrough Plot],0)) as[G2 IEEE 1668 Ridethrough Plot],
							SUM(COALESCE([G3 Suspected Blown Fuse Plot],0)) as[G3 Suspected Blown Fuse Plot],
							SUM(COALESCE([G4 Reserved],0)) as[G4 Reserved],
							SUM(COALESCE([G5 Harmonics Plot],0)) as [G5 Harmonics Plot],
							SUM(COALESCE([G6 MinMax Plot],0)) as [G6 MinMax Plot],
							SUM(COALESCE([G7 State Change Plot],0)) as [G7 State Change Plot],
							SUM(COALESCE([G8 Reserved],0)) as [G8 Reserved],
							SUM(COALESCE([G9 Reserved],0)) as [G9 Reserved],
							SUM(COALESCE([G1 Vector Plot],0) + COALESCE([G2 IEEE 1668 Ridethrough Plot],0) +COALESCE([G3 Suspected Blown Fuse Plot],0) +COALESCE([G4 Reserved],0) +COALESCE([G5 Harmonics Plot],0) +COALESCE([G6 MinMax Plot],0) +COALESCE([G7 State Change Plot],0) +COALESCE([G8 Reserved],0) +COALESCE([G9 Reserved],0)) as AllPlots

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
							Incident
							JOIN
								Meter ON Incident.MeterID = Meter.ID
							JOIN
								Circuit ON Meter.CircuitID = Circuit.ID
							JOIN
								System on Circuit.SystemID = System.ID
							LEFT JOIN
								IncidentAttribute on IncidentAttribute.IncidentID = Incident.ID  AND IncidentAttribute.FaultType IS NOT NULL
							LEFT JOIN
								Event on Event.IncidentID = Incident.ID
							LEFT JOIN
								SOEIncident on SOEIncident.IncidentID = Incident.ID
							LEFT JOIN
								SOE ON SOE.ID = SOEIncident.SOEID
							LEFT JOIN
								EventEventTag ON EventEventTag.EventID = Event.ID
							LEFT JOIN
								EventTag ON EventEventTag.EventTagID = EventTag.ID
							LEFT JOIN
								MatLabGroup on EventTag.Name = MatLabGroup.Name
						WHERE
							CAST(Incident.StartTime as DATE) =  @date
							) as tbl
						PIVOT(
							COUNT(tbl.MatlabGroup)
							For tbl.MatlabGroup IN ([G1 Vector Plot],[G2 IEEE 1668 Ridethrough Plot],[G3 Suspected Blown Fuse Plot],[G4 Reserved],[G5 Harmonics Plot],[G6 MinMax Plot],[G7 State Change Plot],[G8 Reserved],[G9 Reserved])
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
							SUM(COALESCE([G1 Vector Plot],0)) as [G1 Vector Plot],
							SUM(COALESCE([G2 IEEE 1668 Ridethrough Plot],0)) as[G2 IEEE 1668 Ridethrough Plot],
							SUM(COALESCE([G3 Suspected Blown Fuse Plot],0)) as[G3 Suspected Blown Fuse Plot],
							SUM(COALESCE([G4 Reserved],0)) as[G4 Reserved],
							SUM(COALESCE([G5 Harmonics Plot],0)) as [G5 Harmonics Plot],
							SUM(COALESCE([G6 MinMax Plot],0)) as [G6 MinMax Plot],
							SUM(COALESCE([G7 State Change Plot],0)) as [G7 State Change Plot],
							SUM(COALESCE([G8 Reserved],0)) as [G8 Reserved],
							SUM(COALESCE([G9 Reserved],0)) as [G9 Reserved],
							SUM(COALESCE([G1 Vector Plot],0) + COALESCE([G2 IEEE 1668 Ridethrough Plot],0) +COALESCE([G3 Suspected Blown Fuse Plot],0) +COALESCE([G4 Reserved],0) +COALESCE([G5 Harmonics Plot],0) +COALESCE([G6 MinMax Plot],0) +COALESCE([G7 State Change Plot],0) +COALESCE([G8 Reserved],0) +COALESCE([G9 Reserved],0)) as AllPlots

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
							Incident
							JOIN
								Meter ON Incident.MeterID = Meter.ID
							JOIN
								Circuit ON Meter.CircuitID = Circuit.ID
							JOIN
								System on Circuit.SystemID = System.ID LEFT
							JOIN
								IncidentAttribute on IncidentAttribute.IncidentID = Incident.ID  AND IncidentAttribute.FaultType IS NOT NULL
							LEFT JOIN
								Event on Event.IncidentID = Incident.ID
							LEFT JOIN
								SOEIncident on SOEIncident.IncidentID = Incident.ID
							LEFT JOIN
								SOE ON SOE.ID = SOEIncident.SOEID
							LEFT JOIN
								EventEventTag ON EventEventTag.EventID = Event.ID
							LEFT JOIN
								EventTag ON EventEventTag.EventTagID = EventTag.ID
							LEFT JOIN
								MatLabGroup on EventTag.Name = MatLabGroup.Name
						WHERE
							CAST(Incident.StartTime as DATE) =  @date
							) as tbl
						PIVOT(
							COUNT(tbl.MatlabGroup)
							For tbl.MatlabGroup IN ([G1 Vector Plot],[G2 IEEE 1668 Ridethrough Plot],[G3 Suspected Blown Fuse Plot],[G4 Reserved],[G5 Harmonics Plot],[G6 MinMax Plot],[G7 State Change Plot],[G8 Reserved],[G9 Reserved])
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
							SUM(COALESCE([G1 Vector Plot],0)) as [G1 Vector Plot],
							SUM(COALESCE([G2 IEEE 1668 Ridethrough Plot],0)) as[G2 IEEE 1668 Ridethrough Plot],
							SUM(COALESCE([G3 Suspected Blown Fuse Plot],0)) as[G3 Suspected Blown Fuse Plot],
							SUM(COALESCE([G4 Reserved],0)) as[G4 Reserved],
							SUM(COALESCE([G5 Harmonics Plot],0)) as [G5 Harmonics Plot],
							SUM(COALESCE([G6 MinMax Plot],0)) as [G6 MinMax Plot],
							SUM(COALESCE([G7 State Change Plot],0)) as [G7 State Change Plot],
							SUM(COALESCE([G8 Reserved],0)) as [G8 Reserved],
							SUM(COALESCE([G9 Reserved],0)) as [G9 Reserved],
							SUM(COALESCE([G1 Vector Plot],0) + COALESCE([G2 IEEE 1668 Ridethrough Plot],0) +COALESCE([G3 Suspected Blown Fuse Plot],0) +COALESCE([G4 Reserved],0) +COALESCE([G5 Harmonics Plot],0) +COALESCE([G6 MinMax Plot],0) +COALESCE([G7 State Change Plot],0) +COALESCE([G8 Reserved],0) +COALESCE([G9 Reserved],0)) as AllPlots

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
							Incident
							JOIN
							Meter ON Incident.MeterID = Meter.ID
							JOIN
							Circuit ON Meter.CircuitID = Circuit.ID
							JOIN
							System on Circuit.SystemID = System.ID
							LEFT JOIN
							IncidentAttribute on IncidentAttribute.IncidentID = Incident.ID  AND IncidentAttribute.FaultType IS NOT NULL
							LEFT JOIN
							Event on Event.IncidentID = Incident.ID
							LEFT JOIN
							SOEIncident on SOEIncident.IncidentID = Incident.ID
							LEFT JOIN
							SOE ON SOE.ID = SOEIncident.SOEID
							LEFT JOIN
							EventEventTag ON EventEventTag.EventID = Event.ID
							LEFT JOIN
							EventTag ON EventEventTag.EventTagID = EventTag.ID
							LEFT JOIN
							MatLabGroup on EventTag.Name = MatLabGroup.Name
						WHERE
							CAST(Incident.StartTime as DATE) =  @date
							) as tbl
						PIVOT(
							COUNT(tbl.MatlabGroup)
							For tbl.MatlabGroup IN ([G1 Vector Plot],[G2 IEEE 1668 Ridethrough Plot],[G3 Suspected Blown Fuse Plot],[G4 Reserved],[G5 Harmonics Plot],[G6 MinMax Plot],[G7 State Change Plot],[G8 Reserved],[G9 Reserved])
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