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
var Legend = (function (_super) {
    __extends(Legend, _super);
    function Legend(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            data: props.data,
            callback: props.callback
        };
        return _this;
    }
    Legend.prototype.render = function () {
        var _this = this;
        var rows = [];
        $.each(this.state.data, function (i, d) {
            rows.push((React.createElement("tr", null,
                React.createElement("td", null,
                    React.createElement("button", { className: "btn btn-link", onClick: _this.state.callback },
                        React.createElement("div", { style: { border: '1px solid #ccc', padding: '1px' } },
                            React.createElement("div", { style: { width: ' 4px', height: 0, border: '5px solid ' + d.color, overflow: 'hidden' } })))),
                React.createElement("td", null,
                    React.createElement("span", null, d.label)))));
        });
        return (React.createElement("table", null,
            React.createElement("tbody", null, rows)));
    };
    return Legend;
}(React.Component));
exports.default = Legend;
//# sourceMappingURL=Legend.js.map