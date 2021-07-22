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
--CREATE ROLE [SOEAdmin] AUTHORIZATION [dbo]
--GO
--EXEC sp_addrolemember N'SOEAdmin', N'NewUser'
--GO
--EXEC sp_addrolemember N'db_datareader', N'SOEAdmin'
--GO
--EXEC sp_addrolemember N'db_datawriter', N'SOEAdmin'
--GO

----- TABLES -----

CREATE TABLE ApplicationRole(
	ID uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
	Name varchar(200) NOT NULL,
	Description varchar(max) NULL,
	NodeID uniqueidentifier NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
	CreatedOn datetime DEFAULT GETDATE(),
	CreatedBy varchar(200) NOT NULL,
	UpdatedOn datetime DEFAULT GETDATE(),
	UpdatedBy varchar(200) NOT NULL,
)
GO

CREATE TABLE SecurityGroup(
	ID uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
	Name varchar(200) NOT NULL,
	Description varchar(max) NULL,
	CreatedOn datetime DEFAULT GETDATE(),
	CreatedBy varchar(200) NOT NULL,
	UpdatedOn datetime DEFAULT GETDATE(),
	UpdatedBy varchar(200) NOT NULL,
)
GO

CREATE TABLE UserAccount(
	ID uniqueidentifier NOT NULL PRIMARY KEY DEFAULT NEWID(),
	Name varchar(200) NOT NULL,
	Password varchar(200) NULL,
	FirstName varchar(200) NULL,
	LastName varchar(200) NULL,
	DefaultNodeID uniqueidentifier NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
	Phone varchar(200) NULL,
	Email varchar(200) NULL,
	LockedOut bit NOT NULL,
	UseADAuthentication bit NOT NULL,
	ChangePasswordOn datetime NULL,
	CreatedOn datetime DEFAULT GETDATE(),
	CreatedBy varchar(50) NOT NULL,
	UpdatedOn datetime DEFAULT GETDATE(),
	UpdatedBy varchar(50) NOT NULL,
)

CREATE TABLE ApplicationRoleSecurityGroup(
	ApplicationRoleID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES ApplicationRole(ID),
	SecurityGroupID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES SecurityGroup(ID)
)
GO

CREATE TABLE ApplicationRoleUserAccount(
	ApplicationRoleID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES ApplicationRole(ID),
	UserAccountID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES UserAccount(ID)
)
GO


CREATE TABLE SecurityGroupUserAccount(
	SecurityGroupID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES SecurityGroup(ID),
	UserAccountID uniqueidentifier NOT NULL FOREIGN KEY REFERENCES UserAccount(ID)
)
GO

INSERT SecurityGroup (Name, Description, CreatedBy, UpdatedBy) VALUES (N'S-1-5-32-545', 'All authenticated windows users.', N'Installer', N'Installer')
GO
INSERT ApplicationRole (Name, Description, CreatedBy, UpdatedBy) VALUES (N'Administrator', N'Administrator Role', N'Installer', N'Installer')
GO
INSERT ApplicationRole (Name, Description, CreatedBy, UpdatedBy) VALUES (N'Viewer', N'Viewer Role', N'Installer',  N'Installer')
GO
INSERT ApplicationRoleSecurityGroup (ApplicationRoleID, SecurityGroupID) VALUES ((SELECT ID FROM ApplicationRole WHERE Name = 'Administrator'), (SELECT ID FROM SecurityGroup WHERE Name = 's-1-5-32-545'))
GO

CREATE TABLE Setting
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    Value VARCHAR(MAX) NOT NULL,
	DefaultValue VARCHAR(MAX) NOT NULL

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
    Error INT NOT NULL DEFAULT 0,
	FileHash INT
)
GO

CREATE NONCLUSTERED INDEX IX_FileGroup_FileHash
ON FileGroup(FileHash ASC)
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

CREATE TABLE [dbo].[FileBlob](
    ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    DataFileID INT NOT NULL REFERENCES DataFile(ID),
    Blob VARBINARY(MAX) NOT NULL
)
GO

CREATE NONCLUSTERED INDEX IX_Fileblob_DataFileID
ON FileBlob(DataFileID ASC)
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

CREATE TABLE System(
	ID int IDENTITY(1,1) NOT NULL primary key,
	Name varchar(max) NOT NULL,
)
GO

CREATE TABLE SubStation(
	ID int IDENTITY(1,1) NOT NULL primary key,
	Name varchar(max) NOT NULL,
)
GO

CREATE TABLE Circuit(
	ID int IDENTITY(1,1) NOT NULL Primary key,
	SystemID int not null foreign key references system(id),
	Name varchar(max) NOT NULL,
)
GO

CREATE TABLE Meter
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    AssetKey VARCHAR(50) NOT NULL UNIQUE,
	SubStationID INT NULL REFERENCES SubStation(ID),
    MeterLocationID INT NOT NULL REFERENCES MeterLocation(ID),
    ParentNormalID INT NULL REFERENCES Meter(ID),
	ParentAlternateID INT NULL REFERENCES Meter(ID),
	CircuitID INT NULL REFERENCES Circuit(ID),
	IsNormallyOpen bit not null,
    Name VARCHAR(200) NOT NULL,
    Alias VARCHAR(200) NULL,
    ShortName VARCHAR(50) NULL,
    Make VARCHAR(200) NOT NULL,
    Model VARCHAR(200) NOT NULL,
    TimeZone VARCHAR(200) NULL,
    Description VARCHAR(MAX) NULL,
    Phasing VARCHAR(3) NULL,
    Orientation VARCHAR(2) NULL,
	ExtraData VARCHAR(max) NULL
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
	AFCLG FLOAT NULL,
	AFCLL FLOAT NULL,
	AFCLLL FLOAT NULL,
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

CREATE TABLE Recipient
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(200) NOT NULL
)
GO

INSERT INTO Setting(Name, Value, DefaultValue) VALUES('WatchDirectories', 'Watch', 'Watch')
GO
INSERT INTO Setting(Name, Value, DefaultValue) VALUES('TimeWindow', '120', '120')
GO
INSERT INTO Setting(Name, Value, DefaultValue) VALUES('openSEE.SlideShowTime', '3', '3')
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

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.IncidentOperation', 2)
GO

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.EventOperation', 3)
GO

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.CycleDataOperation', 4)
GO

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.SOEPointOperation', 5)
GO

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.IncidentAttributeOperation', 6)
GO

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.LTECalculationOperation', 7)
GO

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.PQSeverityCalculationOperation', 8)
GO

