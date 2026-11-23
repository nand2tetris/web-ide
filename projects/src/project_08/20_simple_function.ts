export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: SimpleFunction/SimpleFunction.vm

// Performs a simple calculation and returns the result.
// argument[0] and argument[1] must be set by the caller.

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
// File name: SimpleFunction/SimpleFunctionVME.tst

// Tests SimpleFunction.vm in the VM emulator.

load SimpleFunction.vm,

// The test checks that the "function" command initializes two local
// variables to zero, and that the "return" command places the computed
// result on the caller's stack and restores the caller's state.

// Initializes the VM pointers to simulate the state immediately after
// executing "call SimpleFunction.test 2", and before the first command
// of SimpleFunction.test executes.
// ARG = 310 is an arbitrary choice. Since the call has two arguments
// and pushes five values onto the stack, LCL = SP = 310 + 2 + 5 = 317.
// THIS and THAT are assigned arbitrary values.
set argument 310,
set local 317,
set sp 317,
set this 3000,
set that 4000,

// The "call" command is bypassed by constructing the call frame that we would
// expect immediately after executing "call SimpleFunction.test 2":
//
//   Address   Value   Contents
//   --------------------------------
//   310       1234    argument 0  <-- ARG
//   311       37      argument 1
//   312       9       return address
//   313       305     saved LCL
//   314       300     saved ARG
//   315       3010    saved THIS
//   316       4010    saved THAT
//   317               <-- LCL, SP
//
// The five values at RAM[312..316] represent the caller's saved state.
// The saved THIS and THAT values are deliberately different from the current
// values, allowing the test to verify that "return" restores them.
set argument[0] 1234,
set argument[1] 37,
set argument[2] 9,
set argument[3] 305,
set argument[4] 300,
set argument[5] 3010,
set argument[6] 4010,

// Executes the function, which computes !(0 + 0) + 1234 - 37 = 1196.
repeat 10 {
    vmstep;
}

// The "return" command must place the result at RAM[310],
// set SP to 311, and restore the caller's segment pointers.
// Expected results:
//
//   Address   Value   Contents
//   --------------------------------
//   310       1196    return value  <-- SP - 1
//   311                             <-- SP
//
//   LCL  = 305
//   ARG  = 300
//   THIS = 3010
//   THAT = 4010
//
compare-to SimpleFunction.cmp,
output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1
            RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[310]%D1.6.1;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: SimpleFunction/SimpleFunction.tst

// Tests SimpleFunction.asm in the CPU emulator.
// Assumes that the program is already loaded.

// The test checks that the "function" command initializes two local
// variables to zero, and that the "return" command places the computed
// result on the caller's stack and restores the caller's state.

// Initializes the VM pointers to simulate the state immediately after
// executing "call SimpleFunction.test 2", and before the first command
// of SimpleFunction.test executes.
// ARG = 310 is an arbitrary choice. Since the call has two arguments
// and pushes five values onto the stack, LCL = SP = 310 + 2 + 5 = 317.
// THIS and THAT are assigned arbitrary values.
set RAM[2] 310,    // ARG
set RAM[1] 317,    // LCL
set RAM[0] 317,    // SP
set RAM[3] 3000,   // THIS
set RAM[4] 4000,   // THAT

// The "call" command is bypassed by constructing the call frame that we would
// expect immediately after executing "call SimpleFunction.test 2":
//
//   Address   Value   Contents
//   --------------------------------
//   310       1234    argument 0  <-- ARG
//   311       37      argument 1
//   312       1000    return address
//   313       305     saved LCL
//   314       300     saved ARG
//   315       3010    saved THIS
//   316       4010    saved THAT
//   317               <-- LCL, SP
//
// The five values at RAM[312..316] represent the caller's saved state.
// The saved THIS and THAT values are deliberately different from the current
// values, allowing the test to verify that "return" restores them.
set RAM[310] 1234,
set RAM[311] 37,
set RAM[312] 1000,
set RAM[313] 305,
set RAM[314] 300,
set RAM[315] 3010,
set RAM[316] 4010,

// Executes enough CPU cycles to complete the function, which computes
// !(0 + 0) + 1234 - 37 = 1196, and return.
repeat 300 {
    ticktock;
}

// The "return" command must place the result at RAM[310],
// set SP to 311, and restore the caller's segment pointers.
// Expected results:
//
//   Address   Value   Contents
//   --------------------------------
//   310       1196    return value  <-- SP - 1
//   311                             <-- SP
//
//   LCL  = 305
//   ARG  = 300
//   THIS = 3010
//   THAT = 4010
//
compare-to SimpleFunction.cmp,
output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1
            RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[310]%D1.6.1;
output;
`;

export const cmp = `| RAM[0] | RAM[1] | RAM[2] | RAM[3] | RAM[4] |RAM[310]|
|    311 |    305 |    300 |   3010 |   4010 |   1196 |
`;
