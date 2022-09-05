export const hdl = `/**
 * The ALU (Arithmetic Logic Unit).
 * Computes one of the following functions:
 * x+y, x-y, y-x, 0, 1, -1, x, y, -x, -y, !x, !y,
 * x+1, y+1, x-1, y-1, x&y, x|y on two 16-bit inputs, 
 * according to 6 input bits denoted zx,nx,zy,ny,f,no.
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
export const sol = `CHIP ALU {
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
    // x input processing, controlled by the 'zx' and 'nx' bits.
    // When 'zx' is false, x is zeroed. 'nx' will select the negation of the
    // possibly zeroed x input, and make it avaialble as 'xbus'.
    Mux16 (sel=zx, a=x, b=false, out=xzero); 
    Not16 (in=xzero, out=notx);       
    Mux16 (sel=nx, a=xzero, b=notx, out=xbus);

    // y input processing, controlled by the 'zy' and 'ny' bits.
    // When 'zy' is false, y is zeroed. 'ny' will select the negation of the
    // possibly zeroed y input, and make it avaialble as 'ybus'.
    Mux16(sel=zy, a=y, b=false, out=yzero);
    Not16(in=yzero, out=noty);
    Mux16(sel=ny, a=yzero, b=noty, out=ybus);

    // Compute both functions and select based on the 'f' bit
    And16(a=xbus, b=ybus, out=fbusand);
    Add16(a=xbus, b=ybus, out=fbusadd);
    Mux16(sel=f, a=fbusand, b=fbusadd, out=outbus);

    // Output inversion, controlled by the 'no' bit
    // 'out' bit 15 is the 'ng' flag
    Not16(in=outbus, out=notoutbus);
    Mux16(sel=no, a=outbus, b=notoutbus, out[15]=ng, out[0..7]=zr1, out[8..15]=zr2, out=out);

    // Compute the zr and nz flags
    Or8Way(in=zr1, out=zra);
    Or8Way(in=zr2, out=zrb);
    Or(a=zra, b=zrb, out=zror);
    Not(in=zror, out=zr);
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
