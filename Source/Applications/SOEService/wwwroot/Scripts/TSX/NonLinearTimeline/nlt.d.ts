//******************************************************************************************************
//  NonLinearTimeline.d.tsx - Gbtc
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
//  07/19/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

export interface SOEDataPoint { SensorName: string, EventID: number, TimeSlot: number, Value: number, ElapsMS: number, ElapsSEC: number, CycleNum: number, TimeGap: number,Time: string }
export interface Color { ID: number, Color: string, Name: string }
export interface MapMeter { AssetKey: string, Latitude: number, Longitude: number, SourceAlternate: string, SourcePreferred: string, Voltage: number, Color: string, ColorText: string }
export interface Image { ID: number, EventID: number, Url: string, DisplayText: string }