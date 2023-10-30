export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/02/ALU.hdl
/**
 * ALU (Arithmetic Logic Unit):
 * Computes out = one of the following functions:
 *                0, 1, -1,
 *                x, y, !x, !y, -x, -y,
 *                x + 1, y + 1, x - 1, y - 1,
 *                x + y, x - y, y - x,
 *                x & y, x | y
 * on the 16-bit inputs x, y,
 * according to the input bits zx, nx, zy, ny, f, no.
 * In addition, computes the output bits:
 * zr = (out == 0, 1, 0)
 * ng = (out < 0,  1, 0)
 */
// Implementation: Manipulates the x and y inputs
// and operates on the resulting values, as follows:
// if (zx == 1) sets x = 0        // 16-bit constant
// if (nx == 1) sets x = !x       // bitwise not
// if (zy == 1) sets y = 0        // 16-bit constant
// if (ny == 1) sets y = !y       // bitwise not
// if (f == 1)  sets out = x + y  // integer 2's complement addition
// if (f == 0)  sets out = x & y  // bitwise and
// if (no == 1) sets out = !out   // bitwise not
CHIP ALU {
    IN  
        x[16], y[16],  // 16-bit inputs        
        zx, // zero the x input?
        nx, // negate the x input?
        zy, // zero the y input?
        ny, // negate the y input?
        f,  // compute (out = x + y) or (out = x & y)?
        no; // negate the out output?
    OUT 
        out[16], // 16-bit output
        zr,      // (out == 0, 1, 0)
        ng;      // (out < 0,  1, 0)

    PARTS:
    //// Replace this comment with your code.
}`;
export const cmp = `|        x         |        y         |zx |nx |zy |ny | f |no |       out        |zr |ng |
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
