//******************************************************************************************************
//  VIDataGroup.cs - Gbtc
//
//  Copyright © 2014, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the Eclipse Public License -v 1.0 (the "License"); you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://www.opensource.org/licenses/eclipse-1.0.php
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  08/29/2014 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Linq;
using FaultData.Database;

namespace FaultData.DataAnalysis
{
    public class VIDataGroup
    {
        #region [ Members ]

        // Fields
        private int m_vaIndex;
        private int m_vbIndex;
        private int m_vcIndex;
        private int m_iaIndex;
        private int m_ibIndex;
        private int m_icIndex;
        private int m_irIndex;

        private DataGroup m_dataGroup;

        #endregion

        #region [ Constructors ]

        public VIDataGroup(DataGroup dataGroup)
        {
            string[] instantaneousSeriesTypes = { "Values", "Instantaneous" };

            // Initialize each of
            // the indexes to -1
            m_vaIndex = -1;
            m_vbIndex = -1;
            m_vcIndex = -1;
            m_iaIndex = -1;
            m_ibIndex = -1;
            m_icIndex = -1;
            m_irIndex = -1;

            // Initialize the data group
            m_dataGroup = dataGroup;

            for (int i = 0; i < dataGroup.DataSeries.Count; i++)
            {
                // If the data group is not instantaneous, do not use it in the VIDataGroup
                if (dataGroup[i].SeriesInfo.Channel.MeasurementCharacteristic.Name != "Instantaneous")
                    continue;

                // If the data group is not instantaneous, do not use it in the VIDataGroup
                if (!instantaneousSeriesTypes.Contains(dataGroup[i].SeriesInfo.SeriesType.Name))
                    continue;

                // Assign the proper indexes for the seven VIDataGroup channels by checking the
                // measurement type and phase. Channels which are not measured load-side take precedence
                if (dataGroup[i].SeriesInfo.Channel.MeasurementType.Name == "Voltage")
                {
                    if (dataGroup[i].SeriesInfo.Channel.Phase.Name == "AN")
                        m_vaIndex = (m_vaIndex >= 0 && dataGroup[i].SeriesInfo.Channel.LoadSide != 0) ? m_vaIndex : i;
                    else if (dataGroup[i].SeriesInfo.Channel.Phase.Name == "BN")
                        m_vbIndex = (m_vbIndex >= 0 && dataGroup[i].SeriesInfo.Channel.LoadSide != 0) ? m_vbIndex : i;
                    else if (dataGroup[i].SeriesInfo.Channel.Phase.Name == "CN")
                        m_vcIndex = (m_vcIndex >= 0 && dataGroup[i].SeriesInfo.Channel.LoadSide != 0) ? m_vcIndex : i;
                }
                else if (dataGroup[i].SeriesInfo.Channel.MeasurementType.Name == "Current")
                {
                    if (dataGroup[i].SeriesInfo.Channel.Phase.Name == "AN")
                        m_iaIndex = (m_iaIndex >= 0 && dataGroup[i].SeriesInfo.Channel.LoadSide != 0) ? m_iaIndex : i;
                    else if (dataGroup[i].SeriesInfo.Channel.Phase.Name == "BN")
                        m_ibIndex = (m_ibIndex >= 0 && dataGroup[i].SeriesInfo.Channel.LoadSide != 0) ? m_ibIndex : i;
                    else if (dataGroup[i].SeriesInfo.Channel.Phase.Name == "CN")
                        m_icIndex = (m_icIndex >= 0 && dataGroup[i].SeriesInfo.Channel.LoadSide != 0) ? m_icIndex : i;
                    else if (dataGroup[i].SeriesInfo.Channel.Phase.Name == "RES")
                        m_irIndex = (m_irIndex >= 0 && dataGroup[i].SeriesInfo.Channel.LoadSide != 0) ? m_irIndex : i;
                }
            }
        }

        private VIDataGroup()
        {
        }

        #endregion

        #region [ Properties ]

        public DataSeries VA
        {
            get
            {
                return (m_vaIndex >= 0) ? m_dataGroup[m_vaIndex] : null;
            }
        }

        public DataSeries VB
        {
            get
            {
                return (m_vbIndex >= 0) ? m_dataGroup[m_vbIndex] : null;
            }
        }

        public DataSeries VC
        {
            get
            {
                return (m_vcIndex >= 0) ? m_dataGroup[m_vcIndex] : null;
            }
        }

        public DataSeries IA
        {
            get
            {
                return (m_iaIndex >= 0) ? m_dataGroup[m_iaIndex] : null;
            }
        }

        public DataSeries IB
        {
            get
            {
                return (m_ibIndex >= 0) ? m_dataGroup[m_ibIndex] : null;
            }
        }

