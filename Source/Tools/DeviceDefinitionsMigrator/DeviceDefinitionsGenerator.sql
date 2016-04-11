SELECT
(
	SELECT
		AssemblyName AS [@assembly],
		TypeName + '.' + MethodName AS [@method]
	FROM FaultLocationAlgorithm
	FOR XML PATH('faultLocation'), TYPE
) AS [analytics],
(
	SELECT
		Meter.AssetKey AS [@id],
		Meter.Name AS [attributes/name],
		Meter.Make AS [attributes/make],
		Meter.Model AS [attributes/model],
		MeterLocation.AssetKey AS [attributes/stationID],
		MeterLocation.Name AS [attributes/stationName],
		CAST(MeterLocation.Latitude AS VARCHAR(10)) AS [attributes/stationLatitude],
		CAST(MeterLocation.Longitude AS VARCHAR(10)) AS [attributes/stationLongitude],
		(
			SELECT
				Line.AssetKey AS [@id],
				MeterLine.LineName AS name,
				CAST(Line.VoltageKV AS VARCHAR(10)) AS voltage,
				CAST(Line.Length AS VARCHAR(10)) AS length
			FROM
				MeterLocation Station JOIN
				MeterLocationLine StationLine ON StationLine.MeterLocationID = Station.ID JOIN
				Line ON StationLine.LineID = Line.ID JOIN
				MeterLine ON MeterLine.LineID = Line.ID
			WHERE
				Station.ID = MeterLocation.ID AND
				MeterLine.MeterID = Meter.ID
			FOR XML PATH('line'), TYPE
		) AS lines
	FROM
		Meter JOIN
		MeterLocation ON Meter.MeterLocationID = MeterLocation.ID
	FOR XML PATH('device'), TYPE
)
FOR XML PATH('openFLE')