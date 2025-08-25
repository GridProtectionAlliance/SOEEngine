//******************************************************************************************************
//  MATLABAnalysisOperation.cs - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  03/27/2023 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using GSF.Data;
using GSF.Data.Model;
using log4net;
using Newtonsoft.Json.Linq;
using SOE.Model;
using SOE.Model.Events;
using SOEDataProcessing.DataAnalysis;
using SOEDataProcessing.DataOperations;
using SOEDataProcessing.DataResources;
using SOEDataProcessing.DataSets;
using AnalyticModel = SOE.Model.MATLABAnalytic;

namespace SOE.MATLAB
{
    public class MATLABAnalysisOperation : DataOperationBase<MeterDataSet>
    {
        #region [ Members ]

        // Nested Types
        private delegate void TagHandler(AdoDataConnection connection, MATLABAnalyticTag analyticTag);

        #endregion

        #region [ Constructors ]

        public MATLABAnalysisOperation()
        {
            TagHandlers = new Dictionary<string, TagHandler>()
            {
                { "SOELog", new TagHandler(HandleSOELogData) }
            };
        }

        #endregion

        #region [ Properties ]

        private Dictionary<string, TagHandler> TagHandlers { get; }

        #endregion

        #region [ Methods ]

        public override void Execute(MeterDataSet meterDataSet)
        {
            CycleDataResource cycleDataResource = meterDataSet.GetResource<CycleDataResource>();
            List<DataGroup> dataGroups = cycleDataResource.DataGroups;
            List<VIDataGroup> viDataGroups = cycleDataResource.VIDataGroups;

            using (AdoDataConnection connection = meterDataSet.CreateDbConnection())
            {
                TableOperations<Event> eventTable = new TableOperations<Event>(connection);
                TableOperations<EventTag> eventTagTable = new TableOperations<EventTag>(connection);
                TableOperations<EventEventTag> eventEventTagTable = new TableOperations<EventEventTag>(connection);

                for (int i = 0; i < dataGroups.Count; i++)
                {
                    DataGroup dataGroup = dataGroups[i];
                    VIDataGroup viDataGroup = viDataGroups[i];
                    Event evt = eventTable.GetEvent(meterDataSet.FileGroup, dataGroup);

                    if (evt is null)
                        continue;

                    List<AnalyticModel> analyticModelList = QueryAnalytics(connection);
                    List<MATLABAnalyticTag> allTags = new List<MATLABAnalyticTag>();

                    foreach (AnalyticModel analyticModel in analyticModelList)
                    {
                        try
                        {
                            MATLABAnalytic analytic = ToAnalytic(analyticModel);
                            List<MATLABAnalyticSettingField> settingFields = QuerySettingFields(connection, analyticModel.SettingSQL, evt.ID);
                            List<MATLABAnalyticTag> analyticTags = analytic.Execute(viDataGroup, settingFields);
                            allTags.AddRange(analyticTags);
                        }
                        catch (Exception ex)
                        {
                            Log.Error($"Error occurred while executing MATLAB analytic {analyticModel.MethodName}: {ex.Message}", ex);
                        }
                    }

                    foreach (MATLABAnalyticTag tag in allTags)
                    {
                        try
                        {
                            if (!(tag.Type is null) && TagHandlers.TryGetValue(tag.Type, out TagHandler handler))
                            {
                                handler(connection, tag);
                                continue;
                            }

                            EventTag eventTag = eventTagTable.GetOrAdd(tag.Name);
                            EventEventTag eventEventTag = eventEventTagTable.NewRecord();
                            eventEventTag.EventID = evt.ID;
                            eventEventTag.EventTagID = eventTag.ID;
                            eventEventTag.TagData = tag.JSONData;
                            eventEventTagTable.AddNewRecord(eventEventTag);
                        }
                        catch (Exception ex)
                        {
                            Log.Error($"Error occurred while loading event tag {tag.Name} from MATLAB analytics: {ex.Message}", ex);
                        }
                    }
                }
            }
        }

        private List<AnalyticModel> QueryAnalytics(AdoDataConnection connection)
        {
            TableOperations<AnalyticModel> matlabAnalyticTable = new TableOperations<AnalyticModel>(connection);
            return matlabAnalyticTable.QueryRecords("LoadOrder").ToList();
        }

