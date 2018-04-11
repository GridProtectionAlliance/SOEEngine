//******************************************************************************************************
//  EventOperation.cs - Gbtc
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
//  07/22/2014 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using SOEDataProcessing.DataAnalysis;
using SOEDataProcessing.DataResources;
using SOEDataProcessing.DataSets;
using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using log4net;
using SOE.Model;

namespace SOEDataProcessing.DataOperations
{
    public class EventOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Constants
        private const double Sqrt3 = 1.7320508075688772935274463415059D;

        // Fields
        private double m_systemFrequency;
        private TimeZoneInfo m_timeZone;

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

        [Setting]
        public string XDATimeZone
        {
            get
            {
                return m_timeZone.Id;
            }
            set
            {
                m_timeZone = TimeZoneInfo.FindSystemTimeZoneById(value);
            }
        }

        #endregion

        #region [ Methods ]

        public override void Execute(MeterDataSet meterDataSet)
        {
            DataGroupsResource dataGroupsResource = meterDataSet.GetResource<DataGroupsResource>();
            CycleDataResource cycleDataResource = meterDataSet.GetResource<CycleDataResource>();

            using (AdoDataConnection connection = meterDataSet.CreateDbConnection())
            {
                List<DataGroup> dataGroups = new List<DataGroup>(cycleDataResource.DataGroups);
                dataGroups.AddRange(dataGroupsResource.DataGroups.Where(dataGroup => dataGroup.DataSeries.Count == 0));

                List<Event> events = GetEvents(connection, meterDataSet, dataGroups, cycleDataResource.VICycleDataGroups);
                LoadEvents(connection, events);
            }
        }

        private List<Event> GetEvents(AdoDataConnection connection, MeterDataSet meterDataSet, List<DataGroup> dataGroups, List<VICycleDataGroup> viCycleDataGroups)
        {
            int count = dataGroups
                .Where(dataGroup => dataGroup.Classification != DataClassification.Trend)
                .Where(dataGroup => dataGroup.Classification != DataClassification.Unknown)
                .Count();

            if (count == 0)
            {
                Log.Info($"No events found for file '{meterDataSet.FilePath}'.");
                return new List<Event>();
            }

            Log.Info(string.Format("Processing {0} events...", count));

            List<Event> events = new List<Event>(count);

            TableOperations<Event> eventTable = new TableOperations<Event>(connection);
            TableOperations<EventData> eventDataTable = new TableOperations<EventData>(connection);
            TableOperations<Incident> incidentTable = new TableOperations<Incident>(connection);
            for (int i = 0; i < dataGroups.Count; i++)
            {
                DataGroup dataGroup = dataGroups[i];

                if (dataGroup.Classification == DataClassification.Trend)
                    continue;

                if (dataGroup.Classification == DataClassification.Unknown)
                    continue;

                if ((object)dataGroup.Line == null && meterDataSet.Meter.MeterLocation.MeterLocationLines.Count != 1)
                    continue;

                Line line = dataGroup.Line ?? meterDataSet.Meter.MeterLocation.MeterLocationLines.Single().Line;

                if (eventTable.QueryRecordCountWhere("StartTime = {0} AND EndTime = {1} AND Samples = {2} AND MeterID = {3} AND LineID = {4}", dataGroup.StartTime, dataGroup.EndTime, dataGroup.Samples, meterDataSet.Meter.ID, line.ID) > 0)
                    continue;

                Incident incident = incidentTable.QueryRecordWhere("MeterID = {0} AND {1} BETWEEN StartTime AND EndTime", meterDataSet.Meter.ID, ToDateTime2(connection, dataGroup.StartTime));

                Event evt = new Event()
                {
                    FileGroupID = meterDataSet.FileGroup.ID,
                    MeterID = meterDataSet.Meter.ID,
                    LineID = line.ID,
                    EventDataID = null,
                    IncidentID = incident.ID,
                    Name = string.Empty,
                    StartTime = dataGroup.StartTime,
                    EndTime = dataGroup.EndTime,
                    Samples = dataGroup.Samples,
                    TimeZoneOffset = (int)m_timeZone.GetUtcOffset(dataGroup.StartTime).TotalMinutes,
                    SamplesPerSecond = 0,
                    SamplesPerCycle = 0
                };

                if (dataGroup.Samples > 0)
                {
                    evt.EventData = new EventData()
                    {
                        FileGroupID = meterDataSet.FileGroup.ID,
                        RunTimeID = i,
                        TimeDomainData = dataGroup.ToData(),
                        FrequencyDomainData = viCycleDataGroups[i].ToDataGroup().ToData(),
                        MarkedForDeletion = 0
                    };

                    evt.SamplesPerSecond = (int)Math.Round(dataGroup.SamplesPerSecond);
                    evt.SamplesPerCycle = Transform.CalculateSamplesPerCycle(dataGroup.SamplesPerSecond, m_systemFrequency);
                }

                events.Add(evt);
            }

            Log.Info(string.Format("Finished processing {0} events.", count));

            return events;
        }

        private void LoadEvents(AdoDataConnection connection, List<Event> events)
        {
            TableOperations<Event> eventTable = new TableOperations<Event>(connection);
            TableOperations<EventData> eventDataTable = new TableOperations<EventData>(connection);

            foreach (Event evt in events)
            {
                IDbDataParameter startTime2 = ToDateTime2(connection, evt.StartTime);
                IDbDataParameter endTime2 = ToDateTime2(connection, evt.EndTime);

                if (eventTable.QueryRecordsWhere("StartTime = {0} AND EndTime = {1} AND Samples = {2} AND MeterID = {3} AND LineID = {4}", startTime2, endTime2, evt.Samples, evt.MeterID, evt.LineID).Any())
                    continue;

                EventData eventData = evt.EventData;

                if ((object)eventData != null)
                {
                    eventDataTable.AddNewRecord(eventData);
                    eventData.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                    evt.EventDataID = eventData.ID;
                }

                eventTable.AddNewRecord(evt);
                evt.ID = eventTable.QueryRecordWhere("StartTime = {0} AND EndTime = {1} AND Samples = {2} AND MeterID = {3} AND LineID = {4}", startTime2, endTime2, evt.Samples, evt.MeterID, evt.LineID).ID;
            }
        }

        private IDbDataParameter ToDateTime2(AdoDataConnection connection, DateTime dateTime)
        {
            using (IDbCommand command = connection.Connection.CreateCommand())
            {
                IDbDataParameter parameter = command.CreateParameter();
                parameter.DbType = DbType.DateTime2;
                parameter.Value = dateTime;
                return parameter;
            }
        }


        #endregion

        #region [ Static ]

        // Static Fields
        private static readonly ILog Log = LogManager.GetLogger(typeof(EventOperation));

        #endregion
    }
}
