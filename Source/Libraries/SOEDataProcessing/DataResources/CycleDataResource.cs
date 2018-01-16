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

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using SOEDataProcessing.DataAnalysis;
using SOEDataProcessing.DataSets;
using log4net;
using SOE.Model;
using GSF.Data;
using GSF.Data.Model;

namespace SOEDataProcessing.DataResources
{
    public class CycleDataResource : DataResourceBase<MeterDataSet>
    {
        #region [ Members ]

        // Fields
        private double m_systemFrequency;
        private List<DataGroup> m_dataGroups;
        private List<VIDataGroup> m_viDataGroups;
        private List<VICycleDataGroup> m_viCycleDataGroups;

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
            DataGroupsResource dataGroupsResource = meterDataSet.GetResource<DataGroupsResource>();
            VIDataGroup viDataGroup;

            m_dataGroups = new List<DataGroup>();
            m_viDataGroups = new List<VIDataGroup>();
            m_viCycleDataGroups = new List<VICycleDataGroup>();

            Log.Info("Identifying events and calculating cycle data...");

            foreach (DataGroup dataGroup in dataGroupsResource.DataGroups)
            {
                double samplesPerCycle;

                if (dataGroup.Classification != DataClassification.Event)
                    continue;

                samplesPerCycle = Math.Round(dataGroup.SamplesPerSecond / m_systemFrequency);

                if (dataGroup.Samples < samplesPerCycle)
                    continue;

                viDataGroup = new VIDataGroup(dataGroup);

                if (viDataGroup.DefinedVoltages != 3 || viDataGroup.DefinedCurrents < 3)
                    continue;

                dataGroup.Add(viDataGroup.CalculateMissingCurrentChannel());

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
                cycleDataGroup[1].SeriesInfo = GetSeriesInfo(cycleDataGroup[1].SeriesInfo, "Angle", "AngleFund");
                cycleDataGroup[2].SeriesInfo = GetSeriesInfo(cycleDataGroup[2].SeriesInfo, "Wave Amplitude", "WaveAmplitude");
                cycleDataGroup[3].SeriesInfo = GetSeriesInfo(cycleDataGroup[3].SeriesInfo, "Wave Error", "WaveError");
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

            channelKey = new ChannelKey(timeDomainSeries.Channel.LineID, 0, channelName, measurementTypeName, measurementCharacteristicName, phaseName);
            seriesKey = new SeriesKey(channelKey, seriesTypeName);

            return GetSeriesInfo(timeDomainSeries.Channel.Meter, channelKey, seriesKey);
        }

        private Series GetSeriesInfo(Meter meter, ChannelKey channelKey, SeriesKey seriesKey)
        {
            Series dbSeries = meter.Channels
                .SelectMany(channel => channel.Series)
                .FirstOrDefault(series => seriesKey.Equals(new SeriesKey(series)));

            if ((object)dbSeries == null)
            {

                using (AdoDataConnection connection = meter.ConnectionFactory())
                {
                    Channel dbChannel = meter.Channels
                        .FirstOrDefault(channel => channelKey.Equals(new ChannelKey(channel)));

                    if ((object)dbChannel == null)
                    {
                        TableOperations<Channel> channelTable = new TableOperations<Channel>(connection);
                        TableOperations<MeasurementType> measurementTypeTable = new TableOperations<MeasurementType>(connection);
                        TableOperations<MeasurementCharacteristic> measurementCharacteristicTable = new TableOperations<MeasurementCharacteristic>(connection);
                        TableOperations<Phase> phaseTable = new TableOperations<Phase>(connection);

                        MeasurementType measurementType = measurementTypeTable.GetOrAdd(channelKey.MeasurementType);
                        MeasurementCharacteristic measurementCharacteristic = measurementCharacteristicTable.GetOrAdd(channelKey.MeasurementCharacteristic);
                        Phase phase = phaseTable.GetOrAdd(channelKey.Phase);

                        dbChannel = new Channel()
                        {
                            MeterID = meter.ID,
                            LineID = channelKey.LineID,
                            MeasurementTypeID = measurementType.ID,
                            MeasurementCharacteristicID = measurementCharacteristic.ID,
                            PhaseID = phase.ID,
                            Name = channelKey.Name,
                            SamplesPerHour = 0,
                            Description = string.Concat(channelKey.MeasurementCharacteristic, " ", channelKey.MeasurementType, " ", channelKey.Phase),
                            Enabled = true
                        };

                        channelTable.AddNewRecord(dbChannel);
                        dbChannel.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                        meter.Channels = null;
                    }
                    TableOperations<Series> seriesTable = new TableOperations<Series>(connection);
                    TableOperations<SeriesType> seriesTypeTable = new TableOperations<SeriesType>(connection);
                    SeriesType seriesType = seriesTypeTable.GetOrAdd(seriesKey.SeriesType);

                    dbSeries = new Series()
                    {
                        ChannelID = dbChannel.ID,
                        SeriesTypeID = seriesType.ID,
                        SourceIndexes = string.Empty
                    };

                    seriesTable.AddNewRecord(dbSeries);
                    dbSeries.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                    dbChannel.Series = null;

                    dbSeries = meter.Channels
                        .SelectMany(channel => channel.Series)
                        .First(series => seriesKey.Equals(new SeriesKey(series)));
                }
            }

            return dbSeries;
        }

        #endregion

        #region [ Static ]

        // Static Fields
        private static readonly ILog Log = LogManager.GetLogger(typeof(CycleDataResource));

        #endregion
    }
}
