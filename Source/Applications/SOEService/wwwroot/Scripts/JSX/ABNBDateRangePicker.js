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
//******************************************************************************************************
//  DateRangePicker.tsx - Gbtc
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
//  02/05/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
require("react-dates/initialize");
require("react-dates/lib/css/_datepicker.css");
var react_dates_1 = require("react-dates");
var React = require("react");
var omit = require("lodash/omit");
var ABNBDateRangePickerWrapper = /** @class */ (function (_super) {
    __extends(ABNBDateRangePickerWrapper, _super);
    function ABNBDateRangePickerWrapper(props) {
        var _this = _super.call(this, props) || this;
        var focusedInput = null;
        if (props.autoFocus) {
            focusedInput = 'startDate';
        }
        else if (props.autoFocusEndDate) {
            focusedInput = 'endDate';
        }
        _this.state = {
            focusedInput: focusedInput,
            startDate: props.initialStartDate,
            endDate: props.initialEndDate,
        };
        _this.onDatesChange = _this.onDatesChange.bind(_this);
        _this.onFocusChange = _this.onFocusChange.bind(_this);
        return _this;
    }
    ABNBDateRangePickerWrapper.prototype.onDatesChange = function (_a) {
        var startDate = _a.startDate, endDate = _a.endDate;
        this.setState({ startDate: startDate, endDate: endDate });
    };
    ABNBDateRangePickerWrapper.prototype.onFocusChange = function (focusedInput) {
        this.setState({ focusedInput: focusedInput });
    };
    ABNBDateRangePickerWrapper.prototype.render = function () {
        var _a = this.state, focusedInput = _a.focusedInput, startDate = _a.startDate, endDate = _a.endDate;
        // autoFocus, autoFocusEndDate, initialStartDate and initialEndDate are helper props for the
        // example wrapper but are not props on the SingleDatePicker itself and
        // thus, have to be omitted.
        var props = omit(this.props, [
            'autoFocus',
            'autoFocusEndDate',
            'initialStartDate',
            'initialEndDate',
        ]);
        return (React.createElement("div", null,
            React.createElement(react_dates_1.DateRangePicker, { onDatesChange: this.onDatesChange, onFocusChange: this.onFocusChange, focusedInput: focusedInput, startDate: startDate, startDateId: 'startDate', endDate: endDate, endDateId: 'endDate' })));
    };
    return ABNBDateRangePickerWrapper;
}(React.Component));
exports.default = ABNBDateRangePickerWrapper;
//# sourceMappingURL=ABNBDateRangePicker.js.map