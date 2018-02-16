"use strict";
//******************************************************************************************************
//  Table.tsx - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  02/06/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
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
var Table = /** @class */ (function (_super) {
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
        var cols = this.state.cols; // [{key, label}]
        // generate our header (th) cell components
        return (React.createElement("tr", null, cols.map(function (colData) {
            return React.createElement("th", { key: colData.key }, colData.label);
        })));
    };
    Table.prototype.generateRows = function () {
        var ctrl = this;
        var cols = ctrl.state.cols, // [{key, label}]
        data = ctrl.state.data;
        return data.map(function (item) {
            // build each cell
            var cells = cols.map(function (colData) {
                // colData.key might be "firstName"
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