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
import Select from './Select';
import Input from './Input';

import * as $ from 'jquery';
import * as moment from 'moment';
import createHistory from "history/createBrowserHistory"
import * as queryString from "query-string";
import * as _ from "lodash";
import SOEService from './../Services/SOEService';

declare var numberOfBuckets: number;
declare var getBool: Function;

class Summary extends React.Component<any, any, any> {
    state: { limits: string; levels: string; date: string; context: any; buckets: number; filter: string; sortField: string; ascending: boolean; cols: any[], data: any[] };
    values: object;
    history: object;
    soeservice: SOEService;

    constructor(props) {
        super(props);
        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);
        this.soeservice = new SOEService();

        this.state = {
            limits: (query['limits'] != undefined ? query['limits'] : 'All'),
            levels: (query['levels'] != undefined ? query['levels'] : 'Circuit'),
            date: (query['date'] != undefined ? query['date'] : moment().subtract(30, 'days').startOf('day').format('YYYYMMDDHH')),
            context: (query['context'] != undefined ? query['context'] : 'Days'),
            buckets: (query['buckets'] != undefined ? query['buckets'] : numberOfBuckets),
            filter: (query['filter'] != undefined ? query['filter'] : null),
            sortField: (query['sortField'] != undefined ? query['sortField'] : null),
            ascending: (query['ascending'] != undefined ? query['ascending'] : false),
            cols: [],
            data: []
        }

