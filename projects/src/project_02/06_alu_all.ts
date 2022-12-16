export const hdl = `/**
 * The ALU (Arithmetic Logic Unit).
 * Computes one of the following functions:
 * x+y, x-y, y-x, 0, 1, -1, x, y, -x, -y, !x, !y,
 * x+1, y+1, x-1, y-1, x&y, x|y on two 16-bit inputs, 
 * according to 6 input bits denoted zx,nx,zy,ny,f,no.
 * 
 * All operations:
 * Ensure your solution handles these undocumented opcodes:
 * 
 * -2, !(x&y), !(x|y), !x&y, !(!x&y), !(x&!y), x&!y
 * x+y+1, x-y-1, -(x+2), -(y+2), -(x+y+2), -(x+y+1), -(x-y+1)
 * 
 * In addition, the ALU computes two 1-bit outputs:
 * if the ALU output == 0, zr is set to 1; otherwise zr is set to 0;
 * if the ALU output < 0, ng is set to 1; otherwise ng is set to 0.
 */

// Implementation: the ALU logic manipulates the x and y inputs
// and operates on the resulting values, as follows:
// if (zx == 1) set x = 0        // 16-bit constant
// if (nx == 1) set x = !x       // bitwise not
// if (zy == 1) set y = 0        // 16-bit constant
// if (ny == 1) set y = !y       // bitwise not
// if (f == 1)  set out = x + y  // integer 2's complement addition
// if (f == 0)  set out = x & y  // bitwise and
// if (no == 1) set out = !out   // bitwise not
// if (out == 0) set zr = 1
// if (out < 0) set ng = 1

// Testing: the test script below has tests for the undocumented instructions
// listed first, and then has the tests for the documented ALU instructions.

CHIP ALU {
    IN  
        x[16], y[16],  // 16-bit inputs        
        zx, // zero the x input?
        nx, // negate the x input?
        zy, // zero the y input?
        ny, // negate the y input?
        f,  // compute out = x + y (if 1) or x & y (if 0)
        no; // negate the out output?

    OUT 
        out[16], // 16-bit output
        zr, // 1 if (out == 0), 0 otherwise
        ng; // 1 if (out < 0),  0 otherwise

    PARTS:
   // Put you code here:
}`;
export const cmp = `|        x         |        y         |zx |nx |zy |ny | f |no |       out        |zr |ng |
| 0000000000000000 | 0000000000000000 | 1 | 1 | 1 | 1 | 1 | 0 | 1111111111111110 | 0 | 1 |
| 0000000000000011 | 0000000000000101 | 0 | 0 | 0 | 0 | 0 | 1 | 1111111111111110 | 0 | 1 |
| 0000000000000011 | 0000000000000101 | 0 | 1 | 0 | 1 | 0 | 0 | 1111111111111000 | 0 | 1 |
| 0000000000000011 | 0000000000000101 | 0 | 1 | 0 | 0 | 0 | 0 | 1111111111110100 | 0 | 1 |
| 0000000000000011 | 0000000000000101 | 0 | 1 | 0 | 0 | 0 | 1 | 1111111111111011 | 0 | 1 |
| 0000000000000011 | 0000000000000101 | 0 | 0 | 0 | 1 | 0 | 1 | 1111111111111101 | 0 | 1 |
| 0000000000000011 | 0000000000000101 | 0 | 0 | 0 | 1 | 0 | 0 | 1111111111110010 | 0 | 1 |
| 0000000000001101 | 0000000000010011 | 0 | 1 | 0 | 1 | 1 | 1 | 0000000000100001 | 0 | 0 |
| 0000000000001101 | 0000000000010011 | 0 | 0 | 0 | 1 | 1 | 0 | 1111111111111001 | 0 | 1 |
| 0000000000001101 | 0000000000010011 | 0 | 1 | 1 | 1 | 1 | 0 | 1111111111110001 | 0 | 1 |
| 0000000000001101 | 0000000000010011 | 1 | 1 | 0 | 1 | 1 | 0 | 1111111111101011 | 0 | 1 |
| 0000000000001101 | 0000000000010011 | 0 | 1 | 0 | 1 | 1 | 0 | 1111111111011110 | 0 | 1 |
| 0000000000001101 | 0000000000010011 | 0 | 0 | 0 | 0 | 1 | 1 | 1111111111011111 | 0 | 1 |
| 0000000000001101 | 0000000000010011 | 0 | 1 | 0 | 0 | 1 | 0 | 0000000000000101 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 1 | 0 | 1 | 0 | 1 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 1 | 0 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 0 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 0 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 0 | 1 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 0 | 1 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 1 | 1 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 1 | 1 | 1 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 1 | 0 | 1111111111111110 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 0 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 0 | 0 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 1 | 1 | 1 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 0 | 0 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 0 | 1 | 0 | 1 | 1111111111111111 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 1 | 0 | 1 | 0 | 1 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 1 | 0 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 0 | 0 | 0000000000010001 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 0 | 0 | 0000000000000011 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 0 | 1 | 1111111111101110 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 0 | 1 | 1111111111111100 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 1 | 1 | 1111111111101111 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 1 | 1 | 1111111111111101 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 1 | 1 | 1 | 1 | 1 | 0000000000010010 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 1 | 1 | 1 | 0000000000000100 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 1 | 0 | 0000000000010000 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 1 | 0 | 0000000000000010 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 0 | 0 | 1 | 0 | 0000000000010100 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 1 | 0 | 0 | 1 | 1 | 0000000000001110 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 0 | 1 | 1 | 1 | 1111111111110010 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 0 | 0 | 0 | 0 | 0000000000000001 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 1 | 0 | 1 | 0 | 1 | 0000000000010011 | 0 | 0 |`;
export const tst = `output-list x%B1.16.1 y%B1.16.1 zx%B1.1.1 nx%B1.1.1 zy%B1.1.1 
ny%B1.1.1 f%B1.1.1 no%B1.1.1 out%B1.16.1 zr%B1.1.1
ng%B1.1.1;

// Compute -2 
set x %B0000000000000000,
set y %B0000000000000000,
set zx 1, set nx 1, set zy 1, set ny 1, set f  1, set no 0, eval, output;

set x %B0000000000000011,
set y %B0000000000000101;

set zx 0, set nx 0, set zy 0, set ny 0, set f  0, set no 1, eval, output;
set zx 0, set nx 1, set zy 0, set ny 1, set f  0, set no 0, eval, output;
set zx 0, set nx 1, set zy 0, set ny 0, set f  0, set no 0, eval, output;
set zx 0, set nx 1, set zy 0, set ny 0, set f  0, set no 1, eval, output;
set zx 0, set nx 0, set zy 0, set ny 1, set f  0, set no 1, eval, output;
set zx 0, set nx 0, set zy 0, set ny 1, set f  0, set no 0, eval, output;

set x %B0000000000001101, // x = 13
set y %B0000000000010011; // y = 19

set zx 0, set nx 1, set zy 0, set ny 1, set f 1, set no 1, eval, output;
set zx 0, set nx 0, set zy 0, set ny 1, set f 1, set no 0, eval, output;
set zx 0, set nx 1, set zy 1, set ny 1, set f 1, set no 0, eval, output;
set zx 1, set nx 1, set zy 0, set ny 1, set f 1, set no 0, eval, output;
set zx 0, set nx 1, set zy 0, set ny 1, set f 1, set no 0, eval, output;
set zx 0, set nx 0, set zy 0, set ny 0, set f 1, set no 1, eval, output;
set zx 0, set nx 1, set zy 0, set ny 0, set f 1, set no 0, eval, output;

set x %B0000000000000000,  // x = 0
set y %B1111111111111111;  // y = -1

// Compute 0
set zx 1, set nx 0, set zy 1, set ny 0, set f  1, set no 0, eval, output;

// Compute 1
set zx 1, set nx 1, set zy 1, set ny 1, set f  1, set no 1, eval, output;

// Compute -1
set zx 1, set nx 1, set zy 1, set ny 0, set f  1, set no 0, eval, output;

// Compute x
set zx 0, set nx 0, set zy 1, set ny 1, set f  0, set no 0, eval, output;

// Compute y
set zx 1, set nx 1, set zy 0, set ny 0, set f  0, set no 0, eval, output;

// Compute !x
set zx 0, set nx 0, set zy 1, set ny 1, set f  0, set no 1, eval, output;

// Compute !y
set zx 1, set nx 1, set zy 0, set ny 0, set f  0, set no 1, eval, output;

// Compute -x
set zx 0, set nx 0, set zy 1, set ny 1, set f  1, set no 1, eval, output;

// Compute -y
set zx 1, set nx 1, set zy 0, set ny 0, set f  1, set no 1, eval, output;

// Compute x + 1
set zx 0, set nx 1, set zy 1, set ny 1, set f  1, set no 1, eval, output;

// Compute y + 1
set zx 1, set nx 1, set zy 0, set ny 1, set f  1, set no 1, eval, output;

// Compute x - 1
set zx 0, set nx 0, set zy 1, set ny 1, set f  1, set no 0, eval, output;

// Compute y - 1
set zx 1, set nx 1, set zy 0, set ny 0, set f  1, set no 0, eval, output;

// Compute x + y
set zx 0, set nx 0, set zy 0, set ny 0, set f  1, set no 0, eval, output;

// Compute x - y
set zx 0, set nx 1, set zy 0, set ny 0, set f  1, set no 1, eval, output;

// Compute y - x
set zx 0, set nx 0, set zy 0, set ny 1, set f  1, set no 1, eval, output;

// Compute x & y
set zx 0, set nx 0, set zy 0, set ny 0, set f  0, set no 0, eval, output;

// Compute x | y
set zx 0, set nx 1, set zy 0, set ny 1, set f  0, set no 1, eval, output;

set x %B000000000010001,  // x = 17
set y %B000000000000011;  // y =  3

// Compute 0
set zx 1, set nx 0, set zy 1, set ny 0, set f  1, set no 0, eval, output;

// Compute 1
set zx 1, set nx 1, set zy 1, set ny 1, set f  1, set no 1, eval, output;

// Compute -1
set zx 1, set nx 1, set zy 1, set ny 0, set f  1, set no 0, eval, output;

// Compute x
set zx 0, set nx 0, set zy 1, set ny 1, set f  0, set no 0, eval, output;

// Compute y
set zx 1, set nx 1, set zy 0, set ny 0, set f  0, set no 0, eval, output;

// Compute !x
set zx 0, set nx 0, set zy 1, set ny 1, set f  0, set no 1, eval, output;

// Compute !y
set zx 1, set nx 1, set zy 0, set ny 0, set f  0, set no 1, eval, output;

// Compute -x
set zx 0, set nx 0, set zy 1, set ny 1, set f  1, set no 1, eval, output;

// Compute -y
set zx 1, set nx 1, set zy 0, set ny 0, set f  1, set no 1, eval, output;

// Compute x + 1
set zx 0, set nx 1, set zy 1, set ny 1, set f  1, set no 1, eval, output;

// Compute y + 1
set zx 1, set nx 1, set zy 0, set ny 1, set f  1, set no 1, eval, output;

// Compute x - 1
set zx 0, set nx 0, set zy 1, set ny 1, set f  1, set no 0, eval, output;

// Compute y - 1
set zx 1, set nx 1, set zy 0, set ny 0, set f  1, set no 0, eval, output;

// Compute x + y
set zx 0, set nx 0, set zy 0, set ny 0, set f  1, set no 0, eval, output;

// Compute x - y
set zx 0, set nx 1, set zy 0, set ny 0, set f  1, set no 1, eval, output;

// Compute y - x
set zx 0, set nx 0, set zy 0, set ny 1, set f  1, set no 1, eval, output;

// Compute x & y
set zx 0, set nx 0, set zy 0, set ny 0, set f  0, set no 0, eval, output;

// Compute x | y
set zx 0, set nx 1, set zy 0, set ny 1, set f  0, set no 1, eval, output;`;
