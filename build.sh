#!/bin/sh

ASSETS=(
   index.html
   fonts
)

npx tsc 
npx rollup -c 
cp -r ${ASSETS/#/src/} dist
