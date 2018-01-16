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

using System.Collections.Generic;
using System.Linq;
using GSF.Data;
using GSF.Data.Model;
using SOE.Model;

namespace SOEDataProcessing.DataAnalysis
{
    public class VIDataGroup
    {
        #region [ Members ]

        // Fields
        private int m_vx1Index;
        private int m_vx2Index;
        private int m_vx3Index;
        private int m_vy1Index;
        private int m_vy2Index;
        private int m_vy3Index;
        private int m_i1Index;
        private int m_i2Index;
        private int m_i3Index;
        private int m_irIndex;

        private DataGroup m_dataGroup;

        #endregion

        #region [ Constructors ]

        public VIDataGroup(DataGroup dataGroup)
        {
            string[] instantaneousSeriesTypes = { "Values", "Instantaneous" };

            // Initialize each of
            // the indexes to -1
            m_vx1Index = -1;
            m_vx2Index = -1;
            m_vx3Index = -1;
            m_vy1Index = -1;
            m_vy2Index = -1;
            m_vy3Index = -1;
            m_i1Index = -1;
            m_i2Index = -1;
            m_i3Index = -1;
            m_irIndex = -1;

            // Initialize the data group
            m_dataGroup = new DataGroup(dataGroup.DataSeries);

            for (int i = 0; i < dataGroup.DataSeries.Count; i++)
            {
                // If the data group is not instantaneous, do not use it in the VIDataGroup
                if (dataGroup[i].SeriesInfo.Channel.MeasurementCharacteristic.Name != "Instantaneous")
                    continue;

                // If the data group is not instantaneous, do not use it in the VIDataGroup
                if (!instantaneousSeriesTypes.Contains(dataGroup[i].SeriesInfo.SeriesType.Name))
                    continue;

                // Assign the proper indexes for the seven VIDataGroup
                // channels by checking the name of the channel
                if (dataGroup[i].SeriesInfo.Channel.Name == "VX1")
                    m_vx1Index = i;
                else if (dataGroup[i].SeriesInfo.Channel.Name == "VX2")
                    m_vx2Index = i;
                else if (dataGroup[i].SeriesInfo.Channel.Name == "VX3")
                    m_vx3Index = i;
                else if (dataGroup[i].SeriesInfo.Channel.Name == "VY1")
                    m_vy1Index = i;
                else if (dataGroup[i].SeriesInfo.Channel.Name == "VY2")
                    m_vy2Index = i;
                else if (dataGroup[i].SeriesInfo.Channel.Name == "VY3")
                    m_vy3Index = i;
                else if (dataGroup[i].SeriesInfo.Channel.Name == "I1")
                    m_i1Index = i;
                else if (dataGroup[i].SeriesInfo.Channel.Name == "I2")
                    m_i2Index = i;
                else if (dataGroup[i].SeriesInfo.Channel.Name == "I3")
                    m_i3Index = i;
            }
        }

        private VIDataGroup()
        {
        }

        #endregion

        #region [ Properties ]

        public DataSeries VX1
        {
            get
            {
                return (m_vx1Index >= 0) ? m_dataGroup[m_vx1Index] : null;
            }
        }

        public DataSeries VX2
        {
            get
            {
                return (m_vx2Index >= 0) ? m_dataGroup[m_vx2Index] : null;
            }
        }

        public DataSeries VX3
        {
            get
            {
                return (m_vx3Index >= 0) ? m_dataGroup[m_vx3Index] : null;
            }
        }

        public DataSeries VY1
        {
            get
            {
                return (m_vy1Index >= 0) ? m_dataGroup[m_vy1Index] : null;
            }
        }

        public DataSeries VY2
        {
            get
            {
                return (m_vy2Index >= 0) ? m_dataGroup[m_vy2Index] : null;
            }
        }

        public DataSeries VY3
        {
            get
            {
                return (m_vy3Index >= 0) ? m_dataGroup[m_vy3Index] : null;
            }
        }

        public DataSeries I1
        {
            get
            {
                return (m_i1Index >= 0) ? m_dataGroup[m_i1Index] : null;
            }
        }

        public DataSeries I2
        {
            get
            {
                return (m_i2Index >= 0) ? m_dataGroup[m_i2Index] : null;
            }
        }

        public DataSeries I3
        {
            get
            {
                return (m_i3Index >= 0) ? m_dataGroup[m_i3Index] : null;
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
                return new int[] { m_vx1Index, m_vx2Index, m_vx3Index };
            }
        }

        private int[] CurrentIndexes
        {
            get
            {
                return new int[] { m_i1Index, m_i2Index, m_i3Index, m_irIndex };
            }
        }

        #endregion

        #region [ Methods ]

