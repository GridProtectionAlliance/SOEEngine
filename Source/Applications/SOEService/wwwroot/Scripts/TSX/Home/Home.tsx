//******************************************************************************************************
//  Home.tsx - Gbtc
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
//  07/26/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Table from '@gpa-gemstone/react-table';
import * as moment from 'moment';
import { ajax } from 'jquery';
import * as queryString from "query-string";
import * as _ from "lodash";

interface HomeTable {
    System: number | string,
    Circuit: number | string,
    Meter: number | string,
    SOEs: number,
    Incidents: number,
    LTE: number,
    PQS: number,
    Faults: number,
    Files: number,
    'G1 Research': number,
    'G2 Switching': number,
    'G3 Faults': number,
    'G4 Power Quality': number,
    'G5 Artifacts/Harmonics': number,
    'G6 MinMaxAvg/History': number,
    'G7 Reports': number,
    'G8 Predictive': number,
    'G9 Other': number,

}

type Level = 'System' | 'Circuit' | 'Meter';
const Home = (props: {}) => {
    let query = queryString.parse(window.location.search);
    const [level, setLevel] = React.useState<Level>(query['level'] != undefined ? query['level'] as Level : 'Meter');
    const [date, setDate] = React.useState<moment.Moment>(query['date'] != undefined ? moment(query['date'] as string) : moment().subtract(7, 'days'));
    const [data, setData] = React.useState<HomeTable[]>([]);
    const [ascending, setAscending] = React.useState<boolean>(query['ascending'] != undefined ? (query['ascending'] as string) == 'true' : true);
    const [sortField, setSortField] = React.useState<keyof HomeTable>(query['sortField'] != undefined ? query['sortField'] as keyof HomeTable :'Meter');

    React.useEffect(() => {
        GetData().done(d => {
            setData(SortData(d))
        });
    }, [level, date]);

    React.useEffect(() => {
        window.history.pushState({}, '', `${window.location.origin}${window.location.pathname}?${queryString.stringify({level, date: date.format('YYYY-MM-DD'), ascending, sortField})}`)
    }, [ level,  date,ascending, sortField]);

    React.useEffect(() => {
       setData(SortData(data));
    }, [ascending, sortField]);

    function GetData(): JQuery.jqXHR<HomeTable[]> {
        return ajax({
            type: "GET",
            url: `${homePath}api/Home/${date.format("YYYY-MM-DD")}/${level}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });
    }

    function SortData(data): HomeTable[] {
        return _.orderBy(data, [sortField], [ascending ? "asc" : "desc"]);
    }

    return (
        <div className='container theme-showcase' style={{ overflow: 'hidden', position: 'absolute', left: 0, top: 60, width: window.innerWidth, height: window.innerHeight - 60 }}>
            <div className='row'>
                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>&nbsp;</label>
                        <button className='btn btn-primary form-control' onClick={() => {
                            setLevel('Meter');
                        }}>Clear Filters</button>
                    </div>
                </div>

                <div className='col-lg-2'>
                    <div className="form-group">
                        <label>Aggregation Level:</label>
                        <select className='form-control' value={level as string} onChange={(evt) => setLevel(evt.target.value as Level)}>
                            <option value='System'>System</option>
                            <option value='Circuit'>Circuit</option>
                            <option value='Meter'>Meter</option>
                        </select>
                    </div>
                </div>


                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>Year Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setDate(moment(date.subtract(1, 'year')))}>{'<<'}</button>
                    </div>
                </div>
                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>Month Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setDate(moment(date.subtract(1, 'month')))}>{'<<'}</button>
                    </div>
                </div>


                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>Day Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setDate(moment(date.subtract(1, 'day')))}>{'<<'}</button>
                    </div>
                </div>


                <div className='col-lg-2'>
                    <div className="form-group">
                        <label>Date:</label>
                        <input className='form-control' type='date' value={date.format('YYYY-MM-DD')} onChange={(evt) => setDate(moment(evt.target.value)) }/>
                    </div>
                </div>

                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>Day Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setDate(moment(date.add(1, 'day')))}>{'>>'}</button>
                    </div>
                </div>

                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>Mpnth Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setDate(moment(date.add(1, 'month')))}>{'>>'}</button>
                    </div>
                </div>

                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>Year Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setDate(moment(date.add(1, 'year'))) }>{'>>'}</button>
                    </div>
                </div>

            </div>
            <div className='row'>
                <Table<HomeTable>
                    cols={[
                        { key: 'System', label: 'System', field: 'System',content: (item, key, field, style) => <><span>{item[field]}</span></> },
                        { key: 'Circuit', label: 'Circuit', field: 'Circuit', headerStyle: { width: 100 }, rowStyle: { width: 100 }, content: (item, key, field, style) => <><span>{item[field]}</span></> },
                        { key: 'Meter', label: 'Meter', field: 'Meter' },
                        { key: 'SOEs', label: 'SOEs', field: 'SOEs' },
                        { key: 'Incidents', label: 'Incidents', field: 'Incidents', headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'LTE', label: 'LTE', field: 'LTE', headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'PQS', label: 'PQS', field: 'PQS',headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'Faults', label: 'Faults', field: 'Faults', headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'Files', label: 'Files', field: 'Files',headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'G1 Research', label: 'G1 Research', field: 'G1 Research', headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'G2 Switching', label: 'G2 Switching', field: 'G2 Switching',headerStyle: { width: 200 }, rowStyle: { width: 200 } },
                        { key: 'G3 Faults', label: 'G3 Faults', field: 'G3 Faults',headerStyle: { width: 200 }, rowStyle: { width: 200 } },
                        { key: 'G4 Power Quality', label: 'G4 Power Quality', field: 'G4 Power Quality', headerStyle: { width: 200 }, rowStyle: { width: 200 } },
                        { key: 'G5 Artifacts/Harmonics', label: 'G5 Artifacts/Harmonics', field: 'G5 Artifacts/Harmonics',headerStyle: { width: 200 }, rowStyle: { width: 200 } },
                        { key: 'G6 MinMaxAvg/History', label: 'G6 MinMaxAvg/History', field: 'G6 MinMaxAvg/History', headerStyle: { width: 200 }, rowStyle: { width: 200 } },
                        { key: 'G7 Reports', label: 'G7 Reports', field: 'G7 Reports',headerStyle: { width: 200 }, rowStyle: { width: 200 } },
                        { key: 'G8 Predictive', label: 'G8 Predictive', field: 'G8 Predictive',headerStyle: { width: 200 }, rowStyle: { width: 200 } },
                        { key: 'G9 Other', label: 'G9 Other', field: 'G9 Other', headerStyle: { width: 200 }, rowStyle: { width: 200 } },
                        { key: null, label: '', headerStyle: { width: 20 }, rowStyle: { width: 0 } }

                    ]}
                    tableClass="table table-hover"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 180, height: window.innerHeight - 180, width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    sortKey={sortField}
                    onClick={(d) => { }}
                    onSort={d => {
                        if (d.colField == sortField) {
                            setAscending(!ascending);
                        }
                        else {
                            setSortField(d.colField);
                        }
                    }}
                    data={data}
                    ascending={ascending}
                />
            </div>
        </div>
    );
}

ReactDOM.render(<Home />, document.getElementById('bodyContainer'));