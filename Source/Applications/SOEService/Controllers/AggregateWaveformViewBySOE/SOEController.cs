//******************************************************************************************************
//  SOEController.cs - Gbtc
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

using GSF.Data;
using GSF.Data.Model;
using SOE.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Web.Http;
using DbSOE = SOE.Model.SOE;
using AnalyticModel = SOE.Model.MATLABAnalytic;
using SOE.MATLAB;

namespace SOEService.Controllers
{
    [RoutePrefix("api/SOE")]
    public class SOEController: ApiController
    {

        [HttpGet, Route("{id:int}/{status}")]
        public IHttpActionResult ChangeStatus(int id, string status)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    int record = connection.ExecuteNonQuery("UPDATE SOE SET Status={0} WHERE ID = {1}", status, id);
                    AnalyticModel makeReplay = new TableOperations<AnalyticModel>(connection).QueryRecordWhere("MethodName = {0}", "MakeReplay");
                    string soeLogPath = connection.ExecuteScalar<string>("SELECT Value FROM SETTING WHERE Name = 'SOELogPath'");
                    string replayPath = connection.ExecuteScalar<string>("SELECT Value FROM SETTING WHERE Name = 'ReplayPath'");

                    SOE.MATLAB.MATLABAnalytic analytic = ToAnalytic(makeReplay);
                    List<MATLABAnalyticSettingField> settings = new List<MATLABAnalyticSettingField>
                    {
                        new MATLABAnalyticSettingField("SOELogPath", soeLogPath), 
                        new MATLABAnalyticSettingField("SOE_ID", id), 
                        new MATLABAnalyticSettingField("ReplayPath", replayPath) 
                    };
                    analytic.Execute(settings);
                    return Ok(record);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost, Route("")]
        public IHttpActionResult UpdateSOE([FromBody] DbSOE soe)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    new TableOperations<DbSOE>(connection).UpdateRecord(soe);
                    return Ok("Updated record.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet, Route("{id:int}")]
        public IHttpActionResult GetSOE(int id)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DbSOE record = new TableOperations<DbSOE>(connection).QueryRecordWhere("ID = {0}", id);
                    return Ok(record);
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet, Route("Counts/{id:int}")]
        public IHttpActionResult GetSOECounts(int id)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DataTable record = connection.RetrieveData(@"
                        SELECT
	                        COUNT(DISTINCT Meter.ID) as Devices, COUNT(DISTINCT Circuit.ID) as Circuits, COUNT(DISTINCT System.ID) as Systems
                        FROM
	                        SOE JOIN
	                        SOEIncident ON SOE.ID = SOEIncident.SOEID JOIN
	                        Incident ON SOEIncident.IncidentID = Incident.ID JOIN
	                        Meter ON Incident.MeterID = Meter.ID JOIN
	                        Circuit ON Meter.CircuitID = Circuit.ID JOIN
	                        System ON Circuit.SystemID = System.ID
                        WHERE
	                        SOE.ID = {0}
                    ", id);
                    return Ok(record);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet, Route("Other/Counts/{id:int}/{startTime}/{endtime}")]
        public IHttpActionResult GetOtherSOECounts(int id, string startTime, string endTime)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DbSOE soe = new TableOperations<DbSOE>(connection).QueryRecordWhere("ID = {0}", id);

