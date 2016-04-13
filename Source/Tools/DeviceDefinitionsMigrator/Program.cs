//******************************************************************************************************
//  Program.cs - Gbtc
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
//  08/06/2014 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Xml.Linq;
using SOEDataProcessing.Database;
using GSF.Collections;

namespace DeviceDefinitionsMigrator
{
    class Program
    {
        private class ProgressTracker
        {
            private int m_progress;
            private int m_total;
            private ManualResetEvent m_pendingWaitHandle;
            private Thread m_pendingMessageThread;

            public ProgressTracker(int total)
            {
                m_total = total;
            }

            private double ProgressRatio
            {
                get
                {
                    return m_progress / (double)m_total;
                }
            }

            public void MakeProgress()
            {
                m_progress++;
            }

            public void WriteMessage(string message)
            {
                FinishPendingMessageLoop();
                Console.WriteLine("[{0:0.00%}] {1}", ProgressRatio, message);
            }

            public void StartPendingMessage(string message)
            {
                FinishPendingMessageLoop();
                Console.Write("[{0:0.00%}] {1}", ProgressRatio, message);
                StartPendingMessageLoop();
            }

            public void EndPendingMessage()
            {
                FinishPendingMessageLoop();
            }

            private void StartPendingMessageLoop()
            {
                m_pendingWaitHandle = new ManualResetEvent(false);
                m_pendingMessageThread = new Thread(ExecutePendingMessageLoop);
                m_pendingMessageThread.IsBackground = true;
                m_pendingMessageThread.Start();
            }

            private void ExecutePendingMessageLoop()
            {
                while (!m_pendingWaitHandle.WaitOne(TimeSpan.FromSeconds(2.0D)))
                {
                    Console.Write(".");
                }

                Console.WriteLine("done.");
            }

            private void FinishPendingMessageLoop()
            {
                if ((object)m_pendingWaitHandle != null)
                {
                    m_pendingWaitHandle.Set();
                    m_pendingMessageThread.Join();
                    m_pendingWaitHandle.Dispose();
                    m_pendingWaitHandle = null;
                }
            }
        }

        private class TupleIgnoreCase : IEqualityComparer<Tuple<string, string>>
        {
            public bool Equals(Tuple<string, string> x, Tuple<string, string> y)
            {
                return StringComparer.OrdinalIgnoreCase.Equals(x.Item1, y.Item1) &&
                       StringComparer.OrdinalIgnoreCase.Equals(x.Item2, y.Item2);
            }

            public int GetHashCode(Tuple<string, string> obj)
            {
                int hash = 17;
                hash = hash * 31 + StringComparer.OrdinalIgnoreCase.GetHashCode(obj.Item1);
                hash = hash * 31 + StringComparer.OrdinalIgnoreCase.GetHashCode(obj.Item2);
                return hash;
            }

            public static TupleIgnoreCase Default
            {
                get
                {
                    return s_default;
                }
            }

            private static readonly TupleIgnoreCase s_default = new TupleIgnoreCase();
        }

        static void Main(string[] args)
        {
            if (args.Length != 2)
            {
                Console.WriteLine("Usage:");
                Console.WriteLine("    DeviceDefinitionsMigrator <ConnectionString> <FilePath>");
                Console.WriteLine();
                Console.WriteLine("Example:");
                Console.WriteLine("    DeviceDefinitionsMigrator \"Data Source=localhost; Initial Catalog=SOEdb; Integrated Security=SSPI\" \"C:\\Program Files\\openFLE\\DeviceDefinitions.xml\"");

                Environment.Exit(0);
            }

            try
            {
                string connectionString = args[0];
                string deviceDefinitionsFile = args[1];

                Migrate(connectionString, deviceDefinitionsFile);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("--- ERROR ---");
                Console.Error.WriteLine(ex.Message);
            }
        }

        private class LookupTables
        {
            private MeterInfoDataContext m_meterInfo;

