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
import 'font-awesome/css/font-awesome.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import * as DateRangePicker from 'bootstrap-daterangepicker';
import * as React from 'react';
import * as moment from 'moment'; 
import * as $ from 'jquery';
import * as PropTypes from 'prop-types';
import * as _ from "lodash";

export default class BootstrapDateRangePickerWrapper extends React.Component<any, any> {
    picker: any;
    static propTypes = {
        startDate: PropTypes.oneOfType([PropTypes.string.isRequired,PropTypes.object.isRequired]),
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

    static defaultProps = {
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
        inputName:'daterange',
    };

    constructor(props) {
        super(props);

        this.state = {
            date: moment(props.startDate.toISOString()),
        };

    }

    componentDidMount() {
        var ctrl = this;

        ctrl.picker = new DateRangePicker('input[name="' + ctrl.props.inputName + '"]', this.props,
            (date) => { 
                ctrl.setState({ date: moment(date.toISOString())}); }
        );

        if(ctrl.props.showDateRangePicker != undefined)
            $('input[name="' + ctrl.props.inputName + '"]').on('show.daterangepicker', function () { ctrl.props.showDateRangePicker(ctrl.state) })
        if (ctrl.props.hideDateRangePicker != undefined)
            $('input[name="' + ctrl.props.inputName + '"]').on('hide.daterangepicker', function () { ctrl.props.hideDateRangePicker(ctrl.state) })
        if (ctrl.props.showCalendar != undefined)
            $('input[name="' + ctrl.props.inputName + '"]').on('showCalendar.daterangepicker', function () { ctrl.props.showCalendar(ctrl.state) })
        if (ctrl.props.hideCalendar != undefined)    
            $('input[name="' + ctrl.props.inputName + '"]').on('hideCalendar.daterangepicker', function () { ctrl.props.hideCalendar(ctrl.state) })
        if (ctrl.props.applyDateRangePicker != undefined)    
            $('input[name="' + ctrl.props.inputName + '"]').on('apply.daterangepicker', function () {
                ctrl.props.applyDateRangePicker(ctrl.state)
            })
        if (ctrl.props.cancelDateRangePicker != undefined)    
            $('input[name="' + ctrl.props.inputName + '"]').on('cancel.daterangepicker', function () { ctrl.props.cancelDateRangePicker(ctrl.state) })

    }
    componentWillReceiveProps(nextProps) { 
        if (!(_.isEqual(this.props.startDate, nextProps.startDate)))
            this.picker.setStartDate(nextProps.startDate);
    }

    componentWillUnmount() {
        var ctrl = this;

        $('input[name="' + ctrl.props.inputName + '"]').off('show.daterangepicker')
        $('input[name="' + ctrl.props.inputName + '"]').off('hide.daterangepicker')
        $('input[name="' + ctrl.props.inputName + '"]').off('showCalendar.daterangepicker')
        $('input[name="' + ctrl.props.inputName + '"]').off('hideCalendar.daterangepicker')
        $('input[name="' + ctrl.props.inputName + '"]').off('apply.daterangepicker')
        $('input[name="' + ctrl.props.inputName + '"]').off('cancel.daterangepicker')
    }

    render() {
        return (
            <div className="form-group">
                { this.props.formLabel != undefined ? (<label>{this.props.formLabel}</label>):(null)}
                <input className="form-control" type="text" name={this.props.inputName}/>
            </div>
         );
    }
}
