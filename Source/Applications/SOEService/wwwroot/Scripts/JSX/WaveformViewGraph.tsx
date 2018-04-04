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
    plot: any;
    options: object;
    xaxisHover;

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
                hoverable: true,
                borderWidth: {
                    top: 0,
                    left: 1,
                    bottom: (props.showXAxis ? 1: 0),
                    right:0
                }
            },
            xaxis: {
                show: props.showXAxis,
                mode: "time",
                tickLength: 10,
                min: ctrl.state.StartDate,
                max: ctrl.state.EndDate,
                reserveSpace: false,
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
                        return moment(value).format("mm:ss.SS");
                    }
                    else {
                        return moment(value).utc().format("HH:mm:ss.S");
                    }
                }
            },
            yaxis: {
                labelWidth: 50,
                panRange: false,
                ticks: 1,
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
        this.soeservice.getIncidentData(state).then(data => {
            var legend = this.state.legendRows;

            if (this.state.legendRows == undefined)
                legend = this.createLegendRows(data);
            this.createDataRows(data, legend);
            this.setState({ dataSet: data });
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
        $("#" + this.state.meterId + "-" + this.state.type).off("plotzoom");
        $("#" + this.state.meterId + "-" + this.state.type).off("plothover");
    }

    createLegendRows(data) {
        var legend = [];
        $.each(Object.keys(data), function (i, key) {
            legend.push({ label: key, color: color[key], enabled: true });
        });

        this.setState({ legendRows: legend });
        return legend;
    }

    createDataRows(data, legend) {
        var newVessel = [];
        var legendKeys = legend.filter(x => x.enabled).map(x => x.label);
        $.each(Object.keys(data), (i, key) => {
            if (legendKeys.indexOf(key) >= 0)
                newVessel.push({ label: key, data: data[key], color: color[key] })
        });

        newVessel.push([[this.getMillisecondTime(this.state.startDate), null], [this.getMillisecondTime(this.state.endDate), null]]);
        this.plot = $.plot($("#" + this.state.meterId + "-" + this.state.type), newVessel, this.options);
        this.plotSelected();
        this.plotZoom();
        this.plotHover();
    }

    plotZoom() {
        var ctrl = this;
        $("#" + this.state.meterId + "-" + this.state.type).off("plotzoom");
        $("#" + ctrl.state.meterId + "-" + ctrl.state.type).bind("plotzoom", function (event, originalEvent) {
            //console.log(event, ctrl.plot.getAxes().xaxis, originalEvent, ctrl.xaxisHover);
            var minDelta = null;
            var maxDelta = 5;
            var xaxis = ctrl.plot.getAxes().xaxis;
            var xcenter = ctrl.xaxisHover;
            var xmin = xaxis.options.min;
            var xmax = xaxis.options.max;
            var datamin = xaxis.datamin;
            var datamax = xaxis.datamax;

            var deltaMagnitude;
            var delta;
            var factor;

            if (xmin == null)
                xmin = datamin;

            if (xmax == null)
                xmax = datamax;

            if (xmin == null || xmax == null)
                return;

            xcenter = Math.max(xcenter, xmin);
            xcenter = Math.min(xcenter, xmax);

            if (originalEvent.wheelDelta != undefined)
                delta = originalEvent.wheelDelta;
            else
                delta = -originalEvent.detail;

            deltaMagnitude = Math.abs(delta);

            if (minDelta == null || deltaMagnitude < minDelta)
                minDelta = deltaMagnitude;

            deltaMagnitude /= minDelta;
            deltaMagnitude = Math.min(deltaMagnitude, maxDelta);
            factor = deltaMagnitude / 10;

            if (delta > 0) {
                xmin = xmin * (1 - factor) + xcenter * factor;
                xmax = xmax * (1 - factor) + xcenter * factor;
            } else {
                xmin = (xmin - xcenter * factor) / (1 - factor);
                xmax = (xmax - xcenter * factor) / (1 - factor);
            }

            if (xmin == xaxis.options.xmin && xmax == xaxis.options.xmax)
                return;

            //console.log(ctrl.getDateString(xmin), ctrl.getDateString(xmax));
            ctrl.state.stateSetter({ StartDate: ctrl.getDateString(xmin), EndDate: ctrl.getDateString(xmax) });

        });

    }

    plotSelected() {
        var ctrl = this;
        $("#" + this.state.meterId + "-" + this.state.type).off("plotselected");    
        $("#" + ctrl.state.meterId + "-" + ctrl.state.type).bind("plotselected", function(event, ranges){
            ctrl.state.stateSetter({ StartDate: ctrl.getDateString(ranges.xaxis.from), EndDate: ctrl.getDateString(ranges.xaxis.to)});
        });
    }

    plotHover() {
        var ctrl = this;
        $("#" + this.state.meterId + "-" + this.state.type).off("plothover");
        $("#" + ctrl.state.meterId + "-" + ctrl.state.type).bind("plothover", function (event, pos, item) {
            ctrl.xaxisHover = pos.x;
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
        this.createDataRows(this.state.dataSet, this.state.legendRows);
    }

    getMillisecondTime(date) {
        var milliseconds = moment.utc(date).valueOf();
        var millisecondsFractionFloat = parseFloat((date.toString().indexOf('.') >= 0 ? '.' + date.toString().split('.')[1] : '0'))*1000;
      
        return milliseconds + millisecondsFractionFloat - Math.floor(millisecondsFractionFloat);
    }

    getDateString(float) {
        var date = moment.utc(float).format('YYYY-MM-DDTHH:mm:ss.SSS');
        var millisecondFraction = parseInt((float.toString().indexOf('.') >= 0 ? float.toString().split('.')[1] : '0'))

        return date + millisecondFraction.toString();
    }

    render() {
        return (
            <div>
                <div id={this.state.meterId + "-" + this.state.type} style={{ height: (this.props.showXAxis ? '95px' :'75px'), float: 'left', width: this.state.pixels - 100 - 180 , margin: '0x', padding: '0px'}}></div>
                <div id={this.state.meterId + "-" + this.state.type + '-legend'} style={{ float: 'right', width: '75px'}}>
                    <Legend data={this.state.legendRows} callback={this.handleSeriesLegendClick.bind(this)} />
                </div>
            </div>
        );
    }

}