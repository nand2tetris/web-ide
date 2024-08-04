export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/SimpleAdd/SimpleAdd.vm

// Pushes and adds two constants.

push constant 7
push constant 8
add
`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/SimpleAdd/SimpleAddVME.tst

// Tests and illustrates SimpleAdd.vm on the VM simulator.

load SimpleAdd.vm,
compare-to SimpleAdd.cmp,

set RAM[0] 256,  // initializes the stack pointer

repeat 3 {       // SimpleAdd.vm has 3 VM commands
  vmstep;
}

// Outputs the stack pointer and the value at the stack's base
output-list RAM[0]%D2.6.2 RAM[256]%D2.6.2;
output;`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/SimpleAdd/SimpleAdd.tst

// Tests SimpleAdd.asm on the CPU emulator.

compare-to SimpleAdd.cmp,

set RAM[0] 256,  // initializes the stack pointer 

repeat 60 {      // enough cycles to complete the execution
  ticktock;
}

// Outputs the stack pointer and the value at the stack's base
output-list RAM[0]%D2.6.2 RAM[256]%D2.6.2;
output;
`;

export const cmp = `|  RAM[0]  | RAM[256] |
|     257  |      15  |
`;
