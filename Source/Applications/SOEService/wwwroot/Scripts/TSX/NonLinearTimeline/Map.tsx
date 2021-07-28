//******************************************************************************************************
//  LeafletMap.tsx - Gbtc
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
//  07/15/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';

import * as leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css'
import {MapContainer, TileLayer, GeoJSON, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';
import { symbolCircle, symbolWye, symbolDiamond, symbolSquare, symbolTriangle, symbolStar, symbolCross, symbol } from 'd3';
import { Color, MapMeter, SOEDataPoint,Image } from './nlt';
import { abort } from 'process';


interface Circuit { ID: number, Name: string, SystemID: number, GeoJSON: string, GeoJSONString: string }

const LeafletMap = (props: { SOEID: string, Colors: Color[], Meters: MapMeter[], Width: number, Height: number, SelectedPoint: SOEDataPoint }) => {
    const [conductors, setConductors] = React.useState<any>(null);

    React.useEffect(() => {
        if (props.SOEID == undefined) return;
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/Conductors/${props.SOEID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }) as JQuery.jqXHR<Circuit[]>;

        handle.done(d => {
            if (d.length == 0) return;
            else {
                let json = null;

                for (let circuit of d) {
                    if (json == null)
                        json = JSON.parse(circuit.GeoJSONString)
                    else
                        json.features = json.features.concat(JSON.parse(circuit.GeoJSONString).features)
                }

                setConductors(json);
            }
        })


        return () => {
            if (handle.abort != undefined) handle.abort();
        }
    }, [props.SOEID]);

    return (
        <MapContainer style={{ height: props.Height, width: props.Width, padding: 5, border: 'solid 1px gray' }} center={[35.0456,-85.3097] } zoom={13}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
            <ColorLegend Colors={props.Colors} />
            <Meters Meters={props.Meters} SelectedPoint={props.SelectedPoint } />
            {conductors !== null ? <GeoJSON data={conductors} style={(feature) => ({ color: feature.properties.COLOR, weight: feature.properties.WEIGHT, opacity: feature.properties.OPACITY  }) }/> : null}
            <ViewWindow SelectedPoint={props.SelectedPoint} />
        </MapContainer>
    );

}

