//******************************************************************************************************
//  CycleData.cs - Gbtc
//
//  Copyright © 2017, Grid Protection Alliance.  All Rights Reserved.
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
//  06/23/2017 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using GSF.Data.Model;
using System;

namespace SOE.Model
{
    public class CycleData
    {
        [PrimaryKey(true)]
        public int ID { get; set; }

        public int EventID { get; set; }
        public int CycleNumber { get; set; }
        public int SampleNumber { get; set; }
        public DateTime Timestamp { get; set; }
        public double VX1RMS { get; set; }
        public double VX1Phase { get; set; }
        public double VX1Peak { get; set; }
        public double VX2RMS { get; set; }
        public double VX2Phase { get; set; }
        public double VX2Peak { get; set; }
        public double VX3RMS { get; set; }
        public double VX3Phase { get; set; }
        public double VX3Peak { get; set; }
        public double VY1RMS { get; set; }
        public double VY1Phase { get; set; }
        public double VY1Peak { get; set; }
        public double VY2RMS { get; set; }
        public double VY2Phase { get; set; }
        public double VY2Peak { get; set; }
        public double VY3RMS { get; set; }
        public double VY3Phase { get; set; }
        public double VY3Peak { get; set; }
        public double I1RMS { get; set; }
        public double I1Phase { get; set; }
        public double I1Peak { get; set; }
        public double I2RMS { get; set; }
        public double I2Phase { get; set; }
        public double I2Peak { get; set; }
        public double I3RMS { get; set; }
        public double I3Phase { get; set; }
        public double I3Peak { get; set; }
        public double IRRMS { get; set; }
        public double IRPhase { get; set; }
        public double IRPeak { get; set; }
    }

    public class RotatedCycleData
    {
        [PrimaryKey(true)]
        public int ID { get; set; }

        public int EventID { get; set; }
        public int CycleNumber { get; set; }
        public int SampleNumber { get; set; }
        public DateTime Timestamp { get; set; }
        public double VXARMS { get; set; }
        public double VXAPhase { get; set; }
        public double VXAPeak { get; set; }
        public double VXBRMS { get; set; }
        public double VXBPhase { get; set; }
        public double VXBPeak { get; set; }
        public double VXCRMS { get; set; }
        public double VXCPhase { get; set; }
        public double VXCPeak { get; set; }
        public double VYARMS { get; set; }
        public double VYAPhase { get; set; }
        public double VYAPeak { get; set; }
        public double VYBRMS { get; set; }
        public double VYBPhase { get; set; }
        public double VYBPeak { get; set; }
        public double VYCRMS { get; set; }
        public double VYCPhase { get; set; }
        public double VYCPeak { get; set; }
        public double IARMS { get; set; }
        public double IAPhase { get; set; }
        public double IAPeak { get; set; }
        public double IBRMS { get; set; }
        public double IBPhase { get; set; }
        public double IBPeak { get; set; }
        public double ICRMS { get; set; }
        public double ICPhase { get; set; }
        public double ICPeak { get; set; }
        public double IRRMS { get; set; }
        public double IRPhase { get; set; }
        public double IRPeak { get; set; }
    }


}
