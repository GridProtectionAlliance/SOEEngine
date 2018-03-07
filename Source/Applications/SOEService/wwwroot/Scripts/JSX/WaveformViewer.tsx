//******************************************************************************************************
//  waveform.tsx - Gbtc
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
//  03/06/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import SOEService from './../Services/SOEService';
import IncidentGroup from './IncidentGroup';
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import * as moment from 'moment';
import * as _ from "lodash";

class WaveformViewer extends React.Component<any, any>{
    soeservice: SOEService;
    history: object;
    resizeId: any;
    constructor(props){
        super(props);
        this.soeservice = new SOEService();
        this.history = createHistory();

        var query = queryString.parse(this.history['location'].search);

        this.state = {
            circuitId: (query['CircuitID'] != undefined ? query['CircuitID'] : 0),
            startDate: (query['StartDate'] != undefined ? query['StartDate'] : moment()),
            endDate: (query['EndDate'] != undefined ? query['EndDate'] : moment()),
            dynamicRows: [<div key="fake"></div>],
            pixels: window.innerWidth
        }

    }

    getData(state) {
        this.soeservice.getIncidentGroups(state).then(data => {
            var dynamicRows = data.map((d, i) => {
                return <IncidentGroup key={d["MeterID"]} circuitId={d["CircuitID"]} meterId={d["MeterID"]} startDate={d["StartTime"]} endDate={d["EndTime"]} pixels={this.state.pixels}></IncidentGroup>
            });

            this.setState({ dynamicRows: dynamicRows });
        });
    }

    componentDidMount() {
        this.getData(this.state);
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));
    }

    handleScreenSizeChange() {
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(() => {
            this.setState({ pixels: window.innerWidth });
            this.getData(this.state);
        }, 500);
    }

    render(){
        return this.state.dynamicRows;
    }
}

ReactDOM.render(<WaveformViewer />, document.getElementById('bodyContainer'));