        this.history['listen']((location, action) => {
            var query = queryString.parse(this.history['location'].search);
            this.setState({
                limits: (query['limits'] != undefined ? query['limits'] : 'All'),
                levels: (query['levels'] != undefined ? query['levels'] : 'Circuit'),
                date: (query['date'] != undefined ? query['date'] : moment().subtract(30, 'days').startOf('day').format('YYYYMMDDHH')),
                context: (query['context'] != undefined ? query['context'] : 'Days'),
                buckets: (query['buckets'] != undefined ? query['buckets'] : numberOfBuckets),
                filter: (query['filter'] != undefined ? query['filter'] : null),
                sortField: (query['sortField'] != undefined ? query['sortField'] : null),
                ascending: (query['ascending'] != undefined ? query['ascending'] : false)
            }, () => this.getData(this.state));
        });
    }

    componentDidMount(){
        this.getData(this.state);
    }

    getData(props) {
        this.soeservice.getView({ date: props.date, timeContext: props.context, numBuckets: props.buckets, limits: props.limits, levels: props.levels, filter: props.filter }).then(data => {
            var headerLeft = [
                { key: 'System', label: 'Volt Class', headerStyle: { width: "100px", 'textAlign': 'center' }, content: this.systemTemplate.bind(this) },
                { key: 'Circuit', label: 'Circuit', headerStyle: { width: "100px", 'textAlign': 'center' }, content: this.circuitTemplate.bind(this)},
                { key: 'Device', label: 'Device', headerStyle: { width: "100px", 'textAlign': 'center' } }];
            var headerRight = [
                { key: 'Total', label: 'Total', headerStyle: { width: "75px", 'textAlign': 'center' } },
                { key: 'LTE', label: 'LTE', headerStyle: { width: "75px", 'textAlign': 'center' }, content: this.lteTemplate.bind(this)},
                { key: 'PQS', label: 'PQS', headerStyle: { width: "75px", 'textAlign': 'center' }, content: this.pqsTemplate.bind(this)},
                { key: 'CT Files', label: 'CT Files', headerStyle: { width: "75px", 'textAlign': 'center' } },
                { key: 'SOE', label: 'SOE', headerStyle: { width: "75px", 'textAlign': 'center' } }];

            if (data.length == 0) return this.setState({ cols: [...headerLeft, ...headerRight], data: data });

            if (Object.keys(data[0]).indexOf(props.sortField) < 0) props.sortField = "System";
            data = _.orderBy(data, [props.sortField], [(getBool(props.ascending) ? 'asc' : 'desc')])

            var nonDynamicColumns = ["System", "Circuit", "Device", "Total", "CT Files", "SOE", "LTE", "PQS"]
            var dynamicalCols = Object.keys(data[0]).filter(x => nonDynamicColumns.indexOf(x) < 0).map(x => Object.create({ key: x, label: x, headerStyle: { 'textAlign': 'center' }, content: this.dateTemplate.bind(this) }));
            this.setState({ cols: [...headerLeft, ...dynamicalCols,...headerRight], data: data });
            //var headerStyle = {
            //    'transform': 'rotate(-45deg)',
            //    'transformOrigin': 'left top 0'
            //}

        });

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

        this.setState({ 'date': date }, this.updateUrl);
    }

    tableCallback(data) {
        var level = ''
        if (data.col == 'System')
            level = 'Circuit';
        else
            level = 'Device';

        this.setState({
            levels: level,
            filter: data.data
        }, this.updateUrl);     
    }

    handleTableSort(data) {
        var ascending = getBool(data.ascending);
        if (data.col == this.state.sortField)
            ascending = !ascending

        this.setState({
            ascending: ascending,
            sortField: data.col
        }, this.updateUrl);

    }

    updateUrl() {
        var state = _.clone(this.state);
        delete state.cols;
        delete state.data;

        this.history['push']('Summary.cshtml?' + queryString.stringify(state));
    }

    buildHeaders() {
    
    }

    systemTemplate(item, key, style) {
        return <button className='btn btn-link' style={style} onClick={() => this.tableCallback({ col: item, row: key, data: item[key] })}><span >{item[key]}</span></button>
    }

    circuitTemplate(item, key, style) {
        if (Number.isInteger(item[key]))
            return <span>{item[key]}</span>
        else
            return <button className='btn btn-link' style={style} onClick={() => this.tableCallback({ col: item, row: key, data: item[key] })}><span >{item[key]}</span></button>
    }

    dateTemplate(item, key, style) {
        var nameString = "";
        if (this.state.levels == "System")
            nameString = item.System;
        else if (this.state.levels == "Circuit")
            nameString = item.Circuit;
        else if (this.state.levels == "Device")
            nameString = item.Device;

        var dateString = ""
        if (this.state.context == "Days")
            dateString = moment(key, "MM/DD/YYYY").format('YYYYMMDDHH');
        else if (this.state.context == "Months")
            dateString = moment(key + "-01", "MM/YYYY/DD").format('YYYYMMDDHH');
        else
            dateString = moment(key + "/" + moment(this.state.date, 'YYYYMMDDHH').year(), "MM/DD HH/YYYY").format('YYYYMMDDHH');

        return <a target="_blank" style={{ 'color': '#337ab7' }} href={`/IncidentEventCycleDataView.cshtml?levels=${this.state.levels}&limits=${this.state.limits}&timeContext=${this.state.context}&date=${dateString}&name=${nameString}&count=${item[key]}`}>{item[key]}</a>

    }

    lteTemplate(item, key, style) {
        if (item.LTE == null) return null;
        var nameString = "";
        if (this.state.levels == "System")
            nameString = item.System;
        else if (this.state.levels == "Circuit")
            nameString = item.Circuit;
        else if (this.state.levels == "Device")
            nameString = item.Device;

        return <a target="_blank" style={{ 'color': '#337ab7' }} href={`/IncidentEventCycleDataView.cshtml?levels=${this.state.levels}&limits=${this.state.limits}&timeContext=${this.state.context}&date=${this.state.date}&name=${nameString}&buckets=${this.state.buckets}&LTE=1`}>{item.LTE.toFixed(0)}</a>

    }
    pqsTemplate(item, key, style) {
        if (item.PQS == null) return null;
        var nameString = "";
        if (this.state.levels == "System")
            nameString = item.System;
        else if (this.state.levels == "Circuit")
            nameString = item.Circuit;
        else if (this.state.levels == "Device")
            nameString = item.Device;

        return <a target="_blank" style={{ 'color': '#337ab7' }} href={`/IncidentEventCycleDataView.cshtml?levels=${this.state.levels}&limits=${this.state.limits}&timeContext=${this.state.context}&date=${this.state.date}&name=${nameString}&buckets=${this.state.buckets}&PQS=1`}>{item.PQS.toFixed(2)}</a>

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
                            <Select value={ctrl.state['limits']} options={["All", "Top 100", "Top 50", "Top 25", "Top 10"]} formLabel="Record Limits:" onChange={function (value) { ctrl.setState({ 'limits': value }, ctrl.updateUrl)}}/>
                            <Select value={ctrl.state['levels']} options={["System", "Circuit", "Device"]} formLabel="Search Levels:" onChange={function (value) { ctrl.setState({ 'levels': value }, ctrl.updateUrl) }}/>
                            {(this.state.levels != "System" ? <Input value={ctrl.state.filter} clearable={true} formLabel={ (this.state.levels == "Circuit" ? "System": "Circuit") + " Filter:"} onChange={function (value) { ctrl.setState({ 'filter': value }, ctrl.updateUrl) }} /> : null)}

                                {/*<Select value={ctrl.state.severity} options={["PQ","LTE", "Both"]} formLabel="Severity Filter:" onChange={function(value){ctrl.setState({severity: value})}}/>*/}
 
                        </div>
                        <div className="col-md-4">
                            <BootstrapDateRangePickerWrapper
                                formLabel="Start Date:"
                                startDate={moment(ctrl.state.date, 'YYYYMMDDHH')}
                                singleDatePicker={true}
                                showDropdowns={true}
                                applyDateRangePicker={(msg)=> {
                                    this.setState({ 'date': msg.date.format('YYYYMMDDHH') }, ctrl.updateUrl);
                                }}
                            />
                            <Select value={ctrl.state['context']} options={["Months", "Days", "Hours"]} formLabel="Time Context:" onChange={function (value) { ctrl.setState({ 'context': value }, ctrl.updateUrl)}}/>
                            <Input value={ctrl.state['buckets']} type="number" formLabel="Number of Buckets:" onChange={function (value) { ctrl.setState({ 'buckets': value }, ctrl.updateUrl)}}/>
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
                <Table
                    cols={this.state.cols}
                    data={this.state.data}
                    onClick={() => { }}
                    sortField={this.state.sortField}
                    ascending={this.state.ascending}
                    onSort={this.handleTableSort.bind(this)}
                    tableClass='table table-striped table-bordered table-hover'
                    tbodyStyle={{textAlign: 'center'}}
                />
            </div>

            );
    }
}

ReactDOM.render(<Summary />, document.getElementById('bodyContainer'));