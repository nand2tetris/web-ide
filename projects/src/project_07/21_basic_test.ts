export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/BasicTest/BasicTest.vm

// Executes pop and push commands.

push constant 10
pop local 0
push constant 21
push constant 22
pop argument 2
pop argument 1
push constant 36
pop this 6
push constant 42
push constant 45
pop that 5
pop that 2
push constant 510
pop temp 6
push local 0
push that 5
add
push argument 1
sub
push this 6
push this 6
add
sub
push temp 6
add
`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/BasicTest/BasicTestVME.tst

// Tests and illustrates BasicTest.vm on the VM simulator.
// Starts by setting the stack pointer and the base addresses
// of relevant memory segments to selected RAM addresses.

load BasicTest.vm,
compare-to BasicTest.cmp,

set sp 256,        // stack pointer
set local 300,     // base address of the local segment
set argument 400,  // base address of the argument segment
set this 3000,     // base address of the this segment
set that 3010,     // base address of the that segment

repeat 25 {        // BasicTest.vm has 25 VM commands
  vmstep;
}

// Outputs the value at the stack's base and some values from the tested memory segments
output-list RAM[256]%D1.6.1 RAM[300]%D1.6.1 RAM[401]%D1.6.1 
            RAM[402]%D1.6.1 RAM[3006]%D1.6.1 RAM[3012]%D1.6.1
            RAM[3015]%D1.6.1 RAM[11]%D1.6.1;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/BasicTest/BasicTest.tst

// Tests BasicTest.asm on the CPU emulator.

compare-to BasicTest.cmp,

set RAM[0] 256,   // stack pointer
set RAM[1] 300,   // base address of the local segment
set RAM[2] 400,   // base address of the argument segment
set RAM[3] 3000,  // base address of the this segment
set RAM[4] 3010,  // base address of the that segment

repeat 600 {      // enough cycles to complete the execution
  ticktock;
}

// Outputs the value at the stack's base and some values from the tested memory segments
output-list RAM[256]%D1.6.1 RAM[300]%D1.6.1 RAM[401]%D1.6.1 
            RAM[402]%D1.6.1 RAM[3006]%D1.6.1 RAM[3012]%D1.6.1
            RAM[3015]%D1.6.1 RAM[11]%D1.6.1;
output;
`;

export const cmp = `|RAM[256]|RAM[300]|RAM[401]|RAM[402]|RAM[3006|RAM[3012|RAM[3015|RAM[11] |
|    472 |     10 |     21 |     22 |     36 |     42 |     45 |    510 |`;
