//******************************************************************************************************
//  ImageTable.tsx - Gbtc
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
//  07/27/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { render } from 'react-dom';
import { parse } from 'query-string';
import * as moment from 'moment';
import { ajax } from 'jquery';
import Table from '@gpa-gemstone/react-table';
import { orderBy } from 'lodash';

interface ImageTableRow {
    System: string,
    Circuit: string,
    Device: string,
    Group: string,
    Link: string,
    DisplayText: string,
    EventID: number,
    RetentionPolicy: string,
    Deleted: boolean,
    ID: number
}

export default function ImageTable() {
    const { date, group, context, object } = parse(location.search);

    if (date == undefined) return null;
    else if (group == undefined) return null;
    else if (context == undefined) return null;
    else if (object == undefined) return null;

    const [mDate, setMDate] = React.useState<moment.Moment>(moment(date));
    const [mGroup, setMGroup] = React.useState<string>(group as string);
    const [data, setData] = React.useState<ImageTableRow[]>([]);
    const [showDeleted, setShowDeleted] = React.useState<boolean>(false);

    const [ascending, setAscending] = React.useState<boolean>(true);
    const [sortField, setSortField] = React.useState<keyof ImageTableRow>('DisplayText');

    React.useEffect(() => {

        let handle = ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/ImageTable/${mDate.format("YYYY-MM-DD")}/${mGroup.replace("/", "------")}/${context}/${object}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        }) as JQuery.jqXHR<ImageTableRow[]>;

        handle.done(d => setData(SortData(d)));

    }, [mDate, mGroup]);

    React.useEffect(() => {
        setData(SortData(data));
    }, [ascending, sortField]);


    function SortData(data: ImageTableRow[]): ImageTableRow[] {
        return orderBy(data, [sortField], [ascending ? "asc" : "desc"]);
    }

    return (
        <div className='container theme-showcase' style={{ overflow: 'hidden', position: 'absolute', left: 0, top: 60, width: window.innerWidth, height: window.innerHeight - 75, padding: 20 }}>
            <div className='row'>
                <div className='col-lg-2'>
                    <div className="form-group">
                        <label>Group:</label>
                        <select className='form-control' value={mGroup} onChange={(evt) => setMGroup(evt.target.value)}>
                            <option value='All'>All</option>
                            <option value='G1 Research'>G1 Research</option>
                            <option value='G2 Switching'>G2 Switching</option>
                            <option value='G3 Faults'>G3 Faults</option>
                            <option value='G4 Power Quality'>G4 Power Quality</option>
                            <option value='G5 Artifacts/Harmonics'>G5 Artifacts/Harmonics</option>
                            <option value='G6 MinMaxAvg/History'>G6 MinMaxAvg/History</option>
                            <option value='G7 Reports'>G7 Reports</option>
                            <option value='G8 Predictive'>G8 Predictive</option>
                            <option value='G9 Other'>G9 Other</option>

                        </select>
                    </div>
                </div>

                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>Day Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setMDate(moment(mDate.subtract(1, 'day')))}>{'<<'}</button>
                    </div>
                </div>


                <div className='col-lg-2'>
                    <div className="form-group">
                        <label>Date:</label>
                        <input className='form-control' type='date' value={mDate.format('YYYY-MM-DD')} onChange={(evt) => setMDate(moment(evt.target.value))} />
                    </div>
                </div>

                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>Day Step</label>
                        <button className='btn btn-primary form-control' onClick={() => setMDate(moment(mDate.add(1, 'days')))}>{'>>'}</button>
                    </div>
                </div>

                <div className='col-lg-1'>
                    <div className='checkbox'>
                        <label><input type='checkbox' value={showDeleted.toString()} checked={showDeleted} onChange={() => setShowDeleted(!showDeleted)} />Show Deleted</label>
                    </div>
                </div>


            </div>
            <div className='row'>
                <Table<ImageTableRow>
                    cols={[
                        { key: 'System', label: 'System', field: 'System' },
                        { key: 'Circuit', label: 'Circuit', field: 'Circuit' },
                        { key: 'Device', label: 'Device', field: 'Device' },
                        { key: 'Group', label: 'Group', field: 'Group' },
                        { key: 'DisplayText', label: 'DisplayText', field: 'DisplayText', content: (item, key, field, style, index) => <a href={`${homePath}Image.html?imageID=${item.ID}`} target='_blank'>{item.DisplayText}</a> },
                        { key: 'EventID', label: 'EventID', field: 'EventID' },
                        { key: 'RetentionPolicy', label: 'RetentionPolicy', field: 'RetentionPolicy' },
                        { key: 'Deleted', label: 'Deleted', field: 'Deleted', content: (item) =>  item.Deleted ? "true" : "false"},
                        { key: null, label: '', headerStyle: { width: 20 }, rowStyle: { width: 0 } }

                    ]}
                    tableClass="table table-hover"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 40 }}
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
                    data={data.filter(d => {
                        if (showDeleted) return true;
                        else return !d.Deleted
                    })}
                    ascending={ascending}
                />
            </div>
        </div>

    );
}

render(<ImageTable />, document.getElementById('bodyContainer'));