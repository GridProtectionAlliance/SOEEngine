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
//  Wrapper class for Bootstrap Date Range Picker
//
//      http://www.daterangepicker.com/
//
//  License
//  The MIT License (MIT)
//
//  Copyright (c) 2012-2017 Dan Grossman
//  
//  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
//  associated documentation files (the "Software"), to deal in the Software without restriction, including 
//  without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
//  copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to
//  the following conditions:
//  The above copyright notice and this permission notice shall be included in all copies or substantial
//  portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE 
//  AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR 
//  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
//  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  02/05/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
require("font-awesome/css/font-awesome.css");
require("bootstrap-daterangepicker/daterangepicker.css");
var DateRangePicker = require("bootstrap-daterangepicker");
var React = require("react");
var moment = require("moment");
var $ = require("jquery");
var PropTypes = require("prop-types");
var BootstrapDateRangePickerWrapper = /** @class */ (function (_super) {
    __extends(BootstrapDateRangePickerWrapper, _super);
    function BootstrapDateRangePickerWrapper(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            date: props.date,
        };
        return _this;
    }
    BootstrapDateRangePickerWrapper.prototype.componentDidMount = function () {
        var ctrl = this;
        var picker = new DateRangePicker('input[name="' + ctrl.props.inputName + '"]', this.props, function (date) {
            ctrl.setState({ date: date });
        });
        if (ctrl.props.showDateRangePicker != undefined)
            $('input[name="' + ctrl.props.inputName + '"]').on('show.daterangepicker', function () { ctrl.props.showDateRangePicker(ctrl.state); });
        if (ctrl.props.hideDateRangePicker != undefined)
            $('input[name="' + ctrl.props.inputName + '"]').on('hide.daterangepicker', function () { ctrl.props.hideDateRangePicker(ctrl.state); });
        if (ctrl.props.showCalendar != undefined)
            $('input[name="' + ctrl.props.inputName + '"]').on('showCalendar.daterangepicker', function () { ctrl.props.showCalendar(ctrl.state); });
        if (ctrl.props.hideCalendar != undefined)
            $('input[name="' + ctrl.props.inputName + '"]').on('hideCalendar.daterangepicker', function () { ctrl.props.hideCalendar(ctrl.state); });
        if (ctrl.props.applyDateRangePicker != undefined)
            $('input[name="' + ctrl.props.inputName + '"]').on('apply.daterangepicker', function () { ctrl.props.applyDateRangePicker(ctrl.state); });
        if (ctrl.props.cancelDateRangePicker != undefined)
            $('input[name="' + ctrl.props.inputName + '"]').on('cancel.daterangepicker', function () { ctrl.props.cancelDateRangePicker(ctrl.state); });
    };
    BootstrapDateRangePickerWrapper.prototype.componentWillUnmount = function () {
        var ctrl = this;
        $('input[name="' + ctrl.props.inputName + '"]').off('show.daterangepicker');
        $('input[name="' + ctrl.props.inputName + '"]').off('hide.daterangepicker');
        $('input[name="' + ctrl.props.inputName + '"]').off('showCalendar.daterangepicker');
        $('input[name="' + ctrl.props.inputName + '"]').off('hideCalendar.daterangepicker');
        $('input[name="' + ctrl.props.inputName + '"]').off('apply.daterangepicker');
        $('input[name="' + ctrl.props.inputName + '"]').off('cancel.daterangepicker');
    };
    BootstrapDateRangePickerWrapper.prototype.render = function () {
        return (React.createElement("div", { className: "form-group" },
            this.props.formLabel != undefined ? (React.createElement("label", null, this.props.formLabel)) : (null),
            React.createElement("input", { className: "form-control", type: "text", name: this.props.inputName })));
    };
    BootstrapDateRangePickerWrapper.propTypes = {
        startDate: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.object.isRequired]),
        endDate: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.object.isRequired]),
        minDate: PropTypes.string,
        maxDate: PropTypes.string,
        dateLimit: PropTypes.object,
        showDropdowns: PropTypes.bool,
        showWeekNumbers: PropTypes.bool,
        timePicker: PropTypes.bool,
        timePickerIncrement: PropTypes.number,
        timePicker24Hour: PropTypes.bool,
        timePickerSeconds: PropTypes.bool,
        ranges: PropTypes.object,
        showCustomRangeLabel: PropTypes.bool,
        alwaysShowCalendars: PropTypes.bool,
        opens: PropTypes.string,
        drops: PropTypes.string,
        buttonClasses: PropTypes.array,
        applyClass: PropTypes.string,
        cancelClass: PropTypes.string,
        local: PropTypes.object,
        singleDatePicker: PropTypes.bool,
        autoApply: PropTypes.bool,
        linkedCalendars: PropTypes.bool,
        isInvalidDate: PropTypes.func,
        isCustomDate: PropTypes.func,
        autoUpdateInput: PropTypes.bool,
        parentE1: PropTypes.func,
        showDateRangePicker: PropTypes.func,
        hideDateRangePicker: PropTypes.func,
        showCalendar: PropTypes.func,
        hideCalendar: PropTypes.func,
        applyDateRangePicker: PropTypes.func,
        cancelDateRangePicker: PropTypes.func,
        inputName: PropTypes.string,
        formLabel: PropTypes.string
    };
    BootstrapDateRangePickerWrapper.defaultProps = {
        startDate: moment().subtract(6, 'days').utc().startOf('day'),
        endDate: moment().utc().endOf('day'),
        showDropdowns: false,
        showWeekNumbers: false,
        timePicker: true,
        timePickerIncrement: 60,
        timePicker24Hour: true,
        timePickerSeconds: false,
        ranges: {
            'Today': [moment().utc().startOf('day'), moment().utc().endOf('day')],
            'Yesterday': [moment().utc().subtract(1, 'days').startOf('day'), moment().utc().subtract(1, 'days').endOf('day')],
            'Last 7 Days': [moment().utc().subtract(6, 'days').startOf('day'), moment().utc().endOf('day')],
            'Last 30 Days': [moment().utc().subtract(29, 'days').startOf('day'), moment().utc().endOf('day')],
            'This Month': [moment().utc().startOf('month').startOf('day'), moment().utc().endOf('month').endOf('day')],
            'Last Month': [moment().utc().subtract(1, 'month').startOf('month').startOf('day'), moment().utc().subtract(1, 'month').endOf('month').endOf('day')]
        },
        showCustomRangeLabel: true,
        alwaysShowCalendars: true,
        opens: 'center',
        drops: 'down',
        singleDatePicker: false,
        autoApply: true,
        linkedCalendars: true,
        autoUpdateInput: true,
        parentE1: undefined,
        showDateRangePicker: undefined,
        hideDateRangePicker: undefined,
        showCalendar: undefined,
        hideCalendar: undefined,
        applyDateRangePicker: undefined,
        cancelDateRangePicker: undefined,
        inputName: 'daterange',
    };
    return BootstrapDateRangePickerWrapper;
}(React.Component));
exports.default = BootstrapDateRangePickerWrapper;
//# sourceMappingURL=BootstrapDateRangePicker.js.map