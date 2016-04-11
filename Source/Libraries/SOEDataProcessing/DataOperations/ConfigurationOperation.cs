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
using SOEDataProcessing.Database;
using SOEDataProcessing.DataSets;
using log4net;

namespace SOEDataProcessing.DataOperations
{
    public class ConfigurationOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Constants
        private const double Sqrt3 = 1.7320508075688772935274463415059D;

        // Fields
        private string m_filePattern;

        private MeterInfoDataContext m_meterInfo;

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

        public override void Prepare(DbAdapterContainer dbAdapterContainer)
        {
            m_meterInfo = dbAdapterContainer.GetAdapter<MeterInfoDataContext>();
        }

        public override void Execute(MeterDataSet meterDataSet)
        {
            Meter meter;
            List<Series> seriesList;
            Dictionary<string, Series> seriesLookup;
            Series seriesInfo;

            Log.Info("Executing operation to locate meter in database...");

            // Search the database for a meter definition that matches the parsed meter
            meter = m_meterInfo.Meters.SingleOrDefault(m => m.AssetKey == meterDataSet.Meter.AssetKey);

            if ((object)meter != null)
            {
                Log.Info(string.Format("Found meter {0} in database.", meter.Name));

                // Get the list of series associated with the meter in the database
                seriesList = m_meterInfo.Series
                    .Where(series => series.Channel.MeterID == meter.ID)
                    .ToList();

                // Match the parsed series with the ones associated with the meter in the database
                seriesLookup = seriesList
                    .Where(series => string.IsNullOrEmpty(series.SourceIndexes))
                    .ToDictionary(series => series.Channel.Name);

                foreach (DataSeries series in meterDataSet.DataSeries)
                {
                    if ((object)series.SeriesInfo == null)
                        continue;

                    if (seriesLookup.TryGetValue(series.SeriesInfo.Channel.Name, out seriesInfo))
                        series.SeriesInfo = seriesInfo;
                }

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

                // Replace the parsed meter with
                // the one from the database
                meterDataSet.Meter = meter;
            }
            else
            {
                Log.Info($"No existing meter found matching meter with name {meterDataSet.Meter.Name}.");

                // If configuration cannot be modified and existing configuration cannot be found for this meter,
                // throw an exception to indicate the operation could not be executed
                throw new InvalidOperationException("Cannot process meter - configuration does not exist");
            }

            // Remove data series that were not defined in the configuration
            // since configuration information cannot be added for it
            RemoveUndefinedDataSeries(meterDataSet);
        }

        public override void Load(DbAdapterContainer dbAdapterContainer)
        {
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
