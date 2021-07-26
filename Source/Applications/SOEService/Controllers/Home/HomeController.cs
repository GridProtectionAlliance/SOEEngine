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
                DataTable table = connection.RetrieveData($@"
					DECLARE @date DATE = {{0}}
					DECLARE @pivotColumns NVARCHAR(MAX);
					SELECT @pivotColumns = COALESCE(@pivotColumns + ',', '') + '['+ Name + ']' FROM MatlabGroup
					DECLARE @sql NVARCHAR(MAX) = N'
					SELECT * FROM (
					SELECT
						COUNT(Incident.ID) as Incidents,
						System.Name as System,
						Circuit.Name as Circuit,
						Meter.AssetKey as Meter,
						MAX(Incident.LTE) as LTE,
						MAX(Incident.PQS) as PQS,
						COUNT(IncidentAttribute.FaultType) as Faults,
						COUNT(distinct Event.FileGroupID) as Files,
						COUNT(distinct SOE.ID) as SOEs,
						MatlabGroup.Name as MatlabGroup
					FROM
						Incident JOIN
						Meter ON Incident.MeterID = Meter.ID JOIN
						Circuit ON Meter.CircuitID = Circuit.ID JOIN
						System on Circuit.SystemID = System.ID JOIN
						IncidentAttribute on IncidentAttribute.IncidentID = Incident.ID  JOIN
						Event on Event.IncidentID = Incident.ID LEFT JOIN
						SOEIncident on SOEIncident.IncidentID = Incident.ID LEFT JOIN
						SOE ON SOE.ID = SOEIncident.SOEID LEFT JOIN
						NLTImages ON NLTImages.EventID = Event.ID LEFT JOIN
						MatlabGroup ON NLTImages.GroupID = MatlabGroup.ID
					WHERE
						CAST(Incident.StartTime as DATE) =  @date
					GROUP BY
						System.Name, Circuit.Name, Meter.AssetKey, MatlabGroup.Name
						) as tbl
					PIVOT(
						COUNT(tbl.MatlabGroup)
						For tbl.MatlabGroup IN ('+ @pivotColumns+')
					) as pvt
					'
					EXECUTE sp_executesql @sql, N'@date DATE', @date = @date
                ", date, level);
                return Ok(table);
            }

        }



    }
}