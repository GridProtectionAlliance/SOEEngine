"use strict";
//******************************************************************************************************
//  Default.tsx - Gbtc
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
var ReactDOM = require("react-dom");
var BootstrapDateRangePicker_1 = require("./BootstrapDateRangePicker");
var PrimeMultiselectWrapper_1 = require("./PrimeMultiselectWrapper");
var PrimeDataTableWrapper_1 = require("./PrimeDataTableWrapper");
var Select_1 = require("./Select");
var Input_1 = require("./Input");
require("primereact/resources/primereact.css");
require("primereact/resources/themes/omega/theme.css");
require("primereact/components/multiselect/MultiSelect.css");
var moment = require("moment");
var MainPage = /** @class */ (function (_super) {
    __extends(MainPage, _super);
    function MainPage(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            severity: 'Both',
            limits: 'All',
            levels: 'System',
            classifications: [],
            date: moment().subtract(6, 'days').utc().startOf('day'),
            timeContext: 'Days',
            numBuckets: 20,
            cars: []
        };
        return _this;
    }
    MainPage.prototype.componentDidMount = function () {
        this.setState({
            cars: [
                { label: 'Audi', value: 'Audi' },
                { label: 'BMW', value: 'BMW' },
                { label: 'Fiat', value: 'Fiat' },
                { label: 'Honda', value: 'Honda' },
                { label: 'Jaguar', value: 'Jaguar' },
                { label: 'Mercedes', value: 'Mercedes' },
                { label: 'Renault', value: 'Renault' },
                { label: 'VW', value: 'VW' },
                { label: 'Volvo', value: 'Volvo' }
            ]
        });
    };
    MainPage.prototype.applyFilter = function () {
    };
    MainPage.prototype.render = function () {
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
                                React.createElement(PrimeMultiselectWrapper_1.default, { value: ctrl.state.classifications, options: ctrl.state.cars, style: { width: '100%' }, formLabel: "Classification Filter:" }),
                                React.createElement(Select_1.default, { value: ctrl.state.limits, options: ["All", "Top 100", "Top 50", "Top 25", "Top 10"], formLabel: "Record Limits:", onChange: function (value) { ctrl.setState({ limits: value }); } }),
                                React.createElement(Select_1.default, { value: ctrl.state.levels, options: ["System", "Circuit", "Device"], formLabel: "Search Levels:", onChange: function (value) { ctrl.setState({ levels: value }); } })),
                            React.createElement("div", { className: "col-md-4" },
                                React.createElement(BootstrapDateRangePicker_1.default, { formLabel: "Date Range:", date: ctrl.state.date, singleDatePicker: true, showDropdowns: true, applyDateRangePicker: function (msg) {
                                        ctrl.setState({ date: msg.date });
                                    } }),
                                React.createElement(Select_1.default, { value: ctrl.state.timeContext, options: ["Months", "Days", "Hours"], formLabel: "Time Context:", onChange: function (value) { ctrl.setState({ timeContext: value }); } }),
                                React.createElement(Input_1.default, { value: ctrl.state.numBuckets, type: "number", formLabel: "Number of Buckets:", onChange: function (value) { ctrl.setState({ numBuckets: value }); } })),
                            React.createElement("div", { className: "col-md-4" }))))),
            React.createElement("br", null),
            React.createElement("div", null,
                React.createElement(PrimeDataTableWrapper_1.default, { filters: { date: this.state.date, timeContext: this.state.timeContext, numBuckets: this.state.numBuckets, limits: this.state.limits } }))));
    };
    MainPage.prototype.handleApply = function () {
        console.log('handled');
    };
    return MainPage;
}(React.Component));
ReactDOM.render(React.createElement(MainPage, null), document.getElementById('bodyContainer'));
//# sourceMappingURL=Default.js.map