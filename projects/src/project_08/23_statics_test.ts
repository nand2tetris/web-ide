export const class1 = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: StaticsTest/Class1.vm

// Stores two supplied arguments in static[0] and static[1].
function Class1.set 0
	push argument 0
	pop static 0
	push argument 1
	pop static 1
	push constant 0
	return

// Returns static[0] - static[1].
function Class1.get 0
	push static 0
	push static 1
	sub
	return`;

export const class2 = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: StaticsTest/Class2.vm

// Stores two supplied arguments in static[0] and static[1].
function Class2.set 0
	push argument 0
	pop static 0
	push argument 1
	pop static 1
	push constant 0
	return

// Returns static[0] - static[1].
function Class2.get 0
	push static 0
	push static 1
	sub
	return`;

export const sys = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: StaticsTest/Sys.vm

// Tests that different functions, stored in two different 
// class files, manipulate the static segment correctly. 

function Sys.init 0
	push constant 6
	push constant 8
	call Class1.set 2
	pop temp 0 // dumps the return value
	push constant 23
	push constant 15
	call Class2.set 2
	pop temp 0 // dumps the return value
	call Class1.get 0
	call Class2.get 0
label END
	goto END`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: StaticsTest/StaticsTestVME.tst

// Tests the statics test on the VM emulator.

load,  // Loads all the .vm files from the folder associated with this test

// In the translated assembly program, the bootstrap code sets
// SP = 256 and executes call Sys.init 0. This call pushes five
// values onto the stack, so Sys.init starts executing with SP = 261.
// We set SP = 261 to simulate this initial state.

set sp 261,

repeat 36 {
	vmstep;
}

compare-to StaticsTest.cmp,
output-list RAM[0]%D1.6.1 RAM[261]%D1.6.1 RAM[262]%D1.6.1;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: StaticsTest/StaticsTest.tst

// Tests StaticsTest.asm in the CPU emulator.
// This assembly program results from translating the StaticsTest folder.
// Assumes that the program is already loaded.

// The translated program must include bootstrap code that
// sets SP = 256 and executes "call Sys.init 0".

repeat 2500 {
	ticktock;
}

compare-to StaticsTest.cmp,
output-list RAM[0]%D1.6.1 RAM[261]%D1.6.1 RAM[262]%D1.6.1;
output;
`;

export const cmp = `| RAM[0] |RAM[261]|RAM[262]|
|    263 |     -2 |      8 |
`;
