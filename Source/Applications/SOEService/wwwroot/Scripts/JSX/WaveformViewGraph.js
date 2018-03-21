"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var SOEService_1 = require("./../Services/SOEService");
var _ = require("lodash");
var moment = require("moment");
var Legend_1 = require("./Legend");
var color = {
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
};
var WaveformViewerGraph = (function (_super) {
    __extends(WaveformViewerGraph, _super);
    function WaveformViewerGraph(props) {
        var _this = _super.call(this, props) || this;
        _this.soeservice = new SOEService_1.default();
        var ctrl = _this;
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
                    var ticks = [], start = ctrl.floorInBase(axis.min, axis.tickSize), i = 0, v = Number.NaN, prev;
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
        };
        return _this;
    }
    WaveformViewerGraph.prototype.getData = function (state) {
        var _this = this;
        this.soeservice.getIncidentData(state).then(function (data) {
            var legend = _this.state.legendRows;
            if (_this.state.legendRows == undefined)
                legend = _this.createLegendRows(data);
            _this.createDataRows(data, legend);
            _this.setState({ dataSet: data });
        });
    };
    WaveformViewerGraph.prototype.componentWillReceiveProps = function (nextProps) {
        if (!(_.isEqual(this.props, nextProps))) {
            this.setState(nextProps);
            this.getData(nextProps);
        }
    };
    WaveformViewerGraph.prototype.componentDidMount = function () {
        this.getData(this.state);
    };
    WaveformViewerGraph.prototype.componentWillUnmount = function () {
        $("#" + this.state.meterId + "-" + this.state.type).off("plotselected");
    };
    WaveformViewerGraph.prototype.createLegendRows = function (data) {
        var legend = [];
        $.each(Object.keys(data), function (i, key) {
            legend.push({ label: key, color: color[key], enabled: true });
        });
        this.setState({ legendRows: legend });
        return legend;
    };
    WaveformViewerGraph.prototype.createDataRows = function (data, legend) {
        var newVessel = [];
        var legendKeys = legend.filter(function (x) { return x.enabled; }).map(function (x) { return x.label; });
        $.each(Object.keys(data), function (i, key) {
            if (legendKeys.indexOf(key) >= 0)
                newVessel.push({ label: key, data: data[key], color: color[key] });
        });
        newVessel.push([[this.getMillisecondTime(this.state.startDate), null], [this.getMillisecondTime(this.state.endDate), null]]);
        $.plot($("#" + this.state.meterId + "-" + this.state.type), newVessel, this.options);
        this.plotSelected();
    };
    WaveformViewerGraph.prototype.plotSelected = function () {
        var ctrl = this;
        $("#" + this.state.meterId + "-" + this.state.type).off("plotselected");
        $("#" + ctrl.state.meterId + "-" + ctrl.state.type).bind("plotselected", function (event, ranges) {
            ctrl.state.stateSetter({ StartDate: ctrl.getDateString(ranges.xaxis.from), EndDate: ctrl.getDateString(ranges.xaxis.to) });
        });
    };
    WaveformViewerGraph.prototype.defaultTickFormatter = function (value, axis) {
        var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
        var formatted = "" + Math.round(value * factor) / factor;
        if (axis.tickDecimals != null) {
            var decimal = formatted.indexOf(".");
            var precision = decimal == -1 ? 0 : formatted.length - decimal - 1;
            if (precision < axis.tickDecimals) {
                return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision);
            }
        }
        return formatted;
    };
    ;
    WaveformViewerGraph.prototype.floorInBase = function (n, base) {
        return base * Math.floor(n / base);
    };
    WaveformViewerGraph.prototype.handleSeriesLegendClick = function () {
        this.createDataRows(this.state.dataSet, this.state.legendRows);
    };
    WaveformViewerGraph.prototype.getMillisecondTime = function (date) {
        var milliseconds = moment.utc(date).valueOf();
        var millisecondsFractionFloat = parseFloat((date.toString().indexOf('.') >= 0 ? '.' + date.toString().split('.')[1] : '0')) * 1000;
        return milliseconds + millisecondsFractionFloat - Math.floor(millisecondsFractionFloat);
    };
    WaveformViewerGraph.prototype.getDateString = function (float) {
        var date = moment.utc(float).format('YYYY-MM-DDTHH:mm:ss.SSS');
        var millisecondFraction = parseInt((float.toString().indexOf('.') >= 0 ? float.toString().split('.')[1] : '0'));
        return date + millisecondFraction.toString();
    };
    WaveformViewerGraph.prototype.render = function () {
        return (React.createElement("div", null,
            React.createElement("div", { id: this.state.meterId + "-" + this.state.type, style: { height: '200px', float: 'left', width: this.state.pixels - 95 } }),
            React.createElement("div", { id: this.state.meterId + "-" + this.state.type + '-legend', style: { height: '165px', marginTop: '5px', float: 'right', width: '75px', borderStyle: 'solid', borderWidth: '2px' } },
                React.createElement(Legend_1.default, { data: this.state.legendRows, callback: this.handleSeriesLegendClick.bind(this) }))));
    };
    return WaveformViewerGraph;
}(React.Component));
exports.default = WaveformViewerGraph;
//# sourceMappingURL=WaveformViewGraph.js.map