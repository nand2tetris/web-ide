export const sol = `CHIP XOr {
    IN a, b;
    OUT out;

    PARTS:
    Not (in=a, out=nota);
    Not (in=b, out=notb);
    And (a=nota, b=b, out=and1);
    And (a=a, b=notb, out=and2);
    Or  (a=and1, b=and2, out=out);
}`;
