//******************************************************************************************************
//  IncidentGroup.tsx - Gbtc
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
import WaveformViewerGraph from './WaveformViewGraph';
import * as _ from "lodash";
import SOEService from './../Services/SOEService';

export default class IncidentGroup extends React.Component<any, any>{
    soeservice: SOEService;

    constructor(props) {
        super(props);
        this.soeservice = new SOEService();

        this.state = {
            incidentId: props.incidentId,
            meterId: props.meterId,
            startDate: props.startDate,
            endDate: props.endDate,
            circuitId: props.circuitId,
            pixels: props.pixels,
            meterName: props.meterName,
            orientation: props.orientation,
            lineName: props.lineName
        };
    }
    componentWillReceiveProps(nextProps) {
        if (!(_.isEqual(this.props, nextProps))) {
            this.setState(nextProps);
        }
    }

    render() {
        return (
            <div id={this.state.meterName} className="list-group-item" style={{padding: 0}}>
                <div className="panel-heading" style={{ textAlign: 'center', padding: '3px 0 0 0'}}>
                    <h4 className="panel-title">{this.state.meterName + ' [' + this.state.lineName + '] ' }</h4>
                    <a onClick={(e)=> this.goToOpenSEE(this.state.incidentId)}>View in OpenSEE</a>
                </div>
                {(this.state.orientation.toUpperCase() == "XY" ?
                    <div className="panel-body collapse in" style={{ padding: '0' }}>
                        <WaveformViewerGraph circuitId={this.state.circuitId} meterId={this.state.meterId} startDate={this.state.startDate} endDate={this.state.endDate} type="VX" pixels={this.state.pixels} stateSetter={this.props.stateSetter} showXAxis={false}></WaveformViewerGraph>
                        <WaveformViewerGraph circuitId={this.state.circuitId} meterId={this.state.meterId} startDate={this.state.startDate} endDate={this.state.endDate} type="I" pixels={this.state.pixels} stateSetter={this.props.stateSetter} showXAxis={false}></WaveformViewerGraph>
                        <WaveformViewerGraph circuitId={this.state.circuitId} meterId={this.state.meterId} startDate={this.state.startDate} endDate={this.state.endDate} type="VY" pixels={this.state.pixels} stateSetter={this.props.stateSetter} showXAxis={true}></WaveformViewerGraph>
                    </div>
                    : ''
                )}
                {(this.state.orientation.toUpperCase() == "YX" ?
                    <div className="panel-body collapse in" style={{ padding: '0' }}>
                        <WaveformViewerGraph circuitId={this.state.circuitId} meterId={this.state.meterId} startDate={this.state.startDate} endDate={this.state.endDate} type="VY" pixels={this.state.pixels} stateSetter={this.props.stateSetter} showXAxis={false}></WaveformViewerGraph>
                        <WaveformViewerGraph circuitId={this.state.circuitId} meterId={this.state.meterId} startDate={this.state.startDate} endDate={this.state.endDate} type="I" pixels={this.state.pixels} stateSetter={this.props.stateSetter} showXAxis={false}></WaveformViewerGraph>
                        <WaveformViewerGraph circuitId={this.state.circuitId} meterId={this.state.meterId} startDate={this.state.startDate} endDate={this.state.endDate} type="VX" pixels={this.state.pixels} stateSetter={this.props.stateSetter} showXAxis={true}></WaveformViewerGraph>
                    </div>
                    : ''
                )}
                {(this.state.orientation.toUpperCase() == "" ?
                    <div className="panel-body collapse in" style={{ padding: '0' }}>
                        <WaveformViewerGraph circuitId={this.state.circuitId} meterId={this.state.meterId} startDate={this.state.startDate} endDate={this.state.endDate} type="V" pixels={this.state.pixels} stateSetter={this.props.stateSetter} showXAxis={false}></WaveformViewerGraph>
                        <WaveformViewerGraph circuitId={this.state.circuitId} meterId={this.state.meterId} startDate={this.state.startDate} endDate={this.state.endDate} type="I" pixels={this.state.pixels} stateSetter={this.props.stateSetter} showXAxis={true}></WaveformViewerGraph>
                    </div>
                    : ''
                )}

                <br />
            </div>
        );
    }

    goToOpenSEE(incidentId) {
        this.soeservice.getEventID(incidentId).then(res => {
            window.open('/OpenSEE.cshtml?EventID=' + res.toString());
        })
    }

    stateSetter(obj) {
        this.setState(obj);
    }

}