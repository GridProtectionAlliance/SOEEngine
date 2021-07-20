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

export default class IncidentGroup extends React.Component<{ lineName: string, incidentId: number, orientation: string, circuitId: number, meterId: number, meterName: string, startDate: string, endDate: string, pixels: number, stateSetter: (rsp: { StartDate: string, EndDate: string }) => void }, {}>{
    soeservice: SOEService;

    constructor(props) {
        super(props);
        this.soeservice = new SOEService();
    }

    render() {
        return (
            <div id={this.props.meterName} className="list-group-item" style={{padding: 0}}>
                <div className="panel-heading" style={{ textAlign: 'center', padding: '3px 0 0 0'}}>
                    <h4 className="panel-title">{this.props.meterName + ' [' + this.props.lineName + '] ' }</h4>
                    <a onClick={(e) => this.goToOpenSEE(this.props.incidentId)}>View in OpenSEE</a>
                </div>
                {(this.props.orientation.toUpperCase() == "XY" ?
                    <div className="panel-body collapse in" style={{ padding: '0' }}>
                        <WaveformViewerGraph circuitId={this.props.circuitId} meterId={this.props.meterId} startDate={this.props.startDate} endDate={this.props.endDate} type="VX" pixels={this.props.pixels} stateSetter={this.props.stateSetter} showXAxis={false}></WaveformViewerGraph>
                        <WaveformViewerGraph circuitId={this.props.circuitId} meterId={this.props.meterId} startDate={this.props.startDate} endDate={this.props.endDate} type="I" pixels={this.props.pixels} stateSetter={this.props.stateSetter} showXAxis={false}></WaveformViewerGraph>
                        <WaveformViewerGraph circuitId={this.props.circuitId} meterId={this.props.meterId} startDate={this.props.startDate} endDate={this.props.endDate} type="VY" pixels={this.props.pixels} stateSetter={this.props.stateSetter} showXAxis={true}></WaveformViewerGraph>
                    </div>
                    : ''
                )}
                {(this.props.orientation.toUpperCase() == "YX" ?
                    <div className="panel-body collapse in" style={{ padding: '0' }}>
                        <WaveformViewerGraph circuitId={this.props.circuitId} meterId={this.props.meterId} startDate={this.props.startDate} endDate={this.props.endDate} type="VY" pixels={this.props.pixels} stateSetter={this.props.stateSetter} showXAxis={false}></WaveformViewerGraph>
                        <WaveformViewerGraph circuitId={this.props.circuitId} meterId={this.props.meterId} startDate={this.props.startDate} endDate={this.props.endDate} type="I" pixels={this.props.pixels} stateSetter={this.props.stateSetter} showXAxis={false}></WaveformViewerGraph>
                        <WaveformViewerGraph circuitId={this.props.circuitId} meterId={this.props.meterId} startDate={this.props.startDate} endDate={this.props.endDate} type="VX" pixels={this.props.pixels} stateSetter={this.props.stateSetter} showXAxis={true}></WaveformViewerGraph>
                    </div>
                    : ''
                )}
                {(this.props.orientation.toUpperCase() == "" ?
                    <div className="panel-body collapse in" style={{ padding: '0' }}>
                        <WaveformViewerGraph circuitId={this.props.circuitId} meterId={this.props.meterId} startDate={this.props.startDate} endDate={this.props.endDate} type="V" pixels={this.props.pixels} stateSetter={this.props.stateSetter} showXAxis={false}></WaveformViewerGraph>
                        <WaveformViewerGraph circuitId={this.props.circuitId} meterId={this.props.meterId} startDate={this.props.startDate} endDate={this.props.endDate} type="I" pixels={this.props.pixels} stateSetter={this.props.stateSetter} showXAxis={true}></WaveformViewerGraph>
                    </div>
                    : ''
                )}

                <br />
            </div>
        );
    }

    goToOpenSEE(incidentId: number) {
        this.soeservice.getEventID(incidentId).then(res => {
            window.open('/OpenSEE.cshtml?EventID=' + res.toString());
        })
    }
}