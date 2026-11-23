export const sys = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: NestedCall/Sys.vm

// Tests nested function calls and returns using three functions:
// Sys.init, Sys.main, and Sys.add12.
// Each function assigns distinct values to THIS and THAT,
// allowing the test to verify that these pointers are saved
// and restored correctly across nested function calls.

// Sys.init is the entry point.
// Sets THIS = 4000 and THAT = 5000, then calls Sys.main.
// Stores the returned value (expected: 246) in temp 1,
// and enters an infinite loop.
function Sys.init 0
    push constant 4000
    pop pointer 0
    push constant 5000
    pop pointer 1
    call Sys.main 0
    pop temp 1
    label LOOP
    goto LOOP

// Sys.main declares five local variables.
// Before execution, the test script sets their RAM
// locations to -1, to allow checking that the "function"
// command initializes all local variables to zero.
//
// Sys.main sets local 1 = 200, local 2 = 40, and local 3 = 6,
// leaving local 0 and local 4 at their initialized values (0).
// It then calls Sys.add12 with argument 123 and stores the
// returned value (expected: 135) in temp 0.
//
// Finally, Sys.main returns the sum of its five local variables
// (expected: 246). This allows checking that the nested call preserved
// the caller's local variables and restored its segment pointers.
function Sys.main 5
    push constant 4001
    pop pointer 0
    push constant 5001
    pop pointer 1
    push constant 200
    pop local 1
    push constant 40
    pop local 2
    push constant 6
    pop local 3
    push constant 123
    call Sys.add12 1
    pop temp 0
    push local 0
    push local 1
    push local 2
    push local 3
    push local 4
    add
    add
    add
    add
    return

// Sys.add12 sets THIS = 4002 and THAT = 5002,
// then returns argument 0 + 12 (expected: 135).
function Sys.add12 0
    push constant 4002
    pop pointer 0
    push constant 5002
    pop pointer 1
    push argument 0
    push constant 12
    add
    return
`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: NestedCall/NestedCallVME.tst

// Tests nested function calls and returns by executing
// NestedCall/Sys.vm in the VM emulator.
// See Sys.vm for more details.

load Sys.vm,

// This test does not execute bootstrap code. Instead of calling Sys.init,
// it manually simulates the call frame that would have been created by
// calling Sys.init. The five-word frame occupies RAM[256] through RAM[260],
// and the stack pointer is initialized to 261.

set RAM[0] 261,
set RAM[1] 261,
set RAM[2] 256,
set RAM[3] -3,
set RAM[4] -4,
set RAM[5] -1,     // Locations for test results
set RAM[6] -1,
set RAM[256] 1234, // Simulated call frame for Sys.init
set RAM[257] -1,
set RAM[258] -2,
set RAM[259] -3,
set RAM[260] -4,

// Initialize unused stack locations to -1.
// This helps verify that the "function" command initializes
// local variables to zero, rather than leaving previous values.
set RAM[261] -1,
set RAM[262] -1,
set RAM[263] -1,
set RAM[264] -1,
set RAM[265] -1,
set RAM[266] -1,
set RAM[267] -1,
set RAM[268] -1,
set RAM[269] -1,
set RAM[270] -1,
set RAM[271] -1,
set RAM[272] -1,
set RAM[273] -1,
set RAM[274] -1,
set RAM[275] -1,
set RAM[276] -1,
set RAM[277] -1,
set RAM[278] -1,
set RAM[279] -1,
set RAM[280] -1,
set RAM[281] -1,
set RAM[282] -1,
set RAM[283] -1,
set RAM[284] -1,
set RAM[285] -1,
set RAM[286] -1,
set RAM[287] -1,
set RAM[288] -1,
set RAM[289] -1,
set RAM[290] -1,
set RAM[291] -1,
set RAM[292] -1,
set RAM[293] -1,
set RAM[294] -1,
set RAM[295] -1,
set RAM[296] -1,
set RAM[297] -1,
set RAM[298] -1,
set RAM[299] -1,

// Sets the VM segment pointers to match the simulated call frame.
set sp 261,
set local 261,
set argument 256,
set this 3000,
set that 4000;

repeat 50 {
    vmstep;
}

compare-to NestedCall.cmp,
output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1 RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[5]%D1.6.1 RAM[6]%D1.6.1;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: NestedCall/NestedCall.tst

// Tests Sys.asm in the CPU emulator.
// Assumes that the program is already loaded.

// Tests nested function calls and returns, including preservation and
// restoration of segment pointers and the caller's local variables.
// Also checks that local variables are initialized to zero and
// that return values are passed correctly between functions.
// See Sys.vm for details.
//
// This test does not execute bootstrap code. Instead of calling Sys.init,
// the test initializes the segment pointers and sets up a five-word call 
// frame, using distinct saved values to verify that the pointers are 
// restored correctly upon return.

// Initializes SP, LCL, ARG, THIS, and THAT.
set RAM[0] 261,
set RAM[1] 261,
set RAM[2] 256,
set RAM[3] -3,
set RAM[4] -4,

// Initializes temp 0 and temp 1, which store the nested return values.
set RAM[5] -1,
set RAM[6] -1,

// Simulates the five-word frame that would have been created by
// "call Sys.init 0":
set RAM[256] 1234,  // return address
set RAM[257] -1,    // saved LCL
set RAM[258] -2,    // saved ARG
set RAM[259] -3,    // saved THIS
set RAM[260] -4,    // saved THAT

// Fills unused stack locations with -1, to check that the "function"
// command initializes local variables to zero.
set RAM[261] -1,
set RAM[262] -1,
set RAM[263] -1,
set RAM[264] -1,
set RAM[265] -1,
set RAM[266] -1,
set RAM[267] -1,
set RAM[268] -1,
set RAM[269] -1,
set RAM[270] -1,
set RAM[271] -1,
set RAM[272] -1,
set RAM[273] -1,
set RAM[274] -1,
set RAM[275] -1,
set RAM[276] -1,
set RAM[277] -1,
set RAM[278] -1,
set RAM[279] -1,
set RAM[280] -1,
set RAM[281] -1,
set RAM[282] -1,
set RAM[283] -1,
set RAM[284] -1,
set RAM[285] -1,
set RAM[286] -1,
set RAM[287] -1,
set RAM[288] -1,
set RAM[289] -1,
set RAM[290] -1,
set RAM[291] -1,
set RAM[292] -1,
set RAM[293] -1,
set RAM[294] -1,
set RAM[295] -1,
set RAM[296] -1,
set RAM[297] -1,
set RAM[298] -1,
set RAM[299] -1,

repeat 4000 {
	ticktock;
}

compare-to NestedCall.cmp,
output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1 RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[5]%D1.6.1 RAM[6]%D1.6.1;
output;
`;

export const cmp = `| RAM[0] | RAM[1] | RAM[2] | RAM[3] | RAM[4] | RAM[5] | RAM[6] |
|    261 |    261 |    256 |   4000 |   5000 |    135 |    246 |
`;
