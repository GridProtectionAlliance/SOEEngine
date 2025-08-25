WITH SOELog1 AS
(
    SELECT
        EventID,
        ChannelName,
        CONCAT(Circuit, '-', DeviceName, '.', ChannelName) SensorName,
        MeasurementTime,
        ColorIndexID
    FROM SOELog
),
SOELog2 AS
(
    SELECT
        SOE.ID SOE_ID,
        SOELog.EventID,
        SOELog.ChannelName,
        SOELog.SensorName,
        SOE.StartTime SOETime,
        SOELog.MeasurementTime,
        SOELog.ColorIndexID
    FROM
        SOELog1 SOELog JOIN
        Event ON SOELog.EventID = Event.ID JOIN
        SOEIncident ON SOEIncident.IncidentID = Event.IncidentID JOIN
        SOE ON SOEIncident.SOEID = SOE.ID
),
Sensor AS
(
    SELECT DISTINCT
        SOE_ID,
        SensorName Name,
        ChannelName
    FROM SOELog2
),
SOETimeSlot AS
(
    SELECT
        SOE_ID,
        SOETime,
        DATEADD(MILLISECOND, -10, MIN(MeasurementTime)) MeasurementTime
    FROM SOELog2
    GROUP BY SOE_ID, SOETime
    UNION ALL

    SELECT
        SOE_ID,
        SOETime,
        DATEADD(MILLISECOND, 10, MAX(MeasurementTime)) MeasurementTime
    FROM SOELog2
    GROUP BY SOE_ID, SOETime
    UNION ALL
    
    SELECT DISTINCT
        SOE_ID,
        SOETime,
        MeasurementTime
    FROM SOELog2
),
SOELog3 AS
(
    SELECT
        SOETimeSlot.SOE_ID,
        COALESCE(SOELog.EventID, -1) EventID,
        Sensor.ChannelName,
        Sensor.Name SensorName,
        SOETimeSlot.SOETime,
        LAG(SOETimeSlot.MeasurementTime) OVER(PARTITION BY SOETimeSlot.SOE_ID ORDER BY SOETimeSlot.MeasurementTime) PreviousMeasurementTime,
        SOETimeSlot.MeasurementTime,
        COALESCE(SOELog.ColorIndexID, 0) ColorIndexID
    FROM
        Sensor JOIN
        SOETimeSlot ON Sensor.SOE_ID = SOETimeSlot.SOE_ID LEFT OUTER JOIN
        SOELog2 SOELog ON
            Sensor.Name = SOELog.SensorName AND
            SOETimeSlot.SOE_ID = SOELog.SOE_ID AND
            SOETimeSlot.MeasurementTime = SOELog.MeasurementTime
),
SOELog4 AS
(
    SELECT
        SOE_ID,
        EventID,
        ChannelName,
        SensorName,
        SOETime,
        MIN(PreviousMeasurementTime) OVER(PARTITION BY SOE_ID, MeasurementTime) PreviousMeasurementTime,
        MeasurementTime,
        ColorIndexID
    FROM SOELog3
)
INSERT INTO SOEDataPoint
(
    SOE_ID,
    TSx,
    TSxUnits,
    EventID,
    NLTDataTypeID,
    SensorTypeID,
    SensorName,
    SensorOrder,
    TimeSlot,
    Time,
    Value,
    ElapsMS,
    ElapsSEC,
    CycleNum,
    TimeGap,
    MapDisplay
)
SELECT
    SOE_ID,
    1 TSx,
    'mSec' TSxUnits,
    EventID,
    1 NLTDataTypeID,
    CASE WHEN ChannelName LIKE '%I123%'
        THEN 2
        ELSE 1
    END SensorTypeID,
    SensorName,
    DENSE_RANK() OVER(PARTITION BY SOE_ID ORDER BY SensorName) SensorOrder,
    DENSE_RANK() OVER(PARTITION BY SOE_ID ORDER BY MeasurementTime) TimeSlot,
    MeasurementTime Time,
    ColorIndexID Value,
    DATEDIFF(MILLISECOND, SOETime, MeasurementTime) ElapsMS,
    DATEDIFF(SECOND, SOETime, MeasurementTime) ElapsSEC,
    DATEDIFF(MILLISECOND, SOETime, MeasurementTime) * 60.0 / 1000.0 CycleNum,
    COALESCE(
        DATEDIFF(MILLISECOND, PreviousMeasurementTime, MeasurementTime),
        0) TimeGap,
    CASE WHEN ChannelName LIKE '%I123%'
        THEN 1
        ELSE 0
    END MapDisplay
FROM SOELog4
WHERE SOE_ID = {0}
ORDER BY TimeSlot, SensorOrder