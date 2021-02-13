#/bin/sh

die() {
    echo $1
    exit 1
}

python assembler_test.py || die 'Assembler test failed'
python translator_test.py || die 'Translator test failed'
python compiler_test.py || die 'Compiler test failed'

for file in ./projects/06/**/*.asm ; do
    echo "Assembling $file..."
    ./assembler.py $file >${file/asm/hack} || die "Failed to assemble ${file}"
done

for file in $(find ./projects/0{7,8} -name '*.vm') ; do
    echo "Translating $file..."
    ./translator.py $file >${file/vm/asm} || die "Failed to assemble ${file}"
done

for dir in ./projects/{10,11}/* ; do
    echo "Compiling $dir..."
    ./compiler.sh $dir >/dev/null || die "Failed to compile ${dir}"
done

echo 'All tests passed'