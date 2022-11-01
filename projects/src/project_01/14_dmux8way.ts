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
