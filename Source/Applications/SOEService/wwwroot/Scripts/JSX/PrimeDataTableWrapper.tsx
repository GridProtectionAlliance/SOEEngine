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
import { BrowserRouter as Router, Route,Link } from 'react-router-dom'

export default class PrimeDataTable extends React.Component<any,any> {
    soeservice: any;
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            dynamicColumns: [<Column key="" field="" header=""></Column>]
        };
        this.soeservice = new SOEService();
    }
    
    getData(props){
        this.soeservice.getView(props.filters).then(data => {
            this.setState({ data: data });
            if (data.length == 0) return this.setState({ dynamicColumns: [<Column key="" field="" header=""></Column>] });
            
            var headerStyle = {
                    'transform': 'rotate(-45deg)',
                    'transformOrigin': 'left top 0'
            }


            this.setState({ data: data });

            var nonDynamicColumns = ["System", "Circuit", "Device", "Total", "CT Files", "SOE"]
            var dynamicColumns = Object.keys(data[0]).map((col,i) =>{
                if(nonDynamicColumns.indexOf(col) < 0)
                    return <Column key={col} field={col} body={this.dateTemplate.bind(this)} header={<div style={headerStyle}>{col}</div>}  sortable={true}></Column>
            });
      
            this.setState({dynamicColumns: dynamicColumns});
        });

    }

    componentDidMount(){ this.getData(this.props);}
    componentWillReceiveProps(nextProps){ 
        if(!(_.isEqual(this.props, nextProps)))
            this.getData(nextProps);
    }

    systemTemplate(rowData, column) {
        return <Link to={"/System/" + rowData.System}><span style={{ 'width': '100%', 'cursor': 'pointer' }}>{rowData[column.field]}</span></Link>
    }
    circuitTemplate(rowData, column) {
        return <Link to={"/Circuit/" + rowData.Circuit}><span style={{ 'width': '100%', 'cursor': 'pointer' }}>{rowData[column.field]}</span></Link>
    }
    dateTemplate(rowData, column) {
        var nameString = "";
        if (this.props.filters.levels == "System")
            nameString = rowData.System;
        else if (this.props.filters.levels == "Circuit")
            nameString = rowData.Circuit;
        else if (this.props.filters.levels == "Device")
            nameString = rowData.Device;

        if(this.props.filters.timeContext == "Days")
            return <a target="_blank" href={`/IncidentEventCycleDataView.cshtml?levels=${this.props.filters.levels}&limits=${this.props.filters.limits}&timeContext=${this.props.filters.timeContext}&date=${moment(column.field, "MM/DD/YYYY").format('YYYYMMDDHH')}&name=${nameString}`}>{rowData[column.field]}</a>
        else if (this.props.filters.timeContext == "Months")
            return <a target="_blank" href={`/IncidentEventCycleDataView.cshtml?levels=${this.props.filters.levels}&limits=${this.props.filters.limits}&timeContext=${this.props.filters.timeContext}&date=${moment(column.field + "-01", "MM/YYYY/DD").format('YYYYMMDDHH')}&name=${nameString}`}>{rowData[column.field]}</a>
        else
            return <a target="_blank" href={`/IncidentEventCycleDataView.cshtml?levels=${this.props.filters.levels}&limits=${this.props.filters.limits}&timeContext=${this.props.filters.timeContext}&date=${moment(column.field + "/" + this.props.filters.date.year(), "MM/DD HH/YYYY").format('YYYYMMDDHH')}&name=${nameString}`}>{rowData[column.field]}</a>
    }



    render() {

        return (
            <DataTable value={this.state.data} paginator={true} rows={25}>
                <Column style={{ width: "100px" }} body={this.systemTemplate} field="System" header="Volt Class" sortable={true}></Column>
                <Column style={{ width: "100px" }} body={this.circuitTemplate} field="Circuit" header="Circuit" sortable={true}></Column>
                <Column style={{ width: "100px" }} field="Device" header="Device" sortable={true}></Column>
                {this.state.dynamicColumns}
                <Column style={{ width: "100px" }} field="Total" header="Total" sortable={true}></Column>
                <Column style={{ width: "100px" }} field="CT Files" header="CT Files" sortable={true}></Column>
                <Column style={{ width: "100px" }} field="SOE" header="SOE" sortable={true}></Column>
            </DataTable>
        );
    }
}