INSERT INTO DataOperation(AssemblyName, TypeName, LoadOrder) VALUES('SOEDataProcessing.dll', 'SOEDataProcessing.DataOperations.SOEOperation', 9)
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

CREATE TABLE SOE
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    Name varchar(max) NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    Status varchar(max) NOT NULL,
    TimeWindows INT NULL
)
GO

CREATE TABLE Incident
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    MeterID INT NOT NULL REFERENCES Meter(ID),
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
	LTE FLOAT NULL,
	PQS FLOAT NULL
)
GO

CREATE TABLE SOEIncident
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    SOEID INT NOT NULL REFERENCES SOE(ID),
    IncidentID INT NOT NULL REFERENCES Incident(ID),
    [Order] INT NOT NULL DEFAULT 0
)
GO

CREATE TABLE IncidentAttribute
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    IncidentID INT NOT NULL REFERENCES Incident(ID),
    FaultType VARCHAR(4) NULL,
    IAMax FLOAT NOT NULL,
    IBMax FLOAT NOT NULL,
    ICMax FLOAT NOT NULL,
    IRMax FLOAT NOT NULL,
    VAMax FLOAT NOT NULL,
    VBMax FLOAT NOT NULL,
    VCMax FLOAT NOT NULL,
    VAMin FLOAT NOT NULL,
    VBMin FLOAT NOT NULL,
    VCMin FLOAT NOT NULL
)
GO

CREATE TABLE Event
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    FileGroupID INT NOT NULL REFERENCES FileGroup(ID),
    MeterID INT NOT NULL REFERENCES Meter(ID),
    LineID INT NOT NULL REFERENCES Line(ID),
    EventDataID INT NOT NULL REFERENCES EventData(ID),
    IncidentID INT NOT NULL REFERENCES Incident(ID),
    Name VARCHAR(200) NOT NULL,
    Alias VARCHAR(200) NULL,
    ShortName VARCHAR(50) NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    Samples INT NOT NULL,
    TimeZoneOffset INT NOT NULL,
    SamplesPerSecond INT NOT NULL,
    SamplesPerCycle INT NOT NULL,
    Description VARCHAR(MAX) NULL
)
GO

CREATE NONCLUSTERED INDEX IX_IncidentAttribute_IncidentID
ON Event(IncidentID ASC)
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

