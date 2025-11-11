export const sys = `// Sys.vm. Tested by the NestedCall test script.
// Consists of three functions: Sys.init, Sys.main, and Sys.add12.

// Calls Sys.main() and stores a return value in temp 1.
// Does not return (enters infinite loop).
// The VM implementation starts running the Sys.init function, by default.
function Sys.init 0
	push constant 4000	// tests that THIS and THAT are handled correctly
	pop pointer 0
	push constant 5000
	pop pointer 1
	call Sys.main 0
	pop temp 1
	label LOOP
	goto LOOP

// Sets locals 1, 2 and 3 to some values. Leaves locals 0 and 4 unchanged, 
// to test that the 'function' VM command initializes them to 0 (the test 
// script sets them to -1 before this code starts running).
// Calls Sys.add12(123) and stores the return value (should be 135) in temp 0.
// Returns local 0 + local 1 + local 2 + local 3 + local 4 (should be 456), to 
// confirm that locals were not mangled by the function call.
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

// Returns (argument 0) + 12.
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

export const vm_tst = `// Tests and illustrates how the VM implementation handles function-call-and-return,
// by executing the functions in Sys.vm in the VM emulator.
// In particular, loads and runs the functions in Sys.vm.

load Sys.vm,
compare-to NestedCall.cmp,
output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1 RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[5]%D1.6.1 RAM[6]%D1.6.1;

set RAM[0] 261,
set RAM[1] 261,
set RAM[2] 256,
set RAM[3] -3,
set RAM[4] -4,
set RAM[5] -1, // test results
set RAM[6] -1,
set RAM[256] 1234, // fake stack frame from call Sys.init
set RAM[257] -1,
set RAM[258] -2,
set RAM[259] -3,
set RAM[260] -4,

set RAM[261] -1, // Initialize stack to check for local segment
set RAM[262] -1, // being cleared to zero.
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

set sp 261,
set local 261,
set argument 256,
set this 3000,
set that 4000;

repeat 50 {
	vmstep;
}
output;
`;

export const hdl_tst = `// Tests how the VM implementation handles function-call-and-return,
// by executing the functions in Sys.vm.
// In particular, loads and runs NestedCall.asm, which results when 
// the VM translator is applied to the NestedCall folder, which 
// includes only one VM file: Sys.vm.

compare-to NestedCall.cmp,

set RAM[0] 261,
set RAM[1] 261,
set RAM[2] 256,
set RAM[3] -3,
set RAM[4] -4,
set RAM[5] -1,     // test results
set RAM[6] -1,
set RAM[256] 1234, // fake stack frame from call Sys.init
set RAM[257] -1,
set RAM[258] -2,
set RAM[259] -3,
set RAM[260] -4,

set RAM[261] -1,   // Initializes the stack, to check that the local segment
set RAM[262] -1,   // is initialized to zeros by the 'function' VM command.
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

output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1 RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[5]%D1.6.1 RAM[6]%D1.6.1;
output;
`;

export const cmp = `| RAM[0] | RAM[1] | RAM[2] | RAM[3] | RAM[4] | RAM[5] | RAM[6] |
|    261 |    261 |    256 |   4000 |   5000 |    135 |    246 |
`;