        public DataSeries IC
        {
            get
            {
                return (m_icIndex >= 0) ? m_dataGroup[m_icIndex] : null;
            }
        }

        public DataSeries IR
        {
            get
            {
                return (m_irIndex >= 0) ? m_dataGroup[m_irIndex] : null;
            }
        }

        public int DefinedVoltages
        {
            get
            {
                return VoltageIndexes.Count(index => index >= 0);
            }
        }

        public int DefinedCurrents
        {
            get
            {
                return CurrentIndexes.Count(index => index >= 0);
            }
        }

        public bool AllVIChannelsDefined
        {
            get
            {
                return VoltageIndexes
                    .Concat(CurrentIndexes)
                    .All(index => index >= 0);
            }
        }

        private int[] VoltageIndexes
        {
            get
            {
                return new int[] { m_vaIndex, m_vbIndex, m_vcIndex };
            }
        }

        private int[] CurrentIndexes
        {
            get
            {
                return new int[] { m_iaIndex, m_ibIndex, m_icIndex, m_irIndex };
            }
        }

        #endregion

        #region [ Methods ]

        /// <summary>
        /// Given three of the four current channels, calculates the
        /// missing channel based on the relationship IR = IA + IB + IC.
        /// </summary>
        /// <param name="meterInfo">Data context for accessing configuration tables in the database.</param>
        public void AddMissingCurrentChannel(MeterInfoDataContext meterInfo)
        {
            Meter meter;
            DataSeries missingSeries;

            // If the data group does not have exactly 3 channels,
            // then there is no missing channel or there is not
            // enough data to calculate the missing channel
            if (DefinedCurrents != 3)
                return;

            // Get the meter associated with the channels in this data group
            meter = (IA ?? IB).SeriesInfo.Channel.Meter;

            if (m_iaIndex == -1)
            {
                // Calculate IA = IR - IB - IC
                missingSeries = IR.Add(IB.Negate()).Add(IC.Negate());
                missingSeries.SeriesInfo = GetSeriesInfo(meterInfo, meter, m_dataGroup, "Current", "AN");
                m_iaIndex = m_dataGroup.DataSeries.Count;
                m_dataGroup.Add(missingSeries);
            }
            else if (m_ibIndex == -1)
            {
                // Calculate IB = IR - IA - IC
                missingSeries = IR.Add(IA.Negate()).Add(IC.Negate());
                missingSeries.SeriesInfo = GetSeriesInfo(meterInfo, meter, m_dataGroup, "Current", "BN");
                m_iaIndex = m_dataGroup.DataSeries.Count;
                m_dataGroup.Add(missingSeries);
            }
            else if (m_icIndex == -1)
            {
                // Calculate IC = IR - IA - IB
                missingSeries = IR.Add(IA.Negate()).Add(IB.Negate());
                missingSeries.SeriesInfo = GetSeriesInfo(meterInfo, meter, m_dataGroup, "Current", "CN");
                m_iaIndex = m_dataGroup.DataSeries.Count;
                m_dataGroup.Add(missingSeries);
            }
            else
            {
                // Calculate IR = IA + IB + IC
                missingSeries = IA.Add(IB).Add(IC);
                missingSeries.SeriesInfo = GetSeriesInfo(meterInfo, meter, m_dataGroup, "Current", "RES");
                m_iaIndex = m_dataGroup.DataSeries.Count;
                m_dataGroup.Add(missingSeries);
            }
        }

        public DataGroup ToDataGroup()
        {
            return new DataGroup(m_dataGroup.DataSeries);
        }

        public VIDataGroup ToSubGroup(int startIndex, int endIndex)
        {
            VIDataGroup subGroup = new VIDataGroup();

            subGroup.m_vaIndex = m_vaIndex;
            subGroup.m_vbIndex = m_vbIndex;
            subGroup.m_vcIndex = m_vcIndex;
            subGroup.m_iaIndex = m_iaIndex;
            subGroup.m_ibIndex = m_ibIndex;
            subGroup.m_icIndex = m_icIndex;
            subGroup.m_irIndex = m_irIndex;

            subGroup.m_dataGroup = m_dataGroup.ToSubGroup(startIndex, endIndex);

            return subGroup;
        }

        #endregion

        #region [ Static ]

