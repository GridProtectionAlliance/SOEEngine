//******************************************************************************************************
//  GeoJSONReader.cs - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  08/11/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************


using System;
using System.Configuration;
using System.IO;
using System.Linq;
using GSF.COMTRADE;
using GSF.IO;
using SOEDataProcessing.DataAnalysis;
using SOEDataProcessing.DataSets;
using log4net;
using SOE.Model;
using System.Collections.Generic;
using GSF.Data;
using GSF.Data.Model;
using System.Text;

namespace SOEDataProcessing.DataReaders
{
    /// <summary>
    /// Reads a json file to load GeoJSON data into the Circuit table.
    /// </summary>
    public class GeoJSONReader : IDataReader, IDisposable
    {
        #region [ Members ]

        // Fields
        private bool m_disposed;

        #endregion

        #region [ Constructors ]

        /// <summary>
        /// Creates a new instance of the <see cref="GeoJSONReader"/> class.
        /// </summary>
        public GeoJSONReader()
        {
            MeterDataSet = null;
        }

        #endregion

        #region [ Properties ]
        /// <summary>
        /// Gets the data set produced by the Parse method of the data reader.
        /// </summary>
        public MeterDataSet MeterDataSet { get; set; }

        #endregion

        #region [ Methods ]

        public bool CanParse(string filePath, DateTime fileCreationTime)
        {

            if ( !FilePath.TryGetReadLockExclusive(filePath))
                return false;

            return true;
        }

        public void Parse(string filePath)
        {
            using (AdoDataConnection connection = new AdoDataConnection("systemSettings")) {

                string circuitName = FilePath.GetFileNameWithoutExtension(filePath);
                Circuit circuit = new TableOperations<Circuit>(connection).QueryRecordWhere("Name = {0}", circuitName);

                if (circuit == null) return;

                string data = File.ReadAllText(filePath);

                circuit.GeoJSON = Encoding.UTF8.GetBytes(data);

                new TableOperations<Circuit>(connection).UpdateRecord(circuit);
            }
        }

        public void Dispose()
        {
            if (!m_disposed)
            {
                try
                {
                }
                finally
                {
                    m_disposed = true;
                }
            }
        }

        #endregion

        #region [ Static ]

        // Static Fields
        private static readonly ILog Log = LogManager.GetLogger(typeof(GeoJSONReader));

        #endregion
    }
}
