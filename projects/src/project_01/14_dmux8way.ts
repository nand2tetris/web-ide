export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/DMux8Way.hdl
/**
 * 8-way demultiplexor:
 * [a, b, c, d, e, f, g, h] = [in, 0,  0,  0,  0,  0,  0,  0] if sel = 000
 *                            [0, in,  0,  0,  0,  0,  0,  0] if sel = 001
 *                            [0,  0, in,  0,  0,  0,  0,  0] if sel = 010
 *                            [0,  0,  0, in,  0,  0,  0,  0] if sel = 011
 *                            [0,  0,  0,  0, in,  0,  0,  0] if sel = 100
 *                            [0,  0,  0,  0,  0, in,  0,  0] if sel = 101
 *                            [0,  0,  0,  0,  0,  0, in,  0] if sel = 110
 *                            [0,  0,  0,  0,  0,  0,  0, in] if sel = 111
 */
CHIP DMux8Way {
    IN in, sel[3];
    OUT a, b, c, d, e, f, g, h;

    PARTS:
    //// Replace this comment with your code.
}`;

export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/DMux8Way.tst

load DMux8Way.hdl,
compare-to DMux8Way.cmp,
output-list in sel%B2.3.2 a b c d e f g h;

set in 0,
set sel %B000,
eval,
output;

set sel %B001,
eval,
output;

set sel %B010,
eval,
output;

set sel %B011,
eval,
output;

set sel %B100,
eval,
output;

set sel %B101,
eval,
output;

set sel %B110,
eval,
output;

set sel %B111,
eval,
output;

set in 1,
set sel %B000,
eval,
output;

set sel %B001,
eval,
output;

set sel %B010,
eval,
output;

set sel %B011,
eval,
output;

set sel %B100,
eval,
output;

set sel %B101,
eval,
output;

set sel %B110,
eval,
output;

set sel %B111,
eval,
output;`;

export const cmp = `|in |  sel  | a | b | c | d | e | f | g | h |
| 0 |  000  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  001  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  010  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  011  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  100  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  101  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  110  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  111  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 |  000  | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 |  001  | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 |  010  | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| 1 |  011  | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| 1 |  100  | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| 1 |  101  | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| 1 |  110  | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| 1 |  111  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |`;
