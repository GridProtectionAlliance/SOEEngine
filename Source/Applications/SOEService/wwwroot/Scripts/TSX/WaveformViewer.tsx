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
import { Moment } from 'moment';
import { SOETools } from '@gpa-gemstone/application-typings';

interface IncidentReturn {
    CircuitID: number,
    EndTime: string,
    ID: number,
    LTE: number,
    LineName: string,
    MeterID: number,
    MeterName: string,
    Orientation: string,
    PQS: number,
    ParentID: number,
    StartTime: string
}

class WaveformViewer extends React.Component<{}, {IncidentID: number, StartDate: string, EndDate: string, Incidents: IncidentReturn[]}>{
    soeservice: SOEService;
    history: object;
    resizeId: any;
    dynamicRows: any;
    meterList: any;
    timeList: any;
    constructor(props){
        super(props);
        this.soeservice = new SOEService();
        this.history = createHistory();

        var query = queryString.parse(this.history['location'].search);

        this.state = {
            IncidentID: (query['IncidentID'] != undefined ? parseInt(query['IncidentID'] as string) : 0),
            StartDate: query['StartDate'] as string,
            EndDate: query['EndDate'] as string,
            Incidents: []
        }

        this.dynamicRows = [<div key="fake"></div>];
        this.history['listen']((location, action) => {

            var query = queryString.parse(this.history['location'].search);
            this.setState({
                IncidentID: (query['IncidentID'] != undefined ? parseInt(query['IncidentID'] as string) : 0),
                StartDate: query['StartDate'] as string,
                EndDate: query['EndDate'] as string
            }, () => {
                this.getData(this.state);
            });
        });

    }

    getData(state) {
        this.soeservice.getIncidentGroups(state.IncidentID).then((data: [IncidentReturn[], SOETools.Types.Meter[]]) => {
            var orderedData = data[1].filter(x => data[0].map(y => y.MeterID).indexOf(x.ID) >= 0).map(x => data[0][data[0].map(y => y.MeterID).indexOf(x.ID)])
            var startString = '';
            var startUnix = Math.min(...orderedData.map((x) => moment(x.StartTime).unix() + (x.StartTime.indexOf('.') >= 0 ? parseFloat('.' + x.StartTime.split('.')[1]) : 0)));
            if (startUnix.toString().indexOf('.') >= 0)
                startString = moment.unix(parseInt(startUnix.toString().split('.')[0])).format('YYYY-MM-DDTHH:mm:ss') + '.' + startUnix.toString().split('.')[1];
            else
                startString = moment.unix(startUnix).format('YYYY-MM-DDTHH:mm:ss')


            var endString = '';
            var endUnix = Math.max(...orderedData.map((x) => moment(x.EndTime).unix() + (x.EndTime.indexOf('.') >= 0 ? parseFloat('.' + x.EndTime.split('.')[1]) : 0)));
            if (endUnix.toString().indexOf('.') >= 0)
                endString = moment.unix(parseInt(endUnix.toString().split('.')[0])).format('YYYY-MM-DDTHH:mm:ss') + '.' + endUnix.toString().split('.')[1];
            else
                endString = moment.unix(endUnix).format('YYYY-MM-DDTHH:mm:ss')

            // if start and end date are not provided calculate them from the data set
            if (this.state.StartDate == null)
                this.setState({ StartDate: startString });
            if (this.state.EndDate == null)
                this.setState({ EndDate: endString });

            var parentIds = orderedData.map(x => x.ParentID);
            var meterIds = orderedData.map(x => x.MeterID);
            var numOfDates = 20;
            var interval = (this.getMillisecondTime(endString) - this.getMillisecondTime(startString)) / numOfDates;
            var dates = [startString];
            for (var i = 1; i < numOfDates - 1; ++i) {
                dates.push(this.getDateString(this.getMillisecondTime(startString) + i*interval)); 
            }
            dates.push(endString);
            this.meterList = orderedData.map(x => {
                return <a key={'#' + x.MeterName} onClick={(e) => this.goToDiv(x.MeterName)}>{x.MeterName}</a>;
            });
            this.timeList = dates.map((date, i) => <TimeSpanButton key={i} meterIds={meterIds} index={i} onClick={() => this.goToTime(date, interval / 2)} date={date} interval={interval}></TimeSpanButton>);
            this.dynamicRows = orderedData.map((d, i) => {
                return <IncidentGroup key={d.MeterID} lineName={d.LineName} incidentId={d.ID} orientation={d.Orientation} circuitId={d.CircuitID} meterId={d.MeterID} meterName={d.MeterName} startDate={this.state.StartDate} endDate={this.state.EndDate} pixels={window.innerWidth} stateSetter={(rsp) => this.stateSetter(rsp)}></IncidentGroup>
            });

            this.setState({ Incidents: orderedData });

            this.forceUpdate();
        });
    }

