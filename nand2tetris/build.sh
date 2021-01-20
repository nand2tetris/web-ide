#/bin/bash

shopt -s globstar

mkdir --parents InstallDir/build
rm -rf InstallDir/build/*

javac -d InstallDir/build -Xlint:deprecation -Xlint:unchecked org/**/*.java
cd InstallDir
jar cf nand2tetris.jar bin
cd build
jar uf ../nand2tetris.jar org