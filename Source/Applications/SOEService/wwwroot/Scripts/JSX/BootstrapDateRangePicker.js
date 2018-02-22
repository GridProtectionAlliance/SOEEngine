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
require("font-awesome/css/font-awesome.css");
require("bootstrap-daterangepicker/daterangepicker.css");
var DateRangePicker = require("bootstrap-daterangepicker");
var React = require("react");
var moment = require("moment");
var $ = require("jquery");
var PropTypes = require("prop-types");
var BootstrapDateRangePickerWrapper = (function (_super) {
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
            $('input[name="' + ctrl.props.inputName + '"]').on('apply.daterangepicker', function () {
                ctrl.props.applyDateRangePicker(ctrl.state);
            });
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
        startDate: moment().subtract(6, 'days').startOf('day'),
        endDate: moment().endOf('day'),
        showDropdowns: false,
        showWeekNumbers: false,
        timePicker: true,
        timePickerIncrement: 60,
        timePicker24Hour: true,
        timePickerSeconds: false,
        locale: {
            format: 'MM/DD/YYYY HH:mm'
        },
        ranges: {
            'Today': [moment().startOf('day'), moment().endOf('day')],
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