        // Static Methods
        private static Series GetSeriesInfo(MeterInfoDataContext meterInfo, Meter meter, DataGroup dataGroup, string measurementTypeName, string phaseName)
        {
            int lineID;
            string remoteMeterName;
            string measurementCharacteristicName;
            string seriesTypeName;

            char typeDesignation;
            char phaseDesignation;
            string channelName;

            DataContextLookup<ChannelKey, Channel> channelLookup;
            DataContextLookup<SeriesKey, Series> seriesLookup;
            DataContextLookup<string, MeasurementType> measurementTypeLookup;
            DataContextLookup<string, MeasurementCharacteristic> measurementCharacteristicLookup;
            DataContextLookup<string, Phase> phaseLookup;
            DataContextLookup<string, SeriesType> seriesTypeLookup;

            ChannelKey channelKey;
            SeriesKey seriesKey;

            lineID = dataGroup.Line.ID;
            remoteMeterName = GetRemoteMeterName(meter, dataGroup.Line);
            measurementCharacteristicName = "Instantaneous";
            seriesTypeName = "Values";

            typeDesignation = (measurementTypeName == "Current") ? 'I' : measurementTypeName[0];
            phaseDesignation = (phaseName == "RES") ? 'R' : phaseName[0];
            channelName = string.Concat(remoteMeterName, " ", typeDesignation, phaseDesignation).Trim();

            channelLookup = new DataContextLookup<ChannelKey, Channel>(meterInfo, channel => new ChannelKey(channel))
                .WithFilterExpression(channel => channel.MeterID == meter.ID)
                .WithFilterExpression(channel => channel.LineID == dataGroup.Line.ID);

            seriesLookup = new DataContextLookup<SeriesKey, Series>(meterInfo, series => new SeriesKey(series))
                .WithFilterExpression(series => series.Channel.Meter.ID == meter.ID)
                .WithFilterExpression(series => series.Channel.Line.ID == dataGroup.Line.ID);

            measurementTypeLookup = new DataContextLookup<string, MeasurementType>(meterInfo, measurementType => measurementType.Name);
            measurementCharacteristicLookup = new DataContextLookup<string, MeasurementCharacteristic>(meterInfo, measurementCharacteristic => measurementCharacteristic.Name);
            phaseLookup = new DataContextLookup<string, Phase>(meterInfo, phase => phase.Name);
            seriesTypeLookup = new DataContextLookup<string, SeriesType>(meterInfo, seriesType => seriesType.Name);

            channelKey = new ChannelKey(lineID, 0, 0, channelName, measurementTypeName, measurementCharacteristicName, phaseName);
            seriesKey = new SeriesKey(channelKey, seriesTypeName);

            return seriesLookup.GetOrAdd(seriesKey, key =>
            {
                SeriesType seriesType = seriesTypeLookup.GetOrAdd(seriesTypeName, name => new SeriesType() { Name = name, Description = name });

                Channel channel = channelLookup.GetOrAdd(channelKey, chKey =>
                {
                    MeasurementType measurementType = measurementTypeLookup.GetOrAdd(measurementTypeName, name => new MeasurementType() { Name = name, Description = name });
                    MeasurementCharacteristic measurementCharacteristic = measurementCharacteristicLookup.GetOrAdd(measurementCharacteristicName, name => new MeasurementCharacteristic() { Name = name, Description = name });
                    Phase phase = phaseLookup.GetOrAdd(phaseName, name => new Phase() { Name = name, Description = name });

                    return new Channel()
                    {
                        Meter = meter,
                        Line = dataGroup.Line,
                        MeasurementType = measurementType,
                        MeasurementCharacteristic = measurementCharacteristic,
                        Phase = phase,
                        Name = string.Concat(measurementType.Name, " ", phase.Name),
                        SamplesPerHour = dataGroup.SamplesPerHour,
                        PerUnitValue = 0,
                        HarmonicGroup = 0,
                        Description = string.Concat(measurementCharacteristic.Name, " ", measurementType.Name, " ", phase.Name),
                        Enabled = 1
                    };
                });

                return new Series()
                {
                    SeriesType = seriesType,
                    Channel = channel,
                    SourceIndexes = string.Empty
                };
            });
        }

        private static bool IsInstantaneous(DataSeries dataSeries)
        {
            string characteristicName = dataSeries.SeriesInfo.Channel.MeasurementCharacteristic.Name;
            string seriesTypeName = dataSeries.SeriesInfo.SeriesType.Name;

            return (characteristicName == "Instantaneous") &&
                   (seriesTypeName == "Values" || seriesTypeName == "Instantaneous");
        }

        private static string GetRemoteMeterName(Meter meter, Line line)
        {
            List<Meter> remoteMeters = line.MeterLocationLines
                .SelectMany(meterLocationLine => meterLocationLine.MeterLocation.Meters)
                .Where(m => m.ID != meter.ID)
                .ToList();

            if (remoteMeters.Count == 1)
                return remoteMeters.Single().Name;

            return null;
        }

        #endregion
    }
}
