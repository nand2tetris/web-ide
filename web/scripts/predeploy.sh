#!/bin/bash

cd "$(dirname "$(readlink -f "$0")")/.."

for F in chip cpu asm guide util ; do
  mkdir build/$F
  cp build/index.html build/$F
done