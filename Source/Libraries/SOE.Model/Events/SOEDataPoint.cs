using GSF.Data.Model;
using System;

namespace SOE.Model.Events
{
    [TableName("SOEDataPoint")]
    public class SOEDataPoint
    {
        [PrimaryKey(true)]
        public int ID { get; set; }

        public int SOE_ID { get; set; }
        public int TSx { get; set; }
        public string TSxUnits { get; set; }
        public int EventID { get; set; }
        public int NLTDataTypeID { get; set; }
        public int SensorTypeID { get; set; }
        public string SensorName { get; set; }
        public int SensorOrder { get; set; }
        public int TimeSlot { get; set; }
        public DateTime Time { get; set; }
        public int Value { get; set; } //misleading name
        public int ElapsMS { get; set; }
        public int ElapsSEC { get; set;}
        public int CycleNum { get; set; }
        public int TimeGap { get; set; }
        public int MapDisplay { get; set; }
    }
}
