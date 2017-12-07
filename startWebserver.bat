@echo off
set BASEDIR=%~dp0
set NODE_HOME=D:\software\Node.js\node-v8.9.2-win-x64
set PATH=%PATH%;%NODE_HOME%
if %BASEDIR:~-1,1% NEQ \ set BASEDIR=%BASEDIR%\

title webserver

if not exist %NODE_HOME% (
   echo Home folder "%NODE_HOME%" of node.js does not exist!
   pause
   exit 1
)

set WEBROOTFOLDER=%BASEDIR%webroot

if not exist %WEBROOTFOLDER% md %WEBROOTFOLDER%

node %BASEDIR%\..\webserver\src\start.js %WEBROOTFOLDER%

if errorlevel 1 pause