CREATE NONCLUSTERED INDEX IX_Event_EventDataID
ON Event(EventDataID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Event_IncidentID
ON Event(IncidentID ASC)
GO

CREATE NONCLUSTERED INDEX IX_Event_StartTime
ON Event(StartTime ASC)
GO

CREATE NONCLUSTERED INDEX IX_Event_EndTime
ON Event(EndTime ASC)
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
    VY1RMS FLOAT NULL,
    VY1Phase FLOAT NULL,
    VY1Peak FLOAT NULL,
    VY2RMS FLOAT NULL,
    VY2Phase FLOAT NULL,
    VY2Peak FLOAT NULL,
    VY3RMS FLOAT NULL,
    VY3Phase FLOAT NULL,
    VY3Peak FLOAT NULL,
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

CREATE NONCLUSTERED INDEX IX_CycleData_EventID
ON CycleData(EventID ASC)
GO

CREATE TABLE SOEPoint
(
    ID INT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
    CycleDataID INT NOT NULL REFERENCES CycleData(ID),
    StatusElement VARCHAR(2) NOT NULL,
    BreakerElementA VARCHAR(1) NOT NULL,
    BreakerElementB VARCHAR(1) NOT NULL,
    BreakerElementC VARCHAR(1) NOT NULL,
    UpState VARCHAR(3) NOT NULL,
    DownState VARCHAR(3) NOT NULL,
    FaultType VARCHAR(4) NULL
)
GO

CREATE NONCLUSTERED INDEX IX_SOEPoint_CycleDataID
ON SOEPoint(CycleDataID ASC)
GO

CREATE TABLE SOE(
	[ID] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[Name] [varchar](max) NULL,
	[StartTime] [datetime2](7) NOT NULL,
	[EndTime] [datetime2](7) NOT NULL,
	[Status] [varchar](max) NOT NULL,
	[TimeWindows] [int] NULL,
)

GO

CREATE TABLE [dbo].[SOEIncident](
	[ID] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
	[SOEID] [int] NOT NULL REFERENCES SOE(ID),
	[IncidentID] [int] NOT NULL REFERENCES Incident(ID),
	[Order] [int] NOT NULL DEFAULT(0),
)

GO



CREATE TABLE ColorIndex (
	ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	Color VARCHAR(20) NOT NULL,
	Red INT NOT NULL,
	Green INT NOT NULL,
	Blue INT NOT NULL
)
GO

SET IDENTITY_INSERT ColorIndex ON
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (0,'grayNoFirstWF', 150,150,150)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (1,'redCurrent', 255,0,0)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (2,'blueFault', 0,0,255)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (3,'greenTrip', 0,120,0)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (4,'greenOpen', 0,255,0)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (5,'redSource', 200,0,0)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (6,'tanPQ', 255,170,100)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (7,'yellowPQ', 255,200,0)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (8,'blackLOS', 0,0,0)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (9,'orangeTBD', 250,130,0)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (10,'aquaTBD', 5,250,250)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (11,'dkGrayTBD', 96,96,96)
GO
INSERT INTO ColorIndex (ID, Color, Red, Green, Blue) VALUES (12,'whiteTBD', 255, 255, 255)
GO
SET IDENTITY_INSERT ColorIndex OFF
GO

CREATE TABLE NLTDataType (
	ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	Name VARCHAR(20) NOT NULL,
	[Type] VARCHAR(20) NOT NULL
)
GO
SET IDENTITY_INSERT NLTDataType ON
GO
INSERT INTO NLTDataType (ID, Name, [Type]) VALUES (1,'SOE_replay', 'replay')
GO
INSERT INTO NLTDataType (ID, Name, [Type]) VALUES (2,'SCADA_points', 'replay')
GO
INSERT INTO NLTDataType (ID, Name, [Type]) VALUES (20,'faults', 'trend')
GO
INSERT INTO NLTDataType (ID, Name, [Type]) VALUES (30,'PQ', 'trend')
GO
INSERT INTO NLTDataType (ID, Name, [Type]) VALUES (40,'general', 'history')
GO
SET IDENTITY_INSERT NLTDataType OFF
GO


CREATE TABLE SensorType (
	ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	Name VARCHAR(20) NOT NULL,
	[Description] VARCHAR(MAX) NULL
)
GO

SET IDENTITY_INSERT SensorType ON
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (1,'sensorVoltage', 'equipment voltage')
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (2,'sensorCurrent', 'equipment current')
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (3,'eqDigitalState', 'equipment logical')
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (20,'scadaVoltage', 'SCADA data set')
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (21,'scadaCurrent', 'SCADA data set')
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (22,'scadaDigital', 'SCADA locical')
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (30,'lightning', 'weather')
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (31,'windSpeed', 'weather')
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (32,'windGust', 'weather')
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (33,'temperature', 'weather')
GO
INSERT INTO SensorType (ID, Name, [Description]) VALUES (34,'precip', 'rain')
GO
SET IDENTITY_INSERT SensorType OFF
GO


CREATE TABLE SOEDataPoint(
	ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	SOE_ID INT NOT NULL,
	TSx INT NOT NULL,
	TSxUnits VARCHAR(10) NOT NULL,
	EventID INT NULL,
	NLTDataTypeID INT NOT NULL FOREIGN KEY REFERENCES NLTDataType(ID),
	SensorTypeID INT NOT NULL REFERENCES SensorType(ID),
	SensorName VARCHAR(MAX) NOT NULL,
	SensorOrder INT NOT NULL,
	TimeSlot INT NOT NULL,
	[Time] INT NOT NULL,
	Value INT NOT NULL,
	ElapsMS INT NOT NULL,
	ElapsSEC INT NOT NULL,
	CycleNum INT NOT NULL,
	TimeGap INT NOT NULL,
	MapDisplay BIT NOT NULL
)
GO

CREATE INDEX IX_SOEDataPoint_SOEID_TSx ON SOEDataPoint(SOE_ID, TSx)
GO

CREATE TABLE MeasuredValues (
	ID INT IDENTITY(1,1) NOT NULL Primary Key,
	EventID INT NOT NULL,
	TaskID INT NOT NULL,
	FirstSampleTimeLocal DateTime NOT NULL,
	ValueDatetimeLocal DateTime NOT NULL,
	GBBid VARCHAR(max) NOT NULL,
	Bucket VARCHAR (max) NOT NULL,
	Bin VARCHAR(max) NOT NULL,
	GisName VARCHAR(200) NOT NULL,
	Sensor VARCHAR(10) NOT NULL,
	MeasurementNumber INT NOT NULL,
	ValueSamplePoint INT NOT NULL,
	Value FLOAT NOT NULL,
	Units VARCHAR(20) NOT NULL,
	Duration FLOAT NOT NULL,
	DurationUnits VARCHAR(20) NOT NULL,
	PlotFilePath VARCHAR(MAX) NOT NULL,
	PlotFileName VARCHAR(MAX) NOT NULL
)
GO

CREATE INDEX IX_MeasuredValues_EventID ON MeasuredValues(EventID)
GO

CREATE TABLE NLTImages (
    ID INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    EventID INT NOT NULL FOREIGN KEY REFERENCES [Event](ID),
    Url VARCHAR(MAX) NOT NULL,
    DisplayText VARCHAR(300) NOT NULL ,
    RetentionPolicy VARCHAR(25) NOT NULL, 
    Deleted bit NOT NULL DEFAULT 0
)

CREATE INDEX IX_NLTImages_EventID ON NLTImages(EventID)
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

CREATE FUNCTION GetIncidents()
RETURNS @incident TABLE
(
    MeterID INT,
    StartTime DATETIME2,
    EndTime DATETIME2
)
AS BEGIN
    ; WITH EventGroup AS
    (
        SELECT e1.ID, e1.MeterID, e1.StartTime, e1.EndTime
        FROM Event e1 LEFT OUTER JOIN Event e2 ON
            e1.MeterID = e2.MeterID AND
            e1.StartTime > e2.StartTime AND
            e1.StartTime <= dbo.AdjustDateTime2(e2.EndTime, 22)
        WHERE e2.ID IS NULL
        UNION ALL
        SELECT EventGroup.ID, EventGroup.MeterID, Event.StartTime, Event.EndTime
        FROM Event JOIN EventGroup ON
            Event.MeterID = EventGroup.MeterID AND
            Event.StartTime > EventGroup.StartTime AND
            Event.StartTime <= dbo.AdjustDateTime2(EventGroup.EndTime, 22)
    ),
    Incident AS
    (
        SELECT
            MIN(MeterID) AS MeterID,
            MIN(StartTime) AS StartTime,
            MAX(EndTime) AS EndTime
        FROM EventGroup
        GROUP BY ID
    )
    INSERT INTO @incident
    SELECT *
    FROM Incident

    RETURN
END
GO

CREATE FUNCTION GetNearbyIncidents
(
    @meterID INT,
    @startTime DATETIME2,
    @endTime DATETIME2,
    @timeTolerance FLOAT
)
RETURNS TABLE
AS RETURN
(
    WITH LeftIncidentGroup AS
    (
        SELECT *
        FROM Incident
        WHERE
            MeterID = @meterID AND
            EndTime < @endTime AND
            EndTime >= dbo.AdjustDateTime2(@startTime, -@timeTolerance)
        UNION ALL
        SELECT Incident.*
        FROM Incident JOIN LeftIncidentGroup ON
            Incident.MeterID = LeftIncidentGroup.MeterID AND
            Incident.EndTime < LeftIncidentGroup.EndTime AND
            Incident.EndTime >= dbo.AdjustDateTime2(LeftIncidentGroup.StartTime, -@timeTolerance)
    ),
    RightIncidentGroup AS
    (
        SELECT *
        FROM Incident
        WHERE
            MeterID = @meterID AND
            StartTime > @startTime AND
            StartTime <= dbo.AdjustDateTime2(@endTime, @timeTolerance)
        UNION ALL
        SELECT Incident.*
        FROM Incident JOIN RightIncidentGroup ON
            Incident.MeterID = RightIncidentGroup.MeterID AND
            Incident.StartTime > RightIncidentGroup.StartTime AND
            Incident.StartTime <= dbo.AdjustDateTime2(RightIncidentGroup.EndTime, @timeTolerance)
    ),
    MiddleIncidentGroup AS
    (
        SELECT *
        FROM Incident
        WHERE
            MeterID = @meterID AND
            StartTime <= @endTime AND
            EndTime >= @startTime
    )
    SELECT * FROM LeftIncidentGroup UNION
    SELECT * FROM RightIncidentGroup UNION
    SELECT * FROM MiddleIncidentGroup
)
GO

CREATE FUNCTION [dbo].[GetNearbyIncidentsByCircuit]
(
    @circuitID INT,
    @startTime DATETIME2,
    @endTime DATETIME2,
    @timeTolerance FLOAT
)
RETURNS TABLE
AS RETURN
(
    WITH LeftIncidentGroup AS
    (
        SELECT Incident.*, Meter.Name as MeterName, Meter.CircuitID as CircuitID, Meter.ParentNormalID as ParentID, Meter.Orientation, Line.AssetKey as LineName
        FROM Incident Join 
			 Meter ON Incident.MeterID = meter.ID join
			 MeterLine ON Meter.ID = MeterLine.MeterID JOIN
			 Line ON Line.ID = MeterLine.LineID
        WHERE
            Meter.CircuitID = @circuitID AND
            EndTime < @endTime AND
            EndTime >= dbo.AdjustDateTime2(@startTime, -@timeTolerance)
        UNION ALL
        SELECT Incident.*, Meter.Name as MeterName, Meter.CircuitID as CircuitID, Meter.ParentNormalID as ParentID, Meter.Orientation, Line.AssetKey as LineName
        FROM Incident Join 
			 Meter ON Incident.MeterID = meter.ID join
			 MeterLine ON Meter.ID = MeterLine.MeterID JOIN
			 Line ON Line.ID = MeterLine.LineID JOIN 
			 LeftIncidentGroup ON
				Meter.CircuitID = LeftIncidentGroup.CircuitID AND
				Incident.EndTime < LeftIncidentGroup.EndTime AND
				Incident.EndTime >= dbo.AdjustDateTime2(LeftIncidentGroup.StartTime, -@timeTolerance)
    ),
    RightIncidentGroup AS
    (
        SELECT Incident.*, Meter.Name as MeterName, Meter.CircuitID as CircuitID, Meter.ParentNormalID as ParentID, Meter.Orientation, Line.AssetKey as LineName
        FROM Incident Join 
			 Meter ON Incident.MeterID = meter.ID join
			 MeterLine ON Meter.ID = MeterLine.MeterID JOIN
			 Line ON Line.ID = MeterLine.LineID
        WHERE
            Meter.CircuitID = @circuitID AND
            StartTime > @startTime AND
            StartTime <= dbo.AdjustDateTime2(@endTime, @timeTolerance)
        UNION ALL
        SELECT Incident.*, Meter.Name as MeterName, Meter.CircuitID as CircuitID, Meter.ParentNormalID as ParentID, Meter.Orientation, Line.AssetKey as LineName
        FROM Incident Join 
			 Meter ON Incident.MeterID = meter.ID join
			 MeterLine ON Meter.ID = MeterLine.MeterID JOIN
			 Line ON Line.ID = MeterLine.LineID JOIN 
			 RightIncidentGroup ON
				Meter.CircuitID = RightIncidentGroup.CircuitID AND
				Incident.StartTime > RightIncidentGroup.StartTime AND
				Incident.StartTime <= dbo.AdjustDateTime2(RightIncidentGroup.EndTime, @timeTolerance)
    ),
    MiddleIncidentGroup AS
    (
        SELECT Incident.*, Meter.Name as MeterName, Meter.CircuitID as CircuitID, Meter.ParentNormalID as ParentID, Meter.Orientation, Line.AssetKey as LineName
        FROM Incident Join 
			 Meter ON Incident.MeterID = meter.ID join
			 MeterLine ON Meter.ID = MeterLine.MeterID JOIN
			 Line ON Line.ID = MeterLine.LineID
        WHERE
            Meter.CircuitID = @circuitID AND
            StartTime <= @endTime AND
            EndTime >= @startTime
    )
    SELECT * FROM LeftIncidentGroup UNION
    SELECT * FROM RightIncidentGroup UNION
    SELECT * FROM MiddleIncidentGroup
)


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
            MeterLocationLine ON MeterLocationLine.MeterLocationID = MeterLocation.ID AND MeterLocationLine.LineID = Line.ID
        WHERE
            Event.MeterID = Meter.ID AND
            Event.LineID = Line.ID
        FOR XML PATH('EventDetail'), TYPE
    ) AS EventDetail