            public Dictionary<string, Meter> MeterLookup;
            public Dictionary<string, Line> LineLookup;
            public Dictionary<string, MeterLocation> MeterLocationLookup;
            public Dictionary<Tuple<string, string>, MeterLine> MeterLineLookup;
            public Dictionary<Tuple<string, string>, MeterLocationLine> MeterLocationLineLookup;
            public Dictionary<string, MeasurementType> MeasurementTypeLookup;
            public Dictionary<string, MeasurementCharacteristic> MeasurementCharacteristicLookup;
            public Dictionary<string, Phase> PhaseLookup;
            public Dictionary<string, SeriesType> SeriesTypeLookup;

            public LookupTables(MeterInfoDataContext meterInfo)
            {
                m_meterInfo = meterInfo;
            }

            public void CreateLookups(XDocument document)
            {
                List<XElement> deviceElements = document.Elements().Elements("device").ToList();
                List<XElement> lineElements = deviceElements.Elements("lines").Elements("line").ToList();

                MeterLookup = GetMeterLookup(deviceElements, m_meterInfo);
                LineLookup = GetLineLookup(lineElements, m_meterInfo);
                MeterLocationLookup = GetMeterLocationLookup(deviceElements, lineElements, m_meterInfo);
                MeterLineLookup = GetMeterLineLookup(MeterLookup.Values, LineLookup.Values, m_meterInfo);
                MeterLocationLineLookup = GetMeterLocationLineLookup(MeterLocationLookup.Values, LineLookup.Values, m_meterInfo);
                MeasurementTypeLookup = GetMeasurementTypeLookup(m_meterInfo);
                MeasurementCharacteristicLookup = GetMeasurementCharacteristicLookup(m_meterInfo);
                PhaseLookup = GetPhaseLookup(m_meterInfo);
                SeriesTypeLookup = GetSeriesTypeLookup(m_meterInfo);
            }

            public Dictionary<string, Channel> GetChannelLookup(Meter meter, Line line)
            {
                return m_meterInfo.Channels
                    .Where(channel => channel.MeterID == meter.ID)
                    .Where(channel => channel.LineID == line.ID)
                    .ToDictionary(channel => channel.Name);
            }

            private Dictionary<string, Meter> GetMeterLookup(List<XElement> deviceElements, MeterInfoDataContext meterInfo)
            {
                List<string> deviceIDs = deviceElements
                    .Select(deviceElement => (string)deviceElement.Attribute("id"))
                    .Where(id => (object)id != null)
                    .Distinct()
                    .ToList();

                return meterInfo.Meters
                    .Where(meter => deviceIDs.Contains(meter.AssetKey))
                    .ToDictionary(meter => meter.AssetKey, StringComparer.OrdinalIgnoreCase);
            }

            private Dictionary<string, Line> GetLineLookup(List<XElement> lineElements, MeterInfoDataContext meterInfo)
            {
                List<string> lineIDs = lineElements
                    .Select(lineElement => (string)lineElement.Attribute("id"))
                    .Where(id => (object)id != null)
                    .Distinct()
                    .ToList();

                return meterInfo.Lines
                    .Where(line => lineIDs.Contains(line.AssetKey))
                    .ToDictionary(line => line.AssetKey, StringComparer.OrdinalIgnoreCase);
            }

            private Dictionary<string, MeterLocation> GetMeterLocationLookup(List<XElement> deviceElements, List<XElement> lineElements, MeterInfoDataContext meterInfo)
            {
                List<string> meterLocationIDs = deviceElements
                    .Select(deviceElement => deviceElement.Element("attributes") ?? new XElement("attributes"))
                    .Select(deviceAttributes => (string)deviceAttributes.Element("stationID"))
                    .Concat(lineElements.Select(lineElement => (string)lineElement.Element("endStationID")))
                    .Distinct()
                    .ToList();

                return meterInfo.MeterLocations
                    .Where(meterLocation => meterLocationIDs.Contains(meterLocation.AssetKey))
                    .ToDictionary(meterLocation => meterLocation.AssetKey, StringComparer.OrdinalIgnoreCase);
            }

