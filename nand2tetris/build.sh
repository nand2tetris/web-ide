#/bin/bash

shopt -s globstar

mkdir --parents InstallDir/build
rm -rf InstallDir/build/*

javac -d InstallDir/build org/**/*.java
cd InstallDir
jar cvf nand2tetris.jar bin
cd build
jar uvf ../nand2tetris.jar org