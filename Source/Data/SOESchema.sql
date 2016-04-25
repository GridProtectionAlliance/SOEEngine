-- The following commented statements are used to create a database
-- from scratch and create a new user with access to the database.
-- 
--  * To change the database name, replace all [SOEdb] with the desired database name.
--  * To change the username, replace all NewUser with the desired username.
--  * To change the password, replace all MyPassword with the desired password.

--USE [master]
--GO
--CREATE DATABASE [SOEdb]
--GO
--USE [SOEdb]
--GO

--USE [master]
--GO
--IF  NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = N'NewUser')
--CREATE LOGIN [NewUser] WITH PASSWORD=N'MyPassword', DEFAULT_DATABASE=[master], CHECK_EXPIRATION=OFF, CHECK_POLICY=OFF
--GO
--USE [SOEdb]
--GO
--CREATE USER [NewUser] FOR LOGIN [NewUser]
--GO
--CREATE ROLE [SOERole] AUTHORIZATION [dbo]
--GO
--EXEC sp_addrolemember N'SOEAdmin', N'NewUser'
--GO
--EXEC sp_addrolemember N'db_datareader', N'SOEAdmin'
--GO
--EXEC sp_addrolemember N'db_datawriter', N'SOEAdmin'
--GO

----- TABLES -----

CREATE TABLE Setting
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    Value VARCHAR(MAX) NOT NULL
)
GO

CREATE TABLE ConfigurationLoader
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    AssemblyName VARCHAR(200) NOT NULL,
    TypeName VARCHAR(200) NOT NULL,
    LoadOrder INT NOT NULL
)
GO

CREATE TABLE DataReader
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    FilePattern VARCHAR(500) NOT NULL,
    AssemblyName VARCHAR(200) NOT NULL,
    TypeName VARCHAR(200) NOT NULL,
    LoadOrder INT NOT NULL
)
GO

CREATE TABLE DataOperation
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    AssemblyName VARCHAR(200) NOT NULL,
    TypeName VARCHAR(200) NOT NULL,
    LoadOrder INT NOT NULL
)
GO

CREATE TABLE DataWriter
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    AssemblyName VARCHAR(200) NOT NULL,
    TypeName VARCHAR(200) NOT NULL,
    LoadOrder INT NOT NULL
)
GO

CREATE TABLE FileGroup
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    DataStartTime DATETIME2 NOT NULL,
    DataEndTime DATETIME2 NOT NULL,
    ProcessingStartTime DATETIME2 NOT NULL,
    ProcessingEndTime DATETIME2 NOT NULL,
    Error INT NOT NULL DEFAULT 0
)
GO

CREATE TABLE DataFile
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    FileGroupID INT NOT NULL REFERENCES FileGroup(ID),
    FilePath VARCHAR(MAX) NOT NULL,
    FilePathHash INT NOT NULL,
    FileSize BIGINT NOT NULL,
    CreationTime DATETIME NOT NULL,
    LastWriteTime DATETIME NOT NULL,
    LastAccessTime DATETIME NOT NULL
)
GO

CREATE NONCLUSTERED INDEX IX_DataFile_FileGroupID
ON DataFile(FileGroupID ASC)
GO

CREATE NONCLUSTERED INDEX IX_DataFile_FilePathHash
ON DataFile(FilePathHash ASC)
GO

CREATE TABLE MeterLocation
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    AssetKey VARCHAR(50) NOT NULL UNIQUE,
    Name VARCHAR(200) NOT NULL,
    Alias VARCHAR(200) NULL,
    ShortName VARCHAR(50) NULL,
    Latitude FLOAT NOT NULL DEFAULT 0.0,
    Longitude FLOAT NOT NULL DEFAULT 0.0,
    Description VARCHAR(MAX) NULL
)
GO

CREATE TABLE Meter
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    AssetKey VARCHAR(50) NOT NULL UNIQUE,
    MeterLocationID INT NOT NULL REFERENCES MeterLocation(ID),
    ParentID INT NULL REFERENCES Meter(ID),
    Name VARCHAR(200) NOT NULL,
    Alias VARCHAR(200) NULL,
    ShortName VARCHAR(50) NULL,
    Make VARCHAR(200) NOT NULL,
    Model VARCHAR(200) NOT NULL,
    TimeZone VARCHAR(200) NULL,
    Description VARCHAR(MAX) NULL,
    Phasing CHAR(3) NULL,
    Orientation CHAR(2) NULL
)
GO

