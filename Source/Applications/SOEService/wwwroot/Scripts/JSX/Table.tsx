//******************************************************************************************************
//  Table.tsx - Gbtc
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
import * as PropTypes from 'prop-types';
import * as _ from 'lodash';

export default class Table extends React.Component<any, any> {
    static propTypes = {
        cols: PropTypes.array,
        data: PropTypes.array
    }
    static defaultProps = {
        cols: [],
        data: []

    }

    constructor(props) {
        super(props);
        this.state = {
            cols: props.cols,
            data: props.data
        };  
    }

    componentDidUpdate(prevProps, prevState){
        if(!(_.isEqual(prevProps, this.props)))
            this.setState({cols: this.props.cols, data: this.props.data})
    }

    render() {
        var headerComponents = this.generateHeaders(),
            rowComponents = this.generateRows();

        return (
            <table className="table table-condensed table-hover">
                <thead>{headerComponents}</thead>
                <tbody>{rowComponents}</tbody>
            </table>
        );
    }

    generateHeaders(){
        var cols = this.state.cols;  // [{key, label}]

        // generate our header (th) cell components
        return (<tr>{cols.map(function(colData) {
            return <th key={colData.key}>{colData.label}</th>;
        })}</tr>
        );
    }

    generateRows() {
        var ctrl = this;
        var cols = ctrl.state.cols,  // [{key, label}]
            data = ctrl.state.data;

        return data.map(function(item) {
            // build each cell
            var cells = cols.map(function(colData) {
                // colData.key might be "firstName"
                return <td key={item[colData.key] + colData.key} onClick={ctrl.handleClick.bind({col: colData.key, row: item, data: item[colData.key]}) }>{item[colData.key]}</td>;
            });

            return <tr key={item.id}>{cells}</tr>;
        });
    }

    handleClick(event){
        console.log(this);
    }
};

