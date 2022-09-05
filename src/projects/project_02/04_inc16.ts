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
    Add16 (a=in, b[0]=true, b[1..15]=false, out=out);
    
// Alternative implementation. Unset bits are explicitly false.
// Add16 (a=in, b[0]=true, out=out);

// Alternate implementation using less abstraction.
// The first implementation is how Inc16 is described in the text.
// This is the classical implementation. 
/*
    HalfAdder (a=in[0], b=true, sum=out[0],  carry=c0);
    HalfAdder (a=in[1], b=c0,   sum=out[1],  carry=c1);
    HalfAdder (a=in[2], b=c1,   sum=out[2],  carry=c2);
    HalfAdder (a=in[3], b=c2,   sum=out[3],  carry=c3);
    HalfAdder (a=in[4], b=c3,   sum=out[4],  carry=c4);
    HalfAdder (a=in[5], b=c4,   sum=out[5],  carry=c5);
    HalfAdder (a=in[6], b=c5,   sum=out[6],  carry=c6);
    HalfAdder (a=in[7], b=c6,   sum=out[7],  carry=c7);
    HalfAdder (a=in[8], b=c7,   sum=out[8],  carry=c8);
    HalfAdder (a=in[9], b=c8,   sum=out[9],  carry=c9);
    HalfAdder (a=in[10],b=c9,   sum=out[10], carry=c10);
    HalfAdder (a=in[11],b=c10,  sum=out[11], carry=c11);
    HalfAdder (a=in[12],b=c11,  sum=out[12], carry=c12);
    HalfAdder (a=in[13],b=c12,  sum=out[13], carry=c13);
    HalfAdder (a=in[14],b=c13,  sum=out[14], carry=c14);
    HalfAdder (a=in[15],b=c14,  sum=out[15]);
*/
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