CREATE TABLE MeterFileGroup
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    MeterID INT NOT NULL REFERENCES Meter(ID),
    FileGroupID INT NOT NULL REFERENCES FileGroup(ID)
)
GO

CREATE TABLE MeterFacility
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    MeterID INT NOT NULL REFERENCES Meter(ID),
    FacilityID INT NOT NULL
)
GO

CREATE TABLE Line
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    AssetKey VARCHAR(50) NOT NULL UNIQUE,
    VoltageKV FLOAT NOT NULL,
    ThermalRating FLOAT NOT NULL,
    Length FLOAT NOT NULL,
    Description VARCHAR(MAX) NULL
)
GO

CREATE TABLE Structure
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    AssetKey VARCHAR(50) NOT NULL UNIQUE,
    LineID INT NOT NULL REFERENCES Line(ID),
    Latitude FLOAT NOT NULL DEFAULT 0.0,
    Longitude FLOAT NOT NULL DEFAULT 0.0
)
GO

CREATE TABLE MeterLine
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    MeterID INT NOT NULL REFERENCES Meter(ID),
    LineID INT NOT NULL REFERENCES Line(ID),
    LineName VARCHAR(200) NOT NULL
)
GO

CREATE TABLE MeterLocationLine
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    MeterLocationID INT NOT NULL REFERENCES MeterLocation(ID),
    LineID INT NOT NULL REFERENCES Line(ID)
)
GO

CREATE TABLE MeasurementType
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL UNIQUE,
    Description VARCHAR(MAX) NULL
)
GO

CREATE TABLE MeasurementCharacteristic
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL UNIQUE,
    Description VARCHAR(MAX) NULL,
    Display BIT NOT NULL DEFAULT 0
)
GO

CREATE TABLE Phase
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL UNIQUE,
    Description VARCHAR(MAX) NULL
)
GO

CREATE TABLE Channel
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    MeterID INT NOT NULL REFERENCES Meter(ID),
    LineID INT NOT NULL REFERENCES Line(ID),
    MeasurementTypeID INT NOT NULL REFERENCES MeasurementType(ID),
    MeasurementCharacteristicID INT NOT NULL REFERENCES MeasurementCharacteristic(ID),
    PhaseID INT NOT NULL REFERENCES Phase(ID),
    Name VARCHAR(200) NOT NULL,
    SamplesPerHour FLOAT NOT NULL,
    PerUnitValue FLOAT NULL,
    HarmonicGroup INT NOT NULL DEFAULT 0,
    Description VARCHAR(MAX) NULL,
    Enabled INT NOT NULL DEFAULT 1
)
GO

CREATE NONCLUSTERED INDEX IX_Channel_MeterID
ON Channel(MeterID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Channel_LineID
ON Channel(LineID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Channel_MeasurementTypeID
ON Channel(MeasurementTypeID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Channel_MeasurementCharacteristicID
ON Channel(MeasurementCharacteristicID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Channel_PhaseID
ON Channel(PhaseID ASC)
GO

CREATE TABLE SeriesType
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL UNIQUE,
    Description VARCHAR(MAX) NULL
)
GO

CREATE TABLE Series
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    ChannelID INT NOT NULL REFERENCES Channel(ID),
    SeriesTypeID INT NOT NULL REFERENCES SeriesType(ID),
    SourceIndexes VARCHAR(200) NOT NULL
)
GO

CREATE TABLE BreakerChannel
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    ChannelID INT NOT NULL REFERENCES Channel(ID),
    BreakerNumber VARCHAR(120) NOT NULL
)
GO

CREATE TABLE [Group]
(
    ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    GroupName NVARCHAR(100) NOT NULL,
    Active BIT NOT NULL
)
GO

CREATE TABLE GroupMeter
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    GroupID INT NOT NULL REFERENCES [Group](ID),
    MeterID INT NOT NULL REFERENCES Meter(ID)
)
GO

CREATE TABLE [User]
(
    ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Active BIT NOT NULL,
)
GO

CREATE TABLE UserGroup
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    UserID INT NOT NULL REFERENCES [User](ID),
    GroupID INT NOT NULL REFERENCES [Group](ID)
)
GO

CREATE TABLE Recipient
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(200) NOT NULL
)
GO

INSERT INTO DataReader(FilePattern, AssemblyName, TypeName, LoadOrder) VALUES('**\IntelliRupters\*.zip', 'IntelliRupters.dll', 'IntelliRupters.ZipReader', 1)
GO

INSERT INTO DataReader(FilePattern, AssemblyName, TypeName, LoadOrder) VALUES('**\IntelliRupters\COMTRADE\*.dat', 'IntelliRupters.dll', 'IntelliRupters.ComNamer', 2)
GO

