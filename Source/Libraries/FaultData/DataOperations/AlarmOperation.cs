﻿//******************************************************************************************************
//  AlarmOperation.cs - Gbtc
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
//  07/23/2014 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using FaultData.Database;
using FaultData.Database.AlarmDataTableAdapters;
using FaultData.DataResources;
using FaultData.DataSets;
using log4net;

namespace FaultData.DataOperations
{
    public class AlarmOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Fields
        private DbAdapterContainer m_dbAdapterContainer;
        private AlarmData.AlarmTypeDataTable m_alarmTypeTable;
        private AlarmData.AlarmLogDataTable m_alarmLogTable;

        #endregion

        #region [ Methods ]

        public override void Prepare(DbAdapterContainer dbAdapterContainer)
        {
            m_alarmTypeTable = new AlarmData.AlarmTypeDataTable();
            m_alarmLogTable = new AlarmData.AlarmLogDataTable();
            dbAdapterContainer.GetAdapter<AlarmTypeTableAdapter>().Fill(m_alarmTypeTable);

            m_dbAdapterContainer = dbAdapterContainer;
        }

        public override void Execute(MeterDataSet meterDataSet)
        {
            Log.Info("Executing operation to load alarm data into the database...");
            //LoadDataQualityAlarmLogs(meterDataSet);
            LoadRangeLimits(meterDataSet);
            LoadHourOfWeekLimits(meterDataSet);
        }

        public override void Load(DbAdapterContainer dbAdapterContainer)
        {
            BulkLoader bulkLoader = new BulkLoader();

            if (m_alarmLogTable.Count == 0)
                return;

            Log.Info("Loading alarm data into the database...");

            bulkLoader.Connection = m_dbAdapterContainer.Connection;
            bulkLoader.CommandTimeout = m_dbAdapterContainer.CommandTimeout;
            bulkLoader.Load(m_alarmLogTable);

            Log.Info(string.Format("Loaded {0} alarm log records into the database...", m_alarmLogTable.Count));
        }

        private void LoadDataQualityAlarmLogs(MeterDataSet meterDataSet)
        {
            const int Latched = 0;
            const int NonCongruent = 1;
            const int Unreasonable = 2;

            Dictionary<int, int> alarmTypeLookup = new Dictionary<int, int>();
            Dictionary<Channel, List<TrendingDataSummaryResource.TrendingDataSummary>> trendingDataSummaries = meterDataSet.GetResource<TrendingDataSummaryResource>().TrendingDataSummaries;
            int channelID;

            alarmTypeLookup.Add(Latched, m_alarmTypeTable.First(alarmType => alarmType.Name == "Latched").ID);
            alarmTypeLookup.Add(NonCongruent, m_alarmTypeTable.First(alarmType => alarmType.Name == "Non-congruent").ID);
            alarmTypeLookup.Add(Unreasonable, m_alarmTypeTable.First(alarmType => alarmType.Name == "Unreasonable").ID);

            foreach (KeyValuePair<Channel, List<TrendingDataSummaryResource.TrendingDataSummary>> trendingDataSummary in trendingDataSummaries)
            {
                channelID = trendingDataSummary.Key.ID;

                foreach (TrendingDataSummaryResource.TrendingDataSummary summary in trendingDataSummary.Value)
                {
                    if (summary.IsValid)
                        continue;

                    if (summary.Latched)
                        m_alarmLogTable.AddAlarmLogRow(channelID, alarmTypeLookup[Latched], summary.Time, 0, 0.0D, 0.0D, summary.Average);

                    if (summary.NonCongruent)
                        m_alarmLogTable.AddAlarmLogRow(channelID, alarmTypeLookup[NonCongruent], summary.Time, 0, summary.Maximum, summary.Minimum, summary.Average);

                    if (summary.Unreasonable)
                        m_alarmLogTable.AddAlarmLogRow(channelID, alarmTypeLookup[Unreasonable], summary.Time, 0, summary.HighLimit, summary.LowLimit, summary.UnreasonableValue);
                }
            }
        }

