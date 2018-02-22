//******************************************************************************************************
//  DataHub.cs - Gbtc
//
//  Copyright © 2016, Grid Protection Alliance.  All Rights Reserved.
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
//  01/14/2016 - Ritchie Carroll
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using GSF;
using GSF.Data.Model;
using GSF.Configuration;
using GSF.COMTRADE;
using GSF.Identity;
using GSF.IO;
using GSF.Web.Hubs;
using GSF.Web.Model.HubOperations;
using GSF.Web.Security;
using SOE.Model;
using GSF.Web.Model;
using System.Globalization;
using System.Data;
using System.IO.Compression;
using GSF.Collections;

namespace SOEService
{
    [AuthorizeHubRole]
    public class DataHub : RecordOperationsHub<DataHub>
    {
        #region [ Setting Table Operations ]

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Setting), RecordOperation.QueryRecordCount)]
        public int QuerySettingCount(string filterString)
        {
            return DataContext.Table<Setting>().QueryRecordCount(filterString);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Setting), RecordOperation.QueryRecords)]
        public IEnumerable<Setting> QuerySettings(string sortField, bool ascending, int page, int pageSize, string filterString)
        {
            return DataContext.Table<Setting>().QueryRecords(sortField, ascending, page, pageSize, filterString);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Setting), RecordOperation.DeleteRecord)]
        public void DeleteSetting(int id)
        {
            DataContext.Table<Setting>().DeleteRecord(id);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Setting), RecordOperation.CreateNewRecord)]
        public Setting NewSetting()
        {
            return new Setting();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(Setting), RecordOperation.AddNewRecord)]
        public void AddNewSetting(Setting record)
        {
            DataContext.Table<Setting>().AddNewRecord(record);
        }

        [AuthorizeHubRole("Administrator, Owner")]
        [RecordOperation(typeof(Setting), RecordOperation.UpdateRecord)]
        public void UpdateSetting(Setting record)
        {
            DataContext.Table<Setting>().UpdateRecord(record);
        }

        #endregion

        #region [ IncidentEventCycleDataView Table Operations ]
        [RecordOperation(typeof(IncidentEventCycleDataView), RecordOperation.QueryRecordCount)]
        public int QueryIncidentEventCycleDataViewCount(string date, string name, string levels, string limits, string timeContext, string filterString)
        {
            TableOperations<IncidentEventCycleDataView> table = DataContext.Table<IncidentEventCycleDataView>();
            RecordRestriction filterRestriction = table.GetSearchRestriction(filterString);
            DateTime startDate = DateTime.ParseExact(date, "yyyyMMddHH", CultureInfo.InvariantCulture);
            DateTime endDate = (DateTime)typeof(DateTime).GetMethod("Add" + timeContext).Invoke(startDate, new object[] { 1 });

            return table.QueryRecordCount(filterRestriction + new RecordRestriction("StartTime BETWEEN {0} AND {1}", startDate,endDate) + new RecordRestriction(levels + " = {0}", name));
        }

        [RecordOperation(typeof(IncidentEventCycleDataView), RecordOperation.QueryRecords)]
        public IEnumerable<IncidentEventCycleDataView> QueryIncidentEventCycleDataViewItems(string date, string name, string levels, string limits, string timeContext, string sortField, bool ascending, int page, int pageSize, string filterString)
        {
            TableOperations<IncidentEventCycleDataView> table = DataContext.Table<IncidentEventCycleDataView>();
            RecordRestriction filterRestriction = table.GetSearchRestriction(filterString);

            DateTime startDate = DateTime.ParseExact(date, "yyyyMMddHH", CultureInfo.InvariantCulture);
            DateTime endDate = (DateTime)typeof(DateTime).GetMethod("Add" + timeContext).Invoke(startDate, new object[] { 1 });

            return table.QueryRecords(sortField, ascending, page, pageSize, filterRestriction + new RecordRestriction("StartTime BETWEEN {0} AND {1}", startDate, endDate) + new RecordRestriction(levels + " = {0}", name));
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(IncidentEventCycleDataView), RecordOperation.DeleteRecord)]
        public void DeleteIncidentEventCycleDataView(int id)
        {
            DataContext.Table<IncidentEventCycleDataView>().DeleteRecord(id);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(IncidentEventCycleDataView), RecordOperation.CreateNewRecord)]
        public IncidentEventCycleDataView NewIncidentEventCycleDataView()
        {
            return new IncidentEventCycleDataView();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(IncidentEventCycleDataView), RecordOperation.AddNewRecord)]
        public void AddNewIncidentEventCycleDataView(IncidentEventCycleDataView record)
        {
            DataContext.Table<IncidentEventCycleDataView>().AddNewRecord(record);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(IncidentEventCycleDataView), RecordOperation.UpdateRecord)]
        public void UpdateIncidentEventCycleDataView(IncidentEventCycleDataView record)
        {
            DataContext.Table<IncidentEventCycleDataView>().UpdateRecord(record);
        }
        #endregion

        #region [ CycleDataSOEPointView Table Operations ]
        [RecordOperation(typeof(CycleDataSOEPointView), RecordOperation.QueryRecordCount)]
        public int QueryCycleDataSOEPointViewCount(int parentID, string filterText)
        {
            return DataContext.Table<CycleDataSOEPointView>().QueryRecordCount(new RecordRestriction("IncidentID = {0}", parentID));
        }


        [RecordOperation(typeof(CycleDataSOEPointView), RecordOperation.QueryRecords)]
        public IEnumerable<CycleDataSOEPointView> QueryCycleDataSOEPointViewItems(int parentID, string sortField, bool ascending, int page, int pageSize, string filterText)
        {
            return DataContext.Table<CycleDataSOEPointView>().QueryRecords(sortField, ascending, page, pageSize, new RecordRestriction("IncidentID = {0}", parentID));
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(CycleDataSOEPointView), RecordOperation.DeleteRecord)]
        public void DeleteCycleDataSOEPointView(int id)
        {
            DataContext.Table<CycleDataSOEPointView>().DeleteRecord(id);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(CycleDataSOEPointView), RecordOperation.CreateNewRecord)]
        public CycleDataSOEPointView NewCycleDataSOEPointView()
        {
            return new CycleDataSOEPointView();
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(CycleDataSOEPointView), RecordOperation.AddNewRecord)]
        public void AddNewCycleDataSOEPointView(CycleDataSOEPointView record)
        {
            DataContext.Table<CycleDataSOEPointView>().AddNewRecord(record);
        }

        [AuthorizeHubRole("Administrator")]
        [RecordOperation(typeof(CycleDataSOEPointView), RecordOperation.UpdateRecord)]
        public void UpdateCycleDataSOEPointView(CycleDataSOEPointView record)
        {
            DataContext.Table<CycleDataSOEPointView>().UpdateRecord(record);
        }
        #endregion

        #region [ OpenSEE Table Operations ]

        public Task<Dictionary<int, List<double[]>>> QueryEventData(int eventID)
        {
            return Task.Run(() =>
            {
                const string EventDataQueryFormat =
                    "SELECT " +
                    "    EventData.TimeDomainData, " +
                    "    EventData.FrequencyDomainData " +
                    "FROM " +
                    "    Event JOIN " +
                    "    EventData ON Event.EventDataID = EventData.ID " +
                    "WHERE Event.ID = {0}";

                Dictionary<int, List<double[]>> dataLookup = new Dictionary<int, List<double[]>>();
                byte[] timeDomainData = null;
                byte[] frequencyDomainData = null;

                using (IDataReader reader = DataContext.Connection.ExecuteReader(EventDataQueryFormat, eventID))
                {
                    while (reader.Read())
                    {
                        timeDomainData = Decompress((byte[])reader["TimeDomainData"]);
                        frequencyDomainData = Decompress((byte[])reader["FrequencyDomainData"]);
                    }
                }

                if ((object)timeDomainData == null || (object)frequencyDomainData == null)
                    return dataLookup;

                return dataLookup.Merge(
                    GetDataLookup(timeDomainData),
                    GetDataLookup(frequencyDomainData));
            });
        }

        private byte[] Decompress(byte[] compressedBytes)
        {
            using (MemoryStream memoryStream = new MemoryStream(compressedBytes))
            using (GZipStream gzipStream = new GZipStream(memoryStream, CompressionMode.Decompress))
            using (MemoryStream destinationStream = new MemoryStream())
            {
                gzipStream.CopyTo(destinationStream);
                return destinationStream.ToArray();
            }
        }

        private Dictionary<int, List<double[]>> GetDataLookup(byte[] bytes)
        {
            int offset;
            int samples;
            double[] times;

            int channelID;
            List<double[]> dataSeries;
            Dictionary<int, List<double[]>> dataLookup;

            offset = 0;
            samples = LittleEndian.ToInt32(bytes, offset);
            offset += sizeof(int);

            long epoch = new DateTime(1970, 1, 1).Ticks;

            times = new double[samples];

            for (int i = 0; i < samples; i++)
            {
                times[i] = (LittleEndian.ToInt64(bytes, offset) - epoch) / (double)TimeSpan.TicksPerMillisecond;
                offset += sizeof(long);
            }

            dataLookup = new Dictionary<int, List<double[]>>();

            while (offset < bytes.Length)
            {
                dataSeries = new List<double[]>();
                channelID = GetChannelID(LittleEndian.ToInt32(bytes, offset));
                offset += sizeof(int);

                for (int i = 0; i < samples; i++)
                {
                    dataSeries.Add(new double[] { times[i], LittleEndian.ToDouble(bytes, offset) });
                    offset += sizeof(double);
                }

                dataLookup.Add(channelID, dataSeries);
            }

            return dataLookup;
        }

        private int GetChannelID(int seriesID)
        {
            const string QueryFormat =
                "SELECT Channel.ID " +
                "FROM " +
                "    Channel JOIN " +
                "    Series ON Series.ChannelID = Channel.ID " +
                "WHERE Series.ID = {0}";

            return DataContext.Connection.ExecuteScalar<int>(QueryFormat, seriesID);
        }

        #endregion

        #region [ Misc ]

        public IEnumerable<IDLabel> SearchTimeZones(string searchText, int limit)
        {
            IReadOnlyCollection<TimeZoneInfo> tzi = TimeZoneInfo.GetSystemTimeZones();

            return tzi
                .Select(row => new IDLabel(row.Id, row.ToString()))
                .Where(row => row.label.ToLower().Contains(searchText.ToLower()));
        }


        /// <summary>
        /// Gets UserAccount table ID for current user.
        /// </summary>
        /// <returns>UserAccount.ID for current user.</returns>
        public static Guid GetCurrentUserID()
        {
            Guid userID;
            AuthorizationCache.UserIDs.TryGetValue(Thread.CurrentPrincipal.Identity.Name, out userID);
            return userID;
        }

        /// <summary>
        /// Gets UserAccount table SID for current user.
        /// </summary>
        /// <returns>UserAccount.ID for current user.</returns>
        public static string GetCurrentUserSID()
        {
            return UserInfo.UserNameToSID(Thread.CurrentPrincipal.Identity.Name);
        }

        /// <summary>
        /// Gets UserAccount table name for current user.
        /// </summary>
        /// <returns>User name for current user.</returns>
        public static string GetCurrentUserName()
        {
            return Thread.CurrentPrincipal.Identity.Name;
        }

        #endregion

    }
}
