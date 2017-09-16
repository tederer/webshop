@echo off
set BASEDIR=%~dp0
if %BASEDIR:~-1,1% NEQ \ set BASEDIR=%BASEDIR%\

set WEBROOTFOLDER=%BASEDIR%webroot

if not exist %WEBROOTFOLDER% md %WEBROOTFOLDER%

node D:\JavaScriptDevelopment\webserver\src\start.js %WEBROOTFOLDER%

if errorlevel 1 pause