            private Dictionary<Tuple<string, string>, MeterLine> GetMeterLineLookup(IEnumerable<Meter> meters, IEnumerable<Line> lines, MeterInfoDataContext meterInfo)
            {
                List<int> meterIDs = meters
                    .Select(meter => meter.ID)
                    .ToList();

                List<int> lineIDs = lines
                    .Select(line => line.ID)
                    .ToList();

                return meterInfo.MeterLines
                    .Where(meterLine => meterIDs.Contains(meterLine.MeterID))
                    .Where(meterLine => lineIDs.Contains(meterLine.LineID))
                    .ToDictionary(meterLine => Tuple.Create(meterLine.Meter.AssetKey, meterLine.Line.AssetKey), TupleIgnoreCase.Default);
            }

            private Dictionary<Tuple<string, string>, MeterLocationLine> GetMeterLocationLineLookup(IEnumerable<MeterLocation> meterLocations, IEnumerable<Line> lines, MeterInfoDataContext meterInfo)
            {
                List<int> meterLocationIDs = meterLocations
                    .Select(meterLocation => meterLocation.ID)
                    .ToList();

                List<int> lineIDs = lines
                    .Select(line => line.ID)
                    .ToList();

                return meterInfo.MeterLocationLines
                    .Where(meterLocationLine => meterLocationIDs.Contains(meterLocationLine.MeterLocationID))
                    .Where(meterLocationLine => lineIDs.Contains(meterLocationLine.LineID))
                    .ToDictionary(meterLocationLine => Tuple.Create(meterLocationLine.MeterLocation.AssetKey, meterLocationLine.Line.AssetKey), TupleIgnoreCase.Default);
            }

            private Dictionary<string, MeasurementType> GetMeasurementTypeLookup(MeterInfoDataContext meterInfo)
            {
                return meterInfo.MeasurementTypes.ToDictionary(measurementType => measurementType.Name, StringComparer.OrdinalIgnoreCase);
            }

            private Dictionary<string, MeasurementCharacteristic> GetMeasurementCharacteristicLookup(MeterInfoDataContext meterInfo)
            {
                return meterInfo.MeasurementCharacteristics.ToDictionary(measurementCharacteristic => measurementCharacteristic.Name, StringComparer.OrdinalIgnoreCase);
            }

            private Dictionary<string, Phase> GetPhaseLookup(MeterInfoDataContext meterInfo)
            {
                return meterInfo.Phases.ToDictionary(phase => phase.Name, StringComparer.OrdinalIgnoreCase);
            }

            private Dictionary<string, SeriesType> GetSeriesTypeLookup(MeterInfoDataContext meterInfo)
            {
                return meterInfo.SeriesTypes.ToDictionary(seriesType => seriesType.Name, StringComparer.OrdinalIgnoreCase);
            }
        }

