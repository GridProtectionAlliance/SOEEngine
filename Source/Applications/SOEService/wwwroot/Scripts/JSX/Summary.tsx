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
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";

class Summary extends React.Component<any, any> {
    values: object;
    history: object;
  constructor(props) {
    super(props);
    this.history = createHistory();
    var query = queryString.parse(this.history['location'].search);

    this.state = {
        limits: (query['limits'] != undefined ? query['limits'] : 'All'),
        levels: (query['levels'] != undefined ? query['levels'] : 'Circuit'),
        date: (query['date'] != undefined ? query['date'] : moment().subtract(30, 'days').startOf('day').format('YYYYMMDDHH')),
        context: (query['context'] != undefined ? query['context'] : 'Days'),
        buckets: (query['buckets'] != undefined ? query['buckets'] : 30),
        filter: (query['filter'] != undefined ? query['filter'] : null)
      }

      this.history['listen']((location, action) => {
          var query = queryString.parse(this.history['location'].search);
          this.setState ({
              limits: (query['limits'] != undefined ? query['limits'] : 'All'),
              levels: (query['levels'] != undefined ? query['levels'] : 'Circuit'),
              date: (query['date'] != undefined ? query['date'] : moment().subtract(30, 'days').startOf('day').format('YYYYMMDDHH')),
              context: (query['context'] != undefined ? query['context'] : 'Days'),
              buckets: (query['buckets'] != undefined ? query['buckets'] : 30),
              filter: (query['filter'] != undefined ? query['filter'] : null)
          })
      });
  }

  componentDidMount(){

  }

  changeDate(type){
    switch(type){
        case '<<':
            var date = moment(this.state.date,'YYYYMMDDHH').subtract(this.state.buckets / 2, this.state.context.toLocaleLowerCase()).format('YYYYMMDDHH');
            break;
        case '<' : 
            var date = moment(this.state.date, 'YYYYMMDDHH').subtract(1, this.state.context.toLocaleLowerCase()).format('YYYYMMDDHH');
            break;
        case '>' : 
            var date = moment(this.state.date, 'YYYYMMDDHH').add(1, this.state.context.toLocaleLowerCase()).format('YYYYMMDDHH');
            break;
        case '>>': 
            var date = moment(this.state.date, 'YYYYMMDDHH').add(this.state.buckets / 2, this.state.context.toLocaleLowerCase()).format('YYYYMMDDHH');
            break;
    }

      this.setState({ 'date': date }, () => this.history['push']('Summary.cshtml?' + queryString.stringify(this.state)));
  }

  tableCallback(rowData, column) {
      var level = ''
      if (column.field == 'System')
          level = 'Circuit';
      else
          level = 'Device';

      this.setState({
          levels: level,
          filter: rowData[column.field]
      }, () => this.history['push']('Summary.cshtml?' + queryString.stringify(this.state)));     
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
                            {/*<PrimeMultiSelectWrapper value={ctrl.state.classifications} options={ctrl.state.cars} style={{ width: '100%' }} formLabel="Classification Filter:"/>*/}
                            <Select value={ctrl.state['limits']} options={["All", "Top 100", "Top 50", "Top 25", "Top 10"]} formLabel="Record Limits:" onChange={function (value) { ctrl.setState({ 'limits': value }, () => ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state)))}}/>
                            <Select value={ctrl.state['levels']} options={["System", "Circuit", "Device"]} formLabel="Search Levels:" onChange={function (value) { ctrl.setState({ 'levels': value }, () => ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state))) }}/>
                            <Input value={ctrl.state['filter']} clearable={true} formLabel="Filter Text:" onChange={function (value) { ctrl.setState({ 'filter': value }, () => ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state))) }} />

                             {/*<Select value={ctrl.state.severity} options={["PQ","LTE", "Both"]} formLabel="Severity Filter:" onChange={function(value){ctrl.setState({severity: value})}}/>*/}
 
                        </div>
                        <div className="col-md-4">
                            <BootstrapDateRangePickerWrapper
                                formLabel="Start Date:"
                                startDate={moment(ctrl.state.date, 'YYYYMMDDHH')}
                                singleDatePicker={true}
                                showDropdowns={true}
                                applyDateRangePicker={(msg)=> {
                                    this.setState({ 'date': msg.date.format('YYYYMMDDHH') }, () => ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state)));
                                }}
                            />
                            <Select value={ctrl.state['context']} options={["Months", "Days", "Hours"]} formLabel="Time Context:" onChange={function (value) { ctrl.setState({ 'context': value }, () => ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state)))}}/>
                            <Input value={ctrl.state['buckets']} type="number" formLabel="Number of Buckets:" onChange={function (value) { ctrl.setState({ 'buckets': value }, () => ctrl.history['push']('Summary.cshtml?' + queryString.stringify(ctrl.state)))}}/>
                        </div>
                        <div className="col-md-4"></div>
 
                      </div>
                    </div>
                  </div>
                </div>
            
                <br/>
                <div style={{ 'width': '100%', 'margin': '0' }} className="row">
                    <div className="col-lg-6 col-md-6 col-sm-6" style={{ textAlign: 'left', 'padding': '0'}}>
                        <button className="btn btn-default" onClick={(e) => this.changeDate('<<')}>{'<<'} Step</button>
                        <button className="btn btn-default" onClick={(e) => this.changeDate('<')}>{'<'} Nudge</button>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6" style={{ textAlign: 'right', 'padding': '0'}}>
                        <button className="btn btn-default" onClick={(e) => this.changeDate('>')}>Nudge {'>'}</button>
                        <button className="btn btn-default" onClick={(e) => this.changeDate('>>')}>Step {'>>'}</button>
                    </div>
                </div>
                <PrimeDataTableWrapper filters={{ date: this.state.date, timeContext: this.state.context, numBuckets: this.state.buckets, limits: this.state.limits, levels: this.state.levels, filter: this.state.filter }} callback={this.tableCallback.bind(this)}/>
            </div>

          );
    }
}

ReactDOM.render(<Summary />, document.getElementById('bodyContainer'));