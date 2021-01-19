#!/bin/sh
cd `dirname $0`
java -classpath "${CLASSPATH}:nand2tetris.jar" org.nand2tetris.hack.main.HardwareSimulatorMain $1