        private static void Migrate(string connectionString, string deviceDefinitionsFile)
        {
            LookupTables lookupTables;

            MeterLocation meterLocation;
            MeterLocation remoteMeterLocation;

            Meter meter;
            Line line;
            Series series;
            Channel channel;

            XDocument document = XDocument.Load(deviceDefinitionsFile);
            List<XElement> deviceElements = document.Elements().Elements("device").ToList();
            XElement deviceAttributes;

            Dictionary<string, Channel> channelLookup;

            ProgressTracker progressTracker = new ProgressTracker(deviceElements.Count);

            using (MeterInfoDataContext meterInfo = new MeterInfoDataContext(connectionString))
            {
                // Load existing configuration from the database
                progressTracker.StartPendingMessage("Loading existing configuration from database...");
                lookupTables = new LookupTables(meterInfo);
                lookupTables.CreateLookups(document);
                progressTracker.EndPendingMessage();

                // Load updates to device configuration into the database
                progressTracker.WriteMessage($"Beginning migration of {deviceElements.Count} device configurations...");

                foreach (XElement deviceElement in deviceElements)
                {
                    // Get the element representing a device's attributes
                    deviceAttributes = deviceElement.Element("attributes") ?? new XElement("attributes");

                    // Attempt to find existing configuration for this device and update the meter with any changes to the device's attributes
                    meter = lookupTables.MeterLookup.GetOrAdd((string)deviceElement.Attribute("id"), assetKey => new Meter() { AssetKey = assetKey });
                    LoadMeterAttributes(meter, deviceAttributes);

                    // Now that we know what meter we are processing, display a message to indicate that we are parsing this meter's configuration
                    progressTracker.StartPendingMessage($"Loading configuration for meter {meter.Name} ({meter.AssetKey})...");

                    // Attempt to find existing configuration for the location of the meter and update with configuration changes
                    meterLocation = lookupTables.MeterLocationLookup.GetOrAdd((string)deviceAttributes.Element("stationID"), assetKey => new MeterLocation() { AssetKey = assetKey });
                    LoadMeterLocationAttributes(meterLocation, deviceAttributes);

                    // Link the meter location to the meter
                    meter.MeterLocation = meterLocation;

                    // Load updates to line configuration into the database
                    foreach (XElement lineElement in deviceElement.Elements("lines").Elements("line"))
                    {
                        // Attempt to find existing configuration for the line and update with configuration changes
                        line = lookupTables.LineLookup.GetOrAdd((string)lineElement.Attribute("id"), assetKey => new Line() { AssetKey = assetKey });
                        LoadLineAttributes(line, lineElement);

                        // Provide a link between this line and the location housing the meter
                        Link(meter, line, lineElement, lookupTables.MeterLineLookup);
                        Link(meterLocation, line, lookupTables.MeterLocationLineLookup);

                        if ((string)lineElement.Element("endStationID") != null)
                        {
                            // Attempt to find existing configuration for the location of the other end of the line and update with configuration changes
                            remoteMeterLocation = lookupTables.MeterLocationLookup.GetOrAdd((string)lineElement.Element("endStationID"), assetKey => new MeterLocation() { AssetKey = assetKey });
                            LoadRemoteMeterLocationAttributes(remoteMeterLocation, lineElement);

                            // Provide a link between this line and the remote location
                            Link(remoteMeterLocation, line, lookupTables.MeterLocationLineLookup);
                        }

                        // Get a lookup table for the channels monitoring this line
                        channelLookup = lookupTables.GetChannelLookup(meter, line);

                        foreach (string channelName in new[] { "VX1", "VX2", "VX3", "VY1", "VY2", "VY3", "I1", "I2", "I3" })
                        {
                            if (channelLookup.ContainsKey(channelName))
                                continue;

                            channel = new Channel();
                            series = new Series();
                            channelLookup.Add(channelName, channel);

                            // Load updates to channel configuration into the database
                            LoadChannelAttributes(meter, line, channel, channelName, lookupTables);
                            LoadSeriesAttributes(channel, series, lookupTables);
                        }
                    }

                    if (meter.ID == 0)
                        meterInfo.Meters.InsertOnSubmit(meter);

                    meterInfo.SubmitChanges();

                    progressTracker.EndPendingMessage();

                    // Increment the progress counter
                    progressTracker.MakeProgress();
                }
            }
        }

        private static void LoadMeterAttributes(Meter meter, XElement deviceAttributes)
        {
            string meterName = (string)deviceAttributes.Element("name") ?? (string)deviceAttributes.Element("stationName");

            if (meter.Name != meterName)
            {
                meter.Name = meterName;
                meter.ShortName = new string(meterName.Take(50).ToArray());
            }

            meter.Make = (string)deviceAttributes.Element("make") ?? string.Empty;
            meter.Model = (string)deviceAttributes.Element("make") ?? string.Empty;
        }

