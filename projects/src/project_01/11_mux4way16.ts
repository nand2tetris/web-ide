export const cmp = `|        a         |        b         |        c         |        d         | sel  |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  00  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  01  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  10  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  11  | 0000000000000000 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  00  | 0001001000110100 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  01  | 1001100001110110 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  10  | 1010101010101010 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  11  | 0101010101010101 |`;
export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Mux4Way16.hdl
/**
 * 4-way 16-bit multiplexor:
 * out = a if sel = 00
 *       b if sel = 01
 *       c if sel = 10
 *       d if sel = 11
 */
CHIP Mux4Way16 {
    IN a[16], b[16], c[16], d[16], sel[2];
    OUT out[16];
    
    PARTS:
    //// Replace this comment with your code.
}`;
export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Mux4Way16.tst

load Mux4Way16.hdl,
compare-to Mux4Way16.cmp,
output-list a%B1.16.1 b%B1.16.1 c%B1.16.1 d%B1.16.1 sel%B2.2.2 out%B1.16.1;

set a 0,
set b 0,
set c 0,
set d 0,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set sel 2,
eval,
output;

set sel 3,
eval,
output;

set a %B0001001000110100,
set b %B1001100001110110,
set c %B1010101010101010,
set d %B0101010101010101,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set sel 2,
eval,
output;

set sel 3,
eval,
output;`;
