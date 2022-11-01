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
