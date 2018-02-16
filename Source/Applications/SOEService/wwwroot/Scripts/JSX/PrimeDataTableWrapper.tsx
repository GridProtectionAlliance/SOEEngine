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

import * as PropTypes from 'prop-types';
import SOEService from './../Services/SOEService';

export default class PrimeDataTable extends React.Component<any,any> {
    soeservice: any;
    constructor(props) {
        super(props);
        this.state = {};
        this.soeservice = new SOEService();
    }
    
    getData(props){
        this.soeservice.getView(props.filters).then(data => {
            if(data.length == 0) return;
            
            var headerStyle = {
                    'transform': 'rotate(-45deg)',
                    'transformOrigin': 'left top 0'
            }

            var dynamicColumns = Object.keys(data[0]).map((col,i) =>{
                if(!isNaN(Date.parse(col)))
                    return <Column key={col} field={col} header={<div style={headerStyle}>{col}</div>} sortable={true}></Column>
                else
                    return <Column style={{width: "100px"}} key={col} field={col} header={col} sortable={true}></Column>
            });
      
            return this.setState({data: data, dynamicColumns: dynamicColumns});
        });

    }

    componentDidMount(){ this.getData(this.props);}
    componentWillReceiveProps(nextProps){ 
        if(!(_.isEqual(this.props, nextProps)))
            this.getData(nextProps);
    }

    render() {

        return (
            <DataTable value={this.state.data}  paginator={true} rows={25}>
                {this.state.dynamicColumns}
            </DataTable>
        );
    }
}