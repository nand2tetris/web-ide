export const vm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: FibonacciSeries/FibonacciSeries.vm

// Computes and stores the first n elements of the Fibonacci series,
// starting at RAM address addr. The values n and addr are supplied
// in argument[0] and argument[1], which must be initialized before
// this code is executed.

    push argument 1         // Sets THAT, the base address of the
    pop pointer 1           // that segment, to argument[1]
    push constant 0         // Initializes the first two elements
    pop that 0              // of the series to 0 and 1
    push constant 1
    pop that 1
    push argument 0         // Sets n to the number of remaining
    push constant 2         // elements to compute, namely n - 2
    sub
    pop argument 0

label LOOP
    push argument 0
    if-goto COMPUTE_ELEMENT // If n != 0, compute the next element
    goto END                // Otherwise, terminate

label COMPUTE_ELEMENT
    // Computes that[2] = that[0] + that[1]
    push that 0
    push that 1
    add
    pop that 2
    // Advances THAT to the next element
    push pointer 1
    push constant 1
    add
    pop pointer 1
    // Decrements n and repeats
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
// File name: FibonacciSeries/FibonacciSeriesVME.tst

// Tests FibonacciSeries.vm in the VM emulator.

load FibonacciSeries.vm,

// Initializes SP, LCL, and ARG, and sets the program's two arguments:
// n = 6 and the RAM base address for storing the series = 3000.
set sp 256,
set local 300,
set argument 400,
set argument[0] 6,
set argument[1] 3000,

repeat 73 {
    vmstep;
}

// Verifies the six Fibonacci elements stored in RAM.
// Expected values: 0, 1, 1, 2, 3, 5.
compare-to FibonacciSeries.cmp,
output-list RAM[3000]%D1.6.2 RAM[3001]%D1.6.2 RAM[3002]%D1.6.2
            RAM[3003]%D1.6.2 RAM[3004]%D1.6.2 RAM[3005]%D1.6.2;
output;
`;

export const hdl_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: FibonacciSeries/FibonacciSeries.tst

// Tests FibonacciSeries.asm in the CPU emulator.
// Assumes that the program is already loaded.

// Initializes SP, LCL, and ARG, and sets the program's two arguments:
// n = 6 and the RAM base address for storing the series = 3000.
set RAM[0] 256,    // SP
set RAM[1] 300,    // LCL
set RAM[2] 400,    // ARG
set RAM[400] 6,    // argument[0], n
set RAM[401] 3000, // argument[1], base address of the series

// Executes enough CPU cycles to compute the six Fibonacci elements.
repeat 1100 {
    ticktock;
}

// Verifies the six Fibonacci elements stored in RAM.
// Expected values: 0, 1, 1, 2, 3, 5.
compare-to FibonacciSeries.cmp,
output-list RAM[3000]%D1.6.2 RAM[3001]%D1.6.2 RAM[3002]%D1.6.2
            RAM[3003]%D1.6.2 RAM[3004]%D1.6.2 RAM[3005]%D1.6.2;
output;
`;

export const cmp = `|RAM[3000]|RAM[3001]|RAM[3002]|RAM[3003]|RAM[3004]|RAM[3005]|
|      0  |      1  |      1  |      2  |      3  |      5  |
`;
