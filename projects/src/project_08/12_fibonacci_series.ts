export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/ProgramFlow/FibonacciSeries/FibonacciSeries.vm

// Puts the first n elements of the Fibonacci series in the memory,
// starting at address addr. n and addr are given in argument[0] and
// argument[1], which must be initialized by the caller of this code.

	push argument 1         // sets THAT, the base address of the
	pop pointer 1           // that segment, to argument[1]
	push constant 0         // sets the series' first and second
	pop that 0              // elements to 0 and 1, respectively       
	push constant 1   
	pop that 1              
	push argument 0         // sets n, the number of remaining elements
	push constant 2         // to be computed, to argument[0] minus 2,
	sub                     // since 2 elements were already computed.
	pop argument 0          

label LOOP
	push argument 0
	if-goto COMPUTE_ELEMENT // if n > 0, goto COMPUTE_ELEMENT
	goto END                // otherwise, goto END

label COMPUTE_ELEMENT
    // that[2] = that[0] + that[1]
	push that 0
	push that 1
	add
	pop that 2
	// THAT += 1 (updates the base address of that)
	push pointer 1
	push constant 1
	add
	pop pointer 1 
	// updates n-- and loops          
	push argument 0
	push constant 1
	sub
	pop argument 0          
	goto LOOP

label END
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

load FibonacciSeries.vm,
compare-to FibonacciSeries.cmp,

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

compare-to FibonacciSeries.cmp,

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
