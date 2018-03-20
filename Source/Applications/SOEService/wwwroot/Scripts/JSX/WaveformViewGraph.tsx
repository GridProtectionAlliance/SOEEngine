//******************************************************************************************************
//  WaveformViewGraph.tsx - Gbtc
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
import * as _ from "lodash";
import * as moment from "moment";
import Legend from './Legend';

const color = {
    VX1: '#A30000',
    VX2: '#0029A3',
    VX3: '#007A29',
    VY1: '#A30000',
    VY2: '#0029A3',
    VY3: '#007A29',
    I1: '#FF0000',
    I2: '#0066CC',
    I3: '#33CC33',
    IR: '#999999'
}

export default class WaveformViewerGraph extends React.Component<any, any>{
    soeservice: SOEService;
    flot: any;
    options: object;
    constructor(props) {
        super(props);
        this.soeservice = new SOEService();
        var ctrl = this;

        ctrl.state = {
            circuitId: props.circuitId,
            meterId: props.meterId,
            startDate: props.startDate,
            endDate: props.endDate,
            type: props.type,
            pixels: props.pixels,
            stateSetter: props.stateSetter,
            legendRow: [], 
            dataSet: []
        };
        ctrl.options = {
            canvas: true,
            legend: { show: false },
            crosshair: { mode: "x" },
            selection: { mode: "x" },
            grid: {
                autoHighlight: false,
                clickable: true,
                hoverable: true
            },
            xaxis: {
                mode: "time",
                tickLength: 10,
                min: ctrl.state.StartDate,
                max: ctrl.state.EndDate,
                ticks: function (axis) {
                    var ticks = [],
                        start = ctrl.floorInBase(axis.min, axis.tickSize),
                        i = 0,
                        v = Number.NaN,
                        prev;

                    do {
                        prev = v;
                        v = start + i * axis.tickSize;
                        ticks.push(v);
                        ++i;
                    } while (v < axis.max && v != prev);
                    return ticks;
                },
                tickFormatter: function (value, axis) {
                    if (axis.delta < 1) {
                        var trunc = value - ctrl.floorInBase(value, 1000);
                        return ctrl.defaultTickFormatter(trunc, axis) + " ms";
                    }

                    if (axis.delta < 1000) {
                        var format = moment(value).format("mm:ss");
                        var ticks = Math.floor(value * 10000);
                        var subsecond = ticks % 10000000;

                        while (subsecond > 0 && subsecond % 10 == 0)
                            subsecond /= 10;

                        if (subsecond != 0)
                            return format + "." + subsecond;

                        return format;
                    }
                    else {
                        var format = moment(value).utc().format("HH:mm:ss");
                        var ticks = Math.floor(value * 10000);
                        var subsecond = ticks % 10000000;

                        while (subsecond > 0 && subsecond % 10 == 0)
                            subsecond /= 10;

                        if (subsecond != 0)
                            return format + "." + subsecond;

                        return format;

                    }
                }
            },
            yaxis: {
                labelWidth: 50,
                panRange: false,
                tickLength: 10,
                tickFormatter: function (val, axis) {
                    if (axis.delta > 1000000 && (val > 1000000 || val < -1000000))
                        return ((val / 1000000) | 0) + "M";
                    else if (axis.delta > 1000 && (val > 1000 || val < -1000))
                        return ((val / 1000) | 0) + "K";
                    else
                        return val.toFixed(axis.tickDecimals);
                }
            }
        }
    }

    getData(state) {
        var ctrl = this;

        ctrl.soeservice.getIncidentData(state).then(data => {
            var newVessel = [];
            var legend = [];
            $.each(Object.keys(data), function (i, key) {
                newVessel.push({ label: key, data: data[key], color: color[key] });
                legend.push({ label: key, color: color[key], enabled: true });
            });
            $.plot($("#" + state.meterId + "-" + state.type), newVessel, this.options);
            this.setState({ legendRows: legend, dataSet: data });
            ctrl.plotSelected();
        });
    }
    componentWillReceiveProps(nextProps) {
        if (!(_.isEqual(this.props, nextProps))) {
            this.setState(nextProps);
            this.getData(nextProps);

        }
    }


    componentDidMount() {
        this.getData(this.state);
    }
    componentWillUnmount() {
        $("#" + this.state.meterId + "-" + this.state.type).off("plotselected");    
    }


    plotSelected() {
        var ctrl = this;

        $("#" + ctrl.state.meterId + "-" + ctrl.state.type).bind("plotselected", function(event, ranges){
            ctrl.state.stateSetter({ StartDate: moment(ranges.xaxis.from).utc().format('YYYY-MM-DDTHH:mm:ss.SSSSSSSSS'), EndDate: moment(ranges.xaxis.to).utc().format('YYYY-MM-DDTHH:mm:ss.SSSSSSSSS')});
        });
    }
    defaultTickFormatter(value, axis) {

        var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
        var formatted = "" + Math.round(value * factor) / factor;

        // If tickDecimals was specified, ensure that we have exactly that
        // much precision; otherwise default to the value's own precision.

        if (axis.tickDecimals != null) {
            var decimal = formatted.indexOf(".");
            var precision = decimal == -1 ? 0 : formatted.length - decimal - 1;
            if (precision < axis.tickDecimals) {
                return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision);
            }
        }

        return formatted;
    };
        // round to nearby lower multiple of base
    floorInBase(n, base) {
        return base * Math.floor(n / base);
    }

    handleSeriesLegendClick() {
        var newVessel = [];
        var legendKeys = this.state.legendRows.filter(x => x.enabled).map(x => x.label);
        $.each(Object.keys(this.state.dataSet), (i, key) => {
            if(legendKeys.indexOf(key) >= 0)
                newVessel.push({ label: key, data: this.state.dataSet[key], color: color[key] })
        });
        $.plot($("#" + this.state.meterId + "-" + this.state.type), newVessel, this.options);

    }

    render() {
        return (
            <div>
                <div id={this.state.meterId + "-" + this.state.type} style={{ height: '200px', float: 'left', width: this.state.pixels - 95 }}></div>
                <div id={this.state.meterId + "-" + this.state.type + '-legend'} style={{ height: '165px', marginTop: '5px', float: 'right', width: '75px', borderStyle: 'solid', borderWidth: '2px' }}>
                    <Legend data={this.state.legendRows} callback={this.handleSeriesLegendClick.bind(this)} />
                </div>
            </div>
        );
    }

}