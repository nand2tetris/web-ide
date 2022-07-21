export const hdl = `/**
 * And gate: out = 1 if {a==1 and b==1}, 0 otherwise
 * And gate: if {a==1 and b==1} then out = 1 else out = 0
 */

CHIP And {
    IN a, b;
    OUT out;

    PARTS:
}`;
export const sol = `CHIP And {
    IN a, b;
    OUT out;

    PARTS:
    Nand(a=a, b=b, out=n);
    Not(in=n, out=out);
}`;
export const tst = `output-list a%B3.1.3 b%B3.1.3 out%B3.1.3;
set a 0, set b 0, eval, output;
set a 0, set b 1, eval, output;
set a 1, set b 0, eval, output;
set a 1, set b 1, eval, output;`;

export const cmp = `|   a   |   b   |  out  |
|   0   |   0   |   0   |
|   0   |   1   |   0   |
|   1   |   0   |   0   |
|   1   |   1   |   1   |`;
