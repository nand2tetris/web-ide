export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: BasicLoop/BasicLoop.vm

// Computes the sum 1 + 2 + ... + n and pushes the result onto
// the stack. The value n is given in argument[0], which must be 
// initialized before this code is executed.

	push constant 0    
	pop local 0         // sum = 0
label LOOP
	push argument 0     
	push local 0
	add
	pop local 0	        // sum = sum + n
	push argument 0
	push constant 1
	sub
	pop argument 0      // n--
	push argument 0
	if-goto LOOP        // if n > 0, goto LOOP
	push local 0        // else, pushes sum to the stack's top
`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: BasicLoop/BasicLoopVME.tst

// Tests BasicLoop.vm in the VM emulator.

load BasicLoop.vm,

// Before executing, initializes SP, LCL, ARG, and argument[0].
set sp 256,
set local 300,
set argument 400,
set argument[0] 3,

repeat 33 {
 	vmstep;
}

// Verifies the final SP and the result at the stack's base.
// Expected: SP=257, RAM[256]=6.
compare-to BasicLoop.cmp,
output-list RAM[0]%D1.6.1 RAM[256]%D1.6.1;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: BasicLoop/BasicLoop.tst

// Tests BasicLoop.asm in the CPU emulator.
// Assumes that the program is already loaded.

// Before executing, initializes SP, LCL, ARG, and argument[0].
set RAM[0] 256,  // SP
set RAM[1] 300,  // LCL
set RAM[2] 400,  // ARG
set RAM[400] 3,  // argument 0

// Executes enough CPU cycles to complete the loop.
repeat 600 {
	ticktock;
}

// Verifies the final SP and the result at the stack's base.
// Expected: SP=257, RAM[256]=6.
compare-to BasicLoop.cmp,
output-list RAM[0]%D1.6.1 RAM[256]%D1.6.1;
output;
`;

export const cmp = `| RAM[0] |RAM[256]|
|    257 |      6 |
`;