FROM Event
GO

CREATE VIEW ChannelInfo AS
SELECT
    Meter.ID AS MeterID,
    Channel.ID AS ChannelID,
    Channel.Name AS ChannelName,
    Channel.Description AS ChannelDescription,
    MeasurementType.Name AS MeasurementType,
    MeasurementCharacteristic.Name AS MeasurementCharacteristic,
    Phase.Name AS Phase,
    SeriesType.Name AS SeriesType,
    Meter.Orientation,
    Meter.Phasing
FROM
    Channel JOIN
    Series ON Series.ChannelID = Channel.ID JOIN
    MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID JOIN
    MeasurementCharacteristic ON Channel.MeasurementCharacteristicID = MeasurementCharacteristic.ID JOIN
    Phase ON Channel.PhaseID = Phase.ID JOIN
    SeriesType ON Series.SeriesTypeID = SeriesType.ID JOIN
    Meter ON Channel.MeterID = Meter.ID
GO

CREATE VIEW EventInfo AS
SELECT
    Event.ID AS EventID,
    Event.IncidentID,
    Event.MeterID,
    Event.StartTime,
    Meter.Name AS MeterName,
    MeterLine.LineName,
    Line.Length AS LineLength
FROM
    Event JOIN
    Meter ON Event.MeterID = Meter.ID JOIN
    MeterLine ON Event.MeterID = MeterLine.MeterID AND Event.LineID = MeterLine.LineID JOIN
    Line ON Event.LineID = Line.ID
GO

