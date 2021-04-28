//******************************************************************************************************
//  PrimeMultiselectWrapper.jsx - Gbtc
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
//  Wrapper class for Prime React Multiselect licensed under The MIT License
//
//      https://www.primefaces.org/primereact/#/multiselect
//
//  License
//  The MIT License (MIT)
//
//  Copyright (c) 2017 PrimeTek
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  02/07/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import 'font-awesome/css/font-awesome.css';
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/components/multiselect/MultiSelect.css';
import { MultiSelect } from 'primereact/components/multiselect/Multiselect';
import * as PropTypes from 'prop-types';

export default class PrimeMultiSelectWrapper extends React.Component<any, any> {

    static propTypes = {
        id: PropTypes.string,
        value: PropTypes.array,
        options: PropTypes.array,
        style: PropTypes.object,
        className: PropTypes.string,
        scrollHeight: PropTypes.string,
        defaultLabel: PropTypes.string,
        filter: PropTypes.bool,
        key: PropTypes.string,
        itemTemplate: PropTypes.func,
        appendTo: PropTypes.object,
        onChange: PropTypes.func,
        formLabel: PropTypes.string,
    }
    static defaultProps = {
        id: undefined,
        value: undefined,
        options: undefined,
        style: undefined,
        className: undefined,
        scrollHeight: '200px',
        defaultLabel: 'Choose',
        filter: true,
        key: undefined,
        itemTemplate: undefined,
        appendTo: undefined,
        onChange: undefined,
        formLabel: undefined
    }

    constructor(props) {
        super(props);
        this.state = {
            value: props.value
        };
    }

    onChange(e) {
        this.setState({ value: e.value })
        if(this.props.onChange != undefined)
            this.props.onChange(this.state.value);
    }

    render() {
        return (
            <div className="form-group">
                { this.props.formLabel != undefined ? (<label>{this.props.formLabel}</label>):(null)}
                <MultiSelect
                    id={this.props.id}
                    value={this.state.value}
                    options={this.props.options}
                    style={this.props.style}
                    className={this.props.className}
                    scrollHeight={this.props.scrollHeight}
                    defaultLabel={this.props.defaultLabel}
                    filter={true}
                    key={this.props.key}
                    itemTemplate={this.props.itemTemplate}
                    appendTo={this.props.appendTo}
                    onChange={this.onChange.bind(this) }                     
                />
            </div>
        );
    }
}