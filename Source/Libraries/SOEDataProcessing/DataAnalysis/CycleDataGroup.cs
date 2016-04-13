//******************************************************************************************************
//  CycleDataGroup.cs - Gbtc
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
//  08/29/2014 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using System.Linq;

namespace SOEDataProcessing.DataAnalysis
{
    public class CycleDataGroup
    {
        #region [ Members ]

        // Fields
        private DataGroup m_dataGroup;

        private int m_rmsIndex;
        private int m_phaseIndex;
        private int m_amplitudeIndex;
        private int m_errorIndex;

        #endregion

        #region [ Constructors ]

        public CycleDataGroup(DataGroup dataGroup)
        {
            string[] instantaneousSeriesTypes = { "Values", "Instantaneous" };

            m_rmsIndex = -1;
            m_phaseIndex = -1;
            m_amplitudeIndex = -1;
            m_errorIndex = -1;
            m_dataGroup = new DataGroup(dataGroup.DataSeries);

            for (int i = 0; i < dataGroup.DataSeries.Count; i++)
            {
                if (!instantaneousSeriesTypes.Contains(dataGroup[i].SeriesInfo.SeriesType.Name))
                    continue;

                if (dataGroup[i].SeriesInfo.Channel.MeasurementCharacteristic.Name == "RMS")
                    m_rmsIndex = i;
                else if (dataGroup[i].SeriesInfo.Channel.MeasurementCharacteristic.Name == "AngleFund")
                    m_phaseIndex = i;
                else if (dataGroup[i].SeriesInfo.Channel.MeasurementCharacteristic.Name == "WaveAmplitude")
                    m_amplitudeIndex = i;
                else if (dataGroup[i].SeriesInfo.Channel.MeasurementCharacteristic.Name == "WaveError")
                    m_errorIndex = i;
            }

            if (new int[] { m_rmsIndex, m_phaseIndex, m_amplitudeIndex, m_errorIndex }.Any(i => i < 0))
                throw new InvalidOperationException("Cannot create CycleDataGroup from an incomplete set of channels");
        }

        #endregion

        #region [ Properties ]

        public DataSeries RMS
        {
            get
            {
                return m_dataGroup[m_rmsIndex];
            }
        }

        public DataSeries Phase
        {
            get
            {
                return m_dataGroup[m_phaseIndex];
            }
        }

        public DataSeries Peak
        {
            get
            {
                return m_dataGroup[m_amplitudeIndex];
            }
        }

        public DataSeries Error
        {
            get
            {
                return m_dataGroup[m_errorIndex];
            }
        }

        #endregion

        #region [ Methods ]

        public DataGroup ToDataGroup()
        {
            return new DataGroup(m_dataGroup.DataSeries);
        }

        public CycleDataGroup ToSubGroup(int startIndex, int endIndex)
        {
            return new CycleDataGroup(m_dataGroup.ToSubGroup(startIndex, endIndex));
        }

        #endregion
    }
}