        private void LoadRangeLimits(MeterDataSet meterDataSet)
        {
            Dictionary<Channel, List<TrendingDataSummaryResource.TrendingDataSummary>> trendingDataSummaries;
            AlarmData.AlarmRangeLimitDataTable rangeLimitTable;

            Channel channel;

            trendingDataSummaries = meterDataSet.GetResource<TrendingDataSummaryResource>().TrendingDataSummaries;

            rangeLimitTable = new AlarmData.AlarmRangeLimitDataTable();

            foreach (KeyValuePair<Channel, List<TrendingDataSummaryResource.TrendingDataSummary>> summaries in trendingDataSummaries)
            {
                channel = summaries.Key;

                InitializeRangeLimitTable(rangeLimitTable, channel);

                // Update alarm log for each excursion
                foreach (TrendingDataSummaryResource.TrendingDataSummary summary in summaries.Value)
                {
                    foreach (AlarmData.AlarmRangeLimitRow rangeLimit in rangeLimitTable.Where(row => row.Enabled != 0))
                        CheckAlarm(channel, summary, rangeLimit);
                }
            }
        }

        private void LoadHourOfWeekLimits(MeterDataSet meterDataSet)
        {
            Dictionary<Channel, List<TrendingDataSummaryResource.TrendingDataSummary>> trendingDataSummaries;

            HourOfWeekLimitTableAdapter hourlyLimitAdapter;
            AlarmData.HourOfWeekLimitDataTable hourlyLimitTable;

            TrendingDataSummaryResource.TrendingDataSummary summary;
            AlarmData.HourOfWeekLimitRow hourlyLimit;

            Channel channel;
            int channelID;

            trendingDataSummaries = meterDataSet.GetResource<TrendingDataSummaryResource>().TrendingDataSummaries;

            hourlyLimitAdapter = m_dbAdapterContainer.GetAdapter<HourOfWeekLimitTableAdapter>();
            hourlyLimitTable = new AlarmData.HourOfWeekLimitDataTable();

            foreach (KeyValuePair<Channel, List<TrendingDataSummaryResource.TrendingDataSummary>> summaries in trendingDataSummaries)
            {
                channel = summaries.Key;
                channelID = channel.ID;
                hourlyLimitAdapter.FillBy(hourlyLimitTable, channelID);

                // Update alarm log for each excursion
                foreach (Tuple<TrendingDataSummaryResource.TrendingDataSummary, AlarmData.HourOfWeekLimitRow> tuple in summaries.Value.Join(hourlyLimitTable, sum => GetHourOfWeek(sum.Time), row => row.HourOfWeek, Tuple.Create))
                {
                    summary = tuple.Item1;
                    hourlyLimit = tuple.Item2;

                    if (summary.Average < hourlyLimit.Low || summary.Average > hourlyLimit.High)
                        m_alarmLogTable.AddAlarmLogRow(channelID, hourlyLimit.AlarmTypeID, summary.Time, hourlyLimit.Severity, hourlyLimit.High, hourlyLimit.Low, summary.Average);
                }
            }
        }

