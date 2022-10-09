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
    Or (a=in[0], b=in[1], out=or01);
    Or (a=in[2], b=in[3], out=or23);
    Or (a=in[4], b=in[5], out=or45);
    Or (a=in[6], b=in[7], out=or67);
    Or (a=or01, b=or23, out=or0123);
    Or (a=or45, b=or67, out=or4567);
    Or (a=or0123, b=or4567, out=out);
}`;
export const tst = `output-list in%B2.8.2 out%B2.1.2;

set in %B00000000, eval, output;
set in %B11111111, eval, output;
set in %B00010000, eval, output;
set in %B00000001, eval, output;
set in %B00100110, eval, output;`;
