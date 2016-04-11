//******************************************************************************************************
//  CycleDataGroup.cs - Gbtc
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
using System.Linq;
using SOEDataProcessing.Database;

namespace SOEDataProcessing.DataAnalysis
{
    public class CycleDataGroup
    {
        #region [ Members ]

        // Fields
        private DataGroup m_dataGroup;

        private int m_rmsIndex;
        private int m_phaseIndex;
        private int m_amplitudeIndex;
        private int m_errorIndex;

        #endregion

        #region [ Constructors ]

        public CycleDataGroup(DataGroup dataGroup)
        {
            string[] instantaneousSeriesTypes = { "Values", "Instantaneous" };

            m_rmsIndex = -1;
            m_phaseIndex = -1;
            m_amplitudeIndex = -1;
            m_errorIndex = -1;
            m_dataGroup = new DataGroup(dataGroup.DataSeries);

            for (int i = 0; i < dataGroup.DataSeries.Count; i++)
            {
                if (!instantaneousSeriesTypes.Contains(dataGroup[i].SeriesInfo.SeriesType.Name))
                    continue;

                if (dataGroup[i].SeriesInfo.Channel.MeasurementCharacteristic.Name == "RMS")
                    m_rmsIndex = i;
                else if (dataGroup[i].SeriesInfo.Channel.MeasurementCharacteristic.Name == "AngleFund")
                    m_phaseIndex = i;
                else if (dataGroup[i].SeriesInfo.Channel.MeasurementCharacteristic.Name == "WaveFitAmplitude")
                    m_amplitudeIndex = i;
                else if (dataGroup[i].SeriesInfo.Channel.MeasurementCharacteristic.Name == "WaveFitError")
                    m_errorIndex = i;
            }

            if (new int[] { m_rmsIndex, m_phaseIndex, m_amplitudeIndex, m_errorIndex }.Any(i => i < 0))
                throw new InvalidOperationException("Cannot create CycleDataGroup from an incomplete set of channels");
        }

        #endregion

        #region [ Properties ]

        public DataSeries RMS
        {
            get
            {
                return m_dataGroup[m_rmsIndex];
            }
        }

        public DataSeries Phase
        {
            get
            {
                return m_dataGroup[m_phaseIndex];
            }
        }

        public DataSeries Peak
        {
            get
            {
                return m_dataGroup[m_amplitudeIndex];
            }
        }

        public DataSeries Error
        {
            get
            {
                return m_dataGroup[m_errorIndex];
            }
        }

        #endregion

        #region [ Methods ]

        public DataGroup ToDataGroup()
        {
            return new DataGroup(m_dataGroup.DataSeries);
        }

        public CycleDataGroup ToSubGroup(int startIndex, int endIndex)
        {
            return new CycleDataGroup(m_dataGroup.ToSubGroup(startIndex, endIndex));
        }

        #endregion

        #region [ Static ]

        // Static Methods
        public static Series GetSeriesInfo(MeterInfoDataContext meterInfo, Series timeDomainSeries, string channelDesignation, string measurementCharacteristicName)
        {
            int meterID;
            int lineID;

            string channelName;
            string measurementTypeName;
            string phaseName;
            string seriesTypeName;

            DataContextLookup<ChannelKey, Channel> channelLookup;
            DataContextLookup<SeriesKey, Series> seriesLookup;
            DataContextLookup<string, MeasurementType> measurementTypeLookup;
            DataContextLookup<string, MeasurementCharacteristic> measurementCharacteristicLookup;
            DataContextLookup<string, Phase> phaseLookup;
            DataContextLookup<string, SeriesType> seriesTypeLookup;

            ChannelKey channelKey;
            SeriesKey seriesKey;

            meterID = timeDomainSeries.Channel.MeterID;
            lineID = timeDomainSeries.Channel.LineID;

            channelName = string.Concat(timeDomainSeries.Channel.Name, " ", channelDesignation);
            measurementTypeName = timeDomainSeries.Channel.MeasurementType.Name;
            phaseName = timeDomainSeries.Channel.Phase.Name;
            seriesTypeName = timeDomainSeries.SeriesType.Name;

            channelLookup = new DataContextLookup<ChannelKey, Channel>(meterInfo, channel => new ChannelKey(channel))
                .WithFilterExpression(channel => channel.MeterID == meterID)
                .WithFilterExpression(channel => channel.LineID == lineID);

            seriesLookup = new DataContextLookup<SeriesKey, Series>(meterInfo, series => new SeriesKey(series))
                .WithFilterExpression(series => series.Channel.Meter.ID == meterID)
                .WithFilterExpression(series => series.Channel.Line.ID == lineID);

            measurementTypeLookup = new DataContextLookup<string, MeasurementType>(meterInfo, measurementType => measurementType.Name);
            measurementCharacteristicLookup = new DataContextLookup<string, MeasurementCharacteristic>(meterInfo, measurementCharacteristic => measurementCharacteristic.Name);
            phaseLookup = new DataContextLookup<string, Phase>(meterInfo, phase => phase.Name);
            seriesTypeLookup = new DataContextLookup<string, SeriesType>(meterInfo, seriesType => seriesType.Name);

            channelKey = new ChannelKey(lineID, 0, channelName, measurementTypeName, measurementCharacteristicName, phaseName);
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
                        Meter = timeDomainSeries.Channel.Meter,
                        Line = timeDomainSeries.Channel.Line,
                        MeasurementType = measurementType,
                        MeasurementCharacteristic = measurementCharacteristic,
                        Phase = phase,
                        Name = string.Concat(measurementType.Name, " ", phase.Name),
                        SamplesPerHour = timeDomainSeries.Channel.SamplesPerHour,
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

        #endregion
    }
}