        /// <summary>
        /// Given three of the four current channels, calculates the
        /// missing channel based on the relationship IR = IA + IB + IC.
        /// </summary>
        /// <param name="meterInfo">Data context for accessing configuration tables in the database.</param>
        public DataSeries CalculateMissingCurrentChannel()
        {
            Meter meter;
            DataSeries missingSeries;

            // If the data group does not have exactly 3 channels,
            // then there is no missing channel or there is not
            // enough data to calculate the missing channel
            if (DefinedCurrents != 3)
                return null;

            // Get the meter associated with the channels in this data group
            meter = (I1 ?? I2).SeriesInfo.Channel.Meter;

            if (m_i1Index == -1)
            {
                // Calculate I1 = IR - I2 - I3
                missingSeries = IR.Add(I2.Negate()).Add(I3.Negate());
                missingSeries.SeriesInfo = GetSeriesInfo(meter, m_dataGroup, "Current", "General1");
                m_i1Index = m_dataGroup.DataSeries.Count;
                m_dataGroup.Add(missingSeries);
            }
            else if (m_i2Index == -1)
            {
                // Calculate I2 = IR - I1 - I3
                missingSeries = IR.Add(I1.Negate()).Add(I3.Negate());
                missingSeries.SeriesInfo = GetSeriesInfo(meter, m_dataGroup, "Current", "General2");
                m_i1Index = m_dataGroup.DataSeries.Count;
                m_dataGroup.Add(missingSeries);
            }
            else if (m_i3Index == -1)
            {
                // Calculate I3 = IR - I1 - I2
                missingSeries = IR.Add(I1.Negate()).Add(I2.Negate());
                missingSeries.SeriesInfo = GetSeriesInfo(meter, m_dataGroup, "Current", "General3");
                m_i1Index = m_dataGroup.DataSeries.Count;
                m_dataGroup.Add(missingSeries);
            }
            else
            {
                // Calculate IR = I1 + I2 + I3
                missingSeries = I1.Add(I2).Add(I3);
                missingSeries.SeriesInfo = GetSeriesInfo( meter, m_dataGroup, "Current", "RES");
                m_i1Index = m_dataGroup.DataSeries.Count;
                m_dataGroup.Add(missingSeries);
            }

            return missingSeries;
        }

        public DataGroup ToDataGroup()
        {
            return new DataGroup(m_dataGroup.DataSeries);
        }

        public VIDataGroup ToSubGroup(int startIndex, int endIndex)
        {
            VIDataGroup subGroup = new VIDataGroup();

            subGroup.m_vx1Index = m_vx1Index;
            subGroup.m_vx2Index = m_vx2Index;
            subGroup.m_vx3Index = m_vx3Index;
            subGroup.m_vy1Index = m_vy1Index;
            subGroup.m_vy2Index = m_vy2Index;
            subGroup.m_vy3Index = m_vy3Index;
            subGroup.m_i1Index = m_i1Index;
            subGroup.m_i2Index = m_i2Index;
            subGroup.m_i3Index = m_i3Index;
            subGroup.m_irIndex = m_irIndex;

            subGroup.m_dataGroup = m_dataGroup.ToSubGroup(startIndex, endIndex);

            return subGroup;
        }

        #endregion

        #region [ Static ]

        // Static Methods
        private static Series GetSeriesInfo(Meter meter, DataGroup dataGroup, string measurementTypeName, string phaseName)
        {
            int lineID = dataGroup.Line.ID;
            string measurementCharacteristicName = "Instantaneous";
            string seriesTypeName = "Values";

            char typeDesignation = (measurementTypeName == "Current") ? 'I' : measurementTypeName[0];
            char phaseDesignation = (phaseName == "RES") ? 'R' : phaseName[0];
            string channelName = string.Concat(typeDesignation, phaseDesignation);

            ChannelKey channelKey = new ChannelKey(lineID, 0, channelName, measurementTypeName, measurementCharacteristicName, phaseName);
            SeriesKey seriesKey = new SeriesKey(channelKey, seriesTypeName);

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

                        MeasurementType measurementType = measurementTypeTable.GetOrAdd(measurementTypeName);
                        MeasurementCharacteristic measurementCharacteristic = measurementCharacteristicTable.GetOrAdd(measurementCharacteristicName);
                        Phase phase = phaseTable.GetOrAdd(phaseName);

                        dbChannel = new Channel()
                        {
                            MeterID = meter.ID,
                            LineID = lineID,
                            MeasurementTypeID = measurementType.ID,
                            MeasurementCharacteristicID = measurementCharacteristic.ID,
                            PhaseID = phase.ID,
                            Name = channelKey.Name,
                            SamplesPerHour = dataGroup.SamplesPerHour,
                            Description = string.Concat(measurementCharacteristicName, " ", measurementTypeName, " ", phaseName),
                            Enabled = true
                        };

                        channelTable.AddNewRecord(dbChannel);
                        dbChannel.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                        meter.Channels = null;
                    }

                    TableOperations<Series> seriesTable = new TableOperations<Series>(connection);
                    TableOperations<SeriesType> seriesTypeTable = new TableOperations<SeriesType>(connection);
                    SeriesType seriesType = seriesTypeTable.GetOrAdd(seriesTypeName);

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
    }
}
