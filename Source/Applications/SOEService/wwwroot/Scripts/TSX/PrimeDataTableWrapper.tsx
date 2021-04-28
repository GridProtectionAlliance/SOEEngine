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

import * as React from 'react';
import 'font-awesome/css/font-awesome.css';
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/components/multiselect/MultiSelect.css';
import {DataTable} from 'primereact/components/datatable/DataTable';
import {Column} from 'primereact/components/column/Column';
import {Button} from 'primereact/components/button/Button';
import * as _ from "lodash";
import * as moment from "moment";
import * as PropTypes from 'prop-types';
import SOEService from './../Services/SOEService';

export default class PrimeDataTable extends React.Component<any,any> {
    state: { data: any[]; dynamicColumns: JSX.Element[]; };
    props: any;
    soeservice: SOEService;
    callback: any;
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            dynamicColumns: [<Column key="" field="" header=""></Column>]
        };
        this.soeservice = new SOEService();
        this.callback = props.callback;
    }
    
    getData(props){
        this.soeservice.getView(props.filters).then(data => {
            if (data.length == 0) return this.setState({ dynamicColumns: [<Column key="" field="" header=""></Column>] });
            
            var headerStyle = {
                    'transform': 'rotate(-45deg)',
                    'transformOrigin': 'left top 0'
            }



            var nonDynamicColumns = ["System", "Circuit", "Device", "Total", "CT Files", "SOE", "LTE", "PQS"]
            var dynamicColumns = Object.keys(data[0]).map((col,i) =>{
                if(nonDynamicColumns.indexOf(col) < 0)
                    return <Column key={col} field={col} style={{'textAlign': 'center' }} body={this.dateTemplate.bind(this)} header={<div style={headerStyle}>{col}</div>} sortable={true}></Column>
            });
      
            this.setState({data: data, dynamicColumns: dynamicColumns});
        });

    }

    componentDidMount(){ this.getData(this.props);}
    componentWillReceiveProps(nextProps){ 
        if(!(_.isEqual(this.props.filters, nextProps.filters)))
            this.getData(nextProps);
    }

    systemTemplate(rowData, column) {
        return <button className='btn btn-link' style={{ 'width': '100%' }} onClick={() => this.callback(rowData, column)}><span >{rowData[column.field]}</span></button>
    }
    circuitTemplate(rowData, column) {
        if (Number.isInteger(rowData[column.field]))
            return <span >{rowData[column.field]}</span>
        else
            return <button className='btn btn-link' style={{ 'width': '100%' }} onClick={() => this.callback(rowData, column)}><span >{rowData[column.field]}</span></button>
    }
    dateTemplate(rowData, column) {
        var nameString = "";
        if (this.props.filters.levels == "System")
            nameString = rowData.System;
        else if (this.props.filters.levels == "Circuit")
            nameString = rowData.Circuit;
        else if (this.props.filters.levels == "Device")
            nameString = rowData.Device;

        var dateString = ""
        if (this.props.filters.timeContext == "Days")
            dateString = moment(column.field, "MM/DD/YYYY").format('YYYYMMDDHH');
        else if (this.props.filters.timeContext == "Months")
            dateString = moment(column.field + "-01", "MM/YYYY/DD").format('YYYYMMDDHH');
        else
            dateString = moment(column.field + "/" + moment(this.props.filters.date, 'YYYYMMDDHH').year(), "MM/DD HH/YYYY").format('YYYYMMDDHH');

        return <a target="_blank" style={{ 'color': '#337ab7' }} href={`/IncidentEventCycleDataView.cshtml?levels=${this.props.filters.levels}&limits=${this.props.filters.limits}&timeContext=${this.props.filters.timeContext}&date=${dateString}&name=${nameString}&count=${rowData[column.field]}`}>{rowData[column.field]}</a>

    }

    lteTemplate(rowData, column) {
        if (rowData.LTE == null) return null;
        var nameString = "";
        if (this.props.filters.levels == "System")
            nameString = rowData.System;
        else if (this.props.filters.levels == "Circuit")
            nameString = rowData.Circuit;
        else if (this.props.filters.levels == "Device")
            nameString = rowData.Device;

        return <a target="_blank" style={{ 'color': '#337ab7' }} href={`/IncidentEventCycleDataView.cshtml?levels=${this.props.filters.levels}&limits=${this.props.filters.limits}&timeContext=${this.props.filters.timeContext}&date=${this.props.filters.date}&name=${nameString}&buckets=${this.props.filters.numBuckets}&LTE=1`}>{rowData.LTE.toFixed(0)}</a>

    }
    pqsTemplate(rowData, column) {
        if (rowData.PQS == null) return null;
        var nameString = "";
        if (this.props.filters.levels == "System")
            nameString = rowData.System;
        else if (this.props.filters.levels == "Circuit")
            nameString = rowData.Circuit;
        else if (this.props.filters.levels == "Device")
            nameString = rowData.Device;

        return <a target="_blank" style={{ 'color': '#337ab7' }} href={`/IncidentEventCycleDataView.cshtml?levels=${this.props.filters.levels}&limits=${this.props.filters.limits}&timeContext=${this.props.filters.timeContext}&date=${this.props.filters.date}&name=${nameString}&buckets=${this.props.filters.numBuckets}&PQS=1`}>{rowData.PQS.toFixed(2)}</a>

    }

    getHref(props, rowData, column, nameString) {
    }
    
    render() {

        return (
            <DataTable value={this.state.data}>
                <Column style={{ width: "100px", 'textAlign': 'center' }} body={this.systemTemplate.bind(this)} field="System" header="Volt Class" sortable={true}></Column>
                <Column style={{ width: "100px", 'textAlign': 'center' }} body={this.circuitTemplate.bind(this)} field="Circuit" header="Circuit" sortable={true}></Column>
                <Column style={{ width: "100px", 'textAlign': 'center' }} field="Device" header="Device" sortable={true}></Column>
                {this.state.dynamicColumns}
                <Column style={{ width: "75px", 'textAlign': 'center' }} field="Total" header="Total" sortable={true}></Column>
                <Column style={{ width: "75px", 'textAlign': 'center' }} field="LTE" header="LTE" sortable={true} body={this.lteTemplate.bind(this)}></Column>
                <Column style={{ width: "75px", 'textAlign': 'center' }} field="PQS" header="PQS" sortable={true} body={this.pqsTemplate.bind(this)}></Column>
                <Column style={{ width: "85px", 'textAlign': 'center' }} field="CT Files" header="CT Files" sortable={true}></Column>
                <Column style={{ width: "75px", 'textAlign': 'center' }} field="SOE" header="SOE" sortable={true}></Column>
            </DataTable>
        );
    }
}