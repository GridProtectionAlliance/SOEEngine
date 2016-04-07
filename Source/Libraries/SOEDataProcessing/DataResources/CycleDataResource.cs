//******************************************************************************************************
//  CycleDataResource.cs - Gbtc
//
//  Copyright © 2015, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  02/20/2015 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using SOEDataProcessing.DataAnalysis;
using SOEDataProcessing.Database;
using SOEDataProcessing.DataSets;
using log4net;

namespace SOEDataProcessing.DataResources
{
    public class CycleDataResource : DataResourceBase<MeterDataSet>
    {
        #region [ Members ]

        // Fields
        private DbAdapterContainer m_dbAdapterContainer;

        private double m_systemFrequency;
        private List<DataGroup> m_dataGroups;
        private List<VIDataGroup> m_viDataGroups;
        private List<VICycleDataGroup> m_viCycleDataGroups;

        #endregion

        #region [ Constructors ]

        private CycleDataResource(DbAdapterContainer dbAdapterContainer)
        {
            m_dbAdapterContainer = dbAdapterContainer;
        }

        #endregion

        #region [ Properties ]

        [Setting]
        public double SystemFrequency
        {
            get
            {
                return m_systemFrequency;
            }
            set
            {
                m_systemFrequency = value;
            }
        }

        public List<DataGroup> DataGroups
        {
            get
            {
                return m_dataGroups;
            }
        }

        public List<VIDataGroup> VIDataGroups
        {
            get
            {
                return m_viDataGroups;
            }
        }

        public List<VICycleDataGroup> VICycleDataGroups
        {
            get
            {
                return m_viCycleDataGroups;
            }
        }

        #endregion

        #region [ Methods ]

        public override void Initialize(MeterDataSet meterDataSet)
        {
            MeterInfoDataContext meterInfo = m_dbAdapterContainer.GetAdapter<MeterInfoDataContext>();
            DataGroupsResource dataGroupsResource = meterDataSet.GetResource<DataGroupsResource>();
            VIDataGroup viDataGroup;

            m_dataGroups = new List<DataGroup>();
            m_viDataGroups = new List<VIDataGroup>();
            m_viCycleDataGroups = new List<VICycleDataGroup>();

            Log.Info("Identifying events and calculating cycle data...");

            foreach (DataGroup dataGroup in dataGroupsResource.DataGroups)
            {
                if (dataGroup.Classification != DataClassification.Event)
                    continue;

                viDataGroup = new VIDataGroup(dataGroup);

                if (viDataGroup.DefinedVoltages != 3 || viDataGroup.DefinedCurrents < 3)
                    continue;

                viDataGroup.AddMissingCurrentChannel(meterInfo);

                m_dataGroups.Add(dataGroup);
                m_viDataGroups.Add(viDataGroup);
                m_viCycleDataGroups.Add(ToVICycleDataGroup(dataGroup, m_systemFrequency));
            }

            Log.Info($"Cycle data calculated for {m_dataGroups.Count} events.");
        }

