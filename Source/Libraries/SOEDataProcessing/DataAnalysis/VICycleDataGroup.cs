//******************************************************************************************************
//  VICycleDataGroup.cs - Gbtc
//
//  Copyright © 2014, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the Eclipse Public License -v 1.0 (the "License", StringComparison.OrdinalIgnoreCase)); you may
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
using System.Collections.Generic;
using System.Linq;

namespace SOEDataProcessing.DataAnalysis
{
    public class VICycleDataGroup
    {
        #region [ Members ]

        // Fields
        private int m_vx1Index;
        private int m_vx2Index;
        private int m_vx3Index;
        private int m_vy1Index;
        private int m_vy2Index;
        private int m_vy3Index;
        private int m_i1Index;
        private int m_i2Index;
        private int m_i3Index;
        private int m_irIndex;

        private List<CycleDataGroup> m_cycleDataGroups;

        #endregion

        #region [ Constructors ]

        public VICycleDataGroup(DataGroup dataGroup)
        {
            m_cycleDataGroups = dataGroup.DataSeries
                .Select((series, i) => Tuple.Create(i / 4, series))
                .GroupBy(tuple => tuple.Item1)
                .Select(grouping => new DataGroup(grouping.Select(tuple => tuple.Item2)))
                .Select(group => new CycleDataGroup(group))
                .ToList();
        }

        public VICycleDataGroup(CycleDataGroup va, CycleDataGroup vb, CycleDataGroup vc, CycleDataGroup ia, CycleDataGroup ib, CycleDataGroup ic, CycleDataGroup ir)
        {
            m_cycleDataGroups = new List<CycleDataGroup>() { va, vb, vc, ia, ib, ic, ir };
        }

        public VICycleDataGroup(List<CycleDataGroup> cycleDataGroups)
        {
            for (int i = 0; i < cycleDataGroups.Count; i++)
            {
                if (cycleDataGroups[i].RMS.SeriesInfo.Channel.Name.StartsWith("VX1", StringComparison.OrdinalIgnoreCase))
                    m_vx1Index = i;
                else if (cycleDataGroups[i].RMS.SeriesInfo.Channel.Name.StartsWith("VX2", StringComparison.OrdinalIgnoreCase))
                    m_vx2Index = i;
                else if (cycleDataGroups[i].RMS.SeriesInfo.Channel.Name.StartsWith("VX3", StringComparison.OrdinalIgnoreCase))
                    m_vx3Index = i;
                else if (cycleDataGroups[i].RMS.SeriesInfo.Channel.Name.StartsWith("VY1", StringComparison.OrdinalIgnoreCase))
                    m_vy1Index = i;
                else if (cycleDataGroups[i].RMS.SeriesInfo.Channel.Name.StartsWith("VY2", StringComparison.OrdinalIgnoreCase))
                    m_vy2Index = i;
                else if (cycleDataGroups[i].RMS.SeriesInfo.Channel.Name.StartsWith("VY3", StringComparison.OrdinalIgnoreCase))
                    m_vy3Index = i;
                else if (cycleDataGroups[i].RMS.SeriesInfo.Channel.Name.StartsWith("I1", StringComparison.OrdinalIgnoreCase))
                    m_i1Index = i;
                else if (cycleDataGroups[i].RMS.SeriesInfo.Channel.Name.StartsWith("I2", StringComparison.OrdinalIgnoreCase))
                    m_i2Index = i;
                else if (cycleDataGroups[i].RMS.SeriesInfo.Channel.Name.StartsWith("I3", StringComparison.OrdinalIgnoreCase))
                    m_i3Index = i;
                else if (cycleDataGroups[i].RMS.SeriesInfo.Channel.Name.StartsWith("IR", StringComparison.OrdinalIgnoreCase))
                    m_irIndex = i;
            }

            m_cycleDataGroups = new List<CycleDataGroup>(cycleDataGroups);
        }

        #endregion

        #region [ Properties ]

        public CycleDataGroup VX1
        {
            get
            {
                return m_cycleDataGroups[m_vx1Index];
            }
        }

        public CycleDataGroup VX2
        {
            get
            {
                return m_cycleDataGroups[m_vx2Index];
            }
        }

        public CycleDataGroup VX3
        {
            get
            {
                return m_cycleDataGroups[m_vx3Index];
            }
        }

        public CycleDataGroup VY1
        {
            get
            {
                return m_cycleDataGroups[m_vy1Index];
            }
        }

        public CycleDataGroup VY2
        {
            get
            {
                return m_cycleDataGroups[m_vy2Index];
            }
        }

        public CycleDataGroup VY3
        {
            get
            {
                return m_cycleDataGroups[m_vy3Index];
            }
        }

        public CycleDataGroup I1
        {
            get
            {
                return m_cycleDataGroups[m_i1Index];
            }
        }

        public CycleDataGroup I2
        {
            get
            {
                return m_cycleDataGroups[m_i2Index];
            }
        }

        public CycleDataGroup I3
        {
            get
            {
                return m_cycleDataGroups[m_i3Index];
            }
        }

        public CycleDataGroup IR
        {
            get
            {
                return m_cycleDataGroups[m_irIndex];
            }
        }

        #endregion

        #region [ Methods ]

        public DataGroup ToDataGroup()
        {
            return Transform.Combine(m_cycleDataGroups
                .Select(cycleDataGroup => cycleDataGroup.ToDataGroup())
                .ToArray());
        }

        public VICycleDataGroup ToSubSet(int startIndex, int endIndex)
        {
            return new VICycleDataGroup(m_cycleDataGroups
                .Select(cycleDataGroup => cycleDataGroup.ToSubGroup(startIndex, endIndex))
                .ToList());
        }

        #endregion
    }
}
