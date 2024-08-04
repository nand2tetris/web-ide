export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/StaticTest/StaticTest.vm

// Executes pop and push commands using the static segment.

push constant 111
push constant 333
push constant 888
pop static 8
pop static 3
pop static 1
push static 3
push static 1
sub
push static 8
add
`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/StaticTest/StaticTestVME.tst

// Tests and illustrates StaticTest.vm on the VM simulator.

load StaticTest.vm,
compare-to StaticTest.cmp,

set sp 256,    // initializes the stack pointer

repeat 11 {    // StaticTest.vm has 11 VM commands
  vmstep;
}

// Outputs the value at the stack's base 
output-list RAM[256]%D1.6.1;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/StaticTest/StaticTest.tst

// Tests StaticTest.asm on the CPU emulator.

compare-to StaticTest.cmp,

set RAM[0] 256,    // initializes the stack pointer

repeat 200 {       // enough cycles to complete the execution
  ticktock;
}

// Outputs the value at the stack's base 
output-list RAM[256]%D1.6.1;
output;
`;

export const cmp = `|RAM[256]|
|   1110 |`;
