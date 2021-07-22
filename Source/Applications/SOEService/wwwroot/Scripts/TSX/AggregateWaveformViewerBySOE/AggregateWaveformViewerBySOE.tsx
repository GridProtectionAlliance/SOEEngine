//******************************************************************************************************
//  waveform.tsx - Gbtc
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
//  03/06/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import IncidentGroup from '../IncidentGroup';
import * as queryString from "query-string";
import * as moment from 'moment';
import * as _ from "lodash";
import { Moment } from 'moment';
import SOEService from '../../Services/SOEService';
import { SOETools } from '@gpa-gemstone/application-typings';
import { Input, Select } from '@gpa-gemstone/react-forms';
import Table from '@gpa-gemstone/react-table';
import { DownArrow, LeftArrow, RightArrow, UpArrow } from '@gpa-gemstone/gpa-symbols';

interface IncidentReturn {
    CicuitID: number,
    EndTime: string,
    LineName: string,
    MeterID: number,
    MeterName: string,
    Orientation: string,
    ParentID: number,
    StartTime: string,
    IncidentID: number
}


const AggregateWaveformViewerBySOE = (props: {}) => {

    let query = queryString.parse(window.location.search);
    const [soeID, setSOEID] = React.useState<number>(query.soeID != undefined ? parseInt(query.soeID as string) : 0);
    const [soe, setSOE] = React.useState<SOETools.Types.SOE>({} as SOETools.Types.SOE);
    const [dateRange, setDateRange] = React.useState<moment.Moment[]>([query.startDate != undefined ? moment(query.startDate, MomentFormat) : undefined, query.endDate != undefined ? moment(query.endDate, MomentFormat) : undefined]);
    const [times, setTimes] = React.useState<JSX.Element[]>([]);
    const [rows, setRows] = React.useState<IncidentReturn[]>([]);
    const [pixels, setPixels] = React.useState<number>(window.innerWidth);

    let resizeID = undefined;
    React.useEffect(() => {

        $.get(`/api/SOE/${soeID}`).done(res => setSOE(res));

        window.addEventListener("resize", () => {
            clearTimeout(resizeID);
            resizeID = setTimeout(() => {
                setPixels(window.innerWidth);
            }, 500);
        });


        return () => {
            $(window).off('resize');
        };
    }, [soeID]);

    React.useEffect(() => {
        if (soe.ID == undefined) return;
        $.get(`api/IncidentGroups/SOE/${soeID}`).done(res => setRows(res));
    }, [soe]);



    React.useEffect(() => {
        if (rows.length == 0) return;
        setTimes(setTimeList());
    }, [rows]);


    React.useEffect(() => {
        window.history.pushState({}, '', `${window.location.origin}${window.location.pathname}?${queryString.stringify({ soeID, startDate: dateRange[0]?.format(MomentFormat), endDate: dateRange[1]?.format(MomentFormat) })}`)
    }, [soeID, dateRange]);

    function setTimeList() {
        if (soe.StartTime == undefined) return [];
        let numOfDates = 20;
        let interval = (getMillisecondTime(soe.EndTime) - getMillisecondTime(soe.StartTime)) / numOfDates;
        let dates = [soe.StartTime];
        for (var i = 1; i < numOfDates - 1; ++i) {
            dates.push(getDateString(getMillisecondTime(soe.StartTime) + i * interval));
        }
        dates.push(soe.EndTime);

        return dates.map((date, i) => <TimeSpanButton key={i} MeterIDs={rows.map(m => m.MeterID)} Index={i} OnClick={() => goToTime(date, interval / 2)} Date={date} Interval={interval}></TimeSpanButton>);
    }

    function goToTime(timeStamp, windowSize) {
        let milliseconds = getMillisecondTime(timeStamp);
        let startDate = getDateString(milliseconds - windowSize);
        let endDate = getDateString(milliseconds + windowSize);
        setDateRange([moment(startDate, MomentFormat), moment(endDate, MomentFormat)])
    }

    function goToDiv(meterName) {
        let element = document.getElementById(meterName);

        if (element) {

            if (!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)) {
                element.tabIndex = -1;
            }

            element.focus();
        }
    }

    return (
        <div className="screen" style={{ height: window.innerHeight - 60 }}>
            <div className="vertical-menu">
                {rows.map(x => <a key={'nav' + x.IncidentID + x.MeterName + x.LineName } onClick={(e) => goToDiv(x.MeterName)}>{x.MeterName}</a>)}
            </div>
            <div className="waveform-viewer" style={{ width: window.innerWidth - 150 }}>
                <div className="horizontal-row" style={{ width: '100%' }}>
                    <table className='table' style={{ width: '100%' }}>
                        <tbody>
                            <tr>
                                <td><button className="btn" onClick={() => setDateRange([moment(soe.StartTime, 'YYYY-MM-DDTHH:mm:ss.SSSSSSS'), moment(soe.EndTime, 'YYYY-MM-DDTHH:mm:ss.SSSSSSS')])}>Reset</button></td>
                                <td>
                                    <span style={{ marginLeft: '3px', marginRight: '3px' }}> Quick Jump(Tmax/20):</span>
                                    {times}
                                </td>
                                <td><span style={{ marginLeft: '3px', marginRight: '3px' }}>SOE Name: {soe.Name}</span></td>
                                <td><span style={{ marginLeft: '3px', marginRight: '3px' }}>Status: {soe.Status}</span></td>
                                <td><span style={{ marginLeft: '3px', marginRight: '3px' }}>Start: {soe.StartTime}</span></td>
                                <td><span style={{ marginLeft: '3px', marginRight: '3px' }}>Duration: {moment.duration(moment(soe.EndTime).diff(moment(soe.StartTime))).asSeconds()}s</span></td>
                                <td><NameEditDialog SOE={soe} OnClose={(record) => window.location.reload()} /></td>
                            </tr>
                        </tbody>
                    </table>                     
                </div>
                <div className="list-group" style={{ maxHeight: window.innerHeight - 100, overflowY: 'auto' }}>
                    {rows.map((d, i) => {
                        return <IncidentGroup
                            key={'ig' + d.IncidentID + d.MeterName + d.LineName}
                            lineName={d.LineName}
                            incidentId={d.IncidentID}
                            orientation={d.Orientation}
                            circuitId={d.CicuitID}
                            meterId={d.MeterID}
                            meterName={d.MeterName}
                            startDate={dateRange[0]?.format(MomentFormat) ?? d.StartTime}
                            endDate={dateRange[1]?.format(MomentFormat) ?? d.EndTime}
                            pixels={pixels}
                            stateSetter={(rsp) => setDateRange([moment(rsp.StartDate, MomentFormat), moment(rsp.EndDate, MomentFormat)])}></IncidentGroup>
                    })}
                </div>
            </div>
        </div>
    );


    function getMillisecondTime(date) {
        let milliseconds = moment.utc(date).valueOf();
        let millisecondsFractionFloat = parseFloat((date.toString().indexOf('.') >= 0 ? '.' + date.toString().split('.')[1] : '0')) * 1000;

        return milliseconds + millisecondsFractionFloat - Math.floor(millisecondsFractionFloat);
    }

    function getDateString(float) {
        let date = moment.utc(float).format(MomentFormat);
        let millisecondFraction = parseInt((float.toString().indexOf('.') >= 0 ? float.toString().split('.')[1] : '0'))

        return date + millisecondFraction.toString();
    }


}

