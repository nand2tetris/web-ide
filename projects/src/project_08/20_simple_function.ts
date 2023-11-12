export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/FunctionCalls/SimpleFunction/SimpleFunction.vm

// Performs a simple calculation and returns the result.
function SimpleFunction.test 2
push local 0
push local 1
add
not
push argument 0
add
push argument 1
sub
return
`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/FunctionCalls/SimpleFunction/SimpleFunctionVME.tst

load SimpleFunction.vm,
output-file SimpleFunction.out,
compare-to SimpleFunction.cmp,
output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1 
            RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[310]%D1.6.1;

set sp 317,
set local 317,
set argument 310,
set this 3000,
set that 4000,
set argument[0] 1234,
set argument[1] 37,
set argument[2] 9,
set argument[3] 305,
set argument[4] 300,
set argument[5] 3010,
set argument[6] 4010;

repeat 10 {
  vmstep;
}

output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/FunctionCalls/SimpleFunction/SimpleFunction.tst

load SimpleFunction.asm,
output-file SimpleFunction.out,
compare-to SimpleFunction.cmp,
output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1 
            RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[310]%D1.6.1;

set RAM[0] 317,
set RAM[1] 317,
set RAM[2] 310,
set RAM[3] 3000,
set RAM[4] 4000,
set RAM[310] 1234,
set RAM[311] 37,
set RAM[312] 1000,
set RAM[313] 305,
set RAM[314] 300,
set RAM[315] 3010,
set RAM[316] 4010,

repeat 300 {
  ticktock;
}

output;
`;

export const cmp = `| RAM[0] | RAM[1] | RAM[2] | RAM[3] | RAM[4] |RAM[310]|
|    311 |    305 |    300 |   3010 |   4010 |   1196 |
`;
