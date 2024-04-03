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
import { Column } from '@gpa-gemstone/react-table/lib/Table';
import * as _ from 'lodash';

interface ImageRow {
    AssetKey: string,
    EventID: number,
    EventTagID: number,
    MeterID: number,
    ID: number,
    TagData: string,
    SystemName: string,
    CircuitName: string,
    SOE_ID: number | null
}

export default function ImageTable() {
    const { date, group, context, object } = parse(location.search);

    if (date == undefined) return null;
    else if (group == undefined) return null;
    else if (context == undefined) return null;
    else if (object == undefined) return null;

    const [mDate, setMDate] = React.useState<moment.Moment>(moment(date));
    const [mGroup, setMGroup] = React.useState<string>(group as string);
    const [data, setData] = React.useState<ImageRow[]>([]);
    const [ascending, setAscending] = React.useState<boolean>(true);
    const [sortField, setSortField] = React.useState<keyof ImageRow>('AssetKey');

    React.useEffect(() => {
        let handle = ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/MatLabImages/${mDate.format("YYYY-MM-DD")}/${mGroup.replace("/", "------")}/${context}/${object}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        }) as JQuery.jqXHR<ImageRow[]>;

        handle.done(d => {
            const parsedData = d.map(item => {
                const parsedTagData: {PlotFilePath: string} = JSON.parse(item.TagData);
                return { ...item, TagData: parsedTagData.PlotFilePath };
            });
            setData(parsedData);
        });

    }, [mDate, mGroup]);

    const cols = React.useMemo(() => {
        let baseCols: Column<ImageRow>[] = [
            { key: 'AssetKey', label: 'Device', field: 'AssetKey' },
            { key: 'SystemName', label: 'System', field: 'SystemName' },
            { key: 'CircuitName', label: 'Circuit', field: 'CircuitName' },
            { key: 'Image', label: 'Image', field: 'TagData', content: (item) => <img src={`${homePath}api/NonLinearTimeline/Image/${btoa(item.TagData)}`} width={100} height={100} onClick={() => window.open(`${homePath}api/NonLinearTimeline/Image/${btoa(item.TagData)}`)} /> },
        ]

        if (mGroup === "G7 State Change Plot")
            baseCols.push({
                key: 'SOE_ID',
                label: '',
                field: 'SOE_ID',
                content: (item) => <a href={item.SOE_ID != null ? `${homePath}NonLinearTimeLine.cshtml?soeID=${item.SOE_ID}` : `${homePath}Replay.cshtml?date=${mDate.format("YYYY-MM-DD")}`}>{item.SOE_ID != null ? 'Non Linear Timeline' : 'Replay'}</a>
            });
        return baseCols
    }, [mGroup])

    React.useEffect(() => {
        setData(_.orderBy(data, [sortField], [ascending ? "asc" : "desc"]));
    }, [ascending, sortField]);

    return (
        <div className='container theme-showcase' style={{ overflow: 'hidden', position: 'absolute', left: 0, top: 60, width: window.innerWidth, height: window.innerHeight - 75, padding: 20 }}>
            <div className='row'>
                <div className='col-lg-2'>
                    <div className="form-group">
                        <label>Group:</label>
                        <select className='form-control' value={mGroup} onChange={(evt) => setMGroup(evt.target.value)}>
                            <option value='All'>All</option>
                            <option value='G1 Vector Plot'>G1) Vector Plot</option>
                            <option value='G2 IEEE 1668 Ridethrough Plot'>G2 IEEE 1668 Ridethrough Plot</option>
                            <option value='G3 Suspected Blown Fuse Plot'>G3 Suspected Blown Fuse Plot</option>
                            <option value='G4 Reserved'>G4 Reserved</option>
                            <option value='G5 Harmonics Plot'>G5 Harmonics Plot</option>
                            <option value='G6 MinMax Plot'>G6 MinMax Plot</option>
                            <option value='G7 State Change Plot'>G7 State Change Plot</option>
                            <option value='G8 Reserved'>G8 Reserved</option>
                            <option value='G9 Reserved'>G9 Reserved</option>
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
            </div>

            <div className='row'>
                <Table<ImageRow>
                    cols={cols}
                    tableClass="table table-hover"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 40 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 270, height: window.innerHeight - 270, width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    sortKey={sortField}
                    onClick={() => { }}
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

render(<ImageTable />, document.getElementById('bodyContainer'));