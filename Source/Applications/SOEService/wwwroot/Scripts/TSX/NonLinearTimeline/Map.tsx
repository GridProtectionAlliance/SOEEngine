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
import {MapContainer, TileLayer, SVGOverlay, AttributionControl, Marker, useMap, useMapEvents, Popup } from 'react-leaflet';

interface Color { ID: number, Color: string, Name: string }
interface MapMeter { AssetKey: string, Latitude: number, Longitude: number, SourceAlternate: string, SourcePrefered: string, Voltage: number, Color: string }

const LeafletMap = (props: { Colors: Color[], Meters: MapMeter[], Width: number, Height: number }) => {
    return (
        <MapContainer style={{ height: props.Height, width: props.Width, padding: 5, border: 'solid 1px gray' }} center={[35.0456,-85.3097] } zoom={13}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
            <ColorLegend Colors={props.Colors} />
            <Meters Meters={props.Meters } />
        </MapContainer>
    );

}

const ColorLegend = (props: { Colors: Color[] }) => React.useMemo(() => {
    if (props.Colors == null || props.Colors.length == 0) return null;

    return (
        <div className="leaflet-bottom leaflet-left">
            <div className='info color-legend leaflet-control' style={{
                textAlign: 'left', lineHeight: 18, color: '#555', padding: '6px 8px', font: '14px/16px Arial, Helvetica, sans-serif',
                background: 'rgb(255,255,255,0.8)', boxShadow: '0 0 15px rgb(0 0 0 / 20%)', borderRadius: 5, width: 130
            }}>
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
}, [props.Colors]);

const Meters = (props: { Meters: MapMeter[] }) => {
    const map = useMap();
    const [meters, setMeters] = React.useState<JSX.Element[]>([]);
    React.useEffect(() => {
        if (props.Meters.length == 0) return;

        let m = props.Meters.map(meter => {
            let svg = `<svg width="20" height="20" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>${MeterMarker(meter)}</svg>`;
            let iconUrl = 'data:image/svg+xml;utf8,' + svg;

            let icon = leaflet.icon({
                iconUrl: iconUrl,
                iconSize: [20, 20],
            });
            return <Marker position={[meter.Latitude, meter.Longitude]} icon={icon} key={meter.AssetKey}><Popup>{meter.AssetKey}</Popup></Marker>
        })

        setMeters(m);
        let markers = props.Meters.map(meter => leaflet.marker([meter.Latitude, meter.Longitude]));
        let group = leaflet.featureGroup(markers);
        map.setMaxBounds(group.getBounds());
    }, [props.Meters])

    return <>{meters}</>;

}
const MeterMarker = (meter: MapMeter) => {
    if (meter.AssetKey.split('-')[0] === meter.AssetKey.split('-')[1]) return Hexagon(meter.Color);
    else if (meter.SourceAlternate === "none") return Square(meter.Color);
    else if (meter.SourceAlternate !== meter.SourcePrefered) return Circle(meter.Color);
    else if (meter.SourceAlternate == meter.SourcePrefered) return Triangle(meter.Color);
    else if (meter.Voltage == 4.6) return Octagon(meter.Color);
    return null;
};

const Hexagon = (fill: string) => `<polygon fill='${fill}' points="20,10 15,19 5,19 0,10 5,1 15,1"></polygon>`;
const Square = (fill: string) => `<rect fill='${fill}' width="20" height="20"></rect>`;
const Circle = (fill: string) => `<circle fill='${fill}' r="20" cx="10" cy="10"></circle>`;
const Triangle = (fill: string) => `<polygon fill='${fill}' points="12,3 5,20 20,20" ></polygon>`
const Octagon = (fill: string) => `<polygon  fill='${fill}' points="7 2, 15 2, 20 7, 20 15, 15 20, 7 20, 2 15, 2 7"></polygon>`;

export default LeafletMap;