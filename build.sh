#!/bin/bash

ASSETS=(
   index.html
   fonts
)

npx tsc 
npx rollup -c 
cp -r ${ASSETS/#/src/} dist
