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
import { TableProps,Rows } from '@gpa-gemstone/react-table';
import * as moment from 'moment';
import { ajax } from 'jquery';
import * as queryString from "query-string";
import * as _ from "lodash";
import { Column } from '@gpa-gemstone/react-table/lib/Table';

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
    'G1 Vector Plot': number,
    'G2 IEEE 1668 Ridethrough Plot': number,
    'G3 Suspected Blown Fuse Plot': number,
    'G4 Reserved': number,
    'G5 Harmonics Plot': number,
    'G6 MinMax Plot': number,
    'G7 State Change Plot': number,
    'G8 Reserved': number,
    'G9 Reserved': number,
    AllPlots: number

}

type Level = 'System' | 'Circuit' | 'Device';
const Home = (props: {}) => {
    let query = queryString.parse(window.location.search);
    const [level, setLevel] = React.useState<Level>(query['level'] != undefined ? query['level'] as Level : 'Device');
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

    const cols: RotatedColumn<HomeTable>[] = [
        {
            key: 'System', label: 'System', field: 'System', headerStyle: { width: 75 }, rowStyle: { width: 75 }, content: (item, key, field, style) => {
                if (typeof (item[field]) == 'number')
                    return item[field];
                else
                    return <a href='#' onClick={() => setLevel('System')}>{item[field]}</a>;
            }
        },
        {
            key: 'Circuit', label: 'Circuit', field: 'Circuit', headerStyle: { width: 100 }, rowStyle: { width: 100 }, content: (item, key, field, style) => {
                if (typeof (item[field]) == 'number')
                    return item[field];
                else
                    return <a href='#' onClick={() => setLevel('Circuit')}>{item[field]}</a>;
            }
        },
        {
            key: 'Meter', label: 'Device', field: 'Meter', headerStyle: { width: 150 }, rowStyle: { width: 150 }
        },
        {
            key: 'SOEs', label: 'SOE Replays', field: 'SOEs', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate:true, content: (item, key, field, style, index) => {
                if (item.SOEs == 0) return 0;
                return <a target='_blank' href={`/Replay.cshtml?date=${date.format('YYYY-MM-DD')}&units=days&stepSize=1`}>{item[field]}</a>

            }
        },
        {
            key: 'Incidents', label: 'SOE(Summary Page)', field: 'Incidents', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate:true, content: (item, key, field, style, index) => {
                if (item.Incidents == 0) return 0;

                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;
                return <a target='_blank' href={`/IncidentEventCycleDataView.cshtml?levels=${level}&limits=All&timeContext=Days&date=${moment(date).format('YYYYMMDD00')}&name=${nameString}&buckets=1`}>{item[field]}</a>
            }
        },
        {
            key: 'LTE', label: 'LTE', field: 'LTE', headerStyle: { width: 100 }, rowStyle: { width: 100 }, content: (item, key, field, style, index) => {
                if (item.LTE == null) return null;

                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;
                return <a target='_blank' href={`/IncidentEventCycleDataView.cshtml?levels=${level}&limits=All&timeContext=Days&date=${moment(date).format('YYYYMMDD00')}&name=${nameString}&buckets=1&LTE=1`}>{item[field]}</a>
            }
        },
        {
            key: 'PQS', label: 'PQS', field: 'PQS', headerStyle: { width: 100 }, rowStyle: { width: 100 }, content: (item, key, field, style, index) => {
                if (item.PQS == null) return null;

                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;
                return <a target='_blanks' href={`/IncidentEventCycleDataView.cshtml?levels=${level}&limits=All&timeContext=Days&date=${moment(date).format('YYYYMMDD00')}&name=${nameString}&buckets=1&PQS=1`}>{item[field]}</a>
            }
        },
        {
            key: 'Faults', label: 'Faults', field: 'Faults', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                if (item.Faults == 0) return 0;

                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;
                return <a target='_blank' href={`/IncidentEventCycleDataView.cshtml?levels=${level}&limits=All&timeContext=Days&date=${moment(date).format('YYYYMMDD00')}&name=${nameString}&buckets=1&Faults=1`}>{item[field]}</a>
            }  },
        { key: 'Files', label: 'Files', field: 'Files', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true },
        {
            key: 'AllPlots', label: 'All Plots', field: 'AllPlots', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;

                return <a href={`${homePath}ImageTable.cshtml?date=${date.format('YYYY-MM-DD')}&group=All&context=${level}&object=${nameString}` }>{item[field] }</a>
            }
        },

        {
            key: 'G1 Vector Plot', label: 'G1 Vector Plot', field: 'G1 Vector Plot', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;

                return <a href={`${homePath}ImageTable.cshtml?date=${date.format('YYYY-MM-DD')}&group=G1 Vector Plot&context=${level}&object=${nameString}`}>{item[field]}</a>
            }
        },
        {
            key: 'G2 IEEE 1668 Ridethrough Plot', label: 'G2 IEEE 1668 Ridethrough Plot', field: 'G2 IEEE 1668 Ridethrough Plot', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;

                return <a href={`${homePath}ImageTable.cshtml?date=${date.format('YYYY-MM-DD')}&group=G2 IEEE 1668 Ridethrough Plot&context=${level}&object=${nameString}`}>{item[field]}</a>
            }
          },
        {
            key: 'G3 Suspected Blown Fuse Plot', label: 'G3 Suspected Blown Fuse Plot', field: 'G3 Suspected Blown Fuse Plot', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;

                return <a href={`${homePath}ImageTable.cshtml?date=${date.format('YYYY-MM-DD')}&group=G3 Suspected Blown Fuse Plot&context=${level}&object=${nameString}`}>{item[field]}</a>
            }
          },
        {
            key: 'G4 Reserved', label: 'G4 Reserved', field: 'G4 Reserved', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;

                return <a href={`${homePath}ImageTable.cshtml?date=${date.format('YYYY-MM-DD')}&group=G4 Reserved&context=${level}&object=${nameString}`}>{item[field]}</a>
            }
          },
        {
            key: 'G5 Harmonics Plot', label: 'G5 Harmonics Plot', field: 'G5 Harmonics Plot', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;

                return <a href={`${homePath}ImageTable.cshtml?date=${date.format('YYYY-MM-DD')}&group=G5 Harmonics Plot&context=${level}&object=${nameString}`}>{item[field]}</a>
            }
          },
        {
            key: 'G6 MinMax Plot', label: 'G6 MinMax Plot', field: 'G6 MinMax Plot', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;

                return <a href={`${homePath}ImageTable.cshtml?date=${date.format('YYYY-MM-DD')}&group=G6 MinMax Plot&context=${level}&object=${nameString}`}>{item[field]}</a>
            }
         },
        {
            key: 'G7 State Change Plot', label: 'G7 State Change Plot', field: 'G7 State Change Plot', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;

                return <a href={`${homePath}ImageTable.cshtml?date=${date.format('YYYY-MM-DD')}&group=G7 State Change Plot&context=${level}&object=${nameString}`}>{item[field]}</a>
            }
          },
        {
            key: 'G8 Reserved', label: 'G8 Reserved', field: 'G8 Reserved', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;

                return <a href={`${homePath}ImageTable.cshtml?date=${date.format('YYYY-MM-DD')}&group=G8 Reserved&context=${level}&object=${nameString}`}>{item[field]}</a>
            }
         },
        {
            key: 'G9 Reserved', label: 'G9 Reserved', field: 'G9 Reserved', headerStyle: { width: 50 }, rowStyle: { width: 50 }, rotate: true, content: (item, key, field, style, index) => {
                let nameString = "";
                if (level == "System")
                    nameString = item.System as string;
                else if (level == "Circuit")
                    nameString = item.Circuit as string;
                else if (level == "Device")
                    nameString = item.Meter as string;

                return <a href={`${homePath}ImageTable.cshtml?date=${date.format('YYYY-MM-DD')}&group=G9 Reserved&context=${level}&object=${nameString}`}>{item[field]}</a>
            }
          },
        { key: null, label: '', headerStyle: { width: 20 }, rowStyle: { width: 0 } }
    ];

    return (
        <div className='container theme-showcase' style={{ overflow: 'hidden', position: 'absolute', left: 0, top: 60, width: window.innerWidth, height: window.innerHeight - 60 }}>
            <div className='row'>
                <div className='col-lg-1'>
                    <div className='form-group'>
                        <label>&nbsp;</label>
                        <button className='btn btn-primary form-control' onClick={() => {
                            setLevel('Device');
                        }}>Clear Filters</button>
                    </div>
                </div>

                <div className='col-lg-2'>
                    <div className="form-group">
                        <label>Aggregation Level:</label>
                        <select className='form-control' value={level as string} onChange={(evt) => setLevel(evt.target.value as Level)}>
                            <option value='System'>System</option>
                            <option value='Circuit'>Circuit</option>
                            <option value='Device'>Device</option>
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
                        <label>Month Step</label>
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
                <RotatedHeaderTable<HomeTable>
                    cols={cols}
                    tableClass="table table-hover"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: window.innerWidth, height: 135 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 270, height: window.innerHeight - 270, width: '100%' }}
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

