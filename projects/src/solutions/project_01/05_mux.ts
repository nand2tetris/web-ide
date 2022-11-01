export const sol = `CHIP Mux {
    IN a, b, sel;
    OUT out;

    PARTS:
    Not (in=sel, out=notsel);
    And (a=a,    b=notsel, out=and1);
    And (a=b,    b=sel,    out=and2);
    Or  (a=and1, b=and2,   out=out);
}`;