        private MATLABAnalytic ToAnalytic(AnalyticModel model)
        {
            string assemblyName = model.AssemblyName;
            string methodName = model.MethodName;
            MATLABAnalysisFunctionInvokerFactory invokerFactory = AnalysisFunctionFactory.GetAnalysisFunctionInvokerFactory(assemblyName, methodName);
            return new MATLABAnalytic(invokerFactory);
        }

        private List<MATLABAnalyticSettingField> QuerySettingFields(AdoDataConnection connection, string sql, int eventID)
        {
            if (string.IsNullOrEmpty(sql))
                return new List<MATLABAnalyticSettingField>(0);

            MATLABAnalyticSettingField ToSettingField(DataColumn column, DataRow row)
            {
                string name = column.ColumnName;
                object value = row[column];
                return new MATLABAnalyticSettingField(name, value);
            }

            using (DataTable table = connection.RetrieveData(sql, eventID))
            {
                if (table.Rows.Count == 0)
                    return new List<MATLABAnalyticSettingField>();

                DataRow row = table.Rows[0];

                return table.Columns
                    .Cast<DataColumn>()
                    .Select(column => ToSettingField(column, row))
                    .ToList();
            }
        }

        private void HandleSOELogData(AdoDataConnection connection, MATLABAnalyticTag soeLogTag)
        {
            JObject tagData = JObject.Parse(soeLogTag.JSONData);
            string soeLogJSON = tagData.Value<string>("SOELog");

            if (soeLogJSON is null)
            {
                Log.Error("Detected invalid format for SOELog data. Check debug log for details.");
                Log.Debug($"Missing SOELog: {soeLogTag.JSONData}");
                return;
            }

            TableOperations<SOELog> soeLogTable = new TableOperations<SOELog>(connection);
            JArray soeLog = JArray.Parse(soeLogJSON);

            foreach (JToken logRecord in soeLog)
            {
                int? eventID = logRecord.Value<int?>("EventID");
                string circuit = logRecord.Value<string>("Circuit");
                string deviceName = logRecord.Value<string>("DeviceName");
                string channelName = logRecord.Value<string>("ChannelName");
                DateTime? soeTime = logRecord.Value<DateTime?>("SOEdateTimeLocal");
                string systemVoltage = logRecord.Value<string>("systemVoltage");
                int? measurementNumber = logRecord.Value<int?>("mxNum");
                int? measurementSampleNumber = logRecord.Value<int?>("mxHereSamp");
                DateTime? measurementTime = logRecord.Value<DateTime?>("mxTimeLocal");
                double? measurementValue = logRecord.Value<double?>("mxValue");
                string measurementColor = logRecord.Value<string>("mxColor");
                int? measurementColorID = logRecord.Value<int?>("mxColorMapInt");
                string plotFileName = logRecord.Value<string>("PlotFileName");

                bool isInvalid =
                    eventID is null || measurementColorID is null || measurementColor is null ||
                    circuit is null || deviceName is null || channelName is null ||
                    soeTime is null || systemVoltage is null ||
                    measurementNumber is null || measurementSampleNumber is null ||
                    measurementTime is null || measurementValue is null ||
                    plotFileName is null;

                if (isInvalid)
                {
                    Log.Error("Detected invalid format for SOELog record. Check debug log for details.");
                    Log.Debug($"Invalid SOELog record: {soeLogTag.JSONData}");
                    continue;
                }

                SOELog dbRecord = new SOELog()
                {
                    EventID = eventID.GetValueOrDefault(),
                    ColorIndexID = measurementColorID.GetValueOrDefault(),
                    Circuit = circuit,
                    DeviceName = deviceName,
                    ChannelName = channelName,
                    SOETime = soeTime.GetValueOrDefault(),
                    SystemVoltage = systemVoltage,
                    MeasurementNumber = measurementNumber.GetValueOrDefault(),
                    MeasurementSampleNumber = measurementSampleNumber.GetValueOrDefault(),
                    MeasurementTime = measurementTime.GetValueOrDefault(),
                    MeasurementValue = measurementValue.GetValueOrDefault(),
                    MeasurementColor = measurementColor,
                    PlotFileName = plotFileName
                };

                soeLogTable.AddNewRecord(dbRecord);
            }
        }

        #endregion

        #region [ Static ]

        // Static Fields
        private static readonly ILog Log = LogManager.GetLogger(typeof(MATLABAnalysisOperation));

        // Static Properties
        private static MATLABAnalysisFunctionFactory AnalysisFunctionFactory { get; }
            = new MATLABAnalysisFunctionFactory();

        #endregion
    }
}
