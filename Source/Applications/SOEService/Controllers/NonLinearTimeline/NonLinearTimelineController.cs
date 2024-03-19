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
using GSF.Data.Model;
using Newtonsoft.Json;
using SOE.Model;
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
	                dbo.GetJSONValueForProperty(Meter.ExtraData, 'sourceAlternate') as SourceAlternate,
	                dbo.GetJSONValueForProperty(Meter.ExtraData, 'sourcePreferred') as SourcePreferred,
	                0 as Voltage,
	                SOEDataPoint.Value,
	                SOEDataPoint.SensorName,
	                'rgb('+CAST(Red as VARCHAR(3))+','+CAST(Green as VARCHAR(3))+','+CAST(Blue as VARCHAR(3))+')' as Color,
                    ColorIndex.Color as ColorText

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

        [HttpGet, Route("MeasuredValues/{eventID:int}")]
        public IHttpActionResult GetMeasuredValues(int eventID)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable table = connection.RetrieveData($@"
                SELECT 
	                pvt.Name, pvt.[1] as M1, pvt.[2] as M2, pvt.[3] as M3, pvt.Units, pvt.SortOrder
                FROM 
	                (SELECT 'V1' AS Name, 1 as SortOrder UNION SELECT 'V2' AS Name, 2 as SortOrder UNION SELECT 'V3' AS Name, 3 as SortOrder UNION 
	                 SELECT 'I1' AS Name, 4 as SortOrder UNION SELECT 'I2' AS Name, 5 as SortOrder UNION SELECT 'I3' AS Name, 6 as SortOrder UNION 
	                 SELECT 'V4' AS Name, 7 as SortOrder UNION SELECT 'V5' AS Name, 8 as SortOrder UNION SELECT 'V6' AS Name, 9 as SortOrder UNION 
	                 SELECT 'I4' AS Name, 10 as SortOrder UNION SELECT 'I5' AS Name, 11 as SortOrder UNION SELECT 'I6' AS Name, 12 as SortOrder ) as Sensors Left JOIN
                (
                SELECT Sensor,
	                   MeasurementNumber,
	                   Value,
	                   Units
                  FROM MeasuredValues
                  WHERE EventID = {{0}}
                ) t ON Sensors.Name = t.Sensor
                PIVOT(
	                MAX(Value) FOR MeasurementNumber in ([1],[2],[3])
                ) as pvt

                UNION
                SELECT 
	                'Sample Number' as Name, 
	                (SELECT TOP 1 ValueSamplePoint FROM MeasuredValues WHERE EventID = {{0}} AND MeasurementNumber = 1) as M1, 
	                (SELECT TOP 1 ValueSamplePoint FROM MeasuredValues WHERE EventID = {{0}} AND MeasurementNumber = 2) as M2, 
	                (SELECT TOP 1 ValueSamplePoint FROM MeasuredValues WHERE EventID = {{0}} AND MeasurementNumber = 3) as M3, 
	                '' as Units, 
	                13 as SortOrder
                ORDER BY 
	                SortOrder                
                ", eventID);
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

        [HttpGet, Route("Conductors/{soeID:int}")]
        public IHttpActionResult GetConductors(int soeID)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable table = connection.RetrieveData($@"
                    ;WITH Devices AS (
                    SELECT 
	                    DISTINCT SUBSTRING(SensorName, 0, CHARINDEX( '.',SensorName) ) AS Device
                    FROM SOEDataPoint WHERE SOE_ID = {{0}}
                    )
                    SELECT
	                    DISTINCT Circuit.*
                    FROM 
	                    Meter JOIN
	                    Devices ON MEter.AssetKey = Devices.Device JOIN
	                    Circuit ON Meter.CircuitID = Circuit.ID
                    WHERE 
                        Circuit.GeoJSON IS NOT NULL

                ", soeID);

                return Ok(table.Select().Select(x => new TableOperations<Circuit>(connection).LoadRecord(x)).ToList());
            }
        }


        [HttpGet, Route("Data/{soeID:int}/{tsx:int}/{sensorName}")]
        public IHttpActionResult GetData(int soeID, int tsx, string sensorName)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                DataTable table = connection.RetrieveData($@"
                    SELECT
	                    SensorName, EventID, TimeSlot, Value, ElapsMS, ElapsSEC, CycleNum, TimeGap, [Time]
                    FROM
	                    SOEDataPoint
                    WHERE
	                    SOE_ID = {{0}} AND TSx = {{1}} And SensorName = {{2}}
                    ORDER BY TimeSlot
                ", soeID, tsx, sensorName);
                return Ok(table);
            }

        }

        [HttpGet, Route("Images/{eventID:int}")]
        public IHttpActionResult GetImages(int eventID)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                IEnumerable<NLTImages> table = new TableOperations<NLTImages>(connection).QueryRecordsWhere("EventID = {0}", eventID);
                return Ok(table.ToList());
            }

        }

        [HttpGet, Route("MatLabImages/{date}/{group}/{context}/{objectName}")]
        public IHttpActionResult GetMatLabImages(string date, string group, string context, string objectName)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
            {
                string sql = $@"
                SELECT 
                    Event.ID,
                    EventEventTag.EventID,
                    Event.MeterID,
                    EventEventTag.EventTagID,
                    EventEventTag.TagData,
	                Meter.AssetKey,
                    System.Name as SystemName,
	                Circuit.Name as CircuitName,
					EventTag.Name as EventTagName
                FROM 
                    EventEventTag
                INNER JOIN 
                    Event ON EventEventTag.EventID = Event.ID
                INNER JOIN
		            Meter on Event.MeterID = Meter.ID 
                INNER JOIN
                        Circuit ON Circuit.ID = Meter.CircuitID
                INNER JOIN
                        System ON System.ID = Circuit.SystemID
				INNER JOIN 
						EventTag on EventEventTag.EventTagID = EventTag.ID
                WHERE
                     CONVERT(date, Event.StartTime) = {{0}}
                ";

                if (group != "All") sql = $@"{sql} AND EventTag.Name = {{2}}";
                if (context == "System") sql = $@"{sql} AND System.Name = {{1}}";
                else if (context == "Circuit") sql = $@"{sql} AND Circuit.Name = {{1}}";
                else sql = $@"{sql} AND Meter.AssetKey = {{1}}";

                DataTable table = connection.RetrieveData(sql, date, objectName, group);
                return Ok(table);
            }

        }

        [HttpGet, Route("Image/{path}")]
        public HttpResponseMessage GetImage(string path)
        {
            byte[] data = Convert.FromBase64String(path);
            string decodedString = System.Text.Encoding.UTF8.GetString(data);
            var result = new HttpResponseMessage(HttpStatusCode.OK);
            Byte[] b = File.ReadAllBytes(decodedString + ".png");
            result.Content = new ByteArrayContent(b);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue("image/png");
            return result;
        }
    }
}