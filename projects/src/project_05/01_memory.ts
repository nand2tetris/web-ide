export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/Memory.hdl
/** 
 * The Memory chip implements the complete address space of the Hack data memory,
 * including the RAM and memory mapped I/O.
 * Outputs the value of the memory location specified by the address input.
 * If (load == 1), sets the memory location specified by the address input
 * to the value of the in input.
 * Address space rules:
 * Only the upper 16K + 8K + 1 words of the memory are used.
 * Access to address 0 to 16383 results in accessing the RAM;
 * Access to address 16384 to 24575 results in accessing the Screen memory map;
 * Access to address 24576 results in accessing the Keyboard memory map.
 */ 
CHIP Memory {
    IN in[16], load, address[15];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`;
export const tst = `output-list in%D1.6.1 load%B2.1.2 address%B1.15.1 out%D1.6.1;

// Set RAM[0] = -1
set address 0,
set in   -1, set load 1, tick, output; tock, output;

// RAM[0] holds value
set in 9999, set load 0, tick, output; tock, output;

// Did not also write to upper RAM or Screen
set address %X2000, eval, output;
set address %X4000, eval, output;

// Set RAM[0x2000] = 2222
set address %X2000,
set in 2222, set load 1, tick, output; tock, output;

// RAM[0x2000] holds value
set in 9999, set load 0, tick, output; tock, output;

// Did not also write to lower RAM or Screen
set address 0, eval, output;
set address %X4000, eval, output;

set load 0,	// Low order address bits connected
set address %X0001, eval, output;
set address %X0002, eval, output;
set address %X0004, eval, output;
set address %X0008, eval, output;
set address %X0010, eval, output;
set address %X0020, eval, output;
set address %X0040, eval, output;
set address %X0080, eval, output;
set address %X0100, eval, output;
set address %X0200, eval, output;
set address %X0400, eval, output;
set address %X0800, eval, output;
set address %X1000, eval, output;
set address %X2000, eval, output;

// RAM[1234] = 1234
set address %X1234,
set in 1234, set load 1, tick, output; tock, output;

// Did not also write to upper RAM or Screen 
set load 0,
set address %X2234, eval, output;
set address %X6234, eval, output;

// RAM[0x2345] = 2345
set address %X2345,
set in 2345, set load 1, tick, output; tock, output;

// Did not also write to lower RAM or Screen 
set load 0,
set address %X0345, eval, output;
set address %X4345, eval, output;

// Keyboard test

// set address 24576,
// echo "Click the Keyboard icon and hold down the 'K' key (uppercase) until you see the next message (it should appear shortly after that) ...",
// It's important to keep holding the key down since if the system is busy,
// the memory will zero itself before being outputted.

/*
set Keyboard 'K';
while out <> 75 {
    eval,
}
clear-echo, output;
output;
*/

// Screen test

set load 1, set in -1, set address %X4FCF, tick, tock, output;
set address %X504F, tick, tock, output;

// Did not also write to lower or upper RAM
set address %X0FCF, eval, output;
set address %X2FCF, eval, output;

set load 0,				// Low order address bits connected
set address %X4FCE, eval, output;
set address %X4FCD, eval, output;
set address %X4FCB, eval, output;
set address %X4FC7, eval, output;
set address %X4FDF, eval, output;
set address %X4FEF, eval, output;
set address %X4F8F, eval, output;
set address %X4F4F, eval, output;
set address %X4ECF, eval, output;
set address %X4DCF, eval, output;
set address %X4BCF, eval, output;
set address %X47CF, eval, output;
set address %X5FCF, eval, output;


set load 0, set address 24576,
echo "Make sure you see ONLY two horizontal lines in the middle of the screen. Change Keyboard to 'Y' (uppercase) to continue ...";

/*
while out <> 89 {
    eval;
}
*/
clear-echo;`;
export const cmp = `|   in   |load |     address     |  out   |
|     -1 |  1  | 000000000000000 |      0 |
|     -1 |  1  | 000000000000000 |     -1 |
|   9999 |  0  | 000000000000000 |     -1 |
|   9999 |  0  | 000000000000000 |     -1 |
|   9999 |  0  | 010000000000000 |      0 |
|   9999 |  0  | 100000000000000 |      0 |
|   2222 |  1  | 010000000000000 |      0 |
|   2222 |  1  | 010000000000000 |   2222 |
|   9999 |  0  | 010000000000000 |   2222 |
|   9999 |  0  | 010000000000000 |   2222 |
|   9999 |  0  | 000000000000000 |     -1 |
|   9999 |  0  | 100000000000000 |      0 |
|   9999 |  0  | 000000000000001 |      0 |
|   9999 |  0  | 000000000000010 |      0 |
|   9999 |  0  | 000000000000100 |      0 |
|   9999 |  0  | 000000000001000 |      0 |
|   9999 |  0  | 000000000010000 |      0 |
|   9999 |  0  | 000000000100000 |      0 |
|   9999 |  0  | 000000001000000 |      0 |
|   9999 |  0  | 000000010000000 |      0 |
|   9999 |  0  | 000000100000000 |      0 |
|   9999 |  0  | 000001000000000 |      0 |
|   9999 |  0  | 000010000000000 |      0 |
|   9999 |  0  | 000100000000000 |      0 |
|   9999 |  0  | 001000000000000 |      0 |
|   9999 |  0  | 010000000000000 |   2222 |
|   1234 |  1  | 001001000110100 |      0 |
|   1234 |  1  | 001001000110100 |   1234 |
|   1234 |  0  | 010001000110100 |      0 |
|   1234 |  0  | 110001000110100 |      0 |
|   2345 |  1  | 010001101000101 |      0 |
|   2345 |  1  | 010001101000101 |   2345 |
|   2345 |  0  | 000001101000101 |      0 |
|   2345 |  0  | 100001101000101 |      0 |
|     -1 |  1  | 100111111001111 |     -1 |
|     -1 |  1  | 101000001001111 |     -1 |
|     -1 |  1  | 000111111001111 |      0 |
|     -1 |  1  | 010111111001111 |      0 |
|     -1 |  0  | 100111111001110 |      0 |
|     -1 |  0  | 100111111001101 |      0 |
|     -1 |  0  | 100111111001011 |      0 |
|     -1 |  0  | 100111111000111 |      0 |
|     -1 |  0  | 100111111011111 |      0 |
|     -1 |  0  | 100111111101111 |      0 |
|     -1 |  0  | 100111110001111 |      0 |
|     -1 |  0  | 100111101001111 |      0 |
|     -1 |  0  | 100111011001111 |      0 |
|     -1 |  0  | 100110111001111 |      0 |
|     -1 |  0  | 100101111001111 |      0 |
|     -1 |  0  | 100011111001111 |      0 |
|     -1 |  0  | 101111111001111 |      0 |`;
