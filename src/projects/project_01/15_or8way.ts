export const cmp = `|     in     | out |
|  00000000  |  0  |
|  11111111  |  1  |
|  00010000  |  1  |
|  00000001  |  1  |
|  00100110  |  1  |`;
export const hdl = `/**
 * 8-way or gate: out = in[0] or in[1] or ... or in[7].
 */

CHIP Or8Way {
    IN in[8];
    OUT out;

    PARTS:
}`;
export const sol = `CHIP Or8Way {
    IN in[8];
    OUT out;

    PARTS:
    Or(a=in[0], b=in[1], out=or1);
    Or(a=in[2], b=in[3], out=or2);
    Or(a=in[4], b=in[5], out=or3);
    Or(a=in[6], b=in[7], out=or4);
    Or(a=or1, b=or2, out=or5);
    Or(a=or3, b=or4, out=or6);
    Or(a=or5, b=or6, out=out);
}`;
export const tst = `output-list in%B2.8.2 out%B2.1.2;

set in %B00000000, eval, output;
set in %B11111111, eval, output;
set in %B00010000, eval, output;
set in %B00000001, eval, output;
set in %B00100110, eval, output;`;
