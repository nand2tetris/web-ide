#/bin/bash

shopt -s globstar

declare -A PACKAGES
PACKAGES[HackPackageSource]=Hack
PACKAGES[HackGUIPackageSource]=HackGUI
PACKAGES[CompilersPackageSource]=Compilers
PACKAGES[SimulatorsPackageSource]=Simulators
PACKAGES[SimulatorsGUIPackageSource]=SimulatorsGUI

#PACKAGES[BuiltInChipsSource] = BuiltInChips
#PACKAGES[BuiltInVMCodeSource] = BuiltInVM
#PACKAGES[MainClassesSource

CLASSPATH="."
for pkg in ${!PACKAGES[@]}; do
    build="${pkg}/build"
    mkdir --parents $build
    CLASSPATH="${build}:${CLASSPATH}"
done

export CLASSPATH
echo $CLASSPATH

for pkg in ${!PACKAGES[@]}; do
    jar=${PACKAGES[$pkg]}.jar
    javac -d $pkg/build $pkg/**/*.java
    jar cvf InstallDir/bin/lib/$jar $pkg/build/**/*.class
done