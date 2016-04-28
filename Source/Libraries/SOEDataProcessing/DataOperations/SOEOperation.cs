//******************************************************************************************************
//  SOEOperation.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
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
//  04/11/2016 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using SOEDataProcessing.DataAnalysis;
using SOEDataProcessing.Database;
using SOEDataProcessing.Database.MeterDataTableAdapters;
using SOEDataProcessing.DataResources;
using SOEDataProcessing.DataSets;
using EventKey = System.Tuple<int, int, System.DateTime, System.DateTime, int>;

namespace SOEDataProcessing.DataOperations
{
    public class SOEOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Fields
        private double m_systemFrequency;
        private DbAdapterContainer m_dbAdapterContainer;
        private MeterDataSet m_meterDataSet;

        private readonly MeterData.CycleDataDataTable m_cycleDataTable;
        private readonly List<Tuple<EventKey, MeterData.CycleDataRow>> m_cycleDataList;

        #endregion

        #region [ Constructors ]

        public SOEOperation()
        {
            m_cycleDataTable = new MeterData.CycleDataDataTable();
            m_cycleDataList = new List<Tuple<EventKey, MeterData.CycleDataRow>>();
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

        #endregion

        #region [ Methods ]

        public override void Prepare(DbAdapterContainer dbAdapterContainer)
        {
            m_dbAdapterContainer = dbAdapterContainer;
        }

        public override void Execute(MeterDataSet meterDataSet)
        {
            CycleDataResource cycleDataResource = CycleDataResource.GetResource(meterDataSet, m_dbAdapterContainer);

            for (int i = 0; i < cycleDataResource.DataGroups.Count; i++)
            {
                EventKey eventKey = CreateEventKey(meterDataSet.FileGroup, cycleDataResource.DataGroups[i]);
                VICycleDataGroup viCycleDataGroup = cycleDataResource.VICycleDataGroups[i];
                int samplesPerCycle = (int)Math.Round(cycleDataResource.DataGroups[i].SamplesPerSecond / m_systemFrequency);
                Process(eventKey, viCycleDataGroup, samplesPerCycle);
            }

            m_meterDataSet = meterDataSet;
        }

        public override void Load(DbAdapterContainer dbAdapterContainer)
        {
            BulkLoader bulkLoader;
            MeterData.EventRow eventRow;

            // Query database for events and store them in a lookup table by event key
            EventTableAdapter eventAdapter = dbAdapterContainer.GetAdapter<EventTableAdapter>();
            MeterData.EventDataTable eventTable = eventAdapter.GetDataByFileGroup(m_meterDataSet.FileGroup.ID);
            Dictionary<EventKey, MeterData.EventRow> eventLookup = eventTable.ToDictionary(CreateEventKey);

            foreach (Tuple<EventKey, MeterData.CycleDataRow> tuple in m_cycleDataList)
            {
                if (eventLookup.TryGetValue(tuple.Item1, out eventRow))
                {
                    tuple.Item2.EventID = eventRow.ID;
                    m_cycleDataTable.AddCycleDataRow(tuple.Item2);
                }
            }

            if (m_cycleDataTable.Count == 0)
                return;

            // Create the bulk loader for loading data into the database
            bulkLoader = new BulkLoader();
            bulkLoader.Connection = dbAdapterContainer.Connection;
            bulkLoader.CommandTimeout = dbAdapterContainer.CommandTimeout;

            bulkLoader.Load(m_cycleDataTable);
        }

        private void Process(EventKey eventKey, VICycleDataGroup viCycleDataGroup, int samplesPerCycle)
        {
            int length = viCycleDataGroup.VX1.RMS.DataPoints.Count;

            int sampleNumber = 0;
            MeterData.CycleDataRow row;

            for (int i = 0; i < length; i++)
            {
                row = m_cycleDataTable.NewCycleDataRow();

                row.CycleNumber = i;
                row.SampleNumber = sampleNumber;
                row.Timestamp = viCycleDataGroup.VX1.RMS[i].Time;

                row.VX1RMS = viCycleDataGroup.VX1.RMS[i].Value;
                row.VX1Phase = viCycleDataGroup.VX1.Phase[i].Value;
                row.VX1Peak = viCycleDataGroup.VX1.Peak[i].Value;
                row.VX2RMS = viCycleDataGroup.VX2.RMS[i].Value;
                row.VX2Phase = viCycleDataGroup.VX2.Phase[i].Value;
                row.VX2Peak = viCycleDataGroup.VX2.Peak[i].Value;
                row.VX3RMS = viCycleDataGroup.VX3.RMS[i].Value;
                row.VX3Phase = viCycleDataGroup.VX3.Phase[i].Value;
                row.VX3Peak = viCycleDataGroup.VX3.Peak[i].Value;

                row.VY1RMS = viCycleDataGroup.VY1.RMS[i].Value;
                row.VY1Phase = viCycleDataGroup.VY1.Phase[i].Value;
                row.VY1Peak = viCycleDataGroup.VY1.Peak[i].Value;
                row.VY2RMS = viCycleDataGroup.VY2.RMS[i].Value;
                row.VY2Phase = viCycleDataGroup.VY2.Phase[i].Value;
                row.VY2Peak = viCycleDataGroup.VY2.Peak[i].Value;
                row.VY3RMS = viCycleDataGroup.VY3.RMS[i].Value;
                row.VY3Phase = viCycleDataGroup.VY3.Phase[i].Value;
                row.VY3Peak = viCycleDataGroup.VY3.Peak[i].Value;

                row.I1RMS = viCycleDataGroup.I1.RMS[i].Value;
                row.I1Phase = viCycleDataGroup.I1.Phase[i].Value;
                row.I1Peak = viCycleDataGroup.I1.Peak[i].Value;
                row.I2RMS = viCycleDataGroup.I2.RMS[i].Value;
                row.I2Phase = viCycleDataGroup.I2.Phase[i].Value;
                row.I2Peak = viCycleDataGroup.I2.Peak[i].Value;
                row.I3RMS = viCycleDataGroup.I3.RMS[i].Value;
                row.I3Phase = viCycleDataGroup.I3.Phase[i].Value;
                row.I3Peak = viCycleDataGroup.I3.Peak[i].Value;
                row.IRRMS = viCycleDataGroup.IR.RMS[i].Value;
                row.IRPhase = viCycleDataGroup.IR.Phase[i].Value;
                row.IRPeak = viCycleDataGroup.IR.Peak[i].Value;

                m_cycleDataList.Add(Tuple.Create(eventKey, row));
                sampleNumber += samplesPerCycle;
            }
        }

        private EventKey CreateEventKey(FileGroup fileGroup, DataGroup dataGroup)
        {
            return Tuple.Create(fileGroup.ID, dataGroup.Line.ID, dataGroup.StartTime, dataGroup.EndTime, dataGroup.Samples);
        }

        private EventKey CreateEventKey(MeterData.EventRow eventRow)
        {
            return Tuple.Create(eventRow.FileGroupID, eventRow.LineID, eventRow.StartTime, eventRow.EndTime, eventRow.Samples);
        }

        #endregion
    }
}
