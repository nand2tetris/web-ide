export const sol = `CHIP Mux4Way16 {
    IN a[16], b[16], c[16], d[16], sel[2];
    OUT out[16];

    PARTS:
    Mux16(a=a,  b=b,  sel=sel[0], out=ab);
    Mux16(a=c,  b=d,  sel=sel[0], out=cd);
    Mux16(a=ab, b=cd, sel=sel[1], out=out);

// Alternate implementation
//
// Some students make a Mux4Way chip and apply it 16 times as in Not16.
}`;
