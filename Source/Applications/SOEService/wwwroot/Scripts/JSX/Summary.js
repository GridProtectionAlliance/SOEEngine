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
var BootstrapDateRangePicker_1 = require("./BootstrapDateRangePicker");
var PrimeDataTableWrapper_1 = require("./PrimeDataTableWrapper");
var Select_1 = require("./Select");
var Input_1 = require("./Input");
require("primereact/resources/primereact.css");
require("primereact/resources/themes/omega/theme.css");
require("primereact/components/multiselect/MultiSelect.css");
var moment = require("moment");
var createBrowserHistory_1 = require("history/createBrowserHistory");
var queryString = require("query-string");
var Summary = (function (_super) {
    __extends(Summary, _super);
    function Summary(props) {
        var _this = _super.call(this, props) || this;
        _this.history = createBrowserHistory_1.default();
        var query = queryString.parse(_this.history['location'].search);
        _this.state = {
            limits: (query['limits'] != undefined ? query['limits'] : 'All'),
            levels: (query['levels'] != undefined ? query['levels'] : 'Circuit'),
            date: (query['date'] != undefined ? query['date'] : moment().subtract(30, 'days').startOf('day').format('YYYYMMDDHH')),
            context: (query['context'] != undefined ? query['context'] : 'Days'),
            buckets: (query['buckets'] != undefined ? query['buckets'] : 30),
            filter: (query['filter'] != undefined ? query['filter'] : null)
        };
        _this.history['listen'](function (location, action) {
            var query = queryString.parse(_this.history['location'].search);
            _this.setState({
                limits: (query['limits'] != undefined ? query['limits'] : 'All'),
                levels: (query['levels'] != undefined ? query['levels'] : 'Circuit'),
                date: (query['date'] != undefined ? query['date'] : moment().subtract(30, 'days').startOf('day').format('YYYYMMDDHH')),
                context: (query['context'] != undefined ? query['context'] : 'Days'),
                buckets: (query['buckets'] != undefined ? query['buckets'] : 30),
                filter: (query['filter'] != undefined ? query['filter'] : null)
            });
        });
        return _this;
    }
    Summary.prototype.componentDidMount = function () {
    };
    Summary.prototype.changeDate = function (type) {
        var _this = this;
        switch (type) {
            case '<<':
                var date = moment(this.state.date, 'YYYYMMDDHH').subtract(this.state.buckets / 2, this.state.context.toLocaleLowerCase()).format('YYYYMMDDHH');
                break;
            case '<':
                var date = moment(this.state.date, 'YYYYMMDDHH').subtract(1, this.state.context.toLocaleLowerCase()).format('YYYYMMDDHH');
                break;
            case '>':
                var date = moment(this.state.date, 'YYYYMMDDHH').add(1, this.state.context.toLocaleLowerCase()).format('YYYYMMDDHH');
                break;
            case '>>':
                var date = moment(this.state.date, 'YYYYMMDDHH').add(this.state.buckets / 2, this.state.context.toLocaleLowerCase()).format('YYYYMMDDHH');
                break;
        }
        this.setState({ 'date': date }, function () { return _this.history['push']('Summary.cshtml?' + queryString.stringify(_this.state)); });
    };
    Summary.prototype.tableCallback = function (rowData, column) {
        var _this = this;
        var level = '';
        if (column.field == 'System')
            level = 'Circuit';
        else
            level = 'Device';
        this.setState({
            levels: level,
            filter: rowData[column.field]
        }, function () { return _this.history['push']('Summary.cshtml?' + queryString.stringify(_this.state)); });
    };
    Summary.prototype.render = function () {
        var _this = this;
        var ctrl = this;
        return (React.createElement("div", { style: { 'marginTop': '50px' } },
            React.createElement("div", { className: "panel-group" },
                React.createElement("div", { className: "panel panel-default" },
                    React.createElement("div", { className: "panel-heading" },
                        React.createElement("h4", { className: "panel-title" },
                            React.createElement("a", { style: { 'color': '#337ab7' }, "data-toggle": "collapse", href: "#collapse1" }, "Filter"))),
                    React.createElement("div", { id: "collapse1", className: "panel-collapse collapse in" },
                        React.createElement("div", { className: "panel-body" },
                            React.createElement("div", { className: "col-md-4" },
                                React.createElement(Select_1.default, { value: ctrl.state['limits'], options: ["All", "Top 100", "Top 50", "Top 25", "Top 10"], formLabel: "Record Limits:", onChange: function (value) { ctrl.setState({ 'limits': value }, function () { return ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state)); }); } }),
                                React.createElement(Select_1.default, { value: ctrl.state['levels'], options: ["System", "Circuit", "Device"], formLabel: "Search Levels:", onChange: function (value) { ctrl.setState({ 'levels': value }, function () { return ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state)); }); } }),
                                React.createElement(Input_1.default, { value: ctrl.state['filter'], clearable: true, formLabel: "Filter Text:", onChange: function (value) { ctrl.setState({ 'filter': value }, function () { return ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state)); }); } })),
                            React.createElement("div", { className: "col-md-4" },
                                React.createElement(BootstrapDateRangePicker_1.default, { formLabel: "Start Date:", startDate: moment(ctrl.state.date, 'YYYYMMDDHH'), singleDatePicker: true, showDropdowns: true, applyDateRangePicker: function (msg) {
                                        _this.setState({ 'date': msg.date.format('YYYYMMDDHH') }, function () { return ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state)); });
                                    } }),
                                React.createElement(Select_1.default, { value: ctrl.state['context'], options: ["Months", "Days", "Hours"], formLabel: "Time Context:", onChange: function (value) { ctrl.setState({ 'context': value }, function () { return ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state)); }); } }),
                                React.createElement(Input_1.default, { value: ctrl.state['buckets'], type: "number", formLabel: "Number of Buckets:", onChange: function (value) { ctrl.setState({ 'buckets': value }, function () { return ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state)); }); } })),
                            React.createElement("div", { className: "col-md-4" }))))),
            React.createElement("br", null),
            React.createElement("div", { style: { 'width': '100%', 'margin': '0' }, className: "row" },
                React.createElement("div", { className: "col-lg-6 col-md-6 col-sm-6", style: { textAlign: 'left', 'padding': '0' } },
                    React.createElement("button", { className: "btn btn-default", onClick: function (e) { return _this.changeDate('<<'); } },
                        '<<',
                        " Step"),
                    React.createElement("button", { className: "btn btn-default", onClick: function (e) { return _this.changeDate('<'); } },
                        '<',
                        " Nudge")),
                React.createElement("div", { className: "col-lg-6 col-md-6 col-sm-6", style: { textAlign: 'right', 'padding': '0' } },
                    React.createElement("button", { className: "btn btn-default", onClick: function (e) { return _this.changeDate('>'); } },
                        "Nudge ",
                        '>'),
                    React.createElement("button", { className: "btn btn-default", onClick: function (e) { return _this.changeDate('>>'); } },
                        "Step ",
                        '>>'))),
            React.createElement(PrimeDataTableWrapper_1.default, { filters: { date: this.state.date, timeContext: this.state.context, numBuckets: this.state.buckets, limits: this.state.limits, levels: this.state.levels, filter: this.state.filter }, callback: this.tableCallback.bind(this) })));
    };
    return Summary;
}(React.Component));
ReactDOM.render(React.createElement(Summary, null), document.getElementById('bodyContainer'));
//# sourceMappingURL=Summary.js.map