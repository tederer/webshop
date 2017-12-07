@echo off
set SCRIPTPATH=%~dp0
set GIT_HOME=D:\software\Git\PortableGit\cmd
set NODE_HOME=D:\software\Node.js\node-v8.9.2-win-x64
set GRUNT_HOME=%SCRIPTPATH%\node_modules\grunt\node_modules\.bin
set PATH=%PATH%;%GIT_HOME%;%NODE_HOME%;%GRUNT_HOME%

if not exist %GIT_HOME% (
   echo Home folder "%GIT_HOME%" of GIT does not exist!
   pause
   exit 1
)

if not exist %NODE_HOME% (
   echo Home folder "%NODE_HOME%" of node.js does not exist!
   pause
   exit 1
)

if not exist %GRUNT_HOME% (
   echo Home folder "%GRUNT_HOME%" of grunt does not exist!
   pause
   exit 1
)

echo %SCRIPTPATH%
start cmd /k cd /d %SCRIPTPATH%