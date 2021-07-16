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
        [HttpGet, Route("Colors")]
        public IHttpActionResult GetColors()
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable table = connection.RetrieveData($@"
                Select 
	                ID, 'rgb('+CAST(Red as VARCHAR(3))+','+CAST(Green as VARCHAR(3))+','+CAST(Blue as VARCHAR(3))+')' as Color, Color as Name
                from 
	                ColorIndex
                ");
                return Ok(table);
            }

        }

        [HttpGet, Route("Meters/{soeID:int}/{tsx:int}/{timeSlot:int}")]
        public IHttpActionResult GetMeters(int soeID, int tsx, int timeSlot)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable table = connection.RetrieveData($@"
                SELECT
	                Meter.AssetKey,
	                MeterLocation.Latitude,
	                MeterLocation.Longitude,
	                dbo.GetJSONValueForProperty(Meter.ExtraData, 'sourceAlternate') as SoureAlternate,
	                dbo.GetJSONValueForProperty(Meter.ExtraData, 'sourcePreferred') as SourcePreferred,
	                0 as Voltage,
	                SOEDataPoint.Value,
	                SOEDataPoint.SensorName,
	                'rgb('+CAST(Red as VARCHAR(3))+','+CAST(Green as VARCHAR(3))+','+CAST(Blue as VARCHAR(3))+')' as Color

                FROM (
	                SELECT
		                DISTINCT SUBSTRING(SensorName,0,CHARINDEX('.', SensorName, 0)) as Name
	                FROM
		                SOEDataPoint
	                WHERE 
	                    SOE_ID = {{0}} AND TSx = {{1}}
                ) as Sensor JOIN
                Meter ON Sensor.Name = Meter.AssetKey JOIN
                MeterLocation ON MeterLocation.ID = Meter.MeterLocationID LEFT JOIN
                SOEDataPoint ON SOE_ID = {{0}} AND TSx = {{1}} AND TimeSlot = {{2}} AND SensorName LIKE Meter.AssetKey + '.I%' LEFT JOIN
                ColorIndex ON ColorIndex.ID = SOEDataPoint.Value
                ", soeID, tsx, timeSlot);
                return Ok(table);
            }

        }

        [HttpGet, Route("Times/{soeID:int}/{tsx:int}")]
        public IHttpActionResult GetTimes(int soeID, int tsx)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable table = connection.RetrieveData($@"
                SELECT 
	                Distinct TimeSlot, [Time], ElapsMS, ElapsSEC, CycleNum
                FROM
	                SOEDataPoint
                WHERE 
                    SOE_ID = {{0}} AND TSx = {{1}} 
                ORDER BY TimeSlot
                ", soeID, tsx);
                return Ok(table);
            }

        }



        [HttpGet, Route("TSx/{soeID:int}")]
        public IHttpActionResult GetTSValues(int soeID)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings")) {
                List<string> table = connection.RetrieveData($@"
                SELECT 
	                DISTINCT TSx
                FROM
	                SOEDataPoint
                WHERE 
	                SOE_ID = {{0}}
                ", soeID).Select().Select(row => row["TSx"].ToString()).ToList();
                return Ok(table);
            }
            
        }

        [HttpGet, Route("Sensors/{soeID:int}/{tsx:int}")]
        public IHttpActionResult GetSensors(int soeID, int tsx)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                List<string> table = connection.RetrieveData($@"
                SELECT
	                DISTINCT SensorName, SensorOrder
                FROM
	                SOEDataPoint
                WHERE
	                SOE_ID = {{0}} AND TSx = {{1}}
                ORDER BY SensorOrder
                ", soeID, tsx).Select().Select(row => row["SensorName"].ToString()).ToList();
                return Ok(table);
            }

        }


        [HttpGet, Route("Data/{soeID:int}/{tsx:int}/{sensorName}")]
        public IHttpActionResult GetData(int soeID, int tsx, string sensorName)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable table = connection.RetrieveData($@"
                    SELECT
	                    SensorName, EventID, TimeSlot, Value, ElapsMS, ElapsSEC, CycleNum, TimeGap
                    FROM
	                    SOEDataPoint
                    WHERE
	                    SOE_ID = {{0}} AND TSx = {{1}} And SensorName = {{2}}
                    ORDER BY TimeSlot
                ", soeID, tsx, sensorName);
                return Ok(table);
            }

        }

    }
}