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
var WaveformViewGraph_1 = require("./WaveformViewGraph");
var _ = require("lodash");
var SOEService_1 = require("./../Services/SOEService");
var IncidentGroup = (function (_super) {
    __extends(IncidentGroup, _super);
    function IncidentGroup(props) {
        var _this = _super.call(this, props) || this;
        _this.soeservice = new SOEService_1.default();
        _this.state = {
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
        return _this;
    }
    IncidentGroup.prototype.componentWillReceiveProps = function (nextProps) {
        if (!(_.isEqual(this.props, nextProps))) {
            this.setState(nextProps);
        }
    };
    IncidentGroup.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { id: this.state.meterName, className: "list-group-item", style: { padding: 0 } },
            React.createElement("div", { className: "panel-heading", style: { textAlign: 'center', padding: '3px 0 0 0' } },
                React.createElement("h4", { className: "panel-title" }, this.state.meterName + ' [' + this.state.lineName + '] '),
                React.createElement("a", { onClick: function (e) { return _this.goToOpenSEE(_this.state.incidentId); } }, "View in OpenSEE")),
            (this.state.orientation.toUpperCase() == "XY" ?
                React.createElement("div", { className: "panel-body collapse in", style: { padding: '0' } },
                    React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "VX", pixels: this.state.pixels, stateSetter: this.props.stateSetter, showXAxis: false }),
                    React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "I", pixels: this.state.pixels, stateSetter: this.props.stateSetter, showXAxis: false }),
                    React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "VY", pixels: this.state.pixels, stateSetter: this.props.stateSetter, showXAxis: true }))
                : ''),
            (this.state.orientation.toUpperCase() == "YX" ?
                React.createElement("div", { className: "panel-body collapse in", style: { padding: '0' } },
                    React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "VY", pixels: this.state.pixels, stateSetter: this.props.stateSetter, showXAxis: false }),
                    React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "I", pixels: this.state.pixels, stateSetter: this.props.stateSetter, showXAxis: false }),
                    React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "VX", pixels: this.state.pixels, stateSetter: this.props.stateSetter, showXAxis: true }))
                : ''),
            (this.state.orientation.toUpperCase() == "" ?
                React.createElement("div", { className: "panel-body collapse in", style: { padding: '0' } },
                    React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "V", pixels: this.state.pixels, stateSetter: this.props.stateSetter, showXAxis: false }),
                    React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "I", pixels: this.state.pixels, stateSetter: this.props.stateSetter, showXAxis: true }))
                : ''),
            React.createElement("br", null)));
    };
    IncidentGroup.prototype.goToOpenSEE = function (incidentId) {
        this.soeservice.getEventID(incidentId).then(function (res) {
            window.open('/OpenSEE.cshtml?EventID=' + res.toString());
        });
    };
    IncidentGroup.prototype.stateSetter = function (obj) {
        this.setState(obj);
    };
    return IncidentGroup;
}(React.Component));
exports.default = IncidentGroup;
//# sourceMappingURL=IncidentGroup.js.map