CREATE VIEW RotatedCycleData AS
SELECT
    CycleData.ID,
    EventID,
    CycleNumber,
    SampleNumber,
    Timestamp,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN VX1RMS
        WHEN 2 THEN VX2RMS
        WHEN 3 THEN VX3RMS
    END AS VXARMS,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN VX1Phase
        WHEN 2 THEN VX2Phase
        WHEN 3 THEN VX3Phase
    END AS VXAPhase,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN VX1Peak
        WHEN 2 THEN VX2Peak
        WHEN 3 THEN VX3Peak
    END AS VXAPeak,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN VX1RMS
        WHEN 2 THEN VX2RMS
        WHEN 3 THEN VX3RMS
    END AS VXBRMS,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN VX1Phase
        WHEN 2 THEN VX2Phase
        WHEN 3 THEN VX3Phase
    END AS VXBPhase,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN VX1Peak
        WHEN 2 THEN VX2Peak
        WHEN 3 THEN VX3Peak
    END AS VXBPeak,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN VX1RMS
        WHEN 2 THEN VX2RMS
        WHEN 3 THEN VX3RMS
    END AS VXCRMS,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN VX1Phase
        WHEN 2 THEN VX2Phase
        WHEN 3 THEN VX3Phase
    END AS VXCPhase,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN VX1Peak
        WHEN 2 THEN VX2Peak
        WHEN 3 THEN VX3Peak
    END AS VXCPeak,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN VY1RMS
        WHEN 2 THEN VY2RMS
        WHEN 3 THEN VY3RMS
    END AS VYARMS,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN VY1Phase
        WHEN 2 THEN VY2Phase
        WHEN 3 THEN VY3Phase
    END AS VYAPhase,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN VY1Peak
        WHEN 2 THEN VY2Peak
        WHEN 3 THEN VY3Peak
    END AS VYAPeak,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN VY1RMS
        WHEN 2 THEN VY2RMS
        WHEN 3 THEN VY3RMS
    END AS VYBRMS,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN VY1Phase
        WHEN 2 THEN VY2Phase
        WHEN 3 THEN VY3Phase
    END AS VYBPhase,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN VY1Peak
        WHEN 2 THEN VY2Peak
        WHEN 3 THEN VY3Peak
    END AS VYBPeak,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN VY1RMS
        WHEN 2 THEN VY2RMS
        WHEN 3 THEN VY3RMS
    END AS VYCRMS,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN VY1Phase
        WHEN 2 THEN VY2Phase
        WHEN 3 THEN VY3Phase
    END AS VYCPhase,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN VY1Peak
        WHEN 2 THEN VY2Peak
        WHEN 3 THEN VY3Peak
    END AS VYCPeak,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN I1RMS
        WHEN 2 THEN I2RMS
        WHEN 3 THEN I3RMS
    END AS IARMS,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN I1Phase
        WHEN 2 THEN I2Phase
        WHEN 3 THEN I3Phase
    END AS IAPhase,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN I1Peak
        WHEN 2 THEN I2Peak
        WHEN 3 THEN I3Peak
    END AS IAPeak,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN I1RMS
        WHEN 2 THEN I2RMS
        WHEN 3 THEN I3RMS
    END AS IBRMS,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN I1Phase
        WHEN 2 THEN I2Phase
        WHEN 3 THEN I3Phase
    END AS IBPhase,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN I1Peak
        WHEN 2 THEN I2Peak
        WHEN 3 THEN I3Peak
    END AS IBPeak,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN I1RMS
        WHEN 2 THEN I2RMS
        WHEN 3 THEN I3RMS
    END AS ICRMS,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN I1Phase
        WHEN 2 THEN I2Phase
        WHEN 3 THEN I3Phase
    END AS ICPhase,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN I1Peak
        WHEN 2 THEN I2Peak
        WHEN 3 THEN I3Peak
    END AS ICPeak,
    IRRMS,
    IRPhase,
    IRPeak
FROM
    CycleData JOIN
    Event ON CycleData.EventID = Event.ID JOIN
    Meter ON Event.MeterID = Meter.ID
GO

CREATE VIEW OrientedCycleData AS
SELECT
    CycleData.ID,
    EventID,
    CycleNumber,
    SampleNumber,
    Timestamp,
    CASE WHEN Orientation = 'XY' THEN VX1RMS ELSE VY1RMS END AS VUp1RMS,
    CASE WHEN Orientation = 'XY' THEN VX1Phase ELSE VY1Phase END AS VUp1Phase,
    CASE WHEN Orientation = 'XY' THEN VX1Peak ELSE VY1Peak END AS VUp1Peak,
    CASE WHEN Orientation = 'XY' THEN VX2RMS ELSE VY2RMS END AS VUp2RMS,
    CASE WHEN Orientation = 'XY' THEN VX2Phase ELSE VY2Phase END AS VUp2Phase,
    CASE WHEN Orientation = 'XY' THEN VX2Peak ELSE VY2Peak END AS VUp2Peak,
    CASE WHEN Orientation = 'XY' THEN VX3RMS ELSE VY3RMS END AS VUp3RMS,
    CASE WHEN Orientation = 'XY' THEN VX3Phase ELSE VY3Phase END AS VUp3Phase,
    CASE WHEN Orientation = 'XY' THEN VX3Peak ELSE VY3Peak END AS VUp3Peak,
    CASE WHEN Orientation = 'XY' THEN VY1RMS ELSE VX1RMS END AS VDown1RMS,
    CASE WHEN Orientation = 'XY' THEN VY1Phase ELSE VX1Phase END AS VDown1Phase,
    CASE WHEN Orientation = 'XY' THEN VY1Peak ELSE VX1Peak END AS VDown1Peak,
    CASE WHEN Orientation = 'XY' THEN VY2RMS ELSE VX2RMS END AS VDown2RMS,
    CASE WHEN Orientation = 'XY' THEN VY2Phase ELSE VX2Phase END AS VDown2Phase,
    CASE WHEN Orientation = 'XY' THEN VY2Peak ELSE VX2Peak END AS VDown2Peak,
    CASE WHEN Orientation = 'XY' THEN VY3RMS ELSE VX3RMS END AS VDown3RMS,
    CASE WHEN Orientation = 'XY' THEN VY3Phase ELSE VX3Phase END AS VDown3Phase,
    CASE WHEN Orientation = 'XY' THEN VY3Peak ELSE VX3Peak END AS VDown3Peak,
	I1RMS,
	I1Phase,
	I1Peak,
	I2RMS,
	I2Phase,
	I2Peak,
	I3RMS,
	I3Phase,
	I3Peak,
    IRRMS,
    IRPhase,
    IRPeak
