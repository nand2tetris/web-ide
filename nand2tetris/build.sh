#/bin/sh

pushd HackPackageSource
mkdir build
javac -d build Hack/**/*.java
jar cvf build/Hack.jar build/Hack/**/*.class
popd

cp HackPackageSource/build/Hack.jar InstallDir/bin/lib

pushd HackGUIPackageSource
mkdir build
javac -cp ../InstallDir/bin/lib/Hack.jar -d build HackGUI/*.java
jar cvf build/HackGUI.jar build/HackGUI/**/*.class
popd

cp HackGUIPackageSource/build/HackGUI.jar InstallDir/bin/lib