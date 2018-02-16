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

export default class Select extends React.Component<any,any>{

    constructor(props) {
        super(props);
        this.state = {
            value: props.value
        };
    }

    componentDidMount() {
        
    }

    onChange(event){
        this.setState({value: event.target.value});
        if(this.props.onChange != undefined)
            this.props.onChange(event.target.value);
    }

    render() {
        return (
            <div className="form-group">
                { this.props.formLabel != undefined ? (<label>{this.props.formLabel}</label>):(null)}
                <input className="form-control" type={this.props.type} onChange={this.onChange.bind(this)} value={this.state.value}/>
            </div>
        );
    }

}
