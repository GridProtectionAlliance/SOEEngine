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
require("font-awesome/css/font-awesome.css");
require("primereact/resources/primereact.css");
require("primereact/resources/themes/omega/theme.css");
require("primereact/components/multiselect/MultiSelect.css");
var DataTable_1 = require("primereact/components/datatable/DataTable");
var Column_1 = require("primereact/components/column/Column");
var _ = require("lodash");
var moment = require("moment");
var SOEService_1 = require("./../Services/SOEService");
var PrimeDataTable = (function (_super) {
    __extends(PrimeDataTable, _super);
    function PrimeDataTable(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: [],
            dynamicColumns: [React.createElement(Column_1.Column, { key: "", field: "", header: "" })]
        };
        _this.soeservice = new SOEService_1.default();
        _this.callback = props.callback;
        return _this;
    }
    PrimeDataTable.prototype.getData = function (props) {
        var _this = this;
        this.soeservice.getView(props.filters).then(function (data) {
            _this.setState({ data: data });
            if (data.length == 0)
                return _this.setState({ dynamicColumns: [React.createElement(Column_1.Column, { key: "", field: "", header: "" })] });
            var headerStyle = {
                'transform': 'rotate(-45deg)',
                'transformOrigin': 'left top 0'
            };
            _this.setState({ data: data });
            var nonDynamicColumns = ["System", "Circuit", "Device", "Total", "CT Files", "SOE", "LTE", "PQS"];
            var dynamicColumns = Object.keys(data[0]).map(function (col, i) {
                if (nonDynamicColumns.indexOf(col) < 0)
                    return React.createElement(Column_1.Column, { key: col, field: col, style: { 'textAlign': 'center' }, body: _this.dateTemplate.bind(_this), header: React.createElement("div", { style: headerStyle }, col), sortable: true });
            });
            _this.setState({ dynamicColumns: dynamicColumns });
        });
    };
    PrimeDataTable.prototype.componentDidMount = function () { this.getData(this.props); };
    PrimeDataTable.prototype.componentWillReceiveProps = function (nextProps) {
        if (!(_.isEqual(this.props, nextProps)))
            this.getData(nextProps);
    };
    PrimeDataTable.prototype.systemTemplate = function (rowData, column) {
        var _this = this;
        return React.createElement("button", { className: 'btn btn-link', style: { 'width': '100%' }, onClick: function () { return _this.callback(rowData, column); } },
            React.createElement("span", null, rowData[column.field]));
    };
    PrimeDataTable.prototype.circuitTemplate = function (rowData, column) {
        var _this = this;
        if (Number.isInteger(rowData[column.field]))
            return React.createElement("span", null, rowData[column.field]);
        else
            return React.createElement("button", { className: 'btn btn-link', style: { 'width': '100%' }, onClick: function () { return _this.callback(rowData, column); } },
                React.createElement("span", null, rowData[column.field]));
    };
    PrimeDataTable.prototype.dateTemplate = function (rowData, column) {
        var nameString = "";
        if (this.props.filters.levels == "System")
            nameString = rowData.System;
        else if (this.props.filters.levels == "Circuit")
            nameString = rowData.Circuit;
        else if (this.props.filters.levels == "Device")
            nameString = rowData.Device;
        var dateString = "";
        if (this.props.filters.timeContext == "Days")
            dateString = moment(column.field, "MM/DD/YYYY").format('YYYYMMDDHH');
        else if (this.props.filters.timeContext == "Months")
            dateString = moment(column.field + "-01", "MM/YYYY/DD").format('YYYYMMDDHH');
        else
            dateString = moment(column.field + "/" + this.props.filters.date.year(), "MM/DD HH/YYYY").format('YYYYMMDDHH');
        return React.createElement("a", { target: "_blank", style: { 'color': '#337ab7' }, href: "/IncidentEventCycleDataView.cshtml?levels=" + this.props.filters.levels + "&limits=" + this.props.filters.limits + "&timeContext=" + this.props.filters.timeContext + "&date=" + dateString + "&name=" + nameString + "&count=" + rowData[column.field] }, rowData[column.field]);
    };
    PrimeDataTable.prototype.getHref = function (props, rowData, column, nameString) {
    };
    PrimeDataTable.prototype.render = function () {
        return (React.createElement(DataTable_1.DataTable, { value: this.state.data, paginator: true, rows: 25 },
            React.createElement(Column_1.Column, { style: { width: "100px", 'textAlign': 'center' }, body: this.systemTemplate.bind(this), field: "System", header: "Volt Class", sortable: true }),
            React.createElement(Column_1.Column, { style: { width: "100px", 'textAlign': 'center' }, body: this.circuitTemplate.bind(this), field: "Circuit", header: "Circuit", sortable: true }),
            React.createElement(Column_1.Column, { style: { width: "100px", 'textAlign': 'center' }, field: "Device", header: "Device", sortable: true }),
            this.state.dynamicColumns,
            React.createElement(Column_1.Column, { style: { width: "75px", 'textAlign': 'center' }, field: "Total", header: "Total", sortable: true }),
            React.createElement(Column_1.Column, { style: { width: "75px", 'textAlign': 'center' }, field: "LTE", header: "LTE", sortable: true, body: function (data) { if (data.LTE == null)
                    return null; return data.LTE.toFixed(0); } }),
            React.createElement(Column_1.Column, { style: { width: "75px", 'textAlign': 'center' }, field: "PQS", header: "PQS", sortable: true, body: function (data) { if (data.PQS == null)
                    return null; return data.PQS.toFixed(2); } }),
            React.createElement(Column_1.Column, { style: { width: "85px", 'textAlign': 'center' }, field: "CT Files", header: "CT Files", sortable: true }),
            React.createElement(Column_1.Column, { style: { width: "75px", 'textAlign': 'center' }, field: "SOE", header: "SOE", sortable: true })));
    };
    return PrimeDataTable;
}(React.Component));
exports.default = PrimeDataTable;
//# sourceMappingURL=PrimeDataTableWrapper.js.map