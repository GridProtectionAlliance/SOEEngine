//******************************************************************************************************
//  Default.tsx - Gbtc
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
import * as ReactDOM from 'react-dom';
import Table from '@gpa-gemstone/react-table';
import * as moment from 'moment';
import { ajax } from 'jquery';
import * as queryString from "query-string";
import * as _ from "lodash";
import { PlayButton, Scroll } from '@gpa-gemstone/gpa-symbols';

interface ReplayTable {
    ID: number,
    Name: string,
    StartTime: string,
    EndTime: string, 
    System: string,
    Circuits: number,
    Devices: number,
    Waveforms: number,
    Duration: number,
    Status: string,
    TimeWindows: number
}

const Replay = (props: {}) => {
    let query = queryString.parse(window.location.search);
    const [stepSize, setStepSize] = React.useState<number>(query['stepSize'] != undefined ? query['stepSize'] : 7);
    const [units, setUnits] = React.useState<moment.unitOfTime.Base>(query['units'] != undefined ? query['units'] : 'days');
    const [date, setDate] = React.useState<moment.Moment>(query['date'] != undefined ? moment(query['date']) : moment().subtract(7, 'days'));
    const [data, setData] = React.useState<ReplayTable[]>([]);
    const [ascending, setAscending] = React.useState<boolean>(query['ascending'] != undefined ? query['ascending'] == 'true' : true);
    const [sortField, setSortField] = React.useState<keyof ReplayTable>(query['sortField'] != undefined ? query['sortField'] :'StartTime');
    const [showDeleted, setShowDeleted] = React.useState<boolean>(query['showDeleted'] != undefined ? query['showDeleted'] == 'true' : false);

    React.useEffect(() => {
        GetData().done(d => {
            if(showDeleted)
                setData(SortData(d))
            else
                setData(SortData(d.filter(dp => dp.Status != 'Hide')))

        });
    }, [stepSize, units, date, showDeleted]);

    React.useEffect(() => {
        window.history.pushState({}, '', `${window.location.origin}${window.location.pathname}?${queryString.stringify({stepSize, units, date: date.format('YYYY-MM-DD'), ascending, sortField, showDeleted})}`)
    }, [stepSize, units, date,ascending, sortField, showDeleted]);

    React.useEffect(() => {
       setData(SortData(data));
    }, [ascending, sortField]);

    function GetData(): JQuery.jqXHR<ReplayTable[]> {
        return ajax({
            type: "GET",
            url: `${homePath}api/Replay/${date.format("YYYY-MM-DD")}/${stepSize}/${units}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });
    }

    function SortData(data): ReplayTable[] {
        return _.orderBy(data, [sortField], [ascending ? "asc" : "desc"]);
    }

    return (
        <div className='container theme-showcase' style={{ overflow: 'hidden', position: 'absolute', left: 0, top: 60, width: window.innerWidth, height: window.innerHeight - 60 }}>
            <div className='row'>
                <div className='col-lg-2'>
                    <div className="form-group">
                        <label>Step Size:</label>
                        <input className='form-control' type='number' value={stepSize} onChange={(evt) => setStepSize(parseInt(evt.target.value))} />
                    </div>
                </div>
                <div className='col-lg-2'>
                    <div className="form-group">
                        <label>Units:</label>
                        <select className='form-control' value={units as string} onChange={(evt) => setUnits(evt.target.value as moment.unitOfTime.Base)}>
                            <option value='days'>Days</option>
                            <option value='weeks'>Weeks</option>
                            <option value='months'>Months</option>
                            <option value='years'>Years</option>
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
                        <label>Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setDate(moment(date.subtract(stepSize, units)))}>{'<<'}</button>
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
                        <label>Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setDate(moment(date.add(stepSize, units)))}>{'>>'}</button>
                    </div>
                </div>

                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>Year Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setDate(moment(date.add(1, 'year'))) }>{'>>'}</button>
                    </div>
                </div>
                <div className='col-lg-1'>
                    <div className='checkbox'>
                        <label><input type='checkbox' value={showDeleted.toString()} checked={showDeleted} onChange={() => setShowDeleted(!showDeleted) }/>Show Hidden Replays</label>
                    </div>
                </div>


            </div>
            <div className='row'>
                <Table<ReplayTable>
                    cols={[
                        { key: 'Name', label: 'Name', content: (item, key, style) => <><span>{item[key]}</span>{item.Status != 'MakeReplay' && item.Status != 'Hide' ? <button className='pull-right btn btn-link'>{PlayButton}</button>:null}</>  },
                        { key: 'ID', label: 'SOE_UID', headerStyle: { width: 100 }, rowStyle: { width: 100 }, content: (item, key, style) => <><span>{item[key]}</span><button onClick={() => window.open(`${homePath}AggregateWaveformViewerBySOE.cshtml?soeID=${item.ID}`) } className='pull-right btn btn-link'>{Scroll}</button></>  },
                        { key: 'StartTime', label: 'Start Time' },
                        { key: 'EndTime', label: 'End Time' },
                        { key: 'System', label: 'System', headerStyle: { width: 100 }, rowStyle: { width: 100 }},
                        { key: 'Circuits', label: 'Circuits', headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'Devices', label: 'Devices', headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'Waveforms', label: 'Waveforms', headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'Duration', label: 'Duration', headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'TimeWindows', label: 'TimeSlots', headerStyle: { width: 100 }, rowStyle: { width: 100 } },
                        { key: 'Status', label: 'Status', headerStyle: { width: 200 }, rowStyle: { width: 200 } },
                        { key: null, label: '', headerStyle: { width: 20 }, rowStyle: { width: 0 }  }

                    ]}
                    tableClass="table table-hover"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 180, height: window.innerHeight - 180, width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    sortField={sortField}
                    onClick={(d) => { }}
                    onSort={d => {
                        if (d.col == sortField) {
                            setAscending(!ascending);
                        }
                        else {
                            setSortField(d.col);
                        }
                    }}
                    data={data}
                    ascending={ascending}
                />
            </div>
        </div>
    );
}

ReactDOM.render(<Replay />, document.getElementById('bodyContainer'));