INSERT INTO DataReader(FilePattern, AssemblyName, TypeName, LoadOrder) VALUES('**\IntelliRupters\COMTRADE\*.d00', 'IntelliRupters.dll', 'IntelliRupters.ComNamer', 2)
GO

INSERT INTO DataReader(FilePattern, AssemblyName, TypeName, LoadOrder) VALUES('**\*.dat', 'SOEDataProcessing.dll', 'SOEDataProcessing.DataReaders.COMTRADEReader', 3)
GO

INSERT INTO DataReader(FilePattern, AssemblyName, TypeName, LoadOrder) VALUES('**\*.d00', 'SOEDataProcessing.dll', 'SOEDataProcessing.DataReaders.COMTRADEReader', 3)
GO

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.ConfigurationOperation', 1)
GO

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.EventOperation', 2)
GO

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.SOEOperation', 3)
GO

-- ------ --
-- Events --
-- ------ --

-- EventData references the IDs in other tables,
-- but no foreign key constraints are defined.
-- If they were defined, the records in this
-- table would need to be deleted before we
-- could delete records in the referenced table.
CREATE TABLE EventData
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    FileGroupID INT NOT NULL,
    RuntimeID INT NOT NULL,
    TimeDomainData VARBINARY(MAX) NOT NULL,
    FrequencyDomainData VARBINARY(MAX) NOT NULL,
    MarkedForDeletion INT NOT NULL
)
GO

CREATE NONCLUSTERED INDEX IX_EventData_FileGroupID
ON EventData(FileGroupID ASC)
GO

CREATE NONCLUSTERED INDEX IX_EventData_RuntimeID
ON EventData(RuntimeID ASC)
GO

CREATE NONCLUSTERED INDEX IX_EventData_MarkedForDeletion
ON EventData(MarkedForDeletion ASC)
GO

CREATE TABLE Incident
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    MeterID INT NOT NULL REFERENCES Meter(ID),
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL
)
GO

CREATE TABLE EventType
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    Description VARCHAR(MAX) NULL
)
GO

CREATE TABLE Event
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    FileGroupID INT NOT NULL REFERENCES FileGroup(ID),
    MeterID INT NOT NULL REFERENCES Meter(ID),
    LineID INT NOT NULL REFERENCES Line(ID),
    EventTypeID INT NOT NULL REFERENCES EventType(ID),
    EventDataID INT NOT NULL REFERENCES EventData(ID),
    IncidentID INT NULL,
    Name VARCHAR(200) NOT NULL,
    Alias VARCHAR(200) NULL,
    ShortName VARCHAR(50) NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    Samples INT NOT NULL,
    TimeZoneOffset INT NOT NULL,
    SamplesPerSecond INT NOT NULL,
    SamplesPerCycle INT NOT NULL,
    Description VARCHAR(MAX) NULL,
)
GO