        public VICycleDataGroup ToVICycleDataGroup(DataGroup dataGroup, double frequency)
        {
            string[] viMeasurementTypes = { "Voltage", "Current" };
            string[] instantaneousSeriesTypes = { "Values", "Instantaneous" };

            List<DataGroup> cycleDataGroups = dataGroup.DataSeries
                .Where(dataSeries => viMeasurementTypes.Contains(dataSeries.SeriesInfo.Channel.MeasurementType.Name))
                .Where(dataSeries => dataSeries.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous")
                .Where(dataSeries => instantaneousSeriesTypes.Contains(dataSeries.SeriesInfo.SeriesType.Name))
                .Select(dataSeries => Transform.ToCycleDataGroup(dataSeries, m_systemFrequency))
                .ToList();

            foreach (DataGroup cycleDataGroup in cycleDataGroups)
            {
                cycleDataGroup[0].SeriesInfo = GetSeriesInfo(cycleDataGroup[0].SeriesInfo, "RMS", "RMS");
                cycleDataGroup[1].SeriesInfo = GetSeriesInfo(cycleDataGroup[1].SeriesInfo, "AngleFund", "Angle");
                cycleDataGroup[2].SeriesInfo = GetSeriesInfo(cycleDataGroup[2].SeriesInfo, "WaveAmplitude", "Wave Amplitude");
                cycleDataGroup[3].SeriesInfo = GetSeriesInfo(cycleDataGroup[3].SeriesInfo, "WaveError", "Wave Error");
            }

            return new VICycleDataGroup(cycleDataGroups
                .Select(cycleDataGroup => new CycleDataGroup(cycleDataGroup))
                .ToList());
        }

        private Series GetSeriesInfo(Series timeDomainSeries, string channelDesignation, string measurementCharacteristicName)
        {
            string channelName;
            string measurementTypeName;
            string phaseName;
            string seriesTypeName;

            ChannelKey channelKey;
            SeriesKey seriesKey;

            channelName = string.Concat(timeDomainSeries.Channel.Name, " ", channelDesignation);
            measurementTypeName = timeDomainSeries.Channel.MeasurementType.Name;
            phaseName = timeDomainSeries.Channel.Phase.Name;
            seriesTypeName = timeDomainSeries.SeriesType.Name;

            channelKey = new ChannelKey(timeDomainSeries.Channel.LineID, 0, 0, channelName, measurementTypeName, measurementCharacteristicName, phaseName);
            seriesKey = new SeriesKey(channelKey, seriesTypeName);

            return GetSeriesInfo(timeDomainSeries.Channel.Meter, channelKey, seriesKey);
        }

        private Series GetSeriesInfo(Meter meter, ChannelKey channelKey, SeriesKey seriesKey)
        {
            MeterInfoDataContext meterInfo = m_dbAdapterContainer.GetAdapter<MeterInfoDataContext>();

            DataContextLookup<ChannelKey, Channel> channelLookup;
            DataContextLookup<SeriesKey, Series> seriesLookup;
            DataContextLookup<string, MeasurementType> measurementTypeLookup;
            DataContextLookup<string, MeasurementCharacteristic> measurementCharacteristicLookup;
            DataContextLookup<string, Phase> phaseLookup;
            DataContextLookup<string, SeriesType> seriesTypeLookup;

            channelLookup = new DataContextLookup<ChannelKey, Channel>(meterInfo, channel => new ChannelKey(channel))
                .WithFilterExpression(channel => channel.MeterID == meter.ID)
                .WithFilterExpression(channel => channel.LineID == channelKey.LineID);

            seriesLookup = new DataContextLookup<SeriesKey, Series>(meterInfo, series => new SeriesKey(series))
                .WithFilterExpression(series => series.Channel.Meter.ID == meter.ID)
                .WithFilterExpression(series => series.Channel.Line.ID == channelKey.LineID);

            measurementTypeLookup = new DataContextLookup<string, MeasurementType>(meterInfo, measurementType => measurementType.Name);
            measurementCharacteristicLookup = new DataContextLookup<string, MeasurementCharacteristic>(meterInfo, measurementCharacteristic => measurementCharacteristic.Name);
            phaseLookup = new DataContextLookup<string, Phase>(meterInfo, phase => phase.Name);
            seriesTypeLookup = new DataContextLookup<string, SeriesType>(meterInfo, seriesType => seriesType.Name);

            return seriesLookup.GetOrAdd(seriesKey, key =>
            {
                SeriesType seriesType = seriesTypeLookup.GetOrAdd(seriesKey.SeriesType, name => new SeriesType() { Name = name, Description = name });

                Channel channel = channelLookup.GetOrAdd(channelKey, chKey =>
                {
                    MeasurementType measurementType = measurementTypeLookup.GetOrAdd(channelKey.MeasurementType, name => new MeasurementType() { Name = name, Description = name });
                    MeasurementCharacteristic measurementCharacteristic = measurementCharacteristicLookup.GetOrAdd(channelKey.MeasurementCharacteristic, name => new MeasurementCharacteristic() { Name = name, Description = name });
                    Phase phase = phaseLookup.GetOrAdd(channelKey.Phase, name => new Phase() { Name = name, Description = name });

                    return new Channel()
                    {
                        Meter = meter,
                        Line = meterInfo.Lines.Single(line => line.ID == channelKey.LineID),
                        MeasurementType = measurementType,
                        MeasurementCharacteristic = measurementCharacteristic,
                        Phase = phase,
                        Name = string.Concat(measurementType.Name, " ", phase.Name),
                        SamplesPerHour = 0,
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

        #region [ Static ]

        // Static Fields
        private static readonly ILog Log = LogManager.GetLogger(typeof(CycleDataResource));

        // Static Methods
        public static CycleDataResource GetResource(MeterDataSet meterDataSet, DbAdapterContainer dbAdapterContainer)
        {
            return meterDataSet.GetResource(() => new CycleDataResource(dbAdapterContainer));
        }

        #endregion
    }
}
