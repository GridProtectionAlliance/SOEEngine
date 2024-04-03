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
import * as $ from 'jquery';
import { parse } from "query-string";
import { } from "lodash";
import { PlayButton, PauseButton, RewindButton, FastForwardButton } from '@gpa-gemstone/gpa-symbols';
import { SOETools } from '@gpa-gemstone/application-typings';
import LeafletMap from './Map';
import * as d3 from 'd3';
import { SOEDataPoint, Color, MapMeter } from './nlt';

type TimeField = 'TimeSlot' | 'Time' | 'ElapsMS' | 'ElapsSEC' | 'CycleNum';

const NonLinearTimeline = (props: {}) => {
    const axis = React.useRef(null);
    let { soeID } = parse(window.location.search);
    const [tsx, setTsx] = React.useState<string>('');
    const [tsxes, setTsxes] = React.useState<string[]>([]);
    const [sensors, setSensors] = React.useState<string[]>([]);
    const [colors, setColors] = React.useState<Color[]>([]);
    const [showVolts, setShowVolts] = React.useState<boolean>(false);
    const [timeField, setTimeField] = React.useState<TimeField>('Time');
    const [meters, setMeters] = React.useState<MapMeter[]>([]);
    const [replayIndex, setReplayIndex] = React.useState<number>(1);
    const [times, setTimes] = React.useState<SOEDataPoint[]>([]);
    const [timeOutHandle, setTimeOutHandle] = React.useState<any>(null);
    const [selectedPoint, setSelectedPoint] = React.useState<SOEDataPoint>(null);
    const [timeout, setTimeout] = React.useState<number>(1000);

    React.useEffect(() => {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/Colors`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }) as JQuery.jqXHR<Color[]>;

        handle.done(d => {
            setColors(d); 
        })
        return () => { if (handle != null && handle.abort == null) handle.abort(); }
    }, []);

    React.useEffect(() => {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/TSx/${soeID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }) as JQuery.jqXHR<string[]>;

        handle.done(d => {
            setTsxes(d);

            if (d.length > 0)
                setTsx(d[d.length - 1]);
        })
        return () => { if (handle != null && handle.abort == null) handle.abort(); }

    }, [soeID]);

    React.useEffect(() => {
        if (tsx == '') return;

        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/Times/${soeID}/${tsx}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }) as JQuery.jqXHR<SOEDataPoint[]>;

        handle.done(d => {
            setTimes(d);
        })
        return () => { if (handle != null && handle.abort == null) handle.abort(); }

    }, [soeID, tsx]);

    React.useEffect(() => {
        if (tsx == '') return;

        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/Sensors/${soeID}/${tsx}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }) as JQuery.jqXHR<string[]>;

        handle.done(d => {
            setSensors(d);
        })

        let handle2 = $.ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/Meters/${soeID}/${tsx}/${replayIndex}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }) as JQuery.jqXHR<MapMeter[]>;

        handle2.done(d => {
            setMeters(d);
        })


        return () => {
            if (handle != null && handle.abort == null) handle.abort();
            if (handle2 != null && handle2.abort == null) handle2.abort();
        }

    }, [tsx, soeID, replayIndex]);

    React.useEffect(() => {
        if (times.length == 0) return;

        let width = window.innerWidth;
        let height = 50;
        $(axis.current).children().remove();

        let svg = d3.select(axis.current).append("svg");
        svg.attr('width', width).attr('height', height);

        let timesExtent = d3.extent(times, (d, i, a) => d.TimeSlot);
        let boxWidth = (width - 220) / times.length;

        let xscale = d3.scaleLinear()
            .domain(timesExtent)
            .range([0, width-220 - boxWidth]);


        let steps = 12;
        let min = timesExtent[0];
        let max = timesExtent[1];
        let stepValue = (max - min) / (steps - 1);
        let tickValues = d3.range(min, max + stepValue, stepValue);
        tickValues = tickValues.map(t => Math.round(t));
        let x_axis = d3.axisTop(xscale).tickValues(tickValues).tickFormat(t => times.find(time => time.TimeSlot == t)[timeField].toString());

        svg.on('click', evt => setReplayIndex(Math.round(xscale.invert(evt.clientX - 150))));

        svg.append("g")
            .attr("transform", `translate(${150 + boxWidth/2},45)`)
            .call(x_axis);

        svg.append("g").attr("transform", `translate(${150 + boxWidth / 2+ xscale(replayIndex)},5) rotate(180)`)
            .selectAll('path')
            .data([1])
            .enter()
            .append('path')
            .attr('d', d3.symbol().type(d3.symbolTriangle))
            .attr('fill', 'red')
            .attr('stroke', '#000')
            .attr('stroke-width', 1);

    }, [times, timeField, replayIndex]);


    let filteredSensors = sensors.filter(s => {
        if (showVolts) return true;
        else if (s.indexOf('.V') >= 0) return false;
        else return true;
    });

    return (
        <div className='container theme-showcase' style={{ overflow: 'hidden', position: 'absolute', left: 0, top: 60, width: window.innerWidth, height: window.innerHeight - 60 }}>
            <LeafletMap SOEID={soeID as string} Colors={colors} Meters={meters} Height={(window.innerHeight - 60) / 2} Width={window.innerWidth} SelectedPoint={selectedPoint } />

            <div style={{ height: (window.innerHeight - 60)/2, width: window.innerWidth, position: 'relative' }}>
                <div style={{ height: 50, width: window.innerWidth }}>
                    <div style={{ height: 50, width: 100, position: 'absolute', left: 5 }}>
                        <span>{[...new Set(sensors.map(s => s.split('-')[0]))].join('/') }</span>
                    </div>

                    <div style={{ height: 50, width: 400, position: 'absolute', right: 900, padding: 7 }}>
                        Replay Time: {moment(times[replayIndex - 1]?.Time).format('HH:mm:ss.SSS') + '   '}
                        Elapsed: {times[replayIndex - 1] != undefined ? times[replayIndex - 1][(timeField == 'Time' ? 'ElapsMS' : timeField)] : ''} {(timeField == 'Time' ? 'ElapsMS' : timeField)}
                    </div>

                    <div style={{ height: 50, width: 200, position: 'absolute', right: 700 }} >
                        <div style={{ position: 'absolute', padding: 7 }}>Speed:</div>
                        <div style={{ height: 50, width: 100, position: 'absolute', right: 5 }}>
                            <select className='form-control' value={(timeout/1000).toString()} onChange={(evt) => setTimeout(parseFloat(evt.target.value)*1000 )}>
                                {['0.25', '0.5', '0.75', '1', '2'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ height: 50, width: 200, position: 'absolute', right: 500, userSelect: 'none' }} >
                        <span style={{ fontSize: 'x-large', cursor: 'pointer' }} onClick={() => {
                            if (replayIndex > 1)
                                setReplayIndex(replayIndex - 1);
                        }}>{RewindButton}</span>
                        <span style={{ fontSize: 'x-large', cursor: 'pointer' }} onClick={() => {
                            if (timeOutHandle != null)
                                clearInterval(timeOutHandle);

                            let handle = setInterval(() => {
                                    setReplayIndex(prev => {
                                        if (prev < times.length) return prev + 1;
                                        else {
                                            clearInterval(handle);
                                            return prev;
                                        }
                                    });
                            }, timeout)

                            setTimeOutHandle(handle);
                        }}>{PlayButton}</span>
                        <span style={{ fontSize: 'x-large', cursor: 'pointer' }} onClick={() => {
                            if (timeOutHandle != null)
                                clearInterval(timeOutHandle);
                        }}>{PauseButton}</span>
                        <span style={{ fontSize: 'x-large', cursor: 'pointer' }} onClick={() => {
                            if(replayIndex < times.length)
                                setReplayIndex(replayIndex + 1)
                        }}>{FastForwardButton}</span>

                    </div>


                    <div style={{ height: 50, width: 200, position: 'absolute', right: 300 }} >
                        <div style={{ position: 'absolute', padding: 7 }}>Time Field:</div>
                        <div style={{ height: 50, width: 100, position: 'absolute', right: 5 }}>
                            <select className='form-control' value={timeField} onChange={(evt) => setTimeField(evt.target.value as TimeField)}>
                                {['TimeSlot','Time' , 'ElapsMS', 'ElapsSEC', 'CycleNum'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ height: 50, width: 125, position: 'absolute', right: 175 }} >
                        <div style={{ position: 'absolute', padding: 7 }}>Show Voltage:</div>
                        <div style={{ height: 50, position: 'absolute', right: 0, padding: 8 }}>
                            <input type='checkbox' value={showVolts.toString()} checked={showVolts} onChange={(evt) => setShowVolts(evt.target.checked) }/>
                        </div>
                    </div>
                </div>
                <div ref={axis} style={{ height: 50, width: window.innerWidth, position: 'relative' }}>
                    
                </div>
                <div style={{ height: window.innerHeight - 500 - 60 - 50 - 50, maxHeight: window.innerHeight - 500 - 60 - 50-50, overflowY: 'scroll', width: window.innerWidth, position: 'relative' }}>
                    <div id='sensors' style={{ width: 200, position: 'absolute', left: 0, height: filteredSensors.length * 20 }}>
                        {filteredSensors.map(s => <div key={s} style={{ width: 200, height: 20 }}>{s}</div>)}
                    </div>
                    <svg id='data' style={{ width: window.innerWidth - 200 - 20, position: 'absolute', left: 200, height: filteredSensors.length * 20 }}>
                        {filteredSensors.map((s, i) => <NTLRow key={s + soeID + tsx + showVolts.toString()} SOEID={soeID as string} TSx={tsx} Sensor={s} Colors={colors} Height={20} Width={window.innerWidth - 200 - 20} NumSensors={filteredSensors.length} Row={i} ReplayIndex={replayIndex} SelectedPoint={selectedPoint} SelectPoint={setSelectedPoint }/>)}
                    </svg>
                </div>
            </div>
        </div>
    );
}


const NTLRow = (props: { SOEID: string, TSx: string, Sensor: string, Colors: Color[], Height: number, Width: number, NumSensors: number, Row: number, ReplayIndex: number, SelectedPoint: SOEDataPoint, SelectPoint: (sp: SOEDataPoint) => void  }) => {
    const [data, setData] = React.useState<SOEDataPoint[]>([]);
    React.useEffect(() => {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/Data/${props.SOEID}/${props.TSx}/${props.Sensor}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }) as JQuery.jqXHR<SOEDataPoint[]>;

        handle.done(d => {
            setData(d);
        })
        return () => { if (handle != null && handle.abort == null) handle.abort(); }

    }, [props.SOEID, props.TSx, props.Sensor]);

    return (
        <g transform={`translate(0,${props.Row*props.Height})`}>
            {data.map((d, i) => <g transform={`translate(${i * props.Width / data.length},0)`}  key={props.SOEID + props.TSx + props.Sensor + d.TimeSlot}><Box Width={props.Width / data.length} Height={props.Height} Color={props.Colors.find(c => c.ID == d.Value)?.Color ?? 'white'} Point={d} SelectedPoint={props.SelectedPoint} SelectPoint={(sp) => props.SelectPoint(sp) }/></g>)}
        </g>
    );
}

const Box = (props: { Width: number, Height: number, Color: string, Point: SOEDataPoint,  SelectedPoint: SOEDataPoint, SelectPoint: (sp: SOEDataPoint) => void }) => {
    return (
            <g>
            <rect width={props.Width} height={props.Height} fill={props.Color} stroke={props.SelectedPoint == props.Point ? 'white' : null} strokeWidth={props.SelectedPoint == props.Point ? 5 : null} style={{cursor:'pointer'}} onClick={(evt) => props.SelectPoint(props.Point)} />
            {(props.Point.EventID == null || props.Point.EventID == 0) ?
                <g>
                    <line stroke='white' strokeWidth={2} x1={0} x2={props.Width} y1={0} y2={props.Height} />
                    <line stroke='white' strokeWidth={2} x1={0} x2={props.Width} y1={props.Height} y2={0} />
                </g>: null
            }
            </g>
    );
}

render(<NonLinearTimeline />, document.getElementById('bodyContainer'));