for f in *.ohm ; do
  echo "const ${f%.ohm} = \`" >| "${f}.js" 
  cat "$f" | sed 's!\\!\\\\!g' >> "${f}.js" 
  echo "\`;" >> "${f}.js"
  echo "export default ${f%.ohm};" >> "${f}.js"
done