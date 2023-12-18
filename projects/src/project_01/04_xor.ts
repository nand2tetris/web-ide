export const cmp = `|   a   |   b   |  out  |
|   0   |   0   |   0   |
|   0   |   1   |   1   |
|   1   |   0   |   1   |
|   1   |   1   |   0   |`;
export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/01/Xor.hdl
/**
 * Exclusive-or gate:
 * out = (not(a) and b) or (a and not(b))
 */
CHIP Xor {
    IN a, b;
    OUT out;

    PARTS:
    //// Replace this comment with your code.
}`;
export const tst = `output-list a%B3.1.3 b%B3.1.3 out%B3.1.3;

set a 0, set b 0, eval, output;
set a 0, set b 1, eval, output;
set a 1, set b 0, eval, output;
set a 1, set b 1, eval, output;`;
