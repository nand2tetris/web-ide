@echo off
cd %0\..
REM java -classpath "%CLASSPATH%;bin/classes;bin/lib/Hack.jar;bin/lib/HackGUI.jar;bin/lib/Simulators.jar;bin/lib/SimulatorsGUI.jar;bin/lib/Compilers.jar" CPUEmulatorMain %1
java -classpath "%CLASSPATH%;nand2tetris.jar" org.nand2tetris.hack.main.CPUEmulatorMain %1
