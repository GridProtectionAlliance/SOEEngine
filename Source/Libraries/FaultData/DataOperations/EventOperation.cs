﻿//******************************************************************************************************
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
using System.Data.SqlClient;
using System.Linq;
using FaultData.DataAnalysis;
using FaultData.Database;
using FaultData.DataResources;
using FaultData.DataSets;
using log4net;
using EventKey = System.Tuple<int, System.DateTime, System.DateTime>;

namespace FaultData.DataOperations
{
    public class EventOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Fields
        private DbAdapterContainer m_dbAdapterContainer;

        private double m_maxVoltage;
        private double m_maxCurrent;
        private double m_lowVoltageThreshold;
        private double m_maxLowVoltageCurrent;
        private double m_maxTimeOffset;
        private double m_minTimeOffset;

        private double m_residualCurrentTrigger;
        private double m_phaseCurrentTrigger;
        private double m_prefaultTrigger;
        private double m_faultSuppressionTrigger;
        private double m_maxFaultDistanceMultiplier;
        private double m_minFaultDistanceMultiplier;

        private MeterDataSet m_meterDataSet;
        private MeterData.EventDataTable m_eventTable;
        private List<Tuple<EventKey, byte[]>> m_cycleDataList;

        #endregion

        #region [ Properties ]

        public double MaxVoltage
        {
            get
            {
                return m_maxVoltage;
            }
            set
            {
                m_maxVoltage = value;
            }
        }

        public double MaxCurrent
        {
            get
            {
                return m_maxCurrent;
            }
            set
            {
                m_maxCurrent = value;
            }
        }

        public double LowVoltageThreshold
        {
            get
            {
                return m_lowVoltageThreshold;
            }
            set
            {
                m_lowVoltageThreshold = value;
            }
        }

        public double MaxLowVoltageCurrent
        {
            get
            {
                return m_maxLowVoltageCurrent;
            }
            set
            {
                m_maxLowVoltageCurrent = value;
            }
        }

        public double MaxTimeOffset
        {
            get
            {
                return m_maxTimeOffset;
            }
            set
            {
                m_maxTimeOffset = value;
            }
        }

        public double MinTimeOffset
        {
            get
            {
                return m_minTimeOffset;
            }
            set
            {
                m_minTimeOffset = value;
            }
        }

        public double ResidualCurrentTrigger
        {
            get
            {
                return m_residualCurrentTrigger;
            }
            set
            {
                m_residualCurrentTrigger = value;
            }
        }

        public double PhaseCurrentTrigger
        {
            get
            {
                return m_phaseCurrentTrigger;
            }
            set
            {
                m_phaseCurrentTrigger = value;
            }
        }

        public double PrefaultTrigger
        {
            get
            {
                return m_prefaultTrigger;
            }
            set
            {
                m_prefaultTrigger = value;
            }
        }

        public double FaultSuppressionTrigger
        {
            get
            {
                return m_faultSuppressionTrigger;
            }
            set
            {
                m_faultSuppressionTrigger = value;
            }
        }

        public double MaxFaultDistanceMultiplier
        {
            get
            {
                return m_maxFaultDistanceMultiplier;
            }
            set
            {
                m_maxFaultDistanceMultiplier = value;
            }
        }

        public double MinFaultDistanceMultiplier
        {
            get
            {
                return m_minFaultDistanceMultiplier;
            }
            set
            {
                m_minFaultDistanceMultiplier = value;
            }
        }

        #endregion

        #region [ Methods ]

        public override void Prepare(DbAdapterContainer dbAdapterContainer)
        {
            m_dbAdapterContainer = dbAdapterContainer;
            LoadEventTypes(dbAdapterContainer);
        }

        public override void Execute(MeterDataSet meterDataSet)
        {
            EventClassificationResource.Factory factory;
            CycleDataResource cycleDataResource;
            EventClassificationResource eventClassificationResource;

            Log.Info("Executing operation to load event data into the database...");

            factory = new EventClassificationResource.Factory()
            {
                DbAdapterContainer = m_dbAdapterContainer,
                MaxVoltage = m_maxVoltage,
                MaxCurrent = m_maxCurrent,
                LowVoltageThreshold = m_lowVoltageThreshold,
                MaxLowVoltageCurrent = m_maxLowVoltageCurrent,
                MaxTimeOffset = m_maxTimeOffset,
                MinTimeOffset = m_minTimeOffset,
                ResidualCurrentTrigger = m_residualCurrentTrigger,
                PhaseCurrentTrigger = m_phaseCurrentTrigger,
                PrefaultTrigger = m_prefaultTrigger,
                FaultSuppressionTrigger = m_faultSuppressionTrigger,
                MaxFaultDistanceMultiplier = m_maxFaultDistanceMultiplier,
                MinFaultDistanceMultiplier = m_minFaultDistanceMultiplier
            };

            cycleDataResource = meterDataSet.GetResource<CycleDataResource>();
            eventClassificationResource = meterDataSet.GetResource(factory.Create);
            LoadEvents(meterDataSet, cycleDataResource.DataGroups, cycleDataResource.VICycleDataGroups, eventClassificationResource.Classifications);

            m_meterDataSet = meterDataSet;
        }

