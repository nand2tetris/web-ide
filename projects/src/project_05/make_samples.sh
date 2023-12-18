#!/bin/bash

# write FileName.ts varname SourceFile

function write () {
  echo -n "export const $2 = \`" >> $1
  cat $3 >> $1
  echo "\`;\n\n" >> $1
}

# write_all ts_name ProjName
function write_all() {
  for e in vm vm_tst hdl_tst cmp ; do write $1 $e $2.$e ; done
}