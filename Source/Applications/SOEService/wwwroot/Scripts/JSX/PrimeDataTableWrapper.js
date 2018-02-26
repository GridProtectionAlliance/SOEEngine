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
var react_router_dom_1 = require("react-router-dom");
var PrimeDataTable = (function (_super) {
    __extends(PrimeDataTable, _super);
    function PrimeDataTable(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: [],
            dynamicColumns: [React.createElement(Column_1.Column, { key: "", field: "", header: "" })]
        };
        _this.soeservice = new SOEService_1.default();
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
            var nonDynamicColumns = ["System", "Circuit", "Device", "Total", "CT Files", "SOE"];
            var dynamicColumns = Object.keys(data[0]).map(function (col, i) {
                if (nonDynamicColumns.indexOf(col) < 0)
                    return React.createElement(Column_1.Column, { key: col, field: col, body: _this.dateTemplate.bind(_this), header: React.createElement("div", { style: headerStyle }, col), sortable: true, footer: _this.footerTemplate });
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
        return React.createElement(react_router_dom_1.Link, { to: "/System/" + rowData.System },
            React.createElement("span", { style: { 'width': '100%', 'cursor': 'pointer' } }, rowData[column.field]));
    };
    PrimeDataTable.prototype.circuitTemplate = function (rowData, column) {
        return React.createElement(react_router_dom_1.Link, { to: "/Circuit/" + rowData.Circuit },
            React.createElement("span", { style: { 'width': '100%', 'cursor': 'pointer' } }, rowData[column.field]));
    };
    PrimeDataTable.prototype.dateTemplate = function (rowData, column) {
        var nameString = "";
        if (this.props.filters.levels == "System")
            nameString = rowData.System;
        else if (this.props.filters.levels == "Circuit")
            nameString = rowData.Circuit;
        else if (this.props.filters.levels == "Device")
            nameString = rowData.Device;
        if (this.props.filters.timeContext == "Days")
            return React.createElement("a", { target: "_blank", href: "/IncidentEventCycleDataView.cshtml?levels=" + this.props.filters.levels + "&limits=" + this.props.filters.limits + "&timeContext=" + this.props.filters.timeContext + "&date=" + moment(column.field, "MM/DD/YYYY").format('YYYYMMDDHH') + "&name=" + nameString }, rowData[column.field]);
        else if (this.props.filters.timeContext == "Months")
            return React.createElement("a", { target: "_blank", href: "/IncidentEventCycleDataView.cshtml?levels=" + this.props.filters.levels + "&limits=" + this.props.filters.limits + "&timeContext=" + this.props.filters.timeContext + "&date=" + moment(column.field + "-01", "MM/YYYY/DD").format('YYYYMMDDHH') + "&name=" + nameString }, rowData[column.field]);
        else
            return React.createElement("a", { target: "_blank", href: "/IncidentEventCycleDataView.cshtml?levels=" + this.props.filters.levels + "&limits=" + this.props.filters.limits + "&timeContext=" + this.props.filters.timeContext + "&date=" + moment(column.field + "/" + this.props.filters.date.year(), "MM/DD HH/YYYY").format('YYYYMMDDHH') + "&name=" + nameString }, rowData[column.field]);
    };
    PrimeDataTable.prototype.footerTemplate = function (data) {
        return [React.createElement("td", null, "footers"), React.createElement("td", null, "totals")];
    };
    PrimeDataTable.prototype.render = function () {
        return (React.createElement(DataTable_1.DataTable, { value: this.state.data, paginator: true, rows: 25, rowGroupFooterTemplate: this.footerTemplate.bind(this.state.data) },
            React.createElement(Column_1.Column, { style: { width: "100px" }, body: this.systemTemplate, field: "System", header: "Volt Class", sortable: true }),
            React.createElement(Column_1.Column, { style: { width: "100px" }, body: this.circuitTemplate, field: "Circuit", header: "Circuit", sortable: true }),
            React.createElement(Column_1.Column, { style: { width: "100px" }, field: "Device", header: "Device", sortable: true }),
            this.state.dynamicColumns,
            React.createElement(Column_1.Column, { style: { width: "100px" }, field: "Total", header: "Total", sortable: true }),
            React.createElement(Column_1.Column, { style: { width: "100px" }, field: "CT Files", header: "CT Files", sortable: true }),
            React.createElement(Column_1.Column, { style: { width: "100px" }, field: "SOE", header: "SOE", sortable: true })));
    };
    return PrimeDataTable;
}(React.Component));
exports.default = PrimeDataTable;
//# sourceMappingURL=PrimeDataTableWrapper.js.map