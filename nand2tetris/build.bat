@echo off

setlocal enableextensions enabledelayedexpansion
call :find-files org *.java

del InstallDir\nand2tetris.jar
erase /P InstallDir\build
javac -d InstallDir\build %PATHS%
javac -d InstallDir\build org\nand2tetris\hack\main\*.java
cd InstallDir
jar cvf nand2tetris.jar bin
cd build
jar uvf ..\nand2tetris.jar org

goto :eof

REM https://stackoverflow.com/a/23839232
:find-files
    set PATHS=
    for /r "%~1" %%P in ("%~2") do (
        set PATHS=!PATHS! "%%~fP"
    )
goto :eof