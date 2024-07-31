export const asm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
// The algorithm is based on repetitive addition.

//// Replace this comment with your code.`;

export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/mult/Mult.tst

// Tests the Mult program, designed to compute R2 = R0 * R1.
// Tests the program by having it multiply several sets of
// R0 and R1 values.

load Mult.asm,
compare-to Mult.cmp,
output-list RAM[0]%D2.6.2 RAM[1]%D2.6.2 RAM[2]%D2.6.2;

set RAM[0] 0,   // Sets R0 and R1 to some input values
set RAM[1] 0,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 20 {
  ticktock;
}
set RAM[0] 0,   // Restores R0 and R1 in case the program changed them
set RAM[1] 0,
output;

set PC 0,
set RAM[0] 1,   // Sets R0 and R1 to some input values
set RAM[1] 0,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 50 {
  ticktock;
}
set RAM[0] 1,   // Restores R0 and R1 in case the program changed them
set RAM[1] 0,
output;

set PC 0,
set RAM[0] 0,   // Sets R0 and R1 to some input values
set RAM[1] 2,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 80 {
  ticktock;
}
set RAM[0] 0,   // Restores R0 and R1 in case the program changed them
set RAM[1] 2,
output;

set PC 0,
set RAM[0] 3,   // Sets R0 and R1 to some input values
set RAM[1] 1,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 120 {
  ticktock;
}
set RAM[0] 3,   // Restores R0 and R1 in case the program changed them
set RAM[1] 1,
output;

set PC 0,
set RAM[0] 2,   // Sets R0 and R1 to some input values
set RAM[1] 4,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 150 {
  ticktock;
}
set RAM[0] 2,   // Restores R0 and R1 in case the program changed them
set RAM[1] 4,
output;

set PC 0,
set RAM[0] 6,   // Sets R0 and R1 to some input values
set RAM[1] 7,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 210 {
  ticktock;
}
set RAM[0] 6,   // Restores R0 and R1 in case the program changed them
set RAM[1] 7,
output;`;

export const cmp = `|  RAM[0]  |  RAM[1]  |  RAM[2]  |
|       0  |       0  |       0  |
|       1  |       0  |       0  |
|       0  |       2  |       0  |
|       3  |       1  |       3  |
|       2  |       4  |       8  |
|       6  |       7  |      42  |`;
