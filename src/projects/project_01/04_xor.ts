export const cmp = `|   a   |   b   |  out  |
|   0   |   0   |   0   |
|   0   |   1   |   1   |
|   1   |   0   |   1   |
|   1   |   1   |   0   |`;
export const hdl = `/**
 *  Exclusive-or gate: out = !(a == b).
 */

CHIP XOr {
    IN a, b;
    OUT out;

    PARTS:
}`;
export const sol = `CHIP XOr {
    IN a, b;
    OUT out;

    PARTS:
    Not(in=a, out=nota);
    Not(in=b, out=notb);
    And(a=nota, b=b, out=t1);
    And(a=a, b=notb, out=t2);
    Or(a=t1, b=t2, out=out);
}`;
export const tst = `output-list a%B3.1.3 b%B3.1.3 out%B3.1.3;

set a 0, set b 0, eval, output;
set a 0, set b 1, eval, output;
set a 1, set b 0, eval, output;
set a 1, set b 1, eval, output;`;
