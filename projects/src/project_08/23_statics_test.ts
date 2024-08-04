export const class1 = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/StaticsTest/Class1.vm

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
// File name: projects/8/FunctionCalls/StaticsTest/Class2.vm

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
// File name: projects/8/FunctionCalls/StaticsTest/Sys.vm

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
// File name: projects/8/FunctionCalls/StaticsTest/StaticsTestVME.tst

// Tests and illustrates the statics test on the VM emulator.

load,
compare-to StaticsTest.cmp,

set sp 261,

repeat 36 {
	vmstep;
}

output-list RAM[0]%D1.6.1 RAM[261]%D1.6.1 RAM[262]%D1.6.1;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/StaticsTest/StaticsTest.tst

// Tests StaticTest.asm in the CPU emulator.
// This assembly file results from translating the staticsTest folder.

compare-to StaticsTest.cmp,

set RAM[0] 256,

repeat 2500 {
	ticktock;
}

output-list RAM[0]%D1.6.1 RAM[261]%D1.6.1 RAM[262]%D1.6.1;
output;
`;

export const cmp = `| RAM[0] |RAM[261]|RAM[262]|
|    263 |     -2 |      8 |
`;
