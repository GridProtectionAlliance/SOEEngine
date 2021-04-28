//******************************************************************************************************
//  SOEService.ts - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  02/09/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import axios from '../../../node_modules/axios/index';
import * as $ from 'jquery';
import * as moment from 'moment'; 

export default class SOEService{
    getView(filters){
        return axios
            .post('/api/Main/GetView',{
                date: moment(filters.date, 'YYYYMMDDHH').format('YYYY-MM-DDTHH:mm:ssZ'),
                timeContext: filters.timeContext,
                numBuckets: filters.numBuckets,
                limits: filters.limits,
                levels: filters.levels,
                circuitName: (filters.levels == 'Device'? filters.filter : null),
                systemName: (filters.levels == 'Circuit' ? filters.filter : null)
            })
            .then(res => {
                return res.data;
            });
    };

    getIncidentGroups(incidentID) {
        return $.get(`/api/Main/GetIncidentGroups/model/${incidentID}`).done(res => res);
    }

    getIncidentData(filters: {meterId: number, type: string, circuitId: number, startDate: string, endDate: string, pixels: number}) {
        return axios
            .post('/api/Main/GetIncidentData/' + filters.meterId + '-' +filters.type, {
                circuitId: filters.circuitId,
                startDate: filters.startDate,
                endDate: filters.endDate,
                meterId: filters.meterId,
                type: filters.type,
                pixels: filters.pixels
            })
            .then(res => {
                return res.data;
            });

    }

    getEventID(incidentId) {
        return axios
            .get('/api/Main/GetEventID/event/' + incidentId)
            .then(res => {
                return res.data;
            });

    }

    getButtonColor(startDate: string, endDate: string, meterIds: Array<number>) {
        return axios
            .post('/api/Main/GetButtonColor/model', {
                startDate: startDate,
                endDate: endDate,
                meterIds: meterIds,
            });
    }

}

