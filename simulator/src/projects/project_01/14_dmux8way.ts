export const hdl = `/**
 * 8-way demultiplexor.
 * {a,b,c,d,e,f,g,h} = {in,0,0,0,0,0,0,0} if sel==000
 *                     {0,in,0,0,0,0,0,0} if sel==001
 *                     etc.
 *                     {0,0,0,0,0,0,0,in} if sel==111
 */


CHIP DMux8Way {
    IN in, sel[3];
    OUT a, b, c, d, e, f, g, h;

    PARTS:
}`;

export const sol = `CHIP DMux8Way {
    IN in, sel[3];
    OUT a, b, c, d, e, f, g, h;

    PARTS:
    // Binary tree of demultiplexors.
    DMux (sel=sel[2], in=in,   a=abcd, b=efgh);
    DMux (sel=sel[1], in=abcd, a=ab,   b=cd);
    DMux (sel=sel[1], in=efgh, a=ef,   b=gh);
    DMux (sel=sel[0], in=ab,   a=a,    b=b);
    DMux (sel=sel[0], in=cd,   a=c,    b=d);
    DMux (sel=sel[0], in=ef,   a=e,    b=f);
    DMux (sel=sel[0], in=gh,   a=g,    b=h);

// Alternate implementation
//
// Replace the final two layers of the binary tree with
// 4-way demultiplexors.
/*
    DMux     (sel=sel[2],    in=in,   a=abcd,   b=efgh);
    DMux4Way (sel=sel[0..1], in=abcd, a=a, b=b, c=c, d=d);
    DMux4Way (sel=sel[0..1], in=efgh, a=e, b=f, c=g, d=h);
*/

// Alternate implementation
//
// The binary tree of demultiplexors implementation with
// the demultiplexors in canonical form.
/*
    Not (in=sel[0], out=notSel0);
    Not (in=sel[1], out=notSel1);
    Not (in=sel[2], out=notSel2);

    And (a=in,   b=notSel2, out=abcd);
    And (a=in,   b=sel[2],  out=efgh);

    And (a=abcd, b=notSel1, out=ab);
    And (a=abcd, b=sel[1],  out=cd);
    And (a=efgh, b=notSel1, out=ef);
    And (a=efgh, b=sel[1],  out=gh);

    And (a=ab,   b=notSel0, out=a);
    And (a=ab,   b=sel[0],  out=b);
    And (a=cd,   b=notSel0, out=c);
    And (a=cd,   b=sel[0],  out=d);
    And (a=ef,   b=notSel0, out=e);
    And (a=ef,   b=sel[0],  out=f);
    And (a=gh,   b=notSel0, out=g);
    And (a=gh,   b=sel[0],  out=h);
*/
}`;

export const tst = `output-list in%B2.1.2 sel%B2.2.2 a%B2.1.2 b%B2.1.2 c%B2.1.2 d%B2.1.2 e%B2.1.2 f%B2.1.2 g%B2.1.2 h%B2.1.2;

set in 0, set sel %B000, eval, output;
set sel %B001, eval, output;
set sel %B010, eval, output;
set sel %B011, eval, output;
set sel %B100, eval, output;
set sel %B101, eval, output;
set sel %B110, eval, output;
set sel %B111, eval, output;

set in 1, set sel %B000, eval, output;
set sel %B001, eval, output;
set sel %B010, eval, output;
set sel %B011, eval, output;
set sel %B100, eval, output;
set sel %B101, eval, output;
set sel %B110, eval, output;
set sel %B111, eval, output;`;

export const cmp = `| in  | sel  |  a  |  b  |  c  |  d  |  e  |  f  |  g  |  h  |
|  0  |  00  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  01  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  10  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  11  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  00  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  01  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  10  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  0  |  11  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  1  |  00  |  1  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |
|  1  |  01  |  0  |  1  |  0  |  0  |  0  |  0  |  0  |  0  |
|  1  |  10  |  0  |  0  |  1  |  0  |  0  |  0  |  0  |  0  |
|  1  |  11  |  0  |  0  |  0  |  1  |  0  |  0  |  0  |  0  |
|  1  |  00  |  0  |  0  |  0  |  0  |  1  |  0  |  0  |  0  |
|  1  |  01  |  0  |  0  |  0  |  0  |  0  |  1  |  0  |  0  |
|  1  |  10  |  0  |  0  |  0  |  0  |  0  |  0  |  1  |  0  |
|  1  |  11  |  0  |  0  |  0  |  0  |  0  |  0  |  0  |  1  |`;
