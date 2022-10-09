export const hdl = `/**
 * 4-way demultiplexor.
 * {a,b,c,d} = {in,0,0,0} if sel==00
 *             {0,in,0,0} if sel==01
 *             {0,0,in,0} if sel==10
 *             {0,0,0,in} if sel==11
 */

CHIP DMux4Way {
    IN in, sel[2];
    OUT a, b, c, d;

    PARTS:
}`;
export const sol = `CHIP DMux4Way {
    IN in, sel[2];
    OUT a, b, c, d;

    PARTS:
    DMux (in=in, sel=sel[1], a=ab, b=cd);
    DMux (in=ab, sel=sel[0], a=a, b=b);
    DMux (in=cd, sel=sel[0], a=c, b=d);

// Alternate implementation, using a canonical representation.
/*
    Not (in=sel[0], out=notSel0);
    Not (in=sel[1], out=notSel1);
    And (a=notSel1, b=notSel0, out=selA);
    And (a=notSel1, b=sel[0],  out=selB);
    And (a=sel[1],  b=notSel0, out=selC);
    And (a=sel[1],  b=sel[0],  out=selD);
    And (a=selA, b=in, out=a);
    And (a=selB, b=in, out=b);
    And (a=selC, b=in, out=c);
    And (a=selD, b=in, out=d);
*/
}`;
export const tst = `output-list in%B2.1.2 sel%B2.2.2 a%B2.1.2 b%B2.1.2 c%B2.1.2 d%B2.1.2;

set in 0, set sel %B00, eval, output;
set sel %B01, eval, output;
set sel %B10, eval, output;
set sel %B11, eval, output;

set in 1, set sel %B00, eval, output;
set sel %B01, eval, output;
set sel %B10, eval, output;
set sel %B11, eval, output;`;

export const cmp = `| in  | sel  |  a  |  b  |  c  |  d  |
|  0  |  00  |  0  |  0  |  0  |  0  |
|  0  |  01  |  0  |  0  |  0  |  0  |
|  0  |  10  |  0  |  0  |  0  |  0  |
|  0  |  11  |  0  |  0  |  0  |  0  |
|  1  |  00  |  1  |  0  |  0  |  0  |
|  1  |  01  |  0  |  1  |  0  |  0  |
|  1  |  10  |  0  |  0  |  1  |  0  |
|  1  |  11  |  0  |  0  |  0  |  1  |`;
