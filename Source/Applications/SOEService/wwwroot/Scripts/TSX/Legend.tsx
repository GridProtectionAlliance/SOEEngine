//******************************************************************************************************
//  Legend.tsx - Gbtc
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
//  03/09/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';

export default function Legend(props: { data: {label: string, color: string, enabled: boolean}[], callback: (label: string) => void}){
    if (props.data == null) return null;
    return (
        <table>
            <tbody>
                {
                    props.data.map(row => {
                        return <Row key={row.label+row.enabled} label={row.label} color={row.color} enabled={row.enabled} callback={() => {
                            props.callback(row.label);
                        }} />
                    })
                }
            </tbody>
        </table>
    );
    
}

const Row = (props) => {
    return (
        <tr>
            <td>
                <button className="btn-link" onClick={props.callback}>
                    <div style={{ border: '1px solid #ccc', padding: '1px' }}>
                        <div style={{ width: ' 4px', height: 0, border: '5px solid ' + props.color + (props.enabled? 'FF' : '60'), overflow: 'hidden' }}>
                        </div>
                    </div>
                </button>
            </td>
            <td>
                <span>{props.label}</span>
            </td>
        </tr>
    );
}