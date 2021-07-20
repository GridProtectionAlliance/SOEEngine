//******************************************************************************************************
//  IncidentGroupController.cs - Gbtc
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
using System.Linq;
using System.Collections.Generic;
using System.Data;
using System.Web.Http;
namespace SOEService.Controllers
{
    [RoutePrefix("api/IncidentGroups/SOE")]
    public class IncidentGroupController: ApiController
    {
        [HttpGet, Route("{id}")]
        public IHttpActionResult GetIncidentGroups(int id)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    SOE.Model.SOE soe = new TableOperations<SOE.Model.SOE>(connection).QueryRecordWhere("ID = {0}", id);

                    DataTable records = connection.RetrieveData(@"
                        SELECT
	                        DISTINCT
	                        Meter.ID as MeterID,
	                        SOE.StartTime,
	                        SOE.EndTime,
	                        Meter.Name as MeterName,
	                        Meter.CircuitID,
	                        Meter.ParentNormalID as ParentID,
	                        Meter.Orientation,
	                        Line.AssetKey as LineName,
                            SOEIncident.[Order],
                            SOEIncident.ID as SOEIncidentID,
	                        Incident.ID as IncidentID
                        FROM
	                        Incident JOIN
	                        SOEIncident ON Incident.ID = SOEIncident.IncidentID JOIN
	                        SOE ON SOEIncident.SOEID = SOE.ID JOIN
	                        Meter ON Meter.ID = Incident.MeterID JOIN
	                        MeterLine ON Meter.ID = MeterLine.MeterID JOIN
	                        Line ON MeterLine.LineID = Line.ID
                        WHERE SOEIncident.SOEID = {0}
                        order by SOEIncident.[Order], Meter.Orientation
                    ", soe.ID) ;

                    if (soe.Name != null)
                        return Ok(records);
                    else if (records.Select().Select(x => x["Order"].ToString()).Where(x => x == "0").Count() == 0)
                        return Ok(records);

                    IEnumerable<Meter> meters = new TableOperations<Meter>(connection).QueryRecordsWhere("ID IN (SELECT MeterID FROM Incident WHERE ID IN (SELECT IncidentID FROM SOEIncident WHERE SOEID ={0}))", id);
                    Dictionary<int, Meter> deviceForCircuitDict = meters.ToDictionary(x => x.ID);
                    Meter nullMeter = new Meter() { AssetKey = "null" };

                    Dictionary<string, IEnumerable<Meter>> childGrouping = meters.GroupBy(x =>
                    {
                        if (deviceForCircuitDict.ContainsKey(x.ParentNormalID ?? 0))
                            return deviceForCircuitDict[x.ParentNormalID ?? 0];
                        else
                            return nullMeter;
                    }).ToDictionary(x => x.Key.AssetKey, x => x.AsEnumerable());
                    List<Meter> orderedMeters = new List<Meter>();
                    IEnumerable<Meter> childDevices = childGrouping[nullMeter.AssetKey];
                    selfFunction(orderedMeters, childDevices, childGrouping);

                    DataTable orderedRecords = orderedMeters.Select(meter => records.Select().First(record => record["MeterID"].ToString() == meter.ID.ToString())).ToArray().CopyToDataTable();

                    int index = 1;
                    foreach(DataRow row in orderedRecords.Select())
                    {
                        if (row["Order"].ToString() != index.ToString())
                        {
                            row["Order"] = index;
                            connection.ExecuteNonQuery("UPDATE SOEIncident SET [Order] = {0} WHERE ID = {1}", index, int.Parse(row["SOEIncidentID"].ToString()));
                        }

                        index++;
                    }
                    return Ok(orderedRecords);
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private void selfFunction(List<Meter> devices, IEnumerable<Meter> childDevices, Dictionary<string, IEnumerable<Meter>> dictionary)
        {
            foreach (Meter childDevice in childDevices)
            {
                devices.Add(childDevice);
                if (dictionary.ContainsKey(childDevice.AssetKey))
                {
                    IEnumerable<Meter> subChildDevices = dictionary[childDevice.AssetKey];
                    selfFunction(devices, subChildDevices, dictionary);
                }
            }
        }

    }

}