const ColorLegend = (props: { Colors: Color[] }) =>  {
    if (props.Colors == null || props.Colors.length == 0) return null;

    return (
        <div className="leaflet-bottom leaflet-left">
            <div className='info color-legend leaflet-control' style={{
                textAlign: 'left', lineHeight: 18, color: '#555', padding: '6px 8px', font: '14px/16px Arial, Helvetica, sans-serif',
                background: 'rgb(255,255,255,0.8)', boxShadow: '0 0 15px rgb(0 0 0 / 20%)', borderRadius: 5, width: 130
            }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', width: 15, height: 15 }}>
                        <svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
                            <path fill='black' d={symbol().type(symbolCross).size(100)()} transform={`translate(10,10)` }/>
                        </svg>
                    </div>
                    <span style={{ position: 'relative', left: 20 }}>Source</span>
                </div>
                <div  style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', width: 15, height: 15}}>
                        <svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
                            <path fill='black' d={symbol().type(symbolDiamond).size(100)()} transform={`translate(10,10)`} />
                        </svg>
                    </div>
                    <span style={{ position: 'relative', left: 20 }}>Tie</span>
                </div>
                <div  style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', width: 15, height: 15 }}>
                        <svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
                            <path fill='black' d={symbol().type(symbolSquare).size(100)()} transform={`translate(10,10)`} />
                        </svg>
                    </div>
                    <span style={{ position: 'relative', left: 20 }}>Line PCR</span>
                </div>
                <div  style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', width: 15, height: 15 }}>
                        <svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
                            <path fill='black' d={symbol().type(symbolStar).size(100)()} transform={`translate(10,10)`} />
                        </svg>
                    </div>
                    <span style={{ position: 'relative', left: 20 }}>46 kV</span>
                </div>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', width: 15, height: 15 }}>
                        <svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
                            <path fill='black' d={symbol().type(symbolCircle).size(100)()} transform={`translate(10,10)`} />
                        </svg>
                    </div>
                    <span style={{ position: 'relative', left: 20 }}>Self Tie</span>
                </div>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', width: 15, height: 15 }}>
                        <svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
                            <path fill='black' d={symbol().type(symbolWye).size(100)()} transform={`translate(10,10)`} />
                        </svg>
                    </div>
                    <span style={{ position: 'relative', left: 20 }}>MOS</span>
                </div>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', width: 15, height: 15 }}>
                        <svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
                            <path fill='black' d={symbol().type(symbolTriangle).size(100)()} transform={`translate(10,10)`} />
                        </svg>
                    </div>
                    <span style={{ position: 'relative', left: 20 }}>Other</span>
                </div>

                {
                    props.Colors.map(color => (
                        <div key={color.Name} style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', width: 15, height: 15, backgroundColor: color.Color }}></div>
                            <span style={{ position: 'relative', left: 20 }}>{color.Name}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

interface MeasuredValue {
    Name: string, M1: number, M2:number, M3: number, Units: string
}
const ViewWindow = (props: { SelectedPoint: SOEDataPoint }) => {
    const [show, setShow] = React.useState<boolean>(false);
    const [measuredValues, setMeasuredValues] = React.useState<MeasuredValue[]>([]);
    const [images, setImages] = React.useState<Image[]>([]);

    React.useEffect(() => {
        if (props.SelectedPoint == null || props.SelectedPoint.EventID <= 0) return;

        setShow(true);

        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/MeasuredValues/${props.SelectedPoint.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }) as JQuery.jqXHR<MeasuredValue[]>;

        handle.done(d => {
            setMeasuredValues(d);
        })

        let handle2 = $.ajax({
            type: "GET",
            url: `${homePath}api/NonLinearTimeline/Images/${props.SelectedPoint.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }) as JQuery.jqXHR<Image[]>;

        handle2.done(d => {
            setImages(d);
        })



        return () => {
            if (handle.abort != undefined) handle.abort();
            if (handle2.abort != undefined) handle2.abort();

        }


    }, [props.SelectedPoint]);
    if (!show || props.SelectedPoint.EventID <= 0) return null;
    return (
        <div className="leaflet-bottom leaflet-right">
            <div className='info color-legend leaflet-control' style={{
                height: 475,
                position: 'relative',
                textAlign: 'left', lineHeight: 18, color: '#555', padding: '6px 8px', font: '14px/16px Arial, Helvetica, sans-serif',
                background: 'rgb(255,255,255,0.8)', boxShadow: '0 0 15px rgb(0 0 0 / 20%)', borderRadius: 5, width: 500
            }}>
                <button type="button" className="close" onClick={() => setShow(false)} style={{position: 'absolute', top: 5, right: 5}}>
                    <span>&times;</span>
                </button>
                <div>{props.SelectedPoint?.SensorName.split('.')[0]} / <a target='_blank' href={`${homePath}OpenSEE.cshtml?EventID=${props.SelectedPoint?.EventID}`}>{props.SelectedPoint?.EventID}</a> / {props.SelectedPoint?.Time}</div>

                <div style={{width: 300, position: 'absolute'}}>
                <table className='table' style={{ fontSize: 'smaller',marginBottom: 0 }}>
                    <thead>
                            <tr>
                                <th style={{padding: 5}}>Time Slot</th>
                                <th style={{padding: 5}}>mSec</th>
                                <th style={{padding: 5}}>Cycles</th>
                                <th style={{padding: 5}}>Seconds</th>
                            </tr>
                    </thead>
                    <tbody>
                            <tr>
                                <td style={{padding: 5}}>{props.SelectedPoint?.TimeSlot}</td>
                                <td style={{padding: 5}}>{props.SelectedPoint?.ElapsMS}</td>
                                <td style={{padding: 5}}>{props.SelectedPoint?.CycleNum}</td>
                                <td style={{padding: 5}}>{props.SelectedPoint?.ElapsSEC}</td>
                            </tr>
                    </tbody>
                </table>
                <table className='table' style={{fontSize: 'smaller'}}>
                    <thead>
                        <tr><th style={{padding: 5}}>Sensor</th><th style={{padding: 5}}>M1</th><th style={{padding: 5}}>M2</th><th style={{padding: 5}}>M3</th><th style={{padding: 5}}>Units</th></tr>
                    </thead>
                    <tbody>{
                        measuredValues.map((mv, i) => (
                            <tr key={props.SelectedPoint.EventID.toString() + i.toString() }>
                                <td style={{padding: 5}}>{mv?.Name}</td>
                                <td style={{padding: 5}}>{mv?.M1}</td>
                                <td style={{padding: 5}}>{mv?.M2}</td>
                                <td style={{padding: 5}}>{mv?.M3}</td>
                                <td style={{padding: 5}}>{mv?.Units}</td>
                            </tr>))
                    }
                        
                    </tbody>
                </table>
                </div>
                <div style={{ width: 150, position: 'absolute', left: 350 }}>
                    <table className='table'>
                        <thead><tr><th style={{ padding: 5 }}>Analysis Plots</th></tr></thead>
                        <tbody>
                            {images.map(image => <tr key={image.ID}><td style={{ padding: 5 }}><a href={`${homePath}Image.html?imageID=${image.ID}` } target='_blank'>{image.DisplayText }</a></td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Meters = (props: { Meters: MapMeter[], SelectedPoint: SOEDataPoint }) => {
    const map = useMap();
    const [meters, setMeters] = React.useState<JSX.Element[]>([]);
    React.useEffect(() => {
        if (props.Meters.length == 0) return;

        let m = props.Meters.map(meter => {
            return <MeterMarker key={meter.AssetKey+props.SelectedPoint?.SensorName} Meter={meter} SelectedPoint={props.SelectedPoint }/>
        })

        setMeters(m);
        let markers = props.Meters.map(meter => leaflet.marker([meter.Latitude, meter.Longitude]));
        let group = leaflet.featureGroup(markers);
        map.setMaxBounds(group.getBounds());
    }, [props.Meters, props.SelectedPoint])

    return <>{meters}</>;

}

const MeterMarker = (props: { Meter: MapMeter, SelectedPoint: SOEDataPoint }) => {
    if (props.Meter.AssetKey.split('-')[0] === props.Meter.AssetKey.split('-')[1]) {
        let svg = `<svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>${Shape(symbolCross,props.Meter.Color, props.SelectedPoint, props.Meter.AssetKey)}</svg>`;
        let iconUrl = 'data:image/svg+xml;utf8,' + svg;

        let icon = leaflet.icon({
            iconUrl: iconUrl,
            iconSize: [20, 20],
        });
        return <Marker position={[props.Meter.Latitude, props.Meter.Longitude]} icon={icon} key={props.Meter.AssetKey}><Popup><div>{props.Meter.AssetKey}</div><div>{ props.Meter.ColorText}</div></Popup></Marker>
    }
    else if (props.Meter.SourceAlternate === "none") {
        let svg = `<svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>${Shape(symbolSquare, props.Meter.Color, props.SelectedPoint, props.Meter.AssetKey)}</svg>`;
        let iconUrl = 'data:image/svg+xml;utf8,' + svg;

        let icon = leaflet.icon({
            iconUrl: iconUrl,
            iconSize: [20, 20],
        });
        return <Marker position={[props.Meter.Latitude, props.Meter.Longitude]} icon={icon} key={props.Meter.AssetKey}><Popup><div>{props.Meter.AssetKey}</div><div>{props.Meter.ColorText}</div></Popup></Marker>
    }
    else if (props.Meter.SourceAlternate === props.Meter.SourcePreferred) {
        let svg = `<svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>${Shape(symbolCircle, props.Meter.Color, props.SelectedPoint, props.Meter.AssetKey)}</svg>`;
        let iconUrl = 'data:image/svg+xml;utf8,' + svg;

        let icon = leaflet.icon({
            iconUrl: iconUrl,
            iconSize: [20, 20],
        });
        return <Marker position={[props.Meter.Latitude, props.Meter.Longitude]} icon={icon} key={props.Meter.AssetKey}><Popup><div>{props.Meter.AssetKey}</div><div>{props.Meter.ColorText}</div></Popup></Marker>
    }
    else if (props.Meter.SourceAlternate !== props.Meter.SourcePreferred) {
        let svg = `<svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>${Shape(symbolDiamond, props.Meter.Color, props.SelectedPoint, props.Meter.AssetKey)}</svg>`;
        let iconUrl = 'data:image/svg+xml;utf8,' + svg;

        let icon = leaflet.icon({
            iconUrl: iconUrl,
            iconSize: [20, 20],
        });
        return <Marker position={[props.Meter.Latitude, props.Meter.Longitude]} icon={icon} key={props.Meter.AssetKey}><Popup><div>{props.Meter.AssetKey}</div><div>{props.Meter.ColorText}</div></Popup></Marker>
    }
    else if (props.Meter.Voltage == 4.6) {
        let svg = `<svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>${Shape(symbolStar, props.Meter.Color, props.SelectedPoint, props.Meter.AssetKey)}</svg>`;
        let iconUrl = 'data:image/svg+xml;utf8,' + svg;

        let icon = leaflet.icon({
            iconUrl: iconUrl,
            iconSize: [20, 20],
        });
        return <Marker position={[props.Meter.Latitude, props.Meter.Longitude]} icon={icon} key={props.Meter.AssetKey}><Popup><div>{props.Meter.AssetKey}</div><div>{props.Meter.ColorText}</div></Popup></Marker>
    }
    else {
        let svg = `<svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>${Shape(symbolTriangle, props.Meter.Color, props.SelectedPoint, props.Meter.AssetKey)}</svg>`;
        let iconUrl = 'data:image/svg+xml;utf8,' + svg;

        let icon = leaflet.icon({
            iconUrl: iconUrl,
            iconSize: [20, 20],
        });
        return <Marker position={[props.Meter.Latitude, props.Meter.Longitude]} icon={icon} key={props.Meter.AssetKey}><Popup><div>{props.Meter.AssetKey}</div><div>{props.Meter.ColorText}</div></Popup></Marker>
    }
};

const Shape = (shape: d3.SymbolType, fill: string, selectedPoint: SOEDataPoint, meterName: string) => `<path fill='${fill}' ${selectedPoint?.SensorName.indexOf(meterName) >= 0 ? 'stroke="black" stroke-width="3"' : ''} transform = 'translate(10,10)' d = '${symbol().type(shape).size(150)()}' />`

export default LeafletMap;