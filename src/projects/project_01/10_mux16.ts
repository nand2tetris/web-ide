export const cmp = `|        a         |        b         | sel |       out        |
| 0000000000000000 | 0000000000000000 |  0  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 |  1  | 0000000000000000 |
| 0000000000000000 | 0001001000110100 |  0  | 0000000000000000 |
| 0000000000000000 | 0001001000110100 |  1  | 0001001000110100 |
| 1001100001110110 | 0000000000000000 |  0  | 1001100001110110 |
| 1001100001110110 | 0000000000000000 |  1  | 0000000000000000 |
| 1010101010101010 | 0101010101010101 |  0  | 1010101010101010 |
| 1010101010101010 | 0101010101010101 |  1  | 0101010101010101 |`;
export const hdl = `// 16 bit multiplexor. If sel==1 then out=b else out=a.

CHIP Mux16 {
    IN a[16], b[16], sel;
    OUT out[16];

    PARTS:
}`;
export const sol = `CHIP Mux16 {
    IN a[16], b[16], sel;
    OUT out[16];

    PARTS:
     Mux(a=a[0],b=b[0],sel=sel,out=out[0]);
     Mux(a=a[1],b=b[1],sel=sel,out=out[1]);
     Mux(a=a[2],b=b[2],sel=sel,out=out[2]);
     Mux(a=a[3],b=b[3],sel=sel,out=out[3]);
     Mux(a=a[4],b=b[4],sel=sel,out=out[4]);
     Mux(a=a[5],b=b[5],sel=sel,out=out[5]);
     Mux(a=a[6],b=b[6],sel=sel,out=out[6]);
     Mux(a=a[7],b=b[7],sel=sel,out=out[7]);
     Mux(a=a[8],b=b[8],sel=sel,out=out[8]);
     Mux(a=a[9],b=b[9],sel=sel,out=out[9]);
     Mux(a=a[10],b=b[10],sel=sel,out=out[10]);
     Mux(a=a[11],b=b[11],sel=sel,out=out[11]);
     Mux(a=a[12],b=b[12],sel=sel,out=out[12]);
     Mux(a=a[13],b=b[13],sel=sel,out=out[13]);
     Mux(a=a[14],b=b[14],sel=sel,out=out[14]);
     Mux(a=a[15],b=b[15],sel=sel,out=out[15]);
}`;
export const tst = `output-list a%B1.16.1 b%B1.16.1 sel%D2.1.2 out%B1.16.1;

set a 0, set b 0, set sel 0, eval, output;
set sel 1, eval, output;

set a %B0000000000000000, set b %B0001001000110100, set sel 0, eval, output;
set sel 1, eval, output;

set a %B1001100001110110, set b %B0000000000000000, set sel 0, eval, output;
set sel 1, eval, output;

set a %B1010101010101010, set b %B0101010101010101, set sel 0, eval, output;
set sel 1, eval, output;`;
