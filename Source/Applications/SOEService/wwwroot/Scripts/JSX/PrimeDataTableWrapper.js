"use strict";
//******************************************************************************************************
//  PrimeDataTableWrapper.tsx - Gbtc
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
//  Wrapper class for Prime React Data Table licensed under The MIT License
//
//     https://www.primefaces.org/primereact/#/datatable
//
//  License
//  The MIT License (MIT)
//
//  Copyright (c) 2017 PrimeTek
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  02/09/2018 - Billy Ernest
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
require("font-awesome/css/font-awesome.css");
require("primereact/resources/primereact.css");
require("primereact/resources/themes/omega/theme.css");
require("primereact/components/multiselect/MultiSelect.css");
var DataTable_1 = require("primereact/components/datatable/DataTable");
var Column_1 = require("primereact/components/column/Column");
var _ = require("lodash");
var SOEService_1 = require("./../Services/SOEService");
var PrimeDataTable = /** @class */ (function (_super) {
    __extends(PrimeDataTable, _super);
    function PrimeDataTable(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {};
        _this.soeservice = new SOEService_1.default();
        return _this;
    }
    PrimeDataTable.prototype.getData = function (props) {
        var _this = this;
        this.soeservice.getView(props.filters).then(function (data) {
            if (data.length == 0)
                return;
            var headerStyle = {
                'transform': 'rotate(-45deg)',
                'transformOrigin': 'left top 0'
            };
            var dynamicColumns = Object.keys(data[0]).map(function (col, i) {
                if (!isNaN(Date.parse(col)))
                    return React.createElement(Column_1.Column, { key: col, field: col, header: React.createElement("div", { style: headerStyle }, col), sortable: true });
                else
                    return React.createElement(Column_1.Column, { style: { width: "100px" }, key: col, field: col, header: col, sortable: true });
            });
            return _this.setState({ data: data, dynamicColumns: dynamicColumns });
        });
    };
    PrimeDataTable.prototype.componentDidMount = function () { this.getData(this.props); };
    PrimeDataTable.prototype.componentWillReceiveProps = function (nextProps) {
        if (!(_.isEqual(this.props, nextProps)))
            this.getData(nextProps);
    };
    PrimeDataTable.prototype.render = function () {
        return (React.createElement(DataTable_1.DataTable, { value: this.state.data, paginator: true, rows: 25 }, this.state.dynamicColumns));
    };
    return PrimeDataTable;
}(React.Component));
exports.default = PrimeDataTable;
//# sourceMappingURL=PrimeDataTableWrapper.js.map