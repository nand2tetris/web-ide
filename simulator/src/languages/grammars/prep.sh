#!/bin/bash

cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")"

if (( $# == 0 )); then set -- *.ohm; fi

for f in "$@"; do
  echo "const ${f%.ohm} = \`" >| "${f}.js" 
  cat "$f" | sed 's!\\!\\\\!g' >> "${f}.js" 
  echo "\`;" >> "${f}.js"
  echo "export default ${f%.ohm};" >> "${f}.js"
done