FROM
    CycleData JOIN
    Event ON CycleData.EventID = Event.ID JOIN
    Meter ON Event.MeterID = Meter.ID
GO

CREATE VIEW RotatedAndOrientedCycleData AS
SELECT
    CycleData.ID,
    EventID,
    CycleNumber,
    SampleNumber,
    Timestamp,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VX1RMS ELSE VY1RMS END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VX2RMS ELSE VY2RMS END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VX3RMS ELSE VY3RMS END
    END AS VUpARMS,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VX1Phase ELSE VY1Phase END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VX2Phase ELSE VY2Phase END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VX3Phase ELSE VY3Phase END
    END AS VUpAPhase,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VX1Peak ELSE VY1Peak END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VX2Peak ELSE VY2Peak END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VX3Peak ELSE VY3Peak END
    END AS VUpAPeak,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VX1RMS ELSE VY1RMS END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VX2RMS ELSE VY2RMS END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VX3RMS ELSE VY3RMS END
    END AS VUpBRMS,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VX1Phase ELSE VY1Phase END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VX2Phase ELSE VY2Phase END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VX3Phase ELSE VY3Phase END
    END AS VUpBPhase,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VX1Peak ELSE VY1Peak END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VX2Peak ELSE VY2Peak END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VX3Peak ELSE VY3Peak END
    END AS VUpBPeak,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VX1RMS ELSE VY1RMS END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VX2RMS ELSE VY3RMS END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VX3RMS ELSE VY2RMS END
    END AS VUpCRMS,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VX1Phase ELSE VY1Phase END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VX2Phase ELSE VY2Phase END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VX3Phase ELSE VY3Phase END
    END AS VUpCPhase,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VX1Peak ELSE VY1Peak END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VX2Peak ELSE VY2Peak END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VX3Peak ELSE VY3Peak END
    END AS VUpCPeak,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VY1RMS ELSE VX1RMS END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VY2RMS ELSE VX2RMS END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VY3RMS ELSE VX3RMS END
    END AS VDownARMS,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VY1Phase ELSE VX1Phase END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VY2Phase ELSE VX2Phase END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VY3Phase ELSE VX3Phase END
    END AS VDownAPhase,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VY1Peak ELSE VX1Peak END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VY2Peak ELSE VX2Peak END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VY3Peak ELSE VX3Peak END
    END AS VDownAPeak,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VY1RMS ELSE VX1RMS END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VY2RMS ELSE VX2RMS END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VY3RMS ELSE VX3RMS END
    END AS VDownBRMS,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VY1Phase ELSE VX1Phase END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VY2Phase ELSE VX2Phase END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VY3Phase ELSE VX3Phase END
    END AS VDownBPhase,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VY1Peak ELSE VX1Peak END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VY2Peak ELSE VX2Peak END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VY3Peak ELSE VX3Peak END
    END AS VDownBPeak,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VY1RMS ELSE VX1RMS END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VY2RMS ELSE VX2RMS END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VY3RMS ELSE VX3RMS END
    END AS VDownCRMS,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VY1Phase ELSE VX1Phase END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VY2Phase ELSE VX2Phase END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VY3Phase ELSE VX3Phase END
    END AS VDownCPhase,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN CASE WHEN Orientation = 'XY' THEN VY1Peak ELSE VX1Peak END
        WHEN 2 THEN CASE WHEN Orientation = 'XY' THEN VY2Peak ELSE VX2Peak END
        WHEN 3 THEN CASE WHEN Orientation = 'XY' THEN VY3Peak ELSE VX3Peak END
    END AS VDownCPeak,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN I1RMS
        WHEN 2 THEN I2RMS
        WHEN 3 THEN I3RMS
    END AS IARMS,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN I1Phase
        WHEN 2 THEN I2Phase
        WHEN 3 THEN I3Phase
    END AS IAPhase,
    CASE CHARINDEX('A', Phasing)
        WHEN 1 THEN I1Peak
        WHEN 2 THEN I2Peak
        WHEN 3 THEN I3Peak
    END AS IAPeak,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN I1RMS
        WHEN 2 THEN I2RMS
        WHEN 3 THEN I3RMS
    END AS IBRMS,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN I1Phase
        WHEN 2 THEN I2Phase
        WHEN 3 THEN I3Phase
    END AS IBPhase,
    CASE CHARINDEX('B', Phasing)
        WHEN 1 THEN I1Peak
        WHEN 2 THEN I2Peak
        WHEN 3 THEN I3Peak
    END AS IBPeak,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN I1RMS
        WHEN 2 THEN I2RMS
        WHEN 3 THEN I3RMS
    END AS ICRMS,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN I1Phase
        WHEN 2 THEN I2Phase
        WHEN 3 THEN I3Phase
    END AS ICPhase,
    CASE CHARINDEX('C', Phasing)
        WHEN 1 THEN I1Peak
        WHEN 2 THEN I2Peak
        WHEN 3 THEN I3Peak
    END AS ICPeak,
    IRRMS,
    IRPhase,
    IRPeak
FROM
    CycleData JOIN
    Event ON CycleData.EventID = Event.ID JOIN
    Meter ON Event.MeterID = Meter.ID
GO