CREATE NONCLUSTERED INDEX IX_Event_FileGroupID
ON Event(FileGroupID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Event_MeterID
ON Event(MeterID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Event_LineID
ON Event(LineID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Event_EventTypeID
ON Event(EventTypeID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Event_EventDataID
ON Event(EventDataID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Event_StartTime
ON Event(StartTime ASC)
GO

CREATE NONCLUSTERED INDEX IX_Event_EndTime
ON Event(EndTime ASC)
GO

CREATE TABLE Disturbance
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    EventID INT NOT NULL REFERENCES Event(ID),
    EventTypeID INT NOT NULL REFERENCES EventType(ID),
    PhaseID INT NOT NULL REFERENCES Phase(ID),
    Magnitude FLOAT NOT NULL,
    PerUnitMagnitude FLOAT NOT NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    DurationSeconds FLOAT NOT NULL,
    DurationCycles FLOAT NOT NULL,
    StartIndex INT NOT NULL,
    EndIndex INT NOT NULL
)
GO

CREATE NONCLUSTERED INDEX IX_Disturbance_EventID
ON Disturbance(EventID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Disturbance_EventTypeID
ON Disturbance(EventTypeID ASC)
GO

CREATE TABLE CycleData
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    EventID INT NOT NULL REFERENCES Event(ID),
    CycleNumber INT NOT NULL,
    SampleNumber INT NOT NULL,
    Timestamp DATETIME2 NOT NULL,
    VX1RMS FLOAT NOT NULL,
    VX1Phase FLOAT NOT NULL,
    VX1Peak FLOAT NOT NULL,
    VX2RMS FLOAT NOT NULL,
    VX2Phase FLOAT NOT NULL,
    VX2Peak FLOAT NOT NULL,
    VX3RMS FLOAT NOT NULL,
    VX3Phase FLOAT NOT NULL,
    VX3Peak FLOAT NOT NULL,
    VY1RMS FLOAT NOT NULL,
    VY1Phase FLOAT NOT NULL,
    VY1Peak FLOAT NOT NULL,
    VY2RMS FLOAT NOT NULL,
    VY2Phase FLOAT NOT NULL,
    VY2Peak FLOAT NOT NULL,
    VY3RMS FLOAT NOT NULL,
    VY3Phase FLOAT NOT NULL,
    VY3Peak FLOAT NOT NULL,
    I1RMS FLOAT NOT NULL,
    I1Phase FLOAT NOT NULL,
    I1Peak FLOAT NOT NULL,
    I2RMS FLOAT NOT NULL,
    I2Phase FLOAT NOT NULL,
    I2Peak FLOAT NOT NULL,
    I3RMS FLOAT NOT NULL,
    I3Phase FLOAT NOT NULL,
    I3Peak FLOAT NOT NULL,
    IRRMS FLOAT NOT NULL,
    IRPhase FLOAT NOT NULL,
    IRPeak FLOAT NOT NULL
)
GO

CREATE TABLE SOEPoint
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    CycleDataID INT NOT NULL REFERENCES CycleData(ID),
    PointCode CHAR(4) NOT NULL,
    UpState CHAR(3) NOT NULL,
    DownState CHAR(3) NOT NULL
)
GO

----- FUNCTIONS -----

CREATE FUNCTION AdjustDateTime2
(
    @dateTime2 DATETIME2,
    @timeTolerance FLOAT
)
RETURNS DATETIME2
BEGIN
    DECLARE @adjustSecond INT = @timeTolerance
    DECLARE @adjustNanosecond INT = (@timeTolerance - ROUND(@timeTolerance, 0, 1)) * 1000000000
    
    DECLARE @adjustedDateTime DATETIME2
    DECLARE @dateTimeLimit DATETIME2
    DECLARE @adjustedDateTimeLimit DATETIME2

    SELECT @dateTimeLimit =
        CASE WHEN @timeTolerance < 0.0 THEN '0001-01-01'
             ELSE '9999-12-31 23:59:59.9999999'
        END
        
    SET @adjustedDateTimeLimit = DATEADD(SECOND, -@adjustSecond, @dateTimeLimit)
    SET @adjustedDateTimeLimit = DATEADD(NANOSECOND, -@adjustNanosecond, @dateTimeLimit)

    SELECT @adjustedDateTime =
        CASE WHEN @timeTolerance < 0.0 AND @dateTime2 <= @adjustedDateTimeLimit THEN @dateTimeLimit
             WHEN @timeTolerance > 0.0 AND @dateTime2 >= @adjustedDateTimeLimit THEN @dateTimeLimit
             ELSE DATEADD(NANOSECOND, @adjustNanosecond, DATEADD(SECOND, @adjustSecond, @dateTime2))
        END

    RETURN @adjustedDateTime
END
GO

CREATE FUNCTION GetSystemEventIDs
(
    @startTime DATETIME2,
    @endTime DATETIME2,
    @timeTolerance FLOAT
)
RETURNS @systemEvent TABLE
(
    EventID INT
)
AS BEGIN
    DECLARE @minStartTime DATETIME2
    DECLARE @maxEndTime DATETIME2

    SELECT @minStartTime = MIN(dbo.AdjustDateTime2(StartTime, -@timeTolerance)), @maxEndTime = MAX(dbo.AdjustDateTime2(EndTime, @timeTolerance))
    FROM Event
    WHERE
        (dbo.AdjustDateTime2(StartTime, -@timeTolerance) <= @startTime AND @startTime <= dbo.AdjustDateTime2(EndTime, @timeTolerance)) OR
        (@startTime <= dbo.AdjustDateTime2(StartTime, -@timeTolerance) AND dbo.AdjustDateTime2(StartTime, -@timeTolerance) <= @endTime)

    WHILE @startTime != @minStartTime OR @endTime != @maxEndTime
    BEGIN
        SET @startTime = @minStartTime
        SET @endTime = @maxEndTime

        SELECT @minStartTime = MIN(dbo.AdjustDateTime2(StartTime, -@timeTolerance)), @maxEndTime = MAX(dbo.AdjustDateTime2(EndTime, @timeTolerance))
        FROM Event
        WHERE
            (dbo.AdjustDateTime2(StartTime, -@timeTolerance) <= @startTime AND @startTime <= dbo.AdjustDateTime2(EndTime, @timeTolerance)) OR
            (@startTime <= dbo.AdjustDateTime2(StartTime, -@timeTolerance) AND dbo.AdjustDateTime2(StartTime, -@timeTolerance) <= @endTime)
    END

    INSERT INTO @systemEvent
    SELECT ID
    FROM Event
    WHERE @startTime <= dbo.AdjustDateTime2(StartTime, -@timeTolerance) AND dbo.AdjustDateTime2(EndTime, @timeTolerance) <= @endTime
    
    RETURN
END
GO

----- VIEWS -----

CREATE VIEW EventDetail AS
WITH TimeTolerance AS
(
    SELECT
        COALESCE(CAST(Value AS FLOAT), 0.5) AS Tolerance
    FROM
        (SELECT 'TimeTolerance' AS Name) AS SettingName LEFT OUTER JOIN
        Setting ON SettingName.Name = Setting.Name
)
SELECT
    Event.ID AS EventID,
    (
        SELECT
            Event.ID AS [Event/ID],
            Event.StartTime AS [Event/StartTime],
            Event.EndTime AS [Event/EndTime],
            EventType.Name AS [Event/Type],
            Meter.AssetKey AS [Meter/AssetKey],
            Meter.Name AS [Meter/Name],
            Meter.ShortName AS [Meter/ShortName],
            Meter.Alias AS [Meter/Alias],
            Meter.Make AS [Meter/Make],
            Meter.Model AS [Meter/Model],
            MeterLocation.AssetKey AS [MeterLocation/AssetKey],
            MeterLocation.Name AS [MeterLocation/Name],
            MeterLocation.ShortName AS [MeterLocation/ShortName],
            MeterLocation.Alias AS [MeterLocation/Alias],
            Line.AssetKey AS [Line/AssetKey],
            MeterLine.LineName AS [Line/Name],
            FORMAT(Line.Length, '0.##########') AS [Line/Length],
            (
                CAST((SELECT '<TimeTolerance>' + CAST((SELECT * FROM TimeTolerance) AS VARCHAR) + '</TimeTolerance>') AS XML)
            ) AS [Settings]
        FROM
            Meter CROSS JOIN
            Line LEFT OUTER JOIN
            MeterLocation ON Meter.MeterLocationID = MeterLocation.ID LEFT OUTER JOIN
            MeterLine ON MeterLine.MeterID = Meter.ID AND MeterLine.LineID = Line.ID LEFT OUTER JOIN
            MeterLocationLine ON MeterLocationLine.MeterLocationID = MeterLocation.ID AND MeterLocationLine.LineID = Line.ID LEFT OUTER JOIN
            EventType ON Event.EventTypeID = EventType.ID
        WHERE
            Event.MeterID = Meter.ID AND
            Event.LineID = Line.ID
        FOR XML PATH('EventDetail'), TYPE
    ) AS EventDetail
FROM Event
GO

----- PROCEDURES -----

CREATE PROCEDURE GetSystemEvent
    @startTime DATETIME2,
    @endTime DATETIME2,
    @timeTolerance FLOAT
AS BEGIN
    SELECT *
    FROM Event
    WHERE ID IN (SELECT * FROM dbo.GetSystemEventIDs(@startTime, @endTime, @timeTolerance))
END
GO

CREATE PROCEDURE GetPreviousAndNextEventIds
    @EventID as INT
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @currentTime DATETIME2,
			@meterID INT,
			@lineID INT

	SELECT @currentTime = StartTime, @meterID = MeterID, @lineID = LineID
	FROM Event
	WHERE ID = @EventID

	SELECT evt2.ID as previd, evt3.ID as nextid
	FROM Event evt1 LEFT OUTER JOIN 
		 Event evt2 ON evt2.StartTime = (SELECT MAX(StartTime)
		 FROM Event
		 WHERE StartTime < @currentTime AND MeterID = @meterID AND LineID = @lineID) AND evt2.MeterID = @meterID AND evt2.LineID = @lineID 
		 LEFT OUTER JOIN 
		 Event evt3 ON evt3.StartTime = (SELECT MIN(StartTime)
		 FROM Event
		 WHERE StartTime > @currentTime AND MeterID = @meterID AND LineID = @lineID) 
		 AND evt3.MeterID = @meterID AND evt3.LineID = @lineID
	WHERE evt1.ID = @EventID
END
GO
