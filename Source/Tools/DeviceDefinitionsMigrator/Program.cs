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
using GSF.Collections;
using SOE.Model;
using GSF.Data;
using GSF.Data.Model;
using Newtonsoft.Json;

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
                Console.Error.WriteLine(ex.InnerException.Message);
                Console.Error.WriteLine(ex.StackTrace);
                Console.Error.WriteLine(ex.ToString());

            }
        }

        private class LookupTables
        {
            public Dictionary<string, Meter> MeterLookup;
            public Dictionary<string, Line> LineLookup;
            public Dictionary<string, MeterLocation> MeterLocationLookup;
            public Dictionary<string, MeasurementType> MeasurementTypeLookup;
            public Dictionary<string, MeasurementCharacteristic> MeasurementCharacteristicLookup;
            public Dictionary<string, Phase> PhaseLookup;
            public Dictionary<string, SeriesType> SeriesTypeLookup;
            public Dictionary<string, Circuit> CircuitsLookup;
            public Dictionary<string, SystemTable> SystemsLookup;
            public Dictionary<string, SubStation> SubStationsLookup;

            public void CreateLookups(XDocument document, AdoDataConnection m_connection)
            {
                MeterLookup = (new TableOperations<Meter>(m_connection)).QueryRecords().ToDictionary(meter => meter.AssetKey, StringComparer.OrdinalIgnoreCase);
                LineLookup = (new TableOperations<Line>(m_connection)).QueryRecords().ToDictionary(line => line.AssetKey, StringComparer.OrdinalIgnoreCase);
                MeterLocationLookup = (new TableOperations<MeterLocation>(m_connection)).QueryRecords().ToDictionary(meterLocation => meterLocation.AssetKey, StringComparer.OrdinalIgnoreCase);
                MeasurementTypeLookup = (new TableOperations<MeasurementType>(m_connection)).QueryRecords().ToDictionary(measurementType => measurementType.Name, StringComparer.OrdinalIgnoreCase);
                MeasurementCharacteristicLookup = (new TableOperations<MeasurementCharacteristic>(m_connection)).QueryRecords().ToDictionary(measurementCharacteristic => measurementCharacteristic.Name, StringComparer.OrdinalIgnoreCase);
                PhaseLookup = (new TableOperations<Phase>(m_connection)).QueryRecords().ToDictionary(phase => phase.Name, StringComparer.OrdinalIgnoreCase);
                SeriesTypeLookup = (new TableOperations<SeriesType>(m_connection)).QueryRecords().ToDictionary(seriesType => seriesType.Name, StringComparer.OrdinalIgnoreCase);
                CircuitsLookup = (new TableOperations<Circuit>(m_connection)).QueryRecords().ToDictionary(circuit => circuit.Name, StringComparer.OrdinalIgnoreCase);
                SystemsLookup = (new TableOperations<SystemTable>(m_connection)).QueryRecords().ToDictionary(system => system.Name, StringComparer.OrdinalIgnoreCase);
                SubStationsLookup = (new TableOperations<SubStation>(m_connection)).QueryRecords().ToDictionary(system => system.Name, StringComparer.OrdinalIgnoreCase);

            }

            public Dictionary<string, Channel> GetChannelLookup(Meter meter, Line line, AdoDataConnection m_connection)
            {
                return (new TableOperations<Channel>(m_connection)).QueryRecordsWhere("MeterID = {0} AND LineID = {1}", meter.ID, line.ID).ToDictionary(channel => channel.Name);
            }

        }

        private static void Migrate(string connectionString, string deviceDefinitionsFile)
        {
            LookupTables lookupTables;

            MeterLocation remoteMeterLocation;

            Meter meter;
            Line line;
            Series series;
            Channel channel;

            XDocument document = XDocument.Load(deviceDefinitionsFile);
            Dictionary<string, XElement> deviceLookup = document.Elements().Elements("device").ToDictionary(device => (string)device.Attribute("id"));
            List<XElement> deviceElements;
            XElement deviceAttributes;

            Dictionary<string, Channel> channelLookup;

            ProgressTracker progressTracker = new ProgressTracker(deviceLookup.Count * 2);

            deviceElements = deviceLookup.Values.OrderBy(device =>
            {
                int count = 0;

                while (deviceLookup.TryGetValue((string)device.Element("parent") ?? string.Empty, out device))
                    count++;

                return count;
            }).ToList();

            using (AdoDataConnection connection = new AdoDataConnection(connectionString, "AssemblyName={System.Data, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089}; ConnectionType=System.Data.SqlClient.SqlConnection; AdapterType=System.Data.SqlClient.SqlDataAdapter"))
            {
                // Load existing configuration from the database
                progressTracker.StartPendingMessage("Loading existing configuration from database...");
                lookupTables = new LookupTables();
                lookupTables.CreateLookups(document, connection);
                progressTracker.EndPendingMessage();

                // Load updates to device configuration into the database
                progressTracker.WriteMessage($"Beginning migration of {deviceElements.Count} device configurations...");

                foreach (XElement deviceElement in deviceElements)
                {
                    // Get the element representing a device's attributes
                    deviceAttributes = deviceElement.Element("attributes") ?? new XElement("attributes");

                    // Attempt to find existing configuration for this device and update the meter with any changes to the device's attributes
                    meter = LoadMeterAttributes(lookupTables, deviceElement, deviceAttributes, connection);

                    // Now that we know what meter we are processing, display a message to indicate that we are parsing this meter's configuration
                    progressTracker.StartPendingMessage($"Loading configuration for meter {meter.Name} ({meter.AssetKey})...");

                    // Load updates to line configuration into the database
                    foreach (XElement lineElement in deviceElement.Elements("lines").Elements("line"))
                    {
                        // Attempt to find existing configuration for the line and update with configuration changes
                        line = LoadLineAttributes(lookupTables, lineElement, connection);

                        // Provide a link between this line and the location housing the meter
                        Link(meter.ID, line.ID, lineElement, connection);
                        Link(lookupTables.MeterLocationLookup.GetOrDefault((string)deviceAttributes.Element("stationID")).ID, line.ID, connection);

                        if ((string)lineElement.Element("endStationID") != null)
                        {
                            // Attempt to find existing configuration for the location of the other end of the line and update with configuration changes
                            remoteMeterLocation = LoadRemoteMeterLocationAttributes(lookupTables, lineElement, connection);

                            // Provide a link between this line and the remote location
                            Link(remoteMeterLocation.ID, line.ID, connection);
                        }

                        // Get a lookup table for the channels monitoring this line
                        channelLookup = lookupTables.GetChannelLookup(meter, line, connection);

                        foreach (XElement channelElement in lineElement.Elements("channels").Elements())
                        {
                            if (channelLookup.ContainsKey(channelElement.Name.LocalName))
                                continue;

                            channel = new Channel();
                            series = new Series();
                            channelLookup.Add(channelElement.Name.LocalName, channel);

                            // Load updates to channel configuration into the database
                            LoadChannelAttributes(meter, line, channel, channelElement.Name.LocalName, lookupTables, connection);
                            LoadSeriesAttributes(channel, channelElement, series, lookupTables, connection);
                        }
                    }

                    progressTracker.EndPendingMessage();

                    // Increment the progress counter
                    progressTracker.MakeProgress();
                }

                foreach (XElement deviceElement in deviceElements)
                {
                    // Get the element representing a device's attributes
                    deviceAttributes = deviceElement.Element("attributes") ?? new XElement("attributes");

                    meter = lookupTables.MeterLookup.GetOrDefault((string)deviceElement.Attribute("id"));

                    if ((string)deviceAttributes.Element("parentNormal") != null && lookupTables.MeterLookup.ContainsKey((string)deviceAttributes.Element("parentNormal")))
                        meter.ParentNormalID = lookupTables.MeterLookup.GetOrDefault((string)deviceAttributes.Element("parentNormal")).ID;

                    if ((string)deviceAttributes.Element("parentAlternate") != null && (string)deviceAttributes.Element("parentAlternate") != "none" && lookupTables.MeterLookup.ContainsKey((string)deviceAttributes.Element("parentAlternate")))
                        meter.ParentAlternateID = lookupTables.MeterLookup.GetOrDefault((string)deviceAttributes.Element("parentAlternate")).ID;

                    (new TableOperations<Meter>(connection)).UpdateRecord(meter);

                    // Now that we know what meter we are processing, display a message to indicate that we are parsing this meter's configuration
                    progressTracker.StartPendingMessage($"Loading parent configuration for meter {meter.Name} ({meter.AssetKey})...");


                    progressTracker.EndPendingMessage();

                    // Increment the progress counter
                    progressTracker.MakeProgress();
                }

            }
        }

        private static Meter LoadMeterAttributes(LookupTables lookupTables,XElement deviceElement, XElement deviceAttributes, AdoDataConnection connection)
        {
            Meter meter = new Meter {
                Name = (string)deviceAttributes.Element("name") ?? (string)deviceAttributes.Element("stationName"),
                AssetKey = (string)deviceElement.Attribute("id"),
                Make = (string)deviceAttributes.Element("make") ?? string.Empty,
                Model = (string)deviceAttributes.Element("model") ?? string.Empty,
                Phasing = (string)deviceAttributes.Element("phaseLabels") ?? string.Empty,
                Orientation = (((string)deviceAttributes.Element("orientation")).ToLower() != "none"? (string)deviceAttributes.Element("orientation"): string.Empty) ?? string.Empty,
                MeterLocationID = LoadMeterLocationAttributes(lookupTables,deviceAttributes, connection)
            };

            List<string> listOfNames = new List<string> { "name", "id", "make", "model", "phaseLabels", "orientation", "circuit", "subStation", "parentNormal", "parentAlternate", "stationID", "stationName", "stationLatitude", "stationLongitude" };
            meter.ExtraData = JsonConvert.SerializeObject(deviceAttributes.Elements().Where(x => !listOfNames.Contains(x.Name.LocalName)).ToDictionary(x => x.Name.LocalName, x => x.Value));

            if ((string)deviceAttributes.Element("circuit") != null)
                meter.CircuitID = GetOrAddCircuit((string)deviceAttributes.Element("circuit"), deviceElement, lookupTables, connection);

            if ((string)deviceAttributes.Element("subStation") != null)
                meter.SubStationID = GetOrAddSubStation((string)deviceAttributes.Element("subStation"), lookupTables, connection);

            if (lookupTables.MeterLookup.ContainsKey(meter.AssetKey))
            {
                meter.ID = lookupTables.MeterLookup[meter.AssetKey].ID;
                (new TableOperations<Meter>(connection)).UpdateRecord(meter);
            }
            else
            {
                (new TableOperations<Meter>(connection)).AddNewRecord(meter);
                meter.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.MeterLookup.Add(meter.AssetKey, meter);
            }

            return meter;
        }

        private static int LoadMeterLocationAttributes(LookupTables lookupTables, XElement deviceAttributes, AdoDataConnection connection)
        {
            MeterLocation meterLocation = new MeterLocation {
                Name = (string)deviceAttributes.Element("stationName"),
                AssetKey = (string)deviceAttributes.Element("stationID"),
                ShortName = new string(((string)deviceAttributes.Element("stationName")).Take(50).ToArray()),
                Latitude = double.Parse((string)deviceAttributes.Element("stationLatitude") ?? "0"),
                Longitude = double.Parse((string)deviceAttributes.Element("stationLongitude") ?? "0")
            };

            if (lookupTables.MeterLocationLookup.ContainsKey(meterLocation.AssetKey))
            {
                meterLocation.ID = lookupTables.MeterLocationLookup[meterLocation.AssetKey].ID;
                (new TableOperations<MeterLocation>(connection)).UpdateRecord(meterLocation);
            }
            else {
                (new TableOperations<MeterLocation>(connection)).AddNewRecord(meterLocation);
                meterLocation.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.MeterLocationLookup.Add(meterLocation.AssetKey, meterLocation);
            }

            return meterLocation.ID;
        }

        private static MeterLocation LoadRemoteMeterLocationAttributes(LookupTables lookupTables, XElement lineElement, AdoDataConnection connection)
        {
            MeterLocation meterLocation = new MeterLocation {
                Name = (string)lineElement.Element("endStationName"),
                ShortName = new string(((string)lineElement.Element("endStationName")).Take(50).ToArray()),
                AssetKey = (string)lineElement.Element("endStationID"),
                Latitude = double.Parse((string)lineElement.Element("endStationLatitude") ?? "0"),
                Longitude = double.Parse((string)lineElement.Element("endStationLongitude") ?? "0")
            };

            if (lookupTables.MeterLocationLookup.ContainsKey(meterLocation.AssetKey))
            {
                meterLocation.ID = lookupTables.MeterLocationLookup[meterLocation.AssetKey].ID;
                (new TableOperations<MeterLocation>(connection)).UpdateRecord(meterLocation);
            }
            else
            {
                (new TableOperations<MeterLocation>(connection)).AddNewRecord(meterLocation);
                meterLocation.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.MeterLocationLookup.Add(meterLocation.AssetKey, meterLocation);
            }

            return meterLocation;
        }

        private static Line LoadLineAttributes(LookupTables lookupTables, XElement lineElement, AdoDataConnection connection)
        {
            Line line = new Line
            {
                AssetKey = (string)lineElement.Attribute("id"),
                VoltageKV = Convert.ToDouble((string)lineElement.Element("voltage")),
                ThermalRating = Convert.ToDouble((string)lineElement.Element("rating50F") ?? "0.0"),
                Length = Convert.ToDouble((string)lineElement.Element("length")),
                AFCLG = Convert.ToDouble((string)lineElement.Element("AFCLG") ?? "0.0"),
                AFCLL = Convert.ToDouble((string)lineElement.Element("AFCLL") ?? "0.0"),
                AFCLLL = Convert.ToDouble((string)lineElement.Element("AFCLLL") ?? "0.0"),
            };

            if (lookupTables.LineLookup.ContainsKey(line.AssetKey)){
                line.ID = lookupTables.LineLookup[line.AssetKey].ID;
                (new TableOperations<Line>(connection)).UpdateRecord(line);
            }
            else {
                (new TableOperations<Line>(connection)).AddNewRecord(line);
                line.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.LineLookup.Add(line.AssetKey, line);
            }

            return line; 

        }

        private static void Link(int meterID, int lineID, XElement lineElement, AdoDataConnection connection)
        {
            TableOperations<MeterLine> table = new TableOperations<MeterLine>(connection);

            MeterLine record = table.QueryRecordWhere("MeterID = {0} AND LineID = {1}", meterID, lineID);

            if (record == null)
            {
                record = new MeterLine()
                {
                    MeterID = meterID,
                    LineID = lineID,
                    LineName = (string)lineElement.Element("name")
                };

                table.AddNewRecord(record);
            }
            else {
                record.LineName = (string)lineElement.Element("name");
                table.UpdateRecord(record);
            }
        }

        private static void Link(int meterLocationID, int lineID, AdoDataConnection connection)
        {
            TableOperations<MeterLocationLine> table = new TableOperations<MeterLocationLine>(connection);

            MeterLocationLine record = table.QueryRecordWhere("MeterLocationID = {0} AND LineID = {1}", meterLocationID, lineID);


            if (record == null)
            {
                MeterLocationLine meterLocationLine = new MeterLocationLine()
                {
                    MeterLocationID = meterLocationID,
                    LineID = lineID
                };

                table.AddNewRecord(meterLocationLine);
            }
        }

        private static void LoadChannelAttributes(Meter meter, Line line, Channel channel, string channelName, LookupTables lookupTables, AdoDataConnection connection)
        {
            string measurementType = (channelName[0] == 'V') ? "Voltage" : "Current";
            string measurementCharacteristic = "Instantaneous";
            string phase = "";
            
            if (channelName.Contains("1") || channelName.Contains("2") || channelName.Contains("3"))
                phase = "General" + channelName.Last();
            else if(channelName.Contains("A")|| channelName.Contains("B")|| channelName.Contains("C"))
                phase = channelName.Last() + "N";
            else
                phase = channelName;

            channel.Name = channelName;
            channel.Description = channelName;
            channel.HarmonicGroup = 0;
            channel.MeasurementTypeID = GetOrAddMeasurementType(measurementType, lookupTables, connection);
            channel.MeasurementCharacteristicID = GetOrAddMeasurementCharacteristic(measurementCharacteristic, lookupTables, connection);
            channel.PhaseID = GetOrAddPhase(phase, lookupTables, connection);

            channel.MeterID = meter.ID;
            channel.LineID = line.ID;

            (new TableOperations<Channel>(connection)).AddNewRecord(channel);
            channel.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");

        }

        private static void LoadSeriesAttributes(Channel channel, XElement channelElement, Series series, LookupTables lookupTables, AdoDataConnection connection)
        {
            series.SeriesTypeID = GetOrAddSeriesType(lookupTables, connection);
            series.ChannelID = channel.ID;
            series.SourceIndexes = channelElement.Value;

            (new TableOperations<Series>(connection)).AddNewRecord(series);

        }

        private static int GetOrAddCircuit(string name, XElement deviceElement, LookupTables lookupTables, AdoDataConnection connection)
        {
            Circuit circuit = new Circuit {
                Name = name,
                SystemID = GetOrAddSystem((string)deviceElement.Element("lines").Elements("line").First().Element("voltage"), lookupTables, connection),
                GeoJSON = null
            };

            if (lookupTables.CircuitsLookup.ContainsKey(name))
            {
                circuit.ID = lookupTables.CircuitsLookup[name].ID;
                //(new TableOperations<Circuit>(connection)).UpdateRecord(circuit);
                connection.ExecuteNonQuery("UPDATE Circuit SET Name= {0} WHERE ID = {1}", circuit.Name, circuit.ID);
                connection.ExecuteNonQuery("UPDATE Circuit SET SystemID = {0} WHERE ID = {1}", circuit.SystemID, circuit.ID);

            }
            else
            {
                connection.ExecuteNonQuery("INSERT INTO Circuit (Name, SystemID) VALUES ({0}, {1})", circuit.Name, circuit.SystemID);
                circuit.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.CircuitsLookup.Add(name,circuit);
            }

            return circuit.ID;
        }

        private static int GetOrAddSystem(string name, LookupTables lookupTables, AdoDataConnection connection) {
            SystemTable system = new SystemTable
            {
                Name = name,
            };

            if (lookupTables.SystemsLookup.ContainsKey(name))
            {
                system.ID = lookupTables.SystemsLookup[name].ID;
                (new TableOperations<SystemTable>(connection)).UpdateRecord(system);
            }
            else
            {
                (new TableOperations<SystemTable>(connection)).AddNewRecord(system);
                system.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.SystemsLookup.Add(name, system);
            }

            return system.ID;
        }

        private static int GetOrAddSubStation(string name, LookupTables lookupTables, AdoDataConnection connection)
        {
            SubStation station = new SubStation
            {
                Name = name,
            };

            if (lookupTables.SubStationsLookup.ContainsKey(name))
            {
                station.ID = lookupTables.SubStationsLookup[name].ID;
                (new TableOperations<SubStation>(connection)).UpdateRecord(station);
            }
            else
            {
                (new TableOperations<SubStation>(connection)).AddNewRecord(station);
                station.ID = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.SubStationsLookup.Add(name, station);
            }

            return station.ID;
        }

        private static int GetOrAddSeriesType(LookupTables lookupTables, AdoDataConnection connection)
        {
            if (lookupTables.SeriesTypeLookup.ContainsKey("Values"))
                return lookupTables.SeriesTypeLookup["Values"].ID;
            else
            {
                (new TableOperations<SeriesType>(connection)).AddNewRecord(new SeriesType() { Name = "Values", Description = "Values" });
                int id = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.SeriesTypeLookup.Add("Values", new SeriesType() { ID = id, Name = "Values", Description = "Values" });
                return id;
            }
        }

        private static int GetOrAddMeasurementType(string measurementType, LookupTables lookupTables, AdoDataConnection connection) {
            if (lookupTables.MeasurementTypeLookup.ContainsKey(measurementType))
                return lookupTables.MeasurementTypeLookup[measurementType].ID;
            else
            {
                (new TableOperations<MeasurementType>(connection)).AddNewRecord(new MeasurementType() { Name = measurementType, Description = measurementType });
                int id = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.MeasurementTypeLookup.Add(measurementType, new MeasurementType() { ID = id, Name = measurementType, Description = measurementType });
                return id;
            }
        }

        private static int GetOrAddMeasurementCharacteristic(string measurementCharacteristic, LookupTables lookupTables, AdoDataConnection connection)
        {
            if (lookupTables.MeasurementCharacteristicLookup.ContainsKey(measurementCharacteristic))
                return lookupTables.MeasurementCharacteristicLookup[measurementCharacteristic].ID;
            else
            {
                (new TableOperations<MeasurementCharacteristic>(connection)).AddNewRecord(new MeasurementCharacteristic() { Name = measurementCharacteristic, Description = measurementCharacteristic });
                int id = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.MeasurementCharacteristicLookup.Add(measurementCharacteristic, new MeasurementCharacteristic() { ID = id, Name = measurementCharacteristic, Description = measurementCharacteristic });
                return id;
            }
        }

        private static int GetOrAddPhase(string phase, LookupTables lookupTables, AdoDataConnection connection)
        {
            if (lookupTables.PhaseLookup.ContainsKey(phase))
                return lookupTables.PhaseLookup[phase].ID;
            else
            {
                (new TableOperations<Phase>(connection)).AddNewRecord(new Phase() { Name = phase, Description = phase });
                int id = connection.ExecuteScalar<int>("SELECT @@IDENTITY");
                lookupTables.PhaseLookup.Add(phase, new Phase() { ID = id, Name = phase, Description = phase });
                return id;
            }
        }

    }
}
