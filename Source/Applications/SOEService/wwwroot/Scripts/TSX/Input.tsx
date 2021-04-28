//******************************************************************************************************
//  Input.tsx - Gbtc
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
//  02/13/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as _ from "lodash";

export default class Select extends React.Component<any,any>{
    state: { value: any; };
    props: { class?: string, formLabel?: string, type?: string, value?: any; onChange?: Function, clearable?: boolean };

    static propTypes = {
        class: PropTypes.string,
        formLabel: PropTypes.string,
        type: PropTypes.string,
        value: PropTypes.any,
        onChange: PropTypes.func,
        clearable: PropTypes.bool
    };

    static defaultProps = {
        class: 'form-control',
        formLabel: null,
        type: 'text',
        value: null,
        onChange: null,
        clearable: false
    };

    constructor(props) {
        super(props);
        this.state = {
            value: (props.value != null ? props.value : '')
        };

    }

    componentWillReceiveProps(nextProps) {
        if (!(_.isEqual(this.props, nextProps)))
            this.setState({
                value: (nextProps.value != null ? nextProps.value : '')
            });
    }

    onChange(event){
        this.setState({value: event.target.value});
        if(this.props.onChange != undefined)
            this.props.onChange(event.target.value);
    }

    clear() {
        this.setState({ value: '' });
        if (this.props.onChange != undefined)
            this.props.onChange(null);

    }

    render() {
        return (
            <div className={'form-group' + (this.props.clearable ? ' clearable-input' : '')} style={{width : '100%'}}>
                { this.props.formLabel != undefined ? (<label>{this.props.formLabel}</label>):(null)}
                <input className={this.props.class} type={this.props.type} onChange={this.onChange.bind(this)} value={this.state.value} />
                {this.props.clearable ? (<span data-clear-input onClick={this.clear.bind(this)}>&times;</span>) : (null)}
            </div>
        );
    }

}