CREATE VIEW CycleDataSOEPointView
AS
SELECT
	CycleData.Timestamp,
	CASE
		WHEN CycleData.IARMS > CycleData.IBRMS AND CycleData.IARMS > CycleData.ICRMS THEN CycleData.IARMS
		WHEN CycleData.IBRMS > CycleData.ICRMS THEN CycleData.IBRMS
		ELSE CycleData.ICRMS
	END AS Imax,
	CASE
		WHEN CycleData.VUpARMS < CycleData.VUpBRMS AND CycleData.VUpARMS < CycleData.VUpCRMS THEN CycleData.VUpARMS
		WHEN CycleData.VUpBRMS < CycleData.VUpCRMS THEN CycleData.VUpBRMS
		ELSE CycleData.VUpCRMS
	END AS Vmin,
	CASE
		WHEN CycleData.VUpARMS > CycleData.VUpBRMS AND CycleData.VUpARMS > CycleData.VUpCRMS THEN CycleData.VUpARMS
		WHEN CycleData.VUpBRMS > CycleData.VUpCRMS THEN CycleData.VUpBRMS
		ELSE CycleData.VUpCRMS
	END AS Vmax,
	SOEPoint.StatusElement,
	SOEPoint.BreakerElementA,
	SOEPoint.BreakerElementB,
	SOEPoint.BreakerElementC,
	SOEPoint.UpState,
	SOEPoint.DownState,
	SOEPoint.ID,
	Event.MeterID,
	CAST(CHARINDEX('A', dbo.Meter.Phasing) AS CHAR(1)) + CAST(CHARINDEX('C', dbo.Meter.Phasing) AS CHAR(1)) + CAST(CHARINDEX('B', dbo.Meter.Phasing) AS CHAR(1)) AS Phasing,
	Meter.Name,
	Event.IncidentID,
	Meter.ParentNormalID,
	Incident.StartTime,
	Event.ID AS EventID,
	SOEPoint.FaultType,
	CycleData.VUpARMS AS VoltSourceA,
	CycleData.VUpBRMS AS VoltSourceB,
	CycleData.VUpCRMS AS VoltSourceC
FROM
	dbo.RotatedAndOrientedCycleData CycleData INNER JOIN
    dbo.SOEPoint ON CycleData.ID = dbo.SOEPoint.CycleDataID INNER JOIN
    dbo.Event ON CycleData.EventID = dbo.Event.ID INNER JOIN
    dbo.Meter ON dbo.Event.MeterID = dbo.Meter.ID INNER JOIN
    dbo.Incident ON dbo.Event.IncidentID = dbo.Incident.ID
GO

CREATE VIEW IncidentEventCycleDataView
AS
WITH IncidentEventCycleDataView0 AS
(
	SELECT
		Incident.ID,
		System.Name as System,
		Circuit.Name as Circuit,
		Meter.Name AS Device,
		Incident.StartTime,
		DATEDIFF(MILLISECOND, dbo.Incident.StartTime, dbo.Incident.EndTime) AS Duration,
		IncidentAttribute.IAMax,
		IncidentAttribute.IBMax,
		IncidentAttribute.ICMax,
		IncidentAttribute.IRMax,
		IncidentAttribute.VAMin,
		IncidentAttribute.VBMin,
		IncidentAttribute.VCMin,
		IncidentAttribute.VAMax,
		IncidentAttribute.VBMax,
		IncidentAttribute.VCMax,
		IncidentAttribute.FaultType,
		CASE
			WHEN IncidentAttribute.IAMax > IncidentAttribute.IBMax AND IncidentAttribute.IAMax > IncidentAttribute.ICMax THEN IncidentAttribute.IAMax
			WHEN IncidentAttribute.IBMax > IncidentAttribute.ICMax THEN IncidentAttribute.IBMax
			ELSE IncidentAttribute.ICMax
		END AS IMax,
		CASE
			WHEN IncidentAttribute.VAMax > IncidentAttribute.VBMax AND IncidentAttribute.VAMax > IncidentAttribute.VCMax THEN IncidentAttribute.VAMax
			WHEN IncidentAttribute.VBMax > IncidentAttribute.VCMax THEN IncidentAttribute.VBMax
			ELSE IncidentAttribute.VCMax
		END AS VMax,
		CASE
			WHEN IncidentAttribute.VAMin < IncidentAttribute.VBMin AND IncidentAttribute.VAMin < IncidentAttribute.VCMin THEN IncidentAttribute.VAMin
			WHEN IncidentAttribute.VBMin < IncidentAttribute.VCMin THEN IncidentAttribute.VBMin
			ELSE IncidentAttribute.VCMin
		END AS VMin,
		Line.VoltageKV * 1000 / SQRT(3) AS NominalVoltage,
		Incident.LTE,
		Incident.PQS
	FROM
		Incident INNER JOIN
		IncidentAttribute ON IncidentAttribute.IncidentID = Incident.ID INNER JOIN
		Meter ON Incident.MeterID = Meter.ID INNER JOIN
		MeterLine ON Meter.ID = MeterLine.MeterID INNER JOIN
		Line ON MeterLine.LineID = Line.ID INNER JOIN
		Circuit ON Circuit.ID = Meter.CircuitID INNER JOIN
		System ON System.ID = Circuit.SystemID
)
SELECT
	CASE
		WHEN LEN(FaultType) = 2 AND FaultType LIKE '%N' THEN 'LG'
		WHEN LEN(FaultType) = 3 AND FaultType LIKE '%N' THEN 'LLG'
		WHEN LEN(FaultType) = 4 AND FaultType LIKE '%N' THEN 'LLLG'
		WHEN LEN(FaultType) = 2 THEN 'LL'
		WHEN FaultType IS NOT NULL THEN 'LLL'
		WHEN VMin = VAMin AND (VAMin / NominalVoltage) <= 0.9 THEN 'A-SAG'
		WHEN VMin = VCMin AND (VCMin / NominalVoltage) <= 0.9 THEN 'C-SAG'
		WHEN VMin = VBMin AND (VBMin / NominalVoltage) <= 0.9 THEN 'B-SAG'
		WHEN VMax = VAMax AND (VAMax / NominalVoltage) >= 1.1 THEN 'A-SWELL'
		WHEN VMax = VCMax AND (VCMax / NominalVoltage) >= 1.1 THEN 'C-SWELL'
		WHEN VMax = VBMax AND (VBMax / NominalVoltage) >= 1.1 THEN 'B-SWELL'
		ELSE 'OTHER'
	END AS IncidentType,
	*
FROM IncidentEventCycleDataView0
GO

CREATE VIEW EventList AS
SELECT 
	SOE.ID as SOE_UID, Event.ID as EventID
FROM
	SOE JOIN
	SOEIncident ON SOE.ID = SOEIncident.SOEID JOIN
	Incident ON Incident.ID = SOEIncident.IncidentID JOIN
	Event ON Event.IncidentID = Incident.ID
GO

CREATE VIEW DeviceList AS
SELECT 
	SOE.ID as SOE_UID, Meter.AssetKey, SOEIncident.[Order] as SortOrder
