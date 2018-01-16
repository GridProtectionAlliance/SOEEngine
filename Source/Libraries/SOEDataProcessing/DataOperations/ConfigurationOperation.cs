//******************************************************************************************************
//  ConfigurationOperation.cs - Gbtc
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
//  07/21/2014 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using SOEDataProcessing.DataAnalysis;
using SOEDataProcessing.DataSets;
using SOE.Model;
using log4net;
using GSF.Data;
using GSF.Data.Model;

namespace SOEDataProcessing.DataOperations
{
    public class ConfigurationOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Nested Types
        private class SourceIndex
        {
            public double Multiplier;
            public int ChannelIndex;

            public static SourceIndex Parse(string text)
            {
                SourceIndex sourceIndex = new SourceIndex();

                string[] parts = text.Split('*');
                string multiplier = (parts.Length > 1) ? parts[0].Trim() : "1";
                string channelIndex = (parts.Length > 1) ? parts[1].Trim() : parts[0].Trim();

                if (parts.Length > 2)
                    throw new FormatException($"Too many asterisks found in source index {text}.");

                if (!double.TryParse(multiplier, out sourceIndex.Multiplier))
                    throw new FormatException($"Incorrect format for multiplier {multiplier} found in source index {text}.");

                if (channelIndex == "NONE")
                    return null;

                if (!int.TryParse(channelIndex, out sourceIndex.ChannelIndex))
                    throw new FormatException($"Incorrect format for channel index {channelIndex} found in source index {text}.");

                if (channelIndex[0] == '-')
                {
                    sourceIndex.Multiplier *= -1.0D;
                    sourceIndex.ChannelIndex *= -1;
                }

                return sourceIndex;
            }
        }


        // Constants
        private const double Sqrt3 = 1.7320508075688772935274463415059D;

        // Fields
        private string m_filePattern;
        #endregion

        #region [ Properties ]

        [Setting]
        public string FilePattern
        {
            get
            {
                return m_filePattern;
            }
            set
            {
                m_filePattern = value;
            }
        }

        #endregion

        #region [ Methods ]

        public override void Execute(MeterDataSet meterDataSet)
        {
            Meter parsedMeter;
            Meter dbMeter;
            List<Series> seriesList;

            Log.Info("Executing operation to locate meter in database...");

            // Grab the parsed meter right away as we will be replacing it in the meter data set with the meter from the database
            parsedMeter = meterDataSet.Meter;

            // Search the database for a meter definition that matches the parsed meter
            using (AdoDataConnection connection = meterDataSet.CreateDbConnection())
            {
                TableOperations<Meter> meterTable = new TableOperations<Meter>(connection);
                dbMeter = meterTable.QueryRecordWhere("AssetKey = {0}", parsedMeter.AssetKey);
                dbMeter.ConnectionFactory = meterDataSet.CreateDbConnection;
            }

            if ((object)dbMeter == null)
            {
                Log.Info(string.Format("No existing meter found matching meter with name {0}.", parsedMeter.Name));

                // If configuration cannot be modified and existing configuration cannot be found for this meter,
                // throw an exception to indicate the operation could not be executed
                throw new InvalidOperationException("Cannot process meter - configuration does not exist");
            }

            Log.Info(string.Format("Found meter {0} in database.", dbMeter.Name));

            // Replace the parsed meter with
            // the one from the database
            meterDataSet.Meter = dbMeter;


            // Get the list of series associated with the meter in the database
            seriesList = dbMeter.Channels
                .SelectMany(channel => channel.Series)
                .ToList();


            // Match the parsed series with the ones associated with the meter in the database
            Dictionary<string, Series> seriesLookup = seriesList
                .Where(series => string.IsNullOrEmpty(series.SourceIndexes))
                .ToDictionary(series => series.Channel.Name);

            foreach (DataSeries series in meterDataSet.DataSeries)
            {
                Series seriesInfo;
                if ((object)series.SeriesInfo == null)
                    continue;

                if (seriesLookup.TryGetValue(series.SeriesInfo.Channel.Name, out seriesInfo))
                    series.SeriesInfo = seriesInfo;
            }

            // Create data series for series which
            // are combinations of the parsed series
            foreach (Series series in seriesList.Where(series => !string.IsNullOrEmpty(series.SourceIndexes)))
                AddCalculatedDataSeries(meterDataSet, series);

            // There may be some placeholder DataSeries objects with no data so that indexes
            // would be correct for calculating data series--now that we are finished
            // calculating data series, these need to be removed
            for (int i = meterDataSet.DataSeries.Count - 1; i >= 0; i--)
            {
                if ((object)meterDataSet.DataSeries[i].SeriesInfo == null)
                    meterDataSet.DataSeries.RemoveAt(i);
            }

            // There may be some placeholder DataSeries objects with no data so that indexes
            // would be correct for calculating data series--now that we are finished
            // calculating data series, these need to be removed
            for (int i = meterDataSet.Digitals.Count - 1; i >= 0; i--)
            {
                if ((object)meterDataSet.Digitals[i].SeriesInfo == null)
                    meterDataSet.Digitals.RemoveAt(i);
            }

            // Remove data series that were not defined in the configuration
            // since configuration information cannot be added for it
            RemoveUndefinedDataSeries(meterDataSet);
        }

        private void AddCalculatedDataSeries(MeterDataSet meterDataSet, Series series)
        {
            List<SourceIndex> sourceIndexes;
            DataSeries dataSeries;

            sourceIndexes = series.SourceIndexes.Split(',')
                .Select(SourceIndex.Parse)
                .Where(sourceIndex => (object)sourceIndex != null)
                .ToList();

            if (sourceIndexes.Count == 0)
                return;

            if (series.Channel.MeasurementType.Name == "Digital")
            {
                if (sourceIndexes.Any(sourceIndex => Math.Abs(sourceIndex.ChannelIndex) >= meterDataSet.Digitals.Count))
                    return;

                dataSeries = sourceIndexes
                    .Select(sourceIndex => meterDataSet.Digitals[sourceIndex.ChannelIndex].Multiply(sourceIndex.Multiplier))
                    .Aggregate((series1, series2) => series1.Add(series2));
            }
            else
            {
                if (sourceIndexes.Any(sourceIndex => sourceIndex.ChannelIndex >= meterDataSet.DataSeries.Count))
                    return;

                dataSeries = sourceIndexes
                    .Select(sourceIndex => meterDataSet.DataSeries[sourceIndex.ChannelIndex].Multiply(sourceIndex.Multiplier))
                    .Aggregate((series1, series2) => series1.Add(series2));
            }

            dataSeries.SeriesInfo = series;

            if (!meterDataSet.DataSeries.Contains(dataSeries))
                meterDataSet.DataSeries.Add(dataSeries);
        }

        private void RemoveUndefinedDataSeries(MeterDataSet meterDataSet)
        {
            for (int i = meterDataSet.DataSeries.Count - 1; i >= 0; i--)
            {
                if ((object)meterDataSet.DataSeries[i].SeriesInfo.Channel.Line == null)
                    meterDataSet.DataSeries.RemoveAt(i);
            }

            for (int i = meterDataSet.Digitals.Count - 1; i >= 0; i--)
            {
                if ((object)meterDataSet.Digitals[i].SeriesInfo.Channel.Line == null)
                    meterDataSet.Digitals.RemoveAt(i);
            }
        }

        #endregion

        #region [ Static ]

        // Static Fields
        private static readonly ILog Log = LogManager.GetLogger(typeof(ConfigurationOperation));

        #endregion
    }
}
