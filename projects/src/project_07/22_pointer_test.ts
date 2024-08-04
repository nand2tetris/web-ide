export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/PointerTest/PointerTest.vm

// Executes pop and push commands using the 
// pointer, this, and that segments.

push constant 3030
pop pointer 0
push constant 3040
pop pointer 1
push constant 32
pop this 2
push constant 46
pop that 6
push pointer 0
push pointer 1
add
push this 2
sub
push that 6
add
`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/PointerTest/PointerTestVME.tst

// Tests and illustrates PointerTest.vm on the VM simulator.

load PointerTest.vm,
compare-to PointerTest.cmp,

set RAM[0] 256,   // initializes the stack pointer

repeat 15 {       // PointerTest.vm has 15 VM commands
  vmstep;
}

// Outputs the stack base, THIS, THAT, and
// some values from the the this and that segments
output-list RAM[256]%D1.6.1 RAM[3]%D1.6.1 RAM[4]%D1.6.1
            RAM[3032]%D1.6.1 RAM[3046]%D1.6.1;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/PointerTest/PointerTest.tst

// Tests PointerTest.asm on the CPU emulator.

compare-to PointerTest.cmp,

set RAM[0] 256,   // initializes the stack pointer

repeat 450 {      // enough cycles to complete the execution
  ticktock;
}

// Outputs the value at the stack's base, THIS, THAT, and
// some values from the the this and that segments
output-list RAM[256]%D1.6.1 RAM[3]%D1.6.1 
            RAM[4]%D1.6.1 RAM[3032]%D1.6.1 RAM[3046]%D1.6.1;
output;
`;

export const cmp = `|RAM[256]| RAM[3] | RAM[4] |RAM[3032|RAM[3046|
  |   6084 |   3030 |   3040 |     32 |     46 |`;
