export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/ProgramFlow/BasicLoop/BasicLoop.vm

// Computes the sum 1 + 2 + ... + argument[0] and pushes the 
// result onto the stack. Argument[0] is initialized by the test 
// script before this code starts running.
push constant 0    
pop local 0         // initializes sum = 0
label LOOP_START
push argument 0    
push local 0
add
pop local 0	        // sum = sum + counter
push argument 0
push constant 1
sub
pop argument 0      // counter--
push argument 0
if-goto LOOP_START  // If counter != 0, goto LOOP_START
push local 0
`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/ProgramFlow/BasicLoop/BasicLoopVME.tst

load BasicLoop.vm,
output-file BasicLoop.out,
compare-to BasicLoop.cmp,
output-list RAM[0]%D1.6.1 RAM[256]%D1.6.1;

set sp 256,
set local 300,
set argument 400,
set argument[0] 3;

repeat 33 {
  vmstep;
}

output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/ProgramFlow/BasicLoop/BasicLoop.tst

load BasicLoop.asm,
output-file BasicLoop.out,
compare-to BasicLoop.cmp,
output-list RAM[0]%D1.6.1 RAM[256]%D1.6.1;

set RAM[0] 256,
set RAM[1] 300,
set RAM[2] 400,
set RAM[400] 3;

repeat 600 {
  ticktock;
}

output;
`;

export const cmp = `| RAM[0] |RAM[256]|
|    257 |      6 |
`;
