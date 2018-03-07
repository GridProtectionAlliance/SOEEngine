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
var ReactDOM = require("react-dom");
var SOEService_1 = require("./../Services/SOEService");
var IncidentGroup_1 = require("./IncidentGroup");
var createBrowserHistory_1 = require("history/createBrowserHistory");
var queryString = require("query-string");
var moment = require("moment");
var WaveformViewer = (function (_super) {
    __extends(WaveformViewer, _super);
    function WaveformViewer(props) {
        var _this = _super.call(this, props) || this;
        _this.soeservice = new SOEService_1.default();
        _this.history = createBrowserHistory_1.default();
        var query = queryString.parse(_this.history['location'].search);
        _this.state = {
            circuitId: (query['CircuitID'] != undefined ? query['CircuitID'] : 0),
            startDate: (query['StartDate'] != undefined ? query['StartDate'] : moment()),
            endDate: (query['EndDate'] != undefined ? query['EndDate'] : moment()),
            dynamicRows: [React.createElement("div", { key: "fake" })]
        };
        return _this;
    }
    WaveformViewer.prototype.getData = function (state) {
        var _this = this;
        this.soeservice.getIncidentGroups(state).then(function (data) {
            var dynamicRows = data.map(function (d, i) {
                return React.createElement(IncidentGroup_1.default, { key: d["MeterID"], circuitId: d["CircuitID"], meterId: d["MeterID"], startDate: d["StartTime"], endDate: d["EndTime"] });
            });
            _this.setState({ dynamicRows: dynamicRows });
        });
    };
    WaveformViewer.prototype.componentDidMount = function () {
        this.getData(this.state);
    };
    WaveformViewer.prototype.render = function () {
        return this.state.dynamicRows;
    };
    return WaveformViewer;
}(React.Component));
ReactDOM.render(React.createElement(WaveformViewer, null), document.getElementById('bodyContainer'));
//# sourceMappingURL=WaveformViewer.js.map