        private static void LoadMeterLocationAttributes(MeterLocation meterLocation, XElement deviceAttributes)
        {
            string meterLocationName = (string)deviceAttributes.Element("stationName");
            string latitude = (string)deviceAttributes.Element("stationLatitude");
            string longitude = (string)deviceAttributes.Element("stationLongitude");

            if (meterLocation.Name != meterLocationName)
            {
                meterLocation.Name = meterLocationName;
                meterLocation.ShortName = new string(meterLocationName.Take(50).ToArray());
            }

            if ((object)latitude != null)
                meterLocation.Latitude = Convert.ToDouble(latitude);

            if ((object)longitude != null)
                meterLocation.Longitude = Convert.ToDouble(longitude);
        }

        private static void LoadRemoteMeterLocationAttributes(MeterLocation meterLocation, XElement lineElement)
        {
            string meterLocationName = (string)lineElement.Element("endStationName");
            string latitude = (string)lineElement.Element("endStationLatitude");
            string longitude = (string)lineElement.Element("endStationLongitude");

            if (meterLocation.Name != meterLocationName)
            {
                meterLocation.Name = meterLocationName;
                meterLocation.ShortName = new string(meterLocationName.Take(50).ToArray());
            }

            if ((object)latitude != null)
                meterLocation.Latitude = Convert.ToDouble(latitude);

            if ((object)longitude != null)
                meterLocation.Longitude = Convert.ToDouble(longitude);
        }

        private static void LoadLineAttributes(Line line, XElement lineElement)
        {
            line.VoltageKV = Convert.ToDouble((string)lineElement.Element("voltage"));
            line.ThermalRating = Convert.ToDouble((string)lineElement.Element("rating50F") ?? "0.0");
            line.Length = Convert.ToDouble((string)lineElement.Element("length"));
        }

        private static MeterLine Link(Meter meter, Line line, XElement lineElement, Dictionary<Tuple<string, string>, MeterLine> meterLineLookup)
        {
            Tuple<string, string> key = Tuple.Create(meter.AssetKey, line.AssetKey);
            MeterLine meterLine;

            if (!meterLineLookup.TryGetValue(key, out meterLine))
            {
                meterLine = new MeterLine()
                {
                    Meter = meter,
                    Line = line,
                    LineName = (string)lineElement.Element("name")
                };

                meterLineLookup.Add(key, meterLine);
            }

            return meterLine;
        }

        private static MeterLocationLine Link(MeterLocation meterLocation, Line line, Dictionary<Tuple<string, string>, MeterLocationLine> meterLocationLineLookup)
        {
            Tuple<string, string> key = Tuple.Create(meterLocation.AssetKey, line.AssetKey);
            MeterLocationLine meterLocationLine;

            if (!meterLocationLineLookup.TryGetValue(key, out meterLocationLine))
            {
                meterLocationLine = new MeterLocationLine()
                {
                    MeterLocation = meterLocation,
                    Line = line
                };

                meterLocationLineLookup.Add(key, meterLocationLine);
            }

            return meterLocationLine;
        }

        private static void LoadChannelAttributes(Meter meter, Line line, Channel channel, string channelName, LookupTables lookupTables)
        {
            string measurementType = (channelName[0] == 'V') ? "Voltage" : "Current";
            string measurementCharacteristic = "Instantaneous";
            string phase = "General" + channelName.Last();

            channel.Name = channelName;
            channel.Description = channelName;
            channel.HarmonicGroup = 0;
            channel.MeasurementType = lookupTables.MeasurementTypeLookup.GetOrAdd(measurementType, name => new MeasurementType() { Name = name, Description = name });
            channel.MeasurementCharacteristic = lookupTables.MeasurementCharacteristicLookup.GetOrAdd(measurementCharacteristic, name => new MeasurementCharacteristic() { Name = name, Description = name });
            channel.Phase = lookupTables.PhaseLookup.GetOrAdd(phase, name => new Phase() { Name = name, Description = name });

            channel.Meter = meter;
            channel.Line = line;
        }

        private static void LoadSeriesAttributes(Channel channel, Series series, LookupTables lookupTables)
        {
            series.SeriesType = lookupTables.SeriesTypeLookup.GetOrAdd("Values", name => new SeriesType() { Name = name, Description = name });
            series.Channel = channel;
            series.SourceIndexes = string.Empty;
        }
    }
}
