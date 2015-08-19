# ![openXDA](http://www.gridprotectionalliance.org/images/products/openXDA.png)

**eXtensible Disturbance Analytics**

openXDA is an extensible platform for processing event and trending records from disturbance monitoring equipment such as digital fault recorders (DFRs), relays, power quality meters, and other power system IEDs.  It includes a parser for COMTRADE and PQDIF formatted records, and demonstrations have been conducted using Schweitzer Engineering Laboratories (SEL) .eve files. openXDA can be used as a data integration layer and can facilitate the development of automated analytic systems.  openXDA has been deployed in a number of major US utilities to perform automated fault distance calculations based on disturbance waveform data combined with line parameters. openXDA determines the fault presence and fault type, and uses 6 different single ended fault distance calculation methods to determine the line-distance to the fault.  Current projects are extending the openXDA by adding double ended fault distance calculations and algorithms to determine breaker operation timing.  For more information see: [The BIG Picture - Open Source Software (OSS) for Disturbance Analytic Systems](http://www.slideshare.net/FredElmendorf/2014-georgia-tech-fda-pres-asda-using-oss-37239423) and [openFLE overview](http://www.gridprotectionalliance.org/pdf/openFLE_Overview_Landscape.pdf).

![openXDA Overview](/Source/Documentation/XDA-Overview.png?raw=true)

openXDA is an extension of work conducted in 2012 on openFLE for the Electric Power Research Institute (EPRI) which is posted under the project http://EPRIopenFLE.codeplex.com/.  The openFLE project included an open source C# parser for PQDIF formatted power quality files (IEEE 1159.3-2003).

openXDA forms the data layer for the 2014 EPRI project, EPRI Open PQ Dashboard http://sourceforge.net/projects/epriopenpqdashboard.
