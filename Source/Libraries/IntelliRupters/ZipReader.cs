//******************************************************************************************************
//  ZipReader.cs - Gbtc
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
using System.IO;
using System.IO.Compression;
using System.Linq;
using SOEDataProcessing.DataReaders;
using SOEDataProcessing.DataSets;
using GSF.Configuration;

namespace IntelliRupters
{
    /// <summary>
    /// Exctracts IntelliRupter data from zip files.
    /// </summary>
    public class ZipReader : IDataReader, IDisposable
    {
        #region [ Members ]

        // Fields
        private IntelliRupterSettings m_intelliRupterSettings;
        private Stream m_zipStream;
        private string m_zipFilePath;
        private string m_zipFileName;
        private bool m_disposed;

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new instance of the <see cref="ZipReader"/> class.
        /// </summary>
        public ZipReader()
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
            try
            {
                string sourcePath = m_intelliRupterSettings.WaveWinSourcePath;
                string archivePath = m_intelliRupterSettings.WaveWinArchivePath;

                // Ensure that the source path and archive path exist
                Directory.CreateDirectory(sourcePath);
                Directory.CreateDirectory(archivePath);

                // Ensure that the source path is empty
                if (Directory.EnumerateFiles(sourcePath).Any())
                    return false;

                // Ensure that the archive path is empty
                if (Directory.EnumerateFiles(archivePath).Any())
                    return false;

                // Attempt to open the zip file
                m_zipFilePath = filePath;
                m_zipFileName = Path.GetFileName(filePath);
                m_zipStream = File.OpenRead(filePath);

                return true;
            }
            catch (IOException)
            {
                return false;
            }
        }

        /// <summary>
        /// Parses the file, writing its contents to the folder for conversion by WaveWin.
        /// </summary>
        /// <param name="filePath">The path to the file to be parsed.</param>
        /// <returns>null</returns>
        public void Parse(string filePath)
        {
            DateTime creation;
            string fileName;

            string sourceDir;
            string archiveDir;
            string outFile;

            creation = File.GetCreationTimeUtc(filePath);
            sourceDir = m_intelliRupterSettings.WaveWinSourcePath;
            archiveDir = m_intelliRupterSettings.WaveWinArchivePath;

            using (ZipArchive archive = new ZipArchive(m_zipStream, ZipArchiveMode.Read))
            {
                foreach (ZipArchiveEntry entry in archive.Entries)
                {
                    // Get the file extension from the name of the zip archive entry
                    fileName = entry.Name;

                    // Only process entries with the wfc extension
                    if (!fileName.EndsWith(".wfc", StringComparison.OrdinalIgnoreCase))
                        continue;

                    // Generate a unique name for the file
                    outFile = $"{creation:yyyyMMddTHHmmss},{m_zipFileName},{fileName}";

                    // If the output file already exists in the source directory, skip the file
                    if (File.Exists(Path.Combine(sourceDir, outFile)))
                        continue;

                    // If the output file already exists in the archive directory, skip the file
                    if (File.Exists(Path.Combine(archiveDir, outFile)))
                        continue;

                    // Copy the data to the COMTRADE source directory
                    using (Stream inStream = entry.Open())
                    using (FileStream outStream = File.OpenWrite(Path.Combine(sourceDir, outFile)))
                    {
                        inStream.CopyTo(outStream);
                    }
                }
            }

            // Once the data has been extracted,
            // delete the zip file
            File.Delete(m_zipFilePath);
        }

        /// <summary>
        /// Releases all the resources used by the <see cref="ZipReader"/> object.
        /// </summary>
        public void Dispose()
        {
            if (!m_disposed)
            {
                try
                {
                    if ((object)m_zipStream != null)
                        m_zipStream.Dispose();
                }
                finally
                {
                    m_disposed = true;
                }
            }
        }

        #endregion
    }
}
