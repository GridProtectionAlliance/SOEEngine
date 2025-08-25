using System;
using System.Data;
using GSF.Data;
using GSF.Data.Model;

namespace SOE.Model.Events
{
    public class SOELog
    {
        [PrimaryKey(true)]
        public int ID { get; set; }

        public int EventID { get; set; }
        public int ColorIndexID { get; set; }
        public string Circuit { get; set; }
        public string DeviceName { get; set; }
        public string ChannelName { get; set; }
        [FieldDataType(DbType.DateTime2, DatabaseType.SQLServer)]
        public DateTime SOETime { get; set; }
        public string SystemVoltage { get; set; }
        public int MeasurementNumber { get; set; }
        public int MeasurementSampleNumber { get; set; }
        [FieldDataType(DbType.DateTime2, DatabaseType.SQLServer)]
        public DateTime MeasurementTime { get; set; }
        public double MeasurementValue { get; set; }
        public string MeasurementColor { get; set; }
        public string PlotFileName { get; set; }
    }
}
