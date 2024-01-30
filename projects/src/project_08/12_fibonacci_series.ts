export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/08/ProgramFlow/FibonacciSeries/FibonacciSeries.vm

// Puts the first argument[0] elements of the Fibonacci series
// in the memory, starting in the address given in argument[1].
// Argument[0] and argument[1] are initialized by the test script 
// before this code starts running.

push argument 1
pop pointer 1           // that = argument[1]

push constant 0
pop that 0              // first element in the series = 0
push constant 1
pop that 1              // second element in the series = 1

push argument 0
push constant 2
sub
pop argument 0          // num_of_elements -= 2 (first 2 elements are set)

label MAIN_LOOP_START

push argument 0
if-goto COMPUTE_ELEMENT // if num_of_elements > 0, goto COMPUTE_ELEMENT
goto END_PROGRAM        // otherwise, goto END_PROGRAM

label COMPUTE_ELEMENT

push that 0
push that 1
add
pop that 2              // that[2] = that[0] + that[1]

push pointer 1
push constant 1
add
pop pointer 1           // that += 1

push argument 0
push constant 1
sub
pop argument 0          // num_of_elements--

goto MAIN_LOOP_START

label END_PROGRAM
`;

export const vm_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/ProgramFlow/FibonacciSeries/FibonacciSeriesVME.tst

// Tests and illustrates FibonacciSeries.vm on the VM emulator.
// Before executing the code, initializes the stack pointer
// and the base addresses of the local and argument segments,
// and sets argument[0] to n and argument [1] to the base address
// of the generated series.

set sp 256,
set local 300,
set argument 400,
set argument[0] 6,
set argument[1] 3000,

repeat 73 {
	vmstep;
}

// Outputs the series of values generated and written by the code.
output-list RAM[3000]%D1.6.2 RAM[3001]%D1.6.2 RAM[3002]%D1.6.2 
            RAM[3003]%D1.6.2 RAM[3004]%D1.6.2 RAM[3005]%D1.6.2;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/ProgramFlow/FibonacciSeries/FibonacciSeries.tst

// Tests FibonacciSeries.asm on the CPU emulator.
// Before executing the code, initializes the stack pointer
// and the base addresses of the local and argument segments,
// and sets argument[0] and argument [1].

set RAM[0] 256,    // SP
set RAM[1] 300,    // LCL
set RAM[2] 400,    // ARG
set RAM[400] 6,    // argument[0], n
set RAM[401] 3000, // argument[1], base address of the generated series

repeat 1100 {
	ticktock;
}

// Outputs the series of values generated and written by the code.
output-list RAM[3000]%D1.6.2 RAM[3001]%D1.6.2 RAM[3002]%D1.6.2 
            RAM[3003]%D1.6.2 RAM[3004]%D1.6.2 RAM[3005]%D1.6.2;
output;
`;

export const cmp = `|RAM[3000]|RAM[3001]|RAM[3002]|RAM[3003]|RAM[3004]|RAM[3005]|
|      0  |      1  |      1  |      2  |      3  |      5  |
`;