    goToTime(timeStamp, windowSize) {
        var milliseconds = this.getMillisecondTime(timeStamp);
        var startDate = this.getDateString(milliseconds - windowSize);
        var endDate = this.getDateString(milliseconds + windowSize);
        this.stateSetter({
            StartDate: startDate,
            EndDate: endDate
        });
    }

    goToDiv(meterName) {
        var element = document.getElementById(meterName);

        if (element) {

            if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
                element.tabIndex = -1;
            }

            element.focus();
        }
    }

    componentDidMount() {
        this.getData(this.state);
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));
        window.addEventListener("keyup", this.moveCharts.bind(this));
    }

    componentWillUnmount() {
        $(window).off('resize');
        $(window).off('keyup');
    }


    handleScreenSizeChange() {
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(() => {
            this.getData(this.state);
        }, 500);
    }

    render() {

        return (
            <div className="screen" style={{ height: window.innerHeight - 60 }}>
                <div className="vertical-menu">
                    {this.meterList}
                </div>
                <div className="waveform-viewer" style={{ width: window.innerWidth - 150 }}>
                    <div className="horizontal-row" style={{ width: '100%' }}>
                        <table className='table' style={{ width: '100%' }}>
                            <tbody>
                                <tr>
                                    <td><button className="btn" onClick={this.resetZoom.bind(this)}>Reset</button></td>
                                    <td>
                                        <span style={{ marginLeft: '3px', marginRight: '3px' }}> Quick Jump(Tmax/20):</span>
                                        {this.timeList}
                                    </td>
                                    <td><span style={{ marginLeft: '3px', marginRight: '3px' }}>Start: {this.state.StartDate}</span></td>
                                    <td><span style={{ marginLeft: '3px', marginRight: '3px' }}>Duration: {moment.duration(moment(this.state.EndDate).diff(moment(this.state.StartDate))).asSeconds()}s</span></td>
                                    <td><button onClick={() => {
                                        $.ajax({
                                            type: 'post',
                                            url: `api/SOE/New`,
                                            data: JSON.stringify({ SOE: { ID: 0, TimeWindows: 0, Name: '', Status: 'Draft', StartTime: this.state.StartDate, EndTime: this.state.EndDate  } as SOETools.Types.SOE, Incidents: this.state.Incidents.map((d,i) => ({ ID: 0, SOEID: 0, IncidentID: d.ID, Order: i + 1 })) }),
                                            contentType: 'application/json'
                                        }).done(soeID => window.open(`${homePath}AggregateWaveformViewerBySOE.cshtml?soeID=${soeID}`));

                                    }}>Create SOE</button></td>

                                </tr>
                            </tbody>
                        </table>                     
                    </div>
                    <div className="list-group" style={{ maxHeight: window.innerHeight - 100, overflowY: 'auto' }}>
                        {this.dynamicRows}
                    </div>
                </div>
            </div>
        );
    }

    stateSetter(obj) {
        this.setState(obj, () => this.history['push']('CommonAggregateView.cshtml?' + queryString.stringify(this.state, {encode: false})));
    }

    collapseAllPanels() {
        $('.in').removeClass('in')
    }

    resetZoom() {
        this.history['push']('CommonAggregateView.cshtml?' + queryString.stringify({ IncidentID: this.state.IncidentID }, { encode: false }));

    }

    moveCharts() {

    }

    getMillisecondTime(date) {
        var milliseconds = moment.utc(date).valueOf();
        var millisecondsFractionFloat = parseFloat((date.toString().indexOf('.') >= 0 ? '.' + date.toString().split('.')[1] : '0')) * 1000;

        return milliseconds + millisecondsFractionFloat - Math.floor(millisecondsFractionFloat);
    }

    getDateString(float) {
        var date = moment.utc(float).format('YYYY-MM-DDTHH:mm:ss.SSS');
        var millisecondFraction = parseInt((float.toString().indexOf('.') >= 0 ? float.toString().split('.')[1] : '0'))

        return date + millisecondFraction.toString();
    }


}

const TimeSpanButton = (props: { meterIds: number[], index: number, onClick: () => void, date: string, interval: number }) => {
    const [color, setColor] = React.useState<'yellow' | 'lightgrey'>('lightgrey');

    React.useEffect(() => {
        let soeservice = new SOEService();
        soeservice.getButtonColor(props.date, moment(props.date).add('milliseconds', props.interval).format(MomentFormat), props.meterIds).then(data => setColor(data.data ? 'yellow' : 'lightgrey'));
    }, []);

    return <button style={{ backgroundColor: color }} onClick={() => props.onClick()} title={props.date.toString()} className="btn">{props.index + 1}</button>;
}

ReactDOM.render(<WaveformViewer />, document.getElementById('bodyContainer'));