                    DataTable record = connection.RetrieveData(@"
                        SELECT
	                        COUNT(DISTINCT Meter.ID) as Devices, 
                            COUNT(DISTINCT Circuit.ID) as Circuits, 
                            COUNT(DISTINCT System.ID) as Systems
                        FROM
	                        Incident JOIN
	                        Meter ON Incident.MeterID = Meter.ID JOIN
	                        Circuit ON Meter.CircuitID = Circuit.ID JOIN
	                        System ON Circuit.SystemID = System.ID 
                        WHERE
	                        Incident.ID NOT IN (
	                            SELECT
		                            SOEIncident.IncidentID
	                            FROM
		                            SOEIncident 
                                WHERE
		                            SOEIncident.SOEID = {0}

	                        ) AND Incident.StartTime >= {1} AND Incident.EndTime <= {2}
                    ", id, DateTime.ParseExact(startTime, "yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture), DateTime.ParseExact(endTime, "yyyy-MM-ddTHH:mm:ss.fffffff", CultureInfo.InvariantCulture));
                    return Ok(record);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet, Route("Devices/{id:int}")]
        public IHttpActionResult GetSOEDevices(int id)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DbSOE soe = new TableOperations<DbSOE>(connection).QueryRecordWhere("ID = {0}", id);

                    DataTable record = connection.RetrieveData(@"
	                    SELECT
                            Incident.ID as IncidentID,
		                    System.Name as System,
		                    Circuit.Name as PrefCkt,
		                    AltCircuit.Name as AltCkt,
		                    SOEIncident.[Order],
		                    Meter.Name as Device,
		                    IncidentAttribute.FaultType,
							COUNT(DISTINCT Event.ID) as Waveforms
	                    FROM
		                    SOE JOIN
		                    SOEIncident ON SOE.ID = SOEIncident.SOEID JOIN
		                    Incident ON SOEIncident.IncidentID = Incident.ID JOIN
                            Event ON Event.IncidentID = Incident.ID JOIN
		                    IncidentAttribute ON Incident.ID = IncidentAttribute.IncidentID JOIN
		                    Meter ON Incident.MeterID = Meter.ID JOIN
		                    Circuit ON Meter.CircuitID = Circuit.ID JOIN
		                    System ON Circuit.SystemID = System.ID LEFT JOIN
		                    Meter AS AltParent ON AltParent.ID = Meter.ParentAlternateID LEFT JOIN
		                    Circuit AS AltCircuit ON AltCircuit.ID = AltParent.CircuitID
	                    WHERE
		                    SOE.ID = {0}
                        GROUP BY
							Incident.ID,
		                    System.Name,
		                    Circuit.Name,
		                    AltCircuit.Name,
		                    SOEIncident.[Order],
		                    Meter.Name,
		                    IncidentAttribute.FaultType
                    ", id, soe.StartTime, soe.EndTime);
                    return Ok(record);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet, Route("Other/Devices/{id:int}/{startTime}/{endtime}")]
        public IHttpActionResult GetOtherDevices(int id, string startTime, string endTime)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DbSOE soe = new TableOperations<DbSOE>(connection).QueryRecordWhere("ID = {0}", id);

                    DataTable record = connection.RetrieveData(@"
                        SELECT
                            Incident.ID as IncidentID,
	                        System.Name as System,
	                        Circuit.Name as PrefCkt,
	                        AltCircuit.Name as AltCkt,
	                        Meter.Name as Device,
	                        IncidentAttribute.FaultType,
	                        COUNT(DISTINCT Event.ID) as Waveforms
                        FROM
	                        Incident JOIN
	                        Event ON Event.IncidentID = Incident.ID JOIN
	                        IncidentAttribute ON Incident.ID = IncidentAttribute.IncidentID JOIN
	                        Meter ON Incident.MeterID = Meter.ID JOIN
	                        Circuit ON Meter.CircuitID = Circuit.ID JOIN
	                        System ON Circuit.SystemID = System.ID LEFT JOIN
	                        Meter AS AltParent ON AltParent.ID = Meter.ParentAlternateID LEFT JOIN
	                        Circuit AS AltCircuit ON AltCircuit.ID = AltParent.CircuitID
                        WHERE
	                        Incident.ID NOT IN (
		                        SELECT
			                        SOEIncident.IncidentID
		                        FROM
			                        SOEIncident 
		                        WHERE
			                        SOEIncident.SOEID = {0}

	                        ) AND 
	                        Incident.StartTime >= {1} AND 
	                        Incident.EndTime <= {2}         
                        GROUP BY
	                        Incident.ID,
	                        System.Name,
	                        Circuit.Name,
	                        AltCircuit.Name,
	                        Meter.Name,
	                        IncidentAttribute.FaultType
                        ", id, startTime, endTime);
                    return Ok(record);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost, Route("Incidents/{id:int}")]
        public IHttpActionResult PostSOEIncidents(int id, [FromBody] IEnumerable<SOEIncident> incidents)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    DbSOE soe = new TableOperations<DbSOE>(connection).QueryRecordWhere("ID = {0}", id);

                    connection.ExecuteNonQuery("DELETE FROM SOEIncident WHERE SOEID = {0}", id);
                    foreach (SOEIncident incident in incidents) {
                        new TableOperations<SOEIncident>(connection).AddNewOrUpdateRecord(incident);
                    }
                    return Ok($"Updated {incidents.Count()} records for SOE_UID {soe.ID}");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        public class PostData {
            public IEnumerable<SOEIncident> Incidents { get; set; }
            public DbSOE SOE { get; set; }
        }
        [HttpPost, Route("New")]
        public IHttpActionResult PostNewSOE( [FromBody] PostData postData)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    postData.SOE.Name = null;
                    new TableOperations<DbSOE>(connection).AddNewOrUpdateRecord(postData.SOE);
                    int soeID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                    connection.ExecuteNonQuery($"UPDATE SOE SET Name = 'xdaSOE{soeID}' WHERE ID = {soeID}");
                    foreach (SOEIncident incident in postData.Incidents)
                    {
                        incident.SOEID = soeID;
                        new TableOperations<SOEIncident>(connection).AddNewOrUpdateRecord(incident);
                    }
                    return Ok(soeID);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        private SOE.MATLAB.MATLABAnalytic ToAnalytic(AnalyticModel model)
        {
            string assemblyName = model.AssemblyName;
            string methodName = model.MethodName;
            MATLABAnalysisFunctionInvokerFactory invokerFactory = AnalysisFunctionFactory.GetAnalysisFunctionInvokerFactory(assemblyName, methodName);
            return new SOE.MATLAB.MATLABAnalytic(invokerFactory);
        }

        private static MATLABAnalysisFunctionFactory AnalysisFunctionFactory { get; } = new MATLABAnalysisFunctionFactory();

    }
}