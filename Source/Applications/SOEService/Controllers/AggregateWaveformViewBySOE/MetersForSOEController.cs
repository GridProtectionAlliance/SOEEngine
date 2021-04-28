//******************************************************************************************************
//  MetersForSOEController.cs - Gbtc
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
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Http;
using SOE.Model;
namespace SOEService.Controllers
{
    public class MetersForSOEController : ApiController
    {
        public IHttpActionResult GetMetersForSOE(int id)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {
                    IEnumerable<Meter> records = new TableOperations<Meter>(connection).QueryRecordsWhere("ID IN (SELECT MeterID FROM Incident WHERE ID IN (SELECT IncidentID FROM SOEIncident WHERE SOEID ={0}))", id);
                    Dictionary<int, Meter> deviceForCircuitDict = records.ToDictionary(x => x.ID);
                    Meter nullMeter = new Meter() { AssetKey = "null" };

                    Dictionary<string, IEnumerable<Meter>> childGrouping = records.GroupBy(x =>
                    {
                        if (deviceForCircuitDict.ContainsKey(x.ParentNormalID ?? 0))
                            return deviceForCircuitDict[x.ParentNormalID ?? 0];
                        else
                            return nullMeter;
                    }).ToDictionary(x => x.Key.AssetKey, x => x.AsEnumerable());
                    List<Meter> devices = new List<Meter>();
                    IEnumerable<Meter> childDevices = childGrouping[nullMeter.AssetKey];
                    selfFunction(devices, childDevices, childGrouping);

                    return Ok(devices);
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