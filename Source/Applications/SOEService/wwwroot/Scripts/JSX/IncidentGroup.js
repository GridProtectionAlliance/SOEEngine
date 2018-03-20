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
var IncidentGroup = (function (_super) {
    __extends(IncidentGroup, _super);
    function IncidentGroup(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            meterId: props.meterId,
            startDate: props.startDate,
            endDate: props.endDate,
            circuitId: props.circuitId,
            pixels: props.pixels,
            meterName: props.meterName
        };
        return _this;
    }
    IncidentGroup.prototype.componentWillReceiveProps = function (nextProps) {
        if (!(_.isEqual(this.props, nextProps))) {
            this.setState(nextProps);
        }
    };
    IncidentGroup.prototype.render = function () {
        return (React.createElement("div", { style: { height: '620px' } },
            React.createElement("div", { style: { height: '20px', textAlign: 'center' } }, this.state.meterName),
            React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "VX", pixels: this.state.pixels, stateSetter: this.props.stateSetter }),
            React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "I", pixels: this.state.pixels, stateSetter: this.props.stateSetter }),
            React.createElement(WaveformViewGraph_1.default, { circuitId: this.state.circuitId, meterId: this.state.meterId, startDate: this.state.startDate, endDate: this.state.endDate, type: "VY", pixels: this.state.pixels, stateSetter: this.props.stateSetter })));
    };
    IncidentGroup.prototype.stateSetter = function (obj) {
        this.setState(obj);
    };
    return IncidentGroup;
}(React.Component));
exports.default = IncidentGroup;
//# sourceMappingURL=IncidentGroup.js.map