FROM
	SOE JOIN
	SOEIncident ON SOE.ID = SOEIncident.SOEID JOIN
	Incident ON Incident.ID = SOEIncident.IncidentID JOIN
	Meter ON Meter.ID = Incident.MeterID
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


-- Author: Kevin Conner
-- Source: http://stackoverflow.com/questions/116968/in-sql-server-2005-can-i-do-a-cascade-delete-without-setting-the-property-on-my
create procedure usp_delete_cascade (
	@base_table_name varchar(200), @base_criteria nvarchar(1000)
)
as begin
	-- Adapted from http://www.sqlteam.com/article/performing-a-cascade-delete-in-sql-server-7
	-- Expects the name of a table, and a conditional for selecting rows
	-- within that table that you want deleted.
	-- Produces SQL that, when run, deletes all table rows referencing the ones
	-- you initially selected, cascading into any number of tables,
	-- without the need for "ON DELETE CASCADE".
	-- Does not appear to work with self-referencing tables, but it will
	-- delete everything beneath them.
	-- To make it easy on the server, put a "GO" statement between each line.

	declare @to_delete table (
		id int identity(1, 1) primary key not null,
		criteria nvarchar(1000) not null,
		table_name varchar(200) not null,
		processed bit not null,
		delete_sql varchar(1000)
	)

	insert into @to_delete (criteria, table_name, processed) values (@base_criteria, @base_table_name, 0)

	declare @id int, @criteria nvarchar(1000), @table_name varchar(200)
	while exists(select 1 from @to_delete where processed = 0) begin
		select top 1 @id = id, @criteria = criteria, @table_name = table_name from @to_delete where processed = 0 order by id desc

		insert into @to_delete (criteria, table_name, processed)
			select referencing_column.name + ' in (select [' + referenced_column.name + '] from [' + @table_name +'] where ' + @criteria + ')',
				referencing_table.name,
				0
			from  sys.foreign_key_columns fk
				inner join sys.columns referencing_column on fk.parent_object_id = referencing_column.object_id 
					and fk.parent_column_id = referencing_column.column_id 
				inner join  sys.columns referenced_column on fk.referenced_object_id = referenced_column.object_id 
					and fk.referenced_column_id = referenced_column.column_id 
				inner join  sys.objects referencing_table on fk.parent_object_id = referencing_table.object_id 
				inner join  sys.objects referenced_table on fk.referenced_object_id = referenced_table.object_id 
				inner join  sys.objects constraint_object on fk.constraint_object_id = constraint_object.object_id
			where referenced_table.name = @table_name
				and referencing_table.name != referenced_table.name

		update @to_delete set
			processed = 1
		where id = @id
	end

	select 'delete from [' + table_name + '] where ' + criteria from @to_delete order by id desc
end
GO

CREATE PROCEDURE [dbo].[UniversalCascadeDelete]
     
    @tableName VARCHAR(200),
    @baseCriteria NVARCHAR(1000)
AS
BEGIN
     
     
    SET NOCOUNT ON;
    DECLARE @deleteSQL NVARCHAR(900)

    CREATE TABLE #DeleteCascade
    (
        DeleteSQL NVARCHAR(900)
    )

    INSERT INTO #DeleteCascade
    EXEC usp_delete_cascade @tableName, @baseCriteria

    DECLARE DeleteCursor CURSOR FOR
    SELECT *
    FROM #DeleteCascade

    OPEN DeleteCursor

    FETCH NEXT FROM DeleteCursor
    INTO @deleteSQL

    WHILE @@FETCH_STATUS = 0
    BEGIN
        EXEC sp_executesql @deleteSQL

        FETCH NEXT FROM DeleteCursor
        INTO @deleteSQL
    END

    CLOSE DeleteCursor
    DEALLOCATE DeleteCursor

    DROP TABLE #DeleteCascade
END
GO

CREATE PROCEDURE [dbo].[GetPreviousAndNextEventIdsForCircuit]
    @EventID as INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @currentTime DATETIME2,
			@beginTime DATETIME2,
			@endTime DATETIME2,
            @meterID INT,
			@parentID INT,
			@childID INT

    SELECT @currentTime = StartTime, @meterID = MeterID, @parentID = (SELECT ParentNormalID FROM Meter WHERE ID = Event.MeterID), @childID = (SELECT TOP 1 ID FROM Meter WHERE ParentNormalID = Event.MeterID)
    FROM Event
    WHERE ID = @EventID

	SET @beginTime = DATEADD(SECOND, -11, @currentTime)
	SET @endTime = DATEADD(SECOND, 11, @currentTime)

	select * into #childEvents from (select ID, DATEDIFF(MILLISECOND, @currentTime, StartTime) as diff from event where StartTime BETWEEN @beginTime AND @endTime AND MeterID = @childID) as tbl order by diff
    select * into #parentEvents from (select ID, DATEDIFF(MILLISECOND, @currentTime, StartTime) as diff from event where StartTime BETWEEN @beginTime AND @endTime AND MeterID = @parentID) as tbl order by diff

    SELECT evt2.ID as previd, evt3.ID as nextid
    FROM Event evt1 LEFT OUTER JOIN 
         Event evt2 ON evt2.ID = (SELECT TOP 1 ID FROM #parentEvents)
         LEFT OUTER JOIN 
         Event evt3 ON evt3.ID = (SELECT TOP 1 ID FROM #childEvents)
    WHERE evt1.ID = @EventID

	drop table #childEvents
	drop table #parentEvents
END
GO

/****** Object:  UserDefinedFunction [dbo].[GetJSONValueForProperty]    Script Date: 6/30/2017 8:32:57 AM ******/
CREATE Function [dbo].GetJSONValueForProperty(@data varchar(max), @columnName varchar(max))
Returns VarChar(max)
AS
Begin
	IF CHARINDEX(@columnName, @data) = 0 
		Return 'None'


	   Return Substring(@Data, 
				   CHARINDEX('"'+@columnName+'":"', @data) + LEN('"'+@columnName+'":"'),
				   CHARINDEX('"', @data, CHARINDEX('"'+@columnName+'":"', @data) + LEN('"'+@columnName+'":"')) - CHARINDEX('"'+@columnName+'":"', @data) - LEN('"'+@columnName+'":"'))
End
GO
