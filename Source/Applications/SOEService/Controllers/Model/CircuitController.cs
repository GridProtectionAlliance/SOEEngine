//******************************************************************************************************
//  CircuitController.cs - Gbtc
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
//  07/28/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using GSF.Web.Model;
using Newtonsoft.Json.Linq;
using SOE.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Http;

namespace SOEService.Controllers.Model
{
    [RoutePrefix("api/Circuit")]
    public class CircuitController : ModelController<Circuit>
    {
        //public override IHttpActionResult Post([FromBody] JObject record)
        //{
        //    record["GeoJSON"] = Encoding.UTF8.GetBytes(record["GeoJSONString"].Value<string>()); 
        //    return base.Post(record);
        //}

        public override IHttpActionResult Patch([FromBody] Circuit record)
        {
            //record.GeoJSON = Encoding.UTF8.GetBytes(record.GeoJSONString);
            return base.Patch(record);
        }
    }
}