const TimeSpanButton = (props: { MeterIDs: number[], Index: number, OnClick: () => void, Date: string, Interval: number }) => {
    const [color, setColor] = React.useState<'yellow' | 'lightgrey'>('lightgrey');

    React.useEffect(() => {
        let soeservice = new SOEService();
        soeservice.getButtonColor(props.Date, moment(props.Date).add(props.Interval, 'milliseconds').format(MomentFormat), props.MeterIDs).then(data => setColor(data.data ? 'yellow' : 'lightgrey'));
    }, []);

    return <button style={{ backgroundColor: color }} onClick={() => props.OnClick()} title={props.Date.toString()} className="btn">{props.Index + 1}</button>;
}

interface SOEDevices {
    IncidentID: number, System: string, PrefCkt: string, AltCkt: string, Order: number, Device: string, FaultType: string, Waveforms: number
}

const NameEditDialog = (props: { SOE: SOETools.Types.SOE, OnClose: (record: SOETools.Types.SOE) => void }) => {
    const [show, setShow] = React.useState<boolean>(false);
    const [soe, setSOE] = React.useState<SOETools.Types.SOE>({ ...props.SOE, Name: (props.SOE.Name == undefined ? `xdaSOE${props.SOE.ID}` : props.SOE.Name), StartTime: moment(props.SOE.StartTime).format(MomentFormat), EndTime: moment(props.SOE.EndTime).format(MomentFormat) });
    const [amendedDuration, setAmendedDuration] = React.useState<number>(1);
    const [amendUnits, setAmendUnits] = React.useState<'minutes' | 'seconds' | 'milliseconds' >('seconds');
    const [prependedDuration, setPrependedDuration] = React.useState<number>(1);
    const [prependUnits, setPrependUnits] = React.useState<'minutes' | 'seconds' | 'milliseconds'>('seconds');

    const [devices, setDevices] = React.useState<SOEDevices[]>([]);
    const [otherDevices, setOtherDevices] = React.useState<SOEDevices[]>([]);

    const [deviceSortField, setDeviceSortField] = React.useState<keyof SOEDevices>('Order');
    const [deviceAscending, setDeviceAscending] = React.useState<boolean>(true);
    const [othersSortField, setOthersSortField] = React.useState<keyof SOEDevices>('System');
    const [othersAscending, setOthersAscending] = React.useState<boolean>(true);


    React.useEffect(() => {
        setSOE({ ...props.SOE, Name: (props.SOE.Name == undefined ? `xdaSOE${props.SOE.ID}` : props.SOE.Name), StartTime: moment(props.SOE.StartTime).format(MomentFormat), EndTime: moment(props.SOE.EndTime).format(MomentFormat) });
    }, [props.SOE, show]);

    React.useEffect(() => {
        if (props.SOE.ID == undefined) return;
        $.get(`api/SOE/Devices/${props.SOE.ID}`).done((res: SOEDevices[]) => SortDevices(res));
    }, [props.SOE.ID]);

    React.useEffect(() => {
        if (props.SOE.ID == undefined) return;
        $.get(`api/SOE/Other/Devices/${props.SOE.ID}/${soe.StartTime}/${soe.EndTime}`).done((res: SOEDevices[]) => SortOtherDevices(res));
    }, [props.SOE.ID, soe.StartTime, soe.EndTime]);

    React.useEffect(() => SortDevices(devices), [deviceSortField, deviceAscending]);
    React.useEffect(() => SortOtherDevices(otherDevices), [othersSortField, othersAscending]);

    const SortDevices = (d: SOEDevices[]) => setDevices(_.orderBy(d, [deviceSortField], [deviceAscending ? 'asc' : 'desc']));
    const SortOtherDevices = (d: SOEDevices[]) => setOtherDevices(_.orderBy(d, [othersSortField], [othersAscending ? 'asc' : 'desc']));

    function MoveDeviceLeft(row: SOEDevices, index: number) {
        let newlist = [...devices];

        if (row.Order == undefined) {
            let maxOrder = Math.max(...newlist.map(x => x.Order));
            row.Order = maxOrder + 1;
        }
        newlist.push(row);

        let newOtherslist = otherDevices.filter((x, i) => i != index);
        SortDevices(newlist);
        SortOtherDevices(newOtherslist);
    }

    function MoveDeviceRight(row: SOEDevices, index: number) {
        let newlist = [...otherDevices];
        newlist.push(row);
        let newOtherslist = devices.filter((x, i) => i != index);
        SortDevices(newOtherslist);
        SortOtherDevices(newlist);
    }

    function MoveDeviceUp(row: SOEDevices, index: number) {
        if (index == 0) return;
        let sorted = _.orderBy(devices, ['Order']);
        let newlist = [...sorted];
        let order = devices[index - 1].Order;
        let nxtorder = devices[index].Order;

        newlist[index].Order = order;
        newlist[index-1].Order = nxtorder;

        SortDevices(newlist);

    }

    function MoveDeviceDown(row: SOEDevices, index: number) {
        if (index == devices.length) return;
        let sorted = _.orderBy(devices, ['Order']);
        let newlist = [...sorted];
        let order = devices[index].Order;
        let nxtorder = devices[index+1].Order;

        newlist[index + 1].Order = order;
        newlist[index ].Order = nxtorder;

        SortDevices(newlist);


    }


    function ChangeSOEStatus(status: 'Hide' | 'MakeReplay') {
        return $.get(`api/SOE/ChangeStatus/${props.SOE.ID}/${status}`);
    }

    function UpdateSOEIncidents() {
        return $.ajax({
            type: 'post',
            url: `api/SOE/Incidents/${props.SOE.ID}`,
            data: JSON.stringify(devices.map(d => ({ ID: 0, SOEID: soe.ID, IncidentID: d.IncidentID, Order: d.Order }))),
            contentType: 'application/json'
        });
    }

    function UpdateSOE() {
        return $.post(`api/SOE`, soe);
    }


    return (
        <div>
            <button onClick={() => setShow(true) }>{props.SOE.Name == undefined ? 'Name SOE' : 'Amend SOE'}</button>
            <div className={`modal fade${show ? ' in' : ''}`} style={{display : show ? 'block' : 'none'}}  role="dialog">
                <div className="modal-dialog" style={{width: '90%'}}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" onClick={() => setShow(false)}>&times;</button>
                            <h4 className="modal-title">{props.SOE.Name == undefined ? 'Name SOE' : 'Amend SOE'}</h4>
                        </div>
                        <div className="modal-body">
                            <div className='row'>
                                <div className='col-sm-6'>
                                    <Input<SOETools.Types.SOE> Field='Name' Record={soe} Label='SOE Name' Type='text' Setter={(record) => { setSOE(record) }} Valid={(record) => true} Feedback='' />
                                </div>
                                <div className='col-sm-6'>
                                    <div className='row'>
                                        <div className='col-sm-4'>
                                            <Input<SOETools.Types.SOE> Field='ID' Record={soe} Label='SOE_UID' Type='text' Setter={(record) => { setSOE(record) }} Valid={(record) => true} Feedback='' Disabled={true} />
                                        </div>
                                        <div className='col-sm-4'>
                                            <Input<{ Duration: number }> Field='Duration' Label='Duration(s)' Record={{ Duration: moment(soe.EndTime).diff(soe.StartTime, 'millisecond') / 1000.0 }} Type='text' Setter={(record) => { }} Valid={(record) => true} Feedback='' Disabled={true} />
                                        </div>
                                        <div className='col-sm-4'>
                                            <Input<SOETools.Types.SOE> Field='Status' Record={soe} Label='Status' Type='text' Setter={(record) => { setSOE(record) }} Valid={(record) => true} Feedback='' Disabled={true} />
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-sm-6'>
                                    <Input<SOETools.Types.SOE> Disabled={true} Field='StartTime' Record={soe} Label='SOE StartTime' Type='text' Setter={(record) => { setSOE({ ...record, StartTime: moment(record.StartTime).format(MomentFormat)}) }} Valid={(record) => true} Feedback='' />
                                </div>
                                <div className='col-sm-6'>
                                    <div className='row'>
                                        <div className='col-sm-4'>
                                            <Input<{ Duration: number }> Field='Duration' Label='Prepend Duration' Record={{ Duration: prependedDuration }} Type='number' Setter={(record) => setPrependedDuration(record.Duration)} Valid={(record) => true} Feedback='' />
                                        </div>
                                        <div className='col-sm-4'>
                                            <Select<{ Units: 'minutes' | 'seconds' | 'milliseconds' }> Field='Units' Label='Units' Record={{ Units: prependUnits }} Setter={(record) => setPrependUnits(record.Units)} Options={[{ Value: 'minutes', Label: 'minutes' }, { Value: 'seconds', Label: 'seconds' }, { Value: 'milliseconds', Label: 'milliseconds' }]} />
                                        </div>
                                        <div className='col-sm-4'>
                                            <div className='form-group'>
                                                <label>&nbsp;</label>
                                                <button className='btn btn-primary form-control' onClick={() => setSOE({ ...soe, StartTime: moment(soe.StartTime).subtract(prependedDuration, prependUnits).format(MomentFormat) })}>Prepend</button>
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-sm-6'>
                                    <Input<SOETools.Types.SOE> Field='EndTime' Disabled={true} Record={soe} Label='SOE EndTime' Type='text' Setter={(record) => { setSOE({ ...record, EndTime: moment(record.EndTime).format(MomentFormat) }) }} Valid={(record) => true} Feedback='' />
                                </div>
                                <div className='col-sm-6'>
                                    <div className='row'>
                                        <div className='col-sm-4'>
                                            <Input<{ Duration: number }> Field='Duration' Label='Amend Duration' Record={{Duration: amendedDuration}} Type='number' Setter={(record) => setAmendedDuration(record.Duration)} Valid={(record) => true} Feedback='' />
                                        </div>
                                        <div className='col-sm-4'>
                                            <Select<{ Units: 'minutes' | 'seconds' | 'milliseconds' }> Field='Units' Label='Units' Record={{ Units: amendUnits }} Setter={(record) => setAmendUnits(record.Units)} Options={[{ Value: 'minutes', Label: 'minutes' }, { Value: 'seconds', Label: 'seconds' }, { Value: 'milliseconds', Label: 'milliseconds' }] }/>
                                        </div>
                                        <div className='col-sm-4'>
                                            <div className='form-group'>
                                                <label>&nbsp;</label>
                                                <button className='btn btn-primary form-control' onClick={() => setSOE({ ...soe, EndTime: moment(soe.EndTime).add(amendedDuration, amendUnits).format(MomentFormat) })}>Amend</button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-sm-6'>
                                    <table className='table table-responsive'>
                                        <thead><tr><th>Count</th><th>SOE Aggregated Waveform Viewer</th></tr></thead>
                                        <tbody>
                                            <tr><td>{[...(new Set(devices.map(x => x.System)))].length}</td><td>Systems</td></tr>
                                            <tr><td>{[...(new Set(devices.map(x => x.PrefCkt)))].length}</td><td>Circuits</td></tr>
                                            <tr><td>{[...(new Set(devices.map(x => x.Device)))].length}</td><td>Devices</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className='col-sm-6'>
                                    <table className='table table-responsive'>
                                        <thead><tr><th>Count</th><th>Additional Candidates</th></tr></thead>
                                        <tbody>
                                            <tr><td>{[...(new Set(otherDevices.map(x => x.System)))].length}</td><td>Systems</td></tr>
                                            <tr><td>{[...(new Set(otherDevices.map(x => x.PrefCkt)))].length}</td><td>Circuits</td></tr>
                                            <tr><td>{[...(new Set(otherDevices.map(x => x.Device)))].length}</td><td>Devices</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div >
                            <div className='row'>
                                <div className='col-sm-6'>
                                    <Table<SOEDevices>
                                        tableClass='table table-responsive'
                                        theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                                        tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 670, height: window.innerHeight - 670, width: '100%' }}
                                        cols={[
                                            { key: 'System', label: 'System', headerStyle: { width: '10%' }, rowStyle: { width: '10%' }, },
                                            { key: 'PrefCkt', label: 'PrefCkt', headerStyle: { width: '10%' }, rowStyle: { width: '10%' }, },
                                            { key: 'AltCkt', label: 'AltCkt', headerStyle: { width: '10%' }, rowStyle: { width: '10%' }, },
                                            {
                                                key: 'Order', label: 'Order', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' }, content: (item, key, style,index) => <><input value={item.Order} type='number' style={{ width: 30 }} onChange={(evt) => {
                                                    //item.Order = parseInt(evt.target.value);
                                                    let d = [...devices];
                                                    d.find(dd => dd.Device == item.Device).Order = parseInt(evt.target.value);
                                                    SortDevices(d);
                                                }} />
                                                    <button className='btn btn-link' onClick={() => MoveDeviceUp(item,index)}>{UpArrow}</button>
                                                    <button className='btn btn-link' onClick={() => MoveDeviceDown(item,index)}>{DownArrow}</button>
                                                </>
                                            },
                                            { key: 'Device', label: 'Devices', headerStyle: { width: '20%' }, rowStyle: { width: '20%' } },
                                            { key: 'FaultType', label: 'FaultType', headerStyle: { width: '10%' }, rowStyle: { width: '10%' }, },
                                            { key: 'Waveforms', label: 'Waveforms', headerStyle: { width: '10%' }, rowStyle: { width: '10%' }, },
                                            { key: null, label: '', headerStyle: { width: '86px' }, rowStyle: { width: '65px' } , content: (item, key, style, index) => <button className='btn btn-link' onClick={() => MoveDeviceRight(item, index)}>{RightArrow}</button> },


                                        ]}
                                        sortField={deviceSortField}
                                        ascending={deviceAscending}
                                        data={devices}
                                        onClick={() => { }}
                                        onSort={(data) => {
                                            if (data.col == deviceSortField) setDeviceAscending(!deviceAscending);
                                            else {
                                                setDeviceSortField(data.col);
                                                setDeviceAscending(true);
                                            }
                                        }}

                                    />

                                </div>
                                <div className='col-sm-6'>
                                    <Table<SOEDevices>
                                        tableClass='table table-responsive'
                                        theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                                        tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 670, height: window.innerHeight - 670, width: '100%' }}
                                        cols={[
                                            { key: null, label: '', headerStyle: { width: 60 }, rowStyle: { width: 60 }, content: (item, key, style, index) => <button className='btn btn-link' onClick={() => MoveDeviceLeft(item, index)}>{LeftArrow}</button> },
                                            { key: 'System', label: 'System', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                                            { key: 'PrefCkt', label: 'PrefCkt', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                                            { key: 'AltCkt', label: 'AltCkt', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                                            { key: 'Device', label: 'Devices', headerStyle: { width: '20%' }, rowStyle: { width: '20%' } },
                                            { key: 'FaultType', label: 'FaultType', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                                            { key: 'Waveforms', label: 'Waveforms', headerStyle: { width: 120 }, rowStyle: { width: 100 } },
                                        ]}
                                        sortField={othersSortField}
                                        ascending={othersAscending}
                                        data={otherDevices}
                                        onClick={() => { }}
                                        onSort={(data) => {
                                            if (data.col == othersSortField) setOthersAscending(!othersAscending);
                                            else {
                                                setOthersSortField(data.col);
                                                setOthersAscending(true);
                                            }
                                        }}

                                    />
                                </div>
                            </div >

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => {
                                setShow(false);
                                ChangeSOEStatus('MakeReplay').done(() => props.OnClose(soe));
                            }}>Make SOE Replay</button>
                            <button type="button" className="btn btn-danger" onClick={() => {
                                setShow(false);
                                ChangeSOEStatus('Hide').done(() => props.OnClose(soe));
                            }}>Hide SOE Replay</button>
                            <button type="button" className="btn btn-primary" onClick={() => {
                                UpdateSOE().done(() => UpdateSOEIncidents().done(() => {
                                    props.OnClose(soe);
                                    setShow(false)
                                }));
                            }}>Apply Changes & Show SOE AWV</button>
                            <button type="button" className="btn btn-default" onClick={() => setShow(false)}>Close</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

ReactDOM.render(<AggregateWaveformViewerBySOE />, document.getElementById('bodyContainer'));