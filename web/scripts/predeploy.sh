#!/bin/bash

cd "$(dirname "$(readlink -f "$0")")/.."
cd build

for F in chip cpu asm vm compiler bitmap guide util about; do
  mkdir $F
  cp index.html $F/index.html
done