interface RotatedColumn<T> extends Column<T> { rotate?: boolean}
interface RotatedHeaderProps<T> extends TableProps<T> {
    cols: RotatedColumn<T>[];
}

function RotatedHeaderTable<T>(props: RotatedHeaderProps<T>){
    return (
        <table className={props.tableClass !== undefined ? props.tableClass : ''} style={props.tableStyle}>
            <RotatedHeader<T> Class={props.theadClass} Style={props.theadStyle} Cols={props.cols} SortKey={props.sortKey} Ascending={props.ascending} Click={(d, e) => {
                if(d.colKey !== null)
                    props.onSort(d)
            }} />
            <Rows<T> Data={props.data} Cols={props.cols} RowStyle={props.rowStyle} BodyStyle={props.tbodyStyle} BodyClass={props.tbodyClass} Click={(data, e) => props.onClick(data, e)} Selected={props.selected} KeySelector={props.keySelector} />
        </table>
    );
}

interface IRotatedHeaderProps<T> {
    Class?: string,
    Style?: React.CSSProperties,
    Cols: RotatedColumn<T>[],
    SortKey: string,
    Ascending: boolean,
    Click: (data: { colKey: string; colField?: keyof T; ascending: boolean }, event: React.MouseEvent<HTMLTableHeaderCellElement, MouseEvent>) => void

}

