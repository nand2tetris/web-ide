export const sol = `CHIP Mux8Way16 {
    IN a[16], b[16], c[16], d[16],
       e[16], f[16], g[16], h[16],
       sel[3];
    OUT out[16];

    PARTS:
    // Binary tree of 2-way multiplexors
    Mux16 (a=a,    b=b,    sel=sel[0], out=ab);
    Mux16 (a=c,    b=d,    sel=sel[0], out=cd);
    Mux16 (a=e,    b=f,    sel=sel[0], out=ef);
    Mux16 (a=g,    b=h,    sel=sel[0], out=gh);
    Mux16 (a=ab,   b=cd,   sel=sel[1], out=abcd);
    Mux16 (a=ef,   b=gh,   sel=sel[1], out=efgh);
    Mux16 (a=abcd, b=efgh, sel=sel[2], out=out);


// Alternate implementation
//
// This implementation replaces the upper two layers of the
// tree with 4-way multiplexors.
/*
    Mux4Way16 (a=a, b=b, c=c, d=d, sel=sel[0..1], out=abcd);
    Mux4Way16 (a=e, b=f, c=g, d=h, sel=sel[0..1], out=efgh);
    Mux16     (a=abcd, b=efgh, sel=sel[2], out=out);
*/

// Alternate implementation
//
// Some students make a Mux8Way chip and apply it 16 times as in Not16.
}`;
