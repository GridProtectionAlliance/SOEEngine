//******************************************************************************************************
//  ComNamer.cs - Gbtc
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
//  01/21/2016 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.ComponentModel;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using SOEDataProcessing.DataReaders;
using SOEDataProcessing.DataSets;
using GSF.COMTRADE;
using GSF.Configuration;
using GSF.IO;
using log4net;

namespace IntelliRupters
{
    public class ComNamer : IDataReader
    {
        #region [ Members ]

        // Fields
        private IntelliRupterSettings m_intelliRupterSettings;
        private TimeSpan m_minWaitTime;
        private Schema m_schema;

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new instance of the <see cref="ComNamer"/> class.
        /// </summary>
        public ComNamer()
        {
            m_intelliRupterSettings = new IntelliRupterSettings();
        }

        #endregion

        #region [ Properties ]

        /// <summary>
        /// Gets the collection of settings for processing intellirupter data.
        /// </summary>
        [Category]
        [SettingName("IntelliRupters")]
        public IntelliRupterSettings IntelliRupterSettings
        {
            get
            {
                return m_intelliRupterSettings;
            }
        }

        [Setting]
        public double COMTRADEMinWaitTime
        {
            get
            {
                return m_minWaitTime.TotalSeconds;
            }
            set
            {
                m_minWaitTime = TimeSpan.FromSeconds(value);
            }
        }

        /// <summary>
        /// Returns null.
        /// </summary>
        public MeterDataSet MeterDataSet
        {
            get
            {
                return null;
            }
        }

        #endregion

        #region [ Methods ]

        /// <summary>
        /// Determines whether the file can be parsed at this time.
        /// </summary>
        /// <param name="filePath">The path to the file to be parsed.</param>
        /// <param name="fileCreationTime">The time the file was created.</param>
        /// <returns>True if the file can be parsed; false otherwise.</returns>
        public bool CanParse(string filePath, DateTime fileCreationTime)
        {
            string schemaFileName = Path.ChangeExtension(filePath, "cfg");
            string extension = FilePath.GetExtension(filePath);
            string[] fileList = FilePath.GetFileList(Path.ChangeExtension(filePath, "*"));
            bool multipleDataFiles = !extension.Equals(".dat", StringComparison.OrdinalIgnoreCase);

            string fileName = FilePath.GetFileName(filePath);
            string altDirectory = m_intelliRupterSettings.WaveWinArchivePath;
            string altFilePath = Path.Combine(altDirectory, fileName);
            string[] altFileList = FilePath.GetFileList(Path.ChangeExtension(altFilePath, "*"));

            if (!File.Exists(schemaFileName))
                return false;

            if (fileList.Any(file => !FilePath.TryGetReadLockExclusive(file)))
                return false;

            if (altFileList.Any(file => !FilePath.TryGetReadLockExclusive(file)))
                return false;

            if (multipleDataFiles && DateTime.UtcNow - fileCreationTime < m_minWaitTime)
                return false;

            try
            {
                m_schema = new Schema(schemaFileName);
            }
            catch (IOException)
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Renames all related files to ComName, and moves the files
        /// to their designated locations for archival and processing.
        /// </summary>
        /// <param name="filePath">The path to the file to be parsed.</param>
        /// <returns>null</returns>
        public void Parse(string filePath)
        {
            string now = $"{DateTime.UtcNow:yyyyMMdd}";

            string stationName = new string(m_schema.StationName.Take(14).ToArray());

            string comName = $"{m_schema.StartTime.Value:yyyyMMdd,HHmmssffffff},{m_intelliRupterSettings.ComNameTimecode}," +
                             $"{stationName},{m_schema.DeviceID},{m_intelliRupterSettings.ComNameCompany}," +
                             $"{m_intelliRupterSettings.ComNameUser1},{m_intelliRupterSettings.ComNameUser2}";

            string originalName = FilePath.GetFileNameWithoutExtension(Regex.Split(filePath, @"\.zip,").Last());
            
            string[] fileList = FilePath.GetFileList(Path.ChangeExtension(filePath, "*"));

            string fileName = FilePath.GetFileName(filePath);
            string altDirectory = m_intelliRupterSettings.WaveWinArchivePath;
            string altFilePath = Path.Combine(altDirectory, fileName);
            string[] altFileList = FilePath.GetFileList(Path.ChangeExtension(altFilePath, "*"));

            foreach (string file in fileList)
            {
                string extension = FilePath.GetExtension(file);
                string destinationFileName = m_intelliRupterSettings.UseComName ? $"{comName}{extension}" : $"{originalName}{extension}";
                string destinationDirectory = m_intelliRupterSettings.SOEDataFileDestinationPath;
                string destinationPath = Path.Combine(destinationDirectory, m_schema.DeviceID, destinationFileName);
                TryCopy(file, destinationPath);

                if (m_intelliRupterSettings.SOEDataFileArchiveExpiration != 0.0D)
                {
                    string archiveDirectory = m_intelliRupterSettings.SOEDataFileArchivePath;
                    string archivePath = Path.Combine(archiveDirectory, now, m_schema.DeviceID, destinationFileName);
                    TryCopy(file, archivePath);
                }

                TryDelete(file);
            }

            foreach (string file in altFileList)
            {
                if (m_intelliRupterSettings.SOESourceFileArchiveExpiration != 0.0D)
                {
                    string extension = FilePath.GetExtension(file);
                    string destinationFileName = m_intelliRupterSettings.UseComName ? $"{comName}{extension}" : $"{originalName}{extension}";
                    string archiveDirectory = m_intelliRupterSettings.SOESourceFileArchivePath;
                    string archivePath = Path.Combine(archiveDirectory, now, m_schema.DeviceID, destinationFileName);
                    TryCopy(file, archivePath);
                }

                TryDelete(file);
            }
        }

        private void TryCopy(string sourcePath, string destinationPath)
        {
            try
            {
                Directory.CreateDirectory(FilePath.GetDirectoryName(destinationPath));
                File.Copy(sourcePath, destinationPath);
            }
            catch (Exception ex)
            {
                string message = $"Failed to copy file \"{sourcePath}\" to destination \"{destinationPath}\" due to exception: {ex.Message}";
                Log.Error(message, new Exception(message, ex));
            }
        }

        private void TryDelete(string filePath)
        {
            try
            {
                File.Delete(filePath);
            }
            catch (Exception ex)
            {
                string message = $"Failed to delete file \"{filePath}\" due to exception: {ex.Message}";
                Log.Error(message, new Exception(message, ex));
            }
        }

        #endregion

        #region [ Static ]

        // Static Fields
        private static readonly ILog Log = LogManager.GetLogger(typeof(ComNamer));

        #endregion
    }
}
