export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/Computer.hdl
/**
 * The Hack computer, consisting of CPU, ROM and RAM.
 * When reset = 0, the program stored in the ROM executes.
 * When reset = 1, the program's execution restarts. 
 * Thus, to start running the currently loaded program,
 * set reset to 1, and then set it to 0. 
 * From this point onwards, the user is at the mercy of the software.
 * Depending on the program's code, and whether the code is correct,
 * the screen may show some output, the user may be expected to enter
 * some input using the keyboard, or the program may do some procerssing. 
 */
CHIP Computer {

    IN reset;

    PARTS:
    //// Replace this comment with your code.
}`;
export const add_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/ComputerAdd.tst

// Tests the Computer chip by having it execute the program Add.hack.
// The program adds up the constants 2 and 3 and writes the result in RAM[0]. 

// Tracks the values of the time, reset bit, A-register, D-register,
// program counter, R0, R1, and R2.

load Computer.hdl,
compare-to ComputerAdd.cmp,
output-list time%S1.3.1 reset%B2.1.2 ARegister[0]%D1.7.1 DRegister[0]%D1.7.1 PC[]%D0.4.0 RAM16K[0]%D1.7.1 RAM16K[1]%D1.7.1 RAM16K[2]%D1.7.1;

// Loads the binary program Add.hack into the computer's instruction memory 
ROM32K load Add.hack,
output;

// First run (at the beginning PC=0)
repeat 6 {
    tick, tock, output;
}

// Resets the PC
set reset 1,
set RAM16K[0] 0,
tick, tock, output;

// Second run, to check that the PC was reset correctly.
set reset 0,

repeat 6 {
    tick, tock, output;
}`;
export const add_cmp = `|time |reset|ARegister|DRegister|PC[]|RAM16K[0]|RAM16K[1]|RAM16K[2]|
| 0   |  0  |       0 |       0 |   0|       0 |       0 |       0 |
| 1   |  0  |       2 |       0 |   1|       0 |       0 |       0 |
| 2   |  0  |       2 |       2 |   2|       0 |       0 |       0 |
| 3   |  0  |       3 |       2 |   3|       0 |       0 |       0 |
| 4   |  0  |       3 |       5 |   4|       0 |       0 |       0 |
| 5   |  0  |       0 |       5 |   5|       0 |       0 |       0 |
| 6   |  0  |       0 |       5 |   6|       5 |       0 |       0 |
| 7   |  1  |       0 |       5 |   0|       0 |       0 |       0 |
| 8   |  0  |       2 |       5 |   1|       0 |       0 |       0 |
| 9   |  0  |       2 |       2 |   2|       0 |       0 |       0 |
| 10  |  0  |       3 |       2 |   3|       0 |       0 |       0 |
| 11  |  0  |       3 |       5 |   4|       0 |       0 |       0 |
| 12  |  0  |       0 |       5 |   5|       0 |       0 |       0 |
| 13  |  0  |       0 |       5 |   6|       5 |       0 |       0 |`;
export const max_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/ComputerMax.tst

// Tests the Computer chip by having it execute the program Max.hack.
// The program computes maximum(R0, R1) and writes the result in RAM[2].

// Tracks the values of the time, reset bit, A-register, D-register,
// program counter, R0, R1, and R2.
load Computer.hdl,
compare-to ComputerMax.cmp,
output-list time%S1.3.1 reset%B2.1.2 ARegister[]%D1.7.1 DRegister[]%D1.7.1 PC[]%D0.4.0 RAM16K[0]%D1.7.1 RAM16K[1]%D1.7.1 RAM16K[2]%D1.7.1;

// Loads the binary program Add.hack into the computer's instruction memory 
ROM32K load Max.hack,

// first run: computes max(3,5)
set RAM16K[0] 3,
set RAM16K[1] 5,
output;

repeat 14 {
    tick, tock, output;
}

// resets the PC
set reset 1,
tick, tock, output;

// second run: computes max(23456,12345)
set reset 0,
set RAM16K[0] 23456,
set RAM16K[1] 12345,
output;