        public override void Load(DbAdapterContainer dbAdapterContainer)
        {
            Dictionary<EventKey, MeterData.EventRow> eventLookup;
            MeterData.EventRow eventRow;

            FaultLocationData.CycleDataDataTable cycleDataTable;
            EventKey eventKey;
            byte[] cycleData;

            if (m_eventTable.Count == 0 && m_cycleDataList.Count == 0)
                return;

            Log.Info("Loading event data into the database...");

            using (SqlBulkCopy bulkCopy = new SqlBulkCopy(dbAdapterContainer.Connection))
            {
                // Set timeout to infinite
                bulkCopy.BulkCopyTimeout = 0;

                // Write events to the database
                bulkCopy.DestinationTableName = m_eventTable.TableName;
                bulkCopy.WriteToServer(m_eventTable);

                // Query database for event IDs and store them in a lookup table by line ID
                dbAdapterContainer.EventAdapter.FillByFileGroup(m_eventTable, m_meterDataSet.FileGroup.ID);
                eventLookup = m_eventTable.Where(evt => evt.MeterID == m_meterDataSet.Meter.ID).ToDictionary(CreateEventKey);

                // Create cycle data table
                cycleDataTable = new FaultLocationData.CycleDataDataTable();

                // Create rows for cycle data in the cycle data table
                foreach (Tuple<EventKey, byte[]> tuple in m_cycleDataList)
                {
                    eventKey = tuple.Item1;
                    cycleData = tuple.Item2;

                    if (eventLookup.TryGetValue(eventKey, out eventRow))
                        cycleDataTable.AddCycleDataRow(eventRow.ID, cycleData);
                }

                // Write cycle data to the database
                bulkCopy.DestinationTableName = cycleDataTable.TableName;
                bulkCopy.WriteToServer(cycleDataTable);
            }

            Log.Info(string.Format("Loaded {0} events into the database.", m_eventTable.Count));
        }

        private void LoadEventTypes(DbAdapterContainer dbAdapterContainer)
        {
            if ((object)s_eventTypeLookup == null)
            {
                lock (s_eventTypeLock)
                {
                    if ((object)s_eventTypeLookup == null)
                        s_eventTypeLookup = GetEventTypeLookup(dbAdapterContainer);
                }
            }
        }

        private void LoadEvents(MeterDataSet meterDataSet, List<DataGroup> dataGroups, List<VICycleDataGroup> viCycleDataGroups, Dictionary<DataGroup, EventClassification> classifications)
        {
            DataGroup dataGroup;
            EventClassification eventClassification;
            int eventTypeID;

            MeterData.EventRow eventRow;

            m_eventTable = new MeterData.EventDataTable();
            m_cycleDataList = new List<Tuple<EventKey, byte[]>>();

            for (int i = 0; i < dataGroups.Count; i++)
            {
                dataGroup = dataGroups[i];

                if (dataGroup.Classification == DataClassification.Trend || dataGroup.Classification == DataClassification.Unknown)
                    continue;

                if (!classifications.TryGetValue(dataGroup, out eventClassification))
                    continue;

                if (!s_eventTypeLookup.TryGetValue(eventClassification, out eventTypeID))
                    continue;

                Log.Debug(string.Format("Processing event with event type {0}.", eventClassification));

                eventRow = m_eventTable.NewEventRow();
                eventRow.FileGroupID = meterDataSet.FileGroup.ID;
                eventRow.MeterID = meterDataSet.Meter.ID;
                eventRow.LineID = dataGroup.Line.ID;
                eventRow.EventTypeID = eventTypeID;
                eventRow.Name = string.Empty;
                eventRow.Data = dataGroup.ToData();
                eventRow.StartTime = dataGroup.StartTime;
                eventRow.EndTime = dataGroup.EndTime;
                eventRow.Magnitude = 0.0D;
                eventRow.Duration = (dataGroup.EndTime - dataGroup.StartTime).TotalSeconds;
                m_eventTable.AddEventRow(eventRow);

                m_cycleDataList.Add(Tuple.Create(CreateEventKey(eventRow), viCycleDataGroups[i].ToDataGroup().ToData()));
            }

            Log.Info(string.Format("Finished processing {0} events.", m_eventTable.Count));
        }

        private Dictionary<EventClassification, int> GetEventTypeLookup(DbAdapterContainer dbAdapterContainer)
        {
            MeterData.EventTypeDataTable eventTypeTable = new MeterData.EventTypeDataTable();
            EventClassification eventClassification = default(EventClassification);

            foreach (EventClassification classification in Enum.GetValues(typeof(EventClassification)))
                eventTypeTable.AddEventTypeRow(classification.ToString(), classification.ToString());

            BulkLoader bulkLoader = new BulkLoader();

            bulkLoader.Connection = dbAdapterContainer.Connection;

            bulkLoader.CreateTableFormat = "CREATE TABLE {0} " +
                                           "( " +
                                           "    ID INT," +
                                           "    Name VARCHAR(200), " +
                                           "    Description VARCHAR(MAX)" +
                                           ")";

            bulkLoader.MergeTableFormat = "MERGE INTO {0} AS Target " +
                                          "USING {1} AS Source " +
                                          "ON Source.Name = Target.Name " +
                                          "WHEN NOT MATCHED THEN " +
                                          "    INSERT (Name, Description) " +
                                          "    VALUES (Source.Name, Source.Description);";

            bulkLoader.Load(eventTypeTable);

            dbAdapterContainer.EventTypeAdapter.Fill(eventTypeTable);

            return eventTypeTable
                .Where(row => Enum.TryParse(row.Name, out eventClassification))
                .Select(row => Tuple.Create(eventClassification, row.ID))
                .ToDictionary(tuple => tuple.Item1, tuple => tuple.Item2);
        }

        private EventKey CreateEventKey(MeterData.EventRow evt)
        {
            return Tuple.Create(evt.LineID, evt.StartTime, evt.EndTime);
        }

        #endregion

        #region [ Static ]

        // Static Fields
        private static object s_eventTypeLock = new object();
        private static Dictionary<EventClassification, int> s_eventTypeLookup;
        private static readonly ILog Log = LogManager.GetLogger(typeof(EventOperation));

        #endregion
    }
}
