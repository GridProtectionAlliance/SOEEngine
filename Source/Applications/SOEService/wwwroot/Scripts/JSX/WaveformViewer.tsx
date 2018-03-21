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
    dynamicRows: any;
    constructor(props){
        super(props);
        this.soeservice = new SOEService();
        this.history = createHistory();

        var query = queryString.parse(this.history['location'].search);

        this.state = {
            IncidentID: (query['IncidentID'] != undefined ? query['IncidentID'] : 0),
            StartDate: query['StartDate'],
            EndDate: query['EndDate']
        }

        this.dynamicRows = [<div key="fake"></div>];
        this.history['listen']((location, action) => {
            var query = queryString.parse(this.history['location'].search);
            this.setState({
                IncidentID: (query['IncidentID'] != undefined ? query['IncidentID'] : 0),
                StartDate: query['StartDate'],
                EndDate: query['EndDate']
            }, () => {
                this.getData(this.state);
            });
        });


    }

    getData(state) {
        this.soeservice.getIncidentGroups(state).then(data => {

            // if start and end date are not provided calculate them from the data set
            if (this.state.StartDate == null) {
                var startUnix = Math.min(...data.map((x) => moment(x.StartTime).unix() + (x.StartTime.indexOf('.') >= 0 ? parseFloat('.' + x.StartTime.split('.')[1]) : 0)));
                var startString = '';
                if (startUnix.toString().indexOf('.') >= 0)
                    startString = moment.unix(parseInt(startUnix.toString().split('.')[0])).format('YYYY-MM-DDTHH:mm:ss') + '.' + startUnix.toString().split('.')[1];
                else
                    startString = moment.unix(startUnix).format('YYYY-MM-DDTHH:mm:ss')

                this.setState({ StartDate: startString });
            }
            if (this.state.EndDate == null) {
                var endUnix = Math.max(...data.map((x) => moment(x.EndTime).unix() + (x.EndTime.indexOf('.') >=0 ? parseFloat('.' + x.EndTime.split('.')[1]) : 0)));
                var endString = '';
                if (endUnix.toString().indexOf('.') >= 0)
                    endString = moment.unix(parseInt(endUnix.toString().split('.')[0])).format('YYYY-MM-DDTHH:mm:ss') + '.' + endUnix.toString().split('.')[1];
                else
                    endString = moment.unix(endUnix).format('YYYY-MM-DDTHH:mm:ss')

                this.setState({ EndDate: endString });
            }

            var parentIds = data.map(x => x.ParentID);
            var meterIds = data.map(x => x.MeterID);
            var parentMeterIndex = 
            this.dynamicRows = data.map((d, i) => {
                return <IncidentGroup key={d["MeterID"]} circuitId={d["CircuitID"]} meterId={d["MeterID"]} meterName={d["MeterName"]} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={window.innerWidth} stateSetter={this.stateSetter.bind(this)}></IncidentGroup>
            });
            this.forceUpdate();
        });
    }

    componentDidMount() {
        this.getData(this.state);
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));
    }

    handleScreenSizeChange() {
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(() => {
            this.getData(this.state);
        }, 500);
    }

    render(){
        return (
            <div className="panel-group">
                {this.dynamicRows}
            </div>
        );
    }

    stateSetter(obj) {
        this.setState(obj, () => this.history['push']('CommonAggregateView.cshtml?' + queryString.stringify(this.state, {encode: false})));
    }

}

ReactDOM.render(<WaveformViewer />, document.getElementById('bodyContainer'));