// The run on these inputs requires less cycles (different branching)
repeat 10 {
    tick, tock, output;
}
`;
export const max_cmp = `|time |reset|ARegister|DRegister|PC[]|RAM16K[0]|RAM16K[1]|RAM16K[2]|
| 0   |  0  |       0 |       0 |   0|       3 |       5 |       0 |
| 1   |  0  |       0 |       0 |   1|       3 |       5 |       0 |
| 2   |  0  |       0 |       3 |   2|       3 |       5 |       0 |
| 3   |  0  |       1 |       3 |   3|       3 |       5 |       0 |
| 4   |  0  |       1 |      -2 |   4|       3 |       5 |       0 |
| 5   |  0  |      10 |      -2 |   5|       3 |       5 |       0 |
| 6   |  0  |      10 |      -2 |   6|       3 |       5 |       0 |
| 7   |  0  |       1 |      -2 |   7|       3 |       5 |       0 |
| 8   |  0  |       1 |       5 |   8|       3 |       5 |       0 |
| 9   |  0  |      12 |       5 |   9|       3 |       5 |       0 |
| 10  |  0  |      12 |       5 |  12|       3 |       5 |       0 |
| 11  |  0  |       2 |       5 |  13|       3 |       5 |       0 |
| 12  |  0  |       2 |       5 |  14|       3 |       5 |       5 |
| 13  |  0  |      14 |       5 |  15|       3 |       5 |       5 |
| 14  |  0  |      14 |       5 |  14|       3 |       5 |       5 |
| 15  |  1  |      14 |       5 |   0|       3 |       5 |       5 |
| 15  |  0  |      14 |       5 |   0|   23456 |   12345 |       5 |
| 16  |  0  |       0 |       5 |   1|   23456 |   12345 |       5 |
| 17  |  0  |       0 |   23456 |   2|   23456 |   12345 |       5 |
| 18  |  0  |       1 |   23456 |   3|   23456 |   12345 |       5 |
| 19  |  0  |       1 |   11111 |   4|   23456 |   12345 |       5 |
| 20  |  0  |      10 |   11111 |   5|   23456 |   12345 |       5 |
| 21  |  0  |      10 |   11111 |  10|   23456 |   12345 |       5 |
| 22  |  0  |       0 |   11111 |  11|   23456 |   12345 |       5 |
| 23  |  0  |       0 |   23456 |  12|   23456 |   12345 |       5 |
| 24  |  0  |       2 |   23456 |  13|   23456 |   12345 |       5 |
| 25  |  0  |       2 |   23456 |  14|   23456 |   12345 |   23456 |`;
export const rect_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/ComputerRect.tst

// Tests the Computer chip by having it execute the program Rect.hack.
// The program draws a rectangle of width 16 pixels and length RAM[0]
// at the top left corner of the screen.

// Tracks the values of the time, A-register, D-register, program counter, R0, R1, and R2.
load Computer.hdl,
compare-to ComputerRect.cmp,
output-list time%S1.3.1 ARegister[]%D1.7.1 DRegister[]%D1.7.1 PC[]%D0.4.0 RAM16K[0]%D1.7.1 RAM16K[1]%D1.7.1 RAM16K[2]%D1.7.1;

// Loads the binary program Rect.hack into the computer's instruction memory 
ROM32K load Rect.hack,

echo "Before you run this script, select the 'Screen' option from the 'View' menu";

echo "A small rectangle should be drawn at the top left of the screen (the 'Screen' option of the 'View' menu should be selected.)";

// Draws a rectangle consisting of 4 rows (each 16 pixels wide)
set RAM16K[0] 4,
output;

repeat 63 {
    tick, tock, output;
}`;
export const rect_cmp = `|time |ARegister|DRegister|PC[]|RAM16K[0]|RAM16K[1]|RAM16K[2]|
| 0   |       0 |       0 |   0|       4 |       0 |       0 |
| 1   |       0 |       0 |   1|       4 |       0 |       0 |
| 2   |       0 |       4 |   2|       4 |       0 |       0 |
| 3   |      23 |       4 |   3|       4 |       0 |       0 |
| 4   |      23 |       4 |   4|       4 |       0 |       0 |
| 5   |      16 |       4 |   5|       4 |       0 |       0 |
| 6   |      16 |       4 |   6|       4 |       0 |       0 |
| 7   |   16384 |       4 |   7|       4 |       0 |       0 |
| 8   |   16384 |   16384 |   8|       4 |       0 |       0 |
| 9   |      17 |   16384 |   9|       4 |       0 |       0 |
| 10  |      17 |   16384 |  10|       4 |       0 |       0 |
| 11  |      17 |   16384 |  11|       4 |       0 |       0 |
| 12  |   16384 |   16384 |  12|       4 |       0 |       0 |
| 13  |   16384 |   16384 |  13|       4 |       0 |       0 |
| 14  |      17 |   16384 |  14|       4 |       0 |       0 |
| 15  |      17 |   16384 |  15|       4 |       0 |       0 |
| 16  |      32 |   16384 |  16|       4 |       0 |       0 |
| 17  |      32 |   16416 |  17|       4 |       0 |       0 |
| 18  |      17 |   16416 |  18|       4 |       0 |       0 |
| 19  |      17 |   16416 |  19|       4 |       0 |       0 |
| 20  |      16 |   16416 |  20|       4 |       0 |       0 |
| 21  |      16 |       3 |  21|       4 |       0 |       0 |
| 22  |      10 |       3 |  22|       4 |       0 |       0 |
| 23  |      10 |       3 |  10|       4 |       0 |       0 |
| 24  |      17 |       3 |  11|       4 |       0 |       0 |
| 25  |   16416 |       3 |  12|       4 |       0 |       0 |
| 26  |   16416 |       3 |  13|       4 |       0 |       0 |
| 27  |      17 |       3 |  14|       4 |       0 |       0 |
| 28  |      17 |   16416 |  15|       4 |       0 |       0 |
| 29  |      32 |   16416 |  16|       4 |       0 |       0 |
| 30  |      32 |   16448 |  17|       4 |       0 |       0 |
| 31  |      17 |   16448 |  18|       4 |       0 |       0 |
| 32  |      17 |   16448 |  19|       4 |       0 |       0 |
| 33  |      16 |   16448 |  20|       4 |       0 |       0 |
| 34  |      16 |       2 |  21|       4 |       0 |       0 |
| 35  |      10 |       2 |  22|       4 |       0 |       0 |
| 36  |      10 |       2 |  10|       4 |       0 |       0 |
| 37  |      17 |       2 |  11|       4 |       0 |       0 |
| 38  |   16448 |       2 |  12|       4 |       0 |       0 |
| 39  |   16448 |       2 |  13|       4 |       0 |       0 |
| 40  |      17 |       2 |  14|       4 |       0 |       0 |
| 41  |      17 |   16448 |  15|       4 |       0 |       0 |
| 42  |      32 |   16448 |  16|       4 |       0 |       0 |
| 43  |      32 |   16480 |  17|       4 |       0 |       0 |
| 44  |      17 |   16480 |  18|       4 |       0 |       0 |
| 45  |      17 |   16480 |  19|       4 |       0 |       0 |
| 46  |      16 |   16480 |  20|       4 |       0 |       0 |
| 47  |      16 |       1 |  21|       4 |       0 |       0 |
| 48  |      10 |       1 |  22|       4 |       0 |       0 |
| 49  |      10 |       1 |  10|       4 |       0 |       0 |
| 50  |      17 |       1 |  11|       4 |       0 |       0 |
| 51  |   16480 |       1 |  12|       4 |       0 |       0 |
| 52  |   16480 |       1 |  13|       4 |       0 |       0 |
| 53  |      17 |       1 |  14|       4 |       0 |       0 |
| 54  |      17 |   16480 |  15|       4 |       0 |       0 |
| 55  |      32 |   16480 |  16|       4 |       0 |       0 |
| 56  |      32 |   16512 |  17|       4 |       0 |       0 |
| 57  |      17 |   16512 |  18|       4 |       0 |       0 |
| 58  |      17 |   16512 |  19|       4 |       0 |       0 |
| 59  |      16 |   16512 |  20|       4 |       0 |       0 |
| 60  |      16 |       0 |  21|       4 |       0 |       0 |
| 61  |      10 |       0 |  22|       4 |       0 |       0 |
| 62  |      10 |       0 |  23|       4 |       0 |       0 |
| 63  |      23 |       0 |  24|       4 |       0 |       0 |`;
export const add = `
0000000000000010
1110110000010000
0000000000000011
1110000010010000
0000000000000000
1110001100001000
`;
export const max = `0000000000000000
1111110000010000
0000000000000001
1111010011010000
0000000000001010
1110001100000001
0000000000000001
1111110000010000
0000000000001100
1110101010000111
0000000000000000
1111110000010000
0000000000000010
1110001100001000
0000000000001110
1110101010000111`;
export const rect = `
0000000000000000
1111110000010000
0000000000010111
1110001100000110
0000000000010000
1110001100001000
0100000000000000
1110110000010000
0000000000010001
1110001100001000
0000000000010001
1111110000100000
1110111010001000
0000000000010001
1111110000010000
0000000000100000
1110000010010000
0000000000010001
1110001100001000
0000000000010000
1111110010011000
0000000000001010
1110001100000001
0000000000010111
1110101010000111`;