        private void InitializeRangeLimitTable(AlarmData.AlarmRangeLimitDataTable rangeLimitTable, Channel channel)
        {
            AlarmRangeLimitTableAdapter rangeLimitAdapter;
            DefaultAlarmRangeLimitTableAdapter defaultRangeLimitAdapter;
            AlarmData.DefaultAlarmRangeLimitDataTable defaultRangeLimitTable;
            AlarmData.AlarmRangeLimitRow alarmRangeLimitRow;

            // Clear existing rows from the range limit table
            rangeLimitTable.Clear();

            // Fill the range limit table with range limits for the given channel
            rangeLimitAdapter = m_dbAdapterContainer.GetAdapter<AlarmRangeLimitTableAdapter>();
            rangeLimitAdapter.FillBy(rangeLimitTable, channel.ID);

            // If limits exist for the given channel,
            // range limit table has been successfully initialized
            if (rangeLimitTable.Count != 0)
                return;

            // Get the default range limits for the measurement type and characteristic of this channel
            defaultRangeLimitAdapter = m_dbAdapterContainer.GetAdapter<DefaultAlarmRangeLimitTableAdapter>();
            defaultRangeLimitTable = defaultRangeLimitAdapter.GetDataBy(channel.MeasurementTypeID, channel.MeasurementCharacteristicID);

            // If there are no default limits for the channel,
            // then the range limit table has been successfully initialized
            if (defaultRangeLimitTable.Count == 0)
                return;

            lock (RangeLimitLock)
            {
                // Fill the range limit table one more time inside the lock to
                // ensure that no other threads have written limits for this channel
                rangeLimitAdapter.FillBy(rangeLimitTable, channel.ID);

                // If there are still no limits defined for this channel,
                // update the table to include this channel's default limits
                if (rangeLimitTable.Count == 0)
                {
                    foreach (AlarmData.DefaultAlarmRangeLimitRow row in defaultRangeLimitTable)
                    {
                        alarmRangeLimitRow = rangeLimitTable.NewAlarmRangeLimitRow();

                        alarmRangeLimitRow.ChannelID = channel.ID;
                        alarmRangeLimitRow.AlarmTypeID = row.AlarmTypeID;
                        alarmRangeLimitRow.Severity = row.Severity;
                        alarmRangeLimitRow.RangeInclusive = row.RangeInclusive;
                        alarmRangeLimitRow.PerUnit = row.PerUnit;
                        alarmRangeLimitRow.Enabled = 1;

                        if (!row.IsHighNull())
                            alarmRangeLimitRow.High = row.High;

                        if (!row.IsLowNull())
                            alarmRangeLimitRow.Low = row.Low;

                        rangeLimitTable.AddAlarmRangeLimitRow(alarmRangeLimitRow);
                    }

                    using (SqlBulkCopy bulkCopy = new SqlBulkCopy(m_dbAdapterContainer.Connection))
                    {
                        bulkCopy.BulkCopyTimeout = 0;
                        bulkCopy.DestinationTableName = rangeLimitTable.TableName;
                        bulkCopy.WriteToServer(rangeLimitTable);
                    }
                }
            }
        }

        private void CheckAlarm(Channel channel, TrendingDataSummaryResource.TrendingDataSummary summary, AlarmData.AlarmRangeLimitRow rangeLimit)
        {
            double perUnitValue;

            double highLimit = 0.0D;
            double lowLimit = 0.0D;
            bool highValid = true;
            bool lowValid = true;

            AlarmData.AlarmLogRow logRow;

            if (summary.IsDuplicate)
                return;

            perUnitValue = channel.PerUnitValue ?? 1.0D;

            if (!rangeLimit.IsHighNull())
            {
                highLimit = Convert.ToBoolean(rangeLimit.PerUnit) ? rangeLimit.High * perUnitValue : rangeLimit.High;
                highValid = Convert.ToBoolean(rangeLimit.RangeInclusive) ^ (summary.Average < highLimit);
            }

            if (!rangeLimit.IsLowNull())
            {
                lowLimit = Convert.ToBoolean(rangeLimit.PerUnit) ? rangeLimit.Low * perUnitValue : rangeLimit.Low;
                lowValid = Convert.ToBoolean(rangeLimit.RangeInclusive) ^ (summary.Average > lowLimit);
            }

            if (!lowValid || !highValid)
            {
                logRow = m_alarmLogTable.NewAlarmLogRow();
                logRow.ChannelID = channel.ID;
                logRow.AlarmTypeID = rangeLimit.AlarmTypeID;
                logRow.Time = summary.Time;
                logRow.Severity = rangeLimit.Severity;
                logRow.Value = summary.Average;

                if (!rangeLimit.IsHighNull())
                    logRow.LimitHigh = highLimit;

                if (!rangeLimit.IsLowNull())
                    logRow.LimitLow = lowLimit;

                m_alarmLogTable.AddAlarmLogRow(logRow);
            }
        }

        private int GetHourOfWeek(DateTime time)
        {
            return (int)time.DayOfWeek * 24 + time.Hour;
        }

        #endregion

        #region [ Static ]

        // Static Fields
        private static readonly object RangeLimitLock = new object();
        private static readonly ILog Log = LogManager.GetLogger(typeof(AlarmOperation));

        #endregion
    }
}
