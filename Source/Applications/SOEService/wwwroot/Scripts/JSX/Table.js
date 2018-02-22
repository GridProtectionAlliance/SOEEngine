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
var PropTypes = require("prop-types");
var _ = require("lodash");
var Table = (function (_super) {
    __extends(Table, _super);
    function Table(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            cols: props.cols,
            data: props.data
        };
        return _this;
    }
    Table.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (!(_.isEqual(prevProps, this.props)))
            this.setState({ cols: this.props.cols, data: this.props.data });
    };
    Table.prototype.render = function () {
        var headerComponents = this.generateHeaders(), rowComponents = this.generateRows();
        return (React.createElement("table", { className: "table table-condensed table-hover" },
            React.createElement("thead", null, headerComponents),
            React.createElement("tbody", null, rowComponents)));
    };
    Table.prototype.generateHeaders = function () {
        var cols = this.state.cols;
        return (React.createElement("tr", null, cols.map(function (colData) {
            return React.createElement("th", { key: colData.key }, colData.label);
        })));
    };
    Table.prototype.generateRows = function () {
        var ctrl = this;
        var cols = ctrl.state.cols, data = ctrl.state.data;
        return data.map(function (item) {
            var cells = cols.map(function (colData) {
                return React.createElement("td", { key: item[colData.key] + colData.key, onClick: ctrl.handleClick.bind({ col: colData.key, row: item, data: item[colData.key] }) }, item[colData.key]);
            });
            return React.createElement("tr", { key: item.id }, cells);
        });
    };
    Table.prototype.handleClick = function (event) {
        console.log(this);
    };
    Table.propTypes = {
        cols: PropTypes.array,
        data: PropTypes.array
    };
    Table.defaultProps = {
        cols: [],
        data: []
    };
    return Table;
}(React.Component));
exports.default = Table;
;
//# sourceMappingURL=Table.js.map