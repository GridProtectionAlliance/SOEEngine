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
            IncidentID: (query['IncidentID'] != undefined ? query['IncidentID'] : 0),
            StartDate: query['StartDate'],
            EndDate: query['EndDate']
        };
        _this.dynamicRows = [React.createElement("div", { key: "fake" })];
        _this.history['listen'](function (location, action) {
            var query = queryString.parse(_this.history['location'].search);
            _this.setState({
                IncidentID: (query['IncidentID'] != undefined ? query['IncidentID'] : 0),
                StartDate: query['StartDate'],
                EndDate: query['EndDate']
            }, function () {
                _this.getData(_this.state);
            });
        });
        return _this;
    }
    WaveformViewer.prototype.getData = function (state) {
        var _this = this;
        this.soeservice.getIncidentGroups(state).then(function (data) {
            if (_this.state.StartDate == null) {
                _this.setState({
                    StartDate: moment.unix(Math.min.apply(Math, data.map(function (x) { return moment(x.StartTime).unix(); }))).format('YYYY-MM-DDTHH:mm:ss.SSSSSSSSS'),
                    EndDate: moment.unix(Math.max.apply(Math, data.map(function (x) { return moment(x.EndTime).unix(); }))).format('YYYY-MM-DDTHH:mm:ss.SSSSSSSSS')
                });
            }
            _this.dynamicRows = data.map(function (d, i) {
                return React.createElement(IncidentGroup_1.default, { key: d["MeterID"], circuitId: d["CircuitID"], meterId: d["MeterID"], meterName: d["MeterName"], startDate: _this.state.StartDate, endDate: _this.state.EndDate, pixels: window.innerWidth, stateSetter: _this.stateSetter.bind(_this) });
            });
            _this.forceUpdate();
        });
    };
    WaveformViewer.prototype.componentDidMount = function () {
        this.getData(this.state);
        window.addEventListener("resize", this.handleScreenSizeChange.bind(this));
    };
    WaveformViewer.prototype.handleScreenSizeChange = function () {
        var _this = this;
        clearTimeout(this.resizeId);
        this.resizeId = setTimeout(function () {
            _this.getData(_this.state);
        }, 500);
    };
    WaveformViewer.prototype.render = function () {
        return this.dynamicRows;
    };
    WaveformViewer.prototype.stateSetter = function (obj) {
        var _this = this;
        this.setState(obj, function () { return _this.history['push']('CommonAggregateView.cshtml?' + queryString.stringify(_this.state, { encode: false })); });
    };
    return WaveformViewer;
}(React.Component));
ReactDOM.render(React.createElement(WaveformViewer, null), document.getElementById('bodyContainer'));
//# sourceMappingURL=WaveformViewer.js.map