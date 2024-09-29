#!/bin/bash
echo "Generating"
cd grammar
antlr4ts  -Werror  -visitor  JackLexer.g4 JackParser.g4 -o ../src/generated
cd ../src/generated
sed -i -e 's/public get serializedATN(/public override get serializedATN\(/g' JackLexer.ts 
sed -i -e 's/public get serializedATN(/public override get serializedATN\(/g' JackParser.ts 
sed -i -e 's/public sempred(/public override sempred\(/g' JackParser.ts 
sed -i -e 's/public get ruleIndex(/public override get ruleIndex\(/g' JackParser.ts 
sed -i -e 's/public enterRule(/public override enterRule\(/g' JackParser.ts 
sed -i -e 's/public exitRule(/public override exitRule\(/g' JackParser.ts 
sed -i -e 's/public accept<Result>(/public override accept<Result>\(/g' JackParser.ts 
sed -i -e 's/public copyFrom(/public override copyFrom\(/g' JackParser.ts 