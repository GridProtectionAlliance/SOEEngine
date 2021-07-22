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
    IR: '#999999',
    VA: '#A30000',
    VB: '#0029A3',
    VC: '#007A29',
    IA: '#FF0000',
    IB: '#0066CC',
    IC: '#33CC33',
    IN: '#999999'


}

interface Props {
    circuitId: number, meterId: number, startDate: string, endDate: string, type: 'V' | 'I' | 'VY' | 'VX', pixels: number, stateSetter: (rsp: { StartDate: string, EndDate: string }) => void, showXAxis: boolean
}

interface IncidentData {
    VA: [number, number][],
    VB: [number, number][],
    VC: [number, number][],
    VX1: [number, number][],
    VX2: [number, number][],
    VX3: [number, number][],
    VY1: [number, number][],
    VY2: [number, number][],
    VY3: [number, number][],
    I1: [number, number][],
    I2: [number, number][],
    I3: [number, number][],
    IR: [number, number][],
    IA: [number, number][],
    IB: [number, number][],
    IC: [number, number][],
    IN: [number, number][],
}

export default class WaveformViewerGraph extends React.Component<Props, { legendRows: { label: string, color: string, enabled: boolean }[], dataSet: IncidentData[] }>{
    soeservice: SOEService;
    plot: jquery.flot.plot;
    options:  object//jquery.flot.plotOptions;
    xaxisHover;

    constructor(props: Props) {
        super(props);
        this.soeservice = new SOEService();
        let ctrl = this;

        ctrl.state = {
            legendRows: [], 
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
                    if ((axis as any).delta < 1) {
                        var trunc = value - ctrl.floorInBase(value, 1000);
                        return ctrl.defaultTickFormatter(trunc, axis) + " ms";
                    }

                    if ((axis as any).delta < 1000) {
                        return moment(value).format("mm:ss.SS");
                    }
                    else {
                        return moment(value).utc().format("HH:mm:ss.S");
                    }
                }
            },
            yaxis: {
                labelWidth: 50,
                ticks: 1,
                tickLength: 10,
                tickFormatter: function (val, axis) {
                    if ((axis as any).delta > 1000000 && (val > 1000000 || val < -1000000))
                        return ((val / 1000000) | 0) + "M";
                    else if (axis.delta > 1000 && (val > 1000 || val < -1000))
                        return ((val / 1000) | 0) + "K";
                    else
                        return val.toFixed(axis.tickDecimals);
                }
            }

        }

        this.handleSeriesLegendClick = this.handleSeriesLegendClick.bind(this);

    }

    getData(state: Props) {
        this.soeservice.getIncidentData(state).then((data: IncidentData[]) => {
            var legend = this.state.legendRows;

            if (this.state.legendRows.length == 0)
                legend = this.createLegendRows(data);
            this.createDataRows(data, legend);
            this.setState({ dataSet: data });
        });
    }

    componentDidUpdate(prevProps: Props) {
        if (!(_.isEqual(this.props, prevProps))) {
            this.getData(this.props);
        }
    }


    componentDidMount() {
        this.getData(this.props);
    }

    componentWillUnmount() {
        $(this.refs.chart).off("plotselected");
        $(this.refs.chart).off("plotzoom");
        $(this.refs.chart).off("plothover");
    }

    createLegendRows(data: IncidentData[]) {
        let legend: {label: string, color: string, enabled: boolean}[] = [];
        $.each(Object.keys(data), function (i, key) {
            legend.push({ label: key, color: color[key], enabled: true });
        });

        this.setState({ legendRows: legend });
        return legend;
    }

    createDataRows(data: IncidentData[], legend: { label: string, color: string, enabled: boolean }[]) {
        var newVessel: jquery.flot.dataSeries[] = [];
        var legendKeys = legend.filter(x => x.enabled).map(x => x.label);
        $.each(Object.keys(data), (i, key) => {
            if (legendKeys.indexOf(key) >= 0)
                newVessel.push({ label: key, data: data[key], color: color[key] })
        });

        newVessel.push({ data: [[this.getMillisecondTime(this.props.startDate), null], [this.getMillisecondTime(this.props.endDate), null]]});
        //this.plot = $.plot($(`#${this.props.meterId}-${this.props.type}`), newVessel, this.options);
        this.plot = $.plot($(this.refs.chart as HTMLElement), newVessel, this.options);

        this.plotSelected();
        //this.plotZoom();
        this.plotHover();
    }

    plotZoom() {
        var ctrl = this;
        
        $(this.refs.chart).off("plotzoom");
        $(this.refs.chart).bind("plotzoom", function (event, originalEvent) {
            //console.log(event, ctrl.plot.getAxes().xaxis, originalEvent, ctrl.xaxisHover);
            var minDelta = null;
            var maxDelta = 5;
            var xaxis = ctrl.plot.getAxes().xaxis;
            var xcenter = ctrl.xaxisHover;
            var xmin = xaxis.options.min;
            var xmax = xaxis.options.max;
            var datamin = (xaxis as any).datamin;
            var datamax = (xaxis as any).datamax;

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

            if (xmin == xaxis.options.min && xmax == xaxis.options.max)
                return;

            //console.log(ctrl.getDateString(xmin), ctrl.getDateString(xmax));
            ctrl.props.stateSetter({ StartDate: ctrl.getDateString(xmin), EndDate: ctrl.getDateString(xmax) });

        });

    }

    plotSelected() {
        var ctrl = this;
        $(this.refs.chart).off("plotselected");
        $(this.refs.chart).bind("plotselected", function(event, ranges){
            ctrl.props.stateSetter({ StartDate: ctrl.getDateString(ranges.xaxis.from), EndDate: ctrl.getDateString(ranges.xaxis.to)});
        });
    }

    plotHover() {
        var ctrl = this;
        $(this.refs.chart).off("plothover");
        $(this.refs.chart).bind("plothover", function (event, pos, item) {
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

    handleSeriesLegendClick(label: string) {
        let rows = [...this.state.legendRows];
        let index = rows.findIndex(r => r.label == label);
        rows[index].enabled = !rows[index].enabled;

        this.createDataRows(this.state.dataSet, rows);
        this.setState({ legendRows: rows });
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
                <div ref="chart" style={{ height: (this.props.showXAxis ? '95px' : '75px'), float: 'left', width: this.props.pixels - 100 - 180 , margin: '0x', padding: '0px'}}></div>
                <div id={`${this.props.meterId}-${ this.props.type}-legend`} style={{ float: 'right', width: '75px'}}>
                    <Legend data={this.state.legendRows} callback={(label) => this.handleSeriesLegendClick(label)} />
                </div>
            </div>
        );
    }

}