function RotatedHeader<T>(props: IRotatedHeaderProps<T>) {

    return (
        <thead className={props.Class} style={props.Style}>
            <tr>{props.Cols.map((col) => <RotatedHeaderCell key={col.key} HeaderStyle={col.headerStyle} DataKey={col.key} Click={(e) => props.Click({ colKey: col.key, colField: col.field, ascending: props.Ascending }, e)} Label={col.label} SortKey={props.SortKey} Ascending={props.Ascending} Rotate={col.rotate } />)}
            </tr>
        </thead>)

}

interface IRotatedHeaderCellProps {
    HeaderStyle?: React.CSSProperties,
    DataKey: string,
    Click: (e: any) => void,
    Label: string,
    SortKey: string,
    Ascending: boolean,
    Rotate?:boolean
}
function RotatedHeaderCell(props: IRotatedHeaderCellProps) {
    const style: React.CSSProperties = (props.HeaderStyle !== undefined) ? props.HeaderStyle : {};

    if (style.cursor === undefined && props.DataKey !== null) {
        style.cursor = 'pointer';
    }

    if (style.position === undefined) {
        style.position = 'relative';
    }

    style.whiteSpace = 'nowrap';
    if (props.Rotate != true)
        return (
            <th
                style={style}
                onClick={(e) => props.Click(e)}
            >

                <RenderAngleIcon SortKey={props.SortKey} Key={props.DataKey} Ascending={props.Ascending} />
                <div style={{ marginLeft: props.SortKey == props.DataKey ?  10 : 0 }}>{props.Label}</div>
            </th>
        );
    else {
        return (
            <th
                style={style}
                onClick={(e) => props.Click(e)}
            >

                <RenderAngleIcon SortKey={props.SortKey} Key={props.DataKey} Ascending={props.Ascending} />
                <div style={{ transform: 'translate(0px,-15px) rotate(315deg)' }}><span style={{borderBottom: '1px solid #ccc', padding: '5px 10px'}}>{props.Label}</span></div>
            </th>
        );

    }
}

interface IRenderAngleProps {
    SortKey: string,
    Key: string,
    Ascending: boolean
}

function RenderAngleIcon(props: IRenderAngleProps) {

    const AngleIcon: React.FunctionComponent<{ ascending: boolean }> = () => (
        <div
            style={{ position: 'absolute', bottom: 10, transform: (props.Ascending ? 'rotate(0deg)' : 'rotate(180deg)') }}>{'^'}</div>
    );

    if (props.SortKey === null)
        return null;

    if (props.SortKey !== props.Key)
        return null;

    return <AngleIcon ascending={props.Ascending} />
};

ReactDOM.render(<Home />, document.getElementById('bodyContainer'));