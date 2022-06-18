export const hdl = `/**
* 16-bit incrementer:
* out = in + 1 (arithmetic addition)
*/

CHIP Inc16 {
   IN in[16];
   OUT out[16];

   PARTS:
  // Put you code here:
}`;
export const sol = `CHIP Inc16 {
    IN in[16];
    OUT out[16];

    PARTS:
    Nand(a=in[0], b=in[0], out=t[0]);
    Xor(a=in[1], b=in[1], out=t[1]);
    Add16(a=in, b=t, out=out);
}`;
export const cmp = `|        in        |       out        |
| 0000000000000000 | 0000000000000001 |
| 1111111111111111 | 0000000000000000 |
| 0000000000000101 | 0000000000000110 |
| 1111111111111011 | 1111111111111100 |
`;
export const tst = `output-list in%B1.16.1 out%B1.16.1;

set in %B0000000000000000,  // in = 0
eval,
output;

set in %B1111111111111111,  // in = -1
eval,
output;

set in %B0000000000000101,  // in = 5
eval,
output;

set in %B1111111111111011,  // in = -5
eval,
output;`;
