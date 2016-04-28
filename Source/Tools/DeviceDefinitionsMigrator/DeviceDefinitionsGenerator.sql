; WITH Device AS
(
	SELECT
		Meter.ID,
		Meter.AssetKey,
		Meter.Make AS Make,
		Meter.Model AS Model,
		MeterLocation.AssetKey AS MeterLocationKey,
		MeterLocation.Name AS MeterLocationName,
		Meter.Phasing,
		Meter.Orientation,
		CAST(NULL AS VARCHAR(50)) AS Parent,
		Line.AssetKey AS LineKey,
		MeterLine.LineName,
		Line.VoltageKV AS LineVoltage,
		Line.Length AS LineLength,
		0 AS Level
	FROM
		Meter JOIN
		MeterLocation ON Meter.MeterLocationID = MeterLocation.ID JOIN
		MeterLine ON MeterLine.MeterID = Meter.ID JOIN
		Line ON MeterLine.LineID = Line.ID
	WHERE Meter.ParentID IS NULL
	UNION ALL
	SELECT
		Meter.ID AS MeterID,
		Meter.AssetKey AS MeterKey,
		Meter.Make AS Make,
		Meter.Model AS Model,
		MeterLocation.AssetKey AS MeterLocationKey,
		MeterLocation.Name AS MeterLocationName,
		Meter.Phasing,
		Meter.Orientation,
		Parent.AssetKey AS Parent,
		Line.AssetKey AS LineKey,
		MeterLine.LineName,
		Line.VoltageKV AS LineVoltage,
		Line.Length AS LineLength,
		Parent.Level + 1 AS Level
	FROM
		Meter JOIN
		Device Parent ON Meter.ParentID = Parent.ID JOIN
		MeterLocation ON Meter.MeterLocationID = MeterLocation.ID JOIN
		MeterLine ON MeterLine.MeterID = Meter.ID JOIN
		Line ON MeterLine.LineID = Line.ID
)
SELECT
	AssetKey AS [@id],
	Make AS [attributes/make],
	Model AS [attributes/model],
	MeterLocationKey AS [attributes/stationID],
	MeterLocationName AS [attributes/stationName],
	Phasing AS [attributes/phasing],
	Orientation AS [attributes/orientation],
	CAST(CASE WHEN Parent IS NOT NULL THEN '<parent>' + Parent + '</parent>' ELSE '' END AS XML) AS [attributes],
	LineKey AS [lines/line/@id],
	LineName AS [lines/line/name],
	CONVERT(DECIMAL(9,1), LineVoltage) AS [lines/line/voltage],
	CONVERT(DECIMAL(9,2), LineLength) AS [lines/line/length]
FROM Device
ORDER BY Level
FOR XML PATH('device')