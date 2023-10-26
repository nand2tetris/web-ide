export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/01/DMux4Way.hdl
/**
 * 4-way demultiplexor:
 * [a, b, c, d] = [in, 0, 0, 0] if sel == 00
 *                [0, in, 0, 0] if sel == 01
 *                [0, 0, in, 0] if sel == 10
 *                [0, 0, 0, in] if sel == 11
 */
CHIP DMux4Way {
    IN in, sel[2];
    OUT a, b, c, d;

    PARTS:
    //// Replace this comment with your code.
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
