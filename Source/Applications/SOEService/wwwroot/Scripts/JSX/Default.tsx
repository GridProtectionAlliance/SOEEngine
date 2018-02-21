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
import { BrowserRouter as Router, Route, Redirect, Link } from 'react-router-dom'
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


class MainPage extends React.Component<any, any> {
  values: object;
  constructor(props) {
    super(props);

    this.state = {
        severity: 'Both',
        limits: 'All',
        levels: 'Circuit',
        classifications: [],
        date: moment().subtract(20, 'days').startOf('day'),
        timeContext: 'Days',
        numBuckets: 20,
        cars: []
    }

    this.values = {
        severity: 'Both',
        limits: 'All',
        levels: 'Circuit',
        date: moment().subtract(20, 'days').startOf('day'),
        timeContext: 'Days',
        numBuckets: 20
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
      this.setState({
          severity: this.values['severity'],
          limits: this.values['limits'],
          levels: this.values['levels'],
          date: this.values['date'],
          timeContext: this.values['timeContext'],
          numBuckets: this.values['numBuckets'],
      });
  }

  render() {
        var ctrl = this;

        return (
            <Router basename="Summary/Summary.cshtml">
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
                                {/*<PrimeMultiSelectWrapper value={ctrl.state.classifications} options={ctrl.state.cars} style={{ width: '100%' }} formLabel="Classification Filter:"/>*/}
                                <Select value={ctrl.values['limits']} options={["All", "Top 100", "Top 50", "Top 25", "Top 10"]} formLabel="Record Limits:" onChange={function (value) { ctrl.values['limits'] = value}}/>
                                <Select value={ctrl.values['levels']} options={["System", "Circuit", "Device"]} formLabel="Search Levels:" onChange={function (value) { ctrl.values['levels'] = value }}/>
                                {/*<Select value={ctrl.state.severity} options={["PQ","LTE", "Both"]} formLabel="Severity Filter:" onChange={function(value){ctrl.setState({severity: value})}}/>*/}

                            </div>
                            <div className="col-md-4">
                                <BootstrapDateRangePickerWrapper
                                    formLabel="Start Date:"
                                    startDate={ctrl.state.date}
                                    singleDatePicker={true}
                                    showDropdowns={true}
                                    applyDateRangePicker={function (msg) {
                                        ctrl.values['date'] = msg.date;
                                    }}
                                />
                                <Select value={ctrl.values['timeContext']} options={["Months", "Days", "Hours"]} formLabel="Time Context:" onChange={function (value) { ctrl.values['timeContext']=  value}}/>
                                <Input value={ctrl.values['numBuckets']} type="number" formLabel="Number of Buckets:" onChange={function (value) { ctrl.values['numBuckets'] = value}}/>
                            </div>
                            <div className="col-md-4"></div>

                          </div>
                          <div className="panel-footer" style={{textAlign: 'right'}}>
                            <Link to="/"><button className="btn btn-primary" onClick={this.applyFilter.bind(this)}>Apply</button></Link>
                          </div>
                        </div>
                      </div>
                    </div>
                
                    <br/>

                    <Route exact path="/" render={() => <PrimeDataTableWrapper filters={{ date: this.state.date, timeContext: this.state.timeContext, numBuckets: this.state.numBuckets, limits: this.state.limits, levels: this.state.levels }} />}></Route>
                    <Route exact path="/System/:systemName" render={({ match }) => <PrimeDataTableWrapper filters={{ date: this.state.date, timeContext: this.state.timeContext, numBuckets: this.state.numBuckets, limits: this.state.limits, levels: "Circuit", systemName: match.params.systemName }} />}></Route>
                    <Route exact path="/Circuit/:circuitName" render={({ match }) => <PrimeDataTableWrapper filters={{ date: this.state.date, timeContext: this.state.timeContext, numBuckets: this.state.numBuckets, limits: this.state.limits, levels: "Device", circuitName: match.params.circuitName }} />}></Route>
                </div>
            </Router>

            );
    }

    handleApply() {
        console.log('handled');
    }
}

ReactDOM.render(<MainPage />, document.getElementById('bodyContainer'));