export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/StackTest/StackTest.vm

// Executes a sequence of arithmetic and logical operations on the stack. 

push constant 17
push constant 17
eq
push constant 17
push constant 16
eq
push constant 16
push constant 17
eq
push constant 892
push constant 891
lt
push constant 891
push constant 892
lt
push constant 891
push constant 891
lt
push constant 32767
push constant 32766
gt
push constant 32766
push constant 32767
gt
push constant 32766
push constant 32766
gt
push constant 57
push constant 31
push constant 53
add
push constant 112
sub
neg
and
push constant 82
or
not
`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/StackTest/StackTestVME.tst

// Tests and illustrates StackTest.vm on the VM simulator.

load StackTest.vm,
compare-to StackTest.cmp,

set RAM[0] 256,  // initializes the stack pointer

repeat 38 {      // StackTest.vm has 38 VM commands
  vmstep;
}

// Outputs the stack pointer (RAM[0]) and the stack contents: RAM[256]-RAM[265]
output-list RAM[0]%D2.6.2 
        RAM[256]%D2.6.2 RAM[257]%D2.6.2 RAM[258]%D2.6.2 RAM[259]%D2.6.2 RAM[260]%D2.6.2;
output;
output-list RAM[261]%D2.6.2 RAM[262]%D2.6.2 RAM[263]%D2.6.2 RAM[264]%D2.6.2 RAM[265]%D2.6.2;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/StackTest/StackTest.tst

// Tests StackTest.asm on the CPU emulator.

compare-to StackTest.cmp,

set RAM[0] 256,  // initializes the stack pointer

repeat 1000 {    // enough cycles to complete the execution
  ticktock;
}

// Outputs the stack pointer and the stack contents: RAM[256]-RAM[265]
output-list RAM[0]%D2.6.2 
        RAM[256]%D2.6.2 RAM[257]%D2.6.2 RAM[258]%D2.6.2 RAM[259]%D2.6.2 RAM[260]%D2.6.2;
output;
output-list RAM[261]%D2.6.2 RAM[262]%D2.6.2 RAM[263]%D2.6.2 RAM[264]%D2.6.2 RAM[265]%D2.6.2;
output;
`;

export const cmp = `|  RAM[0]  | RAM[256] | RAM[257] | RAM[258] | RAM[259] | RAM[260] |
|     266  |      -1  |       0  |       0  |       0  |      -1  |
| RAM[261] | RAM[262] | RAM[263] | RAM[264] | RAM[265] |
|       0  |      -1  |       0  |       0  |     -91  |
`;
