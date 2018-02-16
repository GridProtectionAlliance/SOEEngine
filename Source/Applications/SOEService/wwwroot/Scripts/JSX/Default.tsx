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

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Table from './Table'
import ABNBDateRangePickerWrapper from './ABNBDateRangePicker';
import BootstrapDateRangePickerWrapper from './BootstrapDateRangePicker';
import PrimeMultiSelectWrapper from './PrimeMultiselectWrapper';
import PrimeDataTableWrapper from './PrimeDataTableWrapper';
import Select from './Select';
import Input from './Input';

import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/components/multiselect/MultiSelect.css';
import {Accordion,AccordionTab} from 'primereact/components/accordion/Accordion';
import * as $ from 'jquery';
import * as moment from 'moment';


class MainPage extends React.Component<any,any> {
  constructor(props) {
    super(props);

    this.state = {
        severity: 'Both',
        limits: 'All',
        levels: 'System',
        classifications: [],
        date: moment().subtract(20, 'days').startOf('day'),
        timeContext: 'Days',
        numBuckets: 20,
        cars: []
    }
  }

  componentDidMount(){
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

  }

  applyFilter(){

  }

  render() {
        var ctrl = this;

        return (
            <div style={{'marginTop': '50px'}}>
                <div className="panel-group">
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h4 className="panel-title">
                        <a style={{'color': '#337ab7'}} data-toggle="collapse" href="#collapse1">Filter</a>
                      </h4>
                    </div>
                    <div id="collapse1" className="panel-collapse collapse in">
                      <div className="panel-body">
                                              <div className="col-md-4">
                            <PrimeMultiSelectWrapper value={ctrl.state.classifications} options={ctrl.state.cars} style={{ width: '100%' }} formLabel="Classification Filter:"/>
                            <Select value={ctrl.state.limits} options={["All","Top 100", "Top 50", "Top 25", "Top 10"]} formLabel="Record Limits:" onChange={function(value){ctrl.setState({limits: value})}}/>
                            <Select value={ctrl.state.levels} options={["System","Circuit", "Device"]} formLabel="Search Levels:" onChange={function(value){ctrl.setState({levels: value})}}/>
                            {/*<Select value={ctrl.state.severity} options={["PQ","LTE", "Both"]} formLabel="Severity Filter:" onChange={function(value){ctrl.setState({severity: value})}}/>*/}

                        </div>
                        <div className="col-md-4">
                            <BootstrapDateRangePickerWrapper
                                formLabel="Start Date:"
                                startDate={ctrl.state.date}
                                singleDatePicker={true}
                                showDropdowns={true}
                                applyDateRangePicker={function (msg) {
                                   ctrl.setState({date: msg.date});
                                }}
                            />
                            <Select value={ctrl.state.timeContext} options={["Months", "Days", "Hours"]} formLabel="Time Context:" onChange={function(value){ctrl.setState({timeContext: value})}}/>
                            <Input value={ctrl.state.numBuckets} type="number" formLabel="Number of Buckets:" onChange={function(value){ctrl.setState({numBuckets: value})}}/>
                        </div>
                        <div className="col-md-4"></div>

                      </div>
                    </div>
                  </div>
                </div>
                
                <br/>

                <div>
                    <PrimeDataTableWrapper filters={{date: this.state.date, timeContext: this.state.timeContext, numBuckets: this.state.numBuckets, limits: this.state.limits, levels: this.state.levels}} />
                </div>
            </div>
            );
    }

    handleApply() {
        console.log('handled');
    }
}

ReactDOM.render(<MainPage />, document.getElementById('bodyContainer'));