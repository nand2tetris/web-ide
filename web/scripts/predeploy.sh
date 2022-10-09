#!/bin/bash

for F in chip guide util ; do
  mkdir build/$F
  cp build/index.html build/$F
done