//******************************************************************************************************
//  NonLinearTimeline.tsx - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  07/12/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { render } from 'react-dom';
import * as moment from 'moment';
import { ajax } from 'jquery';
import { parse } from "query-string";
import { } from "lodash";
import { PlayButton, Scroll } from '@gpa-gemstone/gpa-symbols';
import { SOETools } from '@gpa-gemstone/application-typings';
import * as leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css'

const NonLinearTimeline = (props: {}) => {
    let { soeID } = parse(window.location.search);

    React.useEffect(() => {
        let r = leaflet.map('map', { center: [35.045631, -85.309677], zoom: 13 });
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(r);
    }, []);
    return (
        <div className='container theme-showcase' style={{ overflow: 'hidden', position: 'absolute', left: 0, top: 60, width: window.innerWidth, height: window.innerHeight - 60 }}>
            <div id="map" style={{ height: 500, padding: 5, border: 'solid 1px gray' }}></div>
            <div style={{ height: window.innerHeight - 500 - 60, width: window.innerWidth, position: 'relative' }}>
                <div style={{ height: 60, width: window.innerWidth }}>
                    <div style={{ height: 60, width: 100, position: 'absolute', left: 5 }}>Sup... {soeID}</div>
                    <div style={{ height: 60, width: 100, position: 'absolute', right: 5 }}>
                        <select className='form-control'></select>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

render(<NonLinearTimeline />, document.getElementById('bodyContainer'));