export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/01/DMux.hdl
/**
 * Demultiplexor:
 * [a, b] = ((sel == 0), [in, 0], [0, in])
 */
CHIP DMux {
    IN in, sel;
    OUT a, b;

    PARTS:
    //// Replace this comment with your code.
}`;
export const tst = `output-list in%B3.1.3 sel%B3.1.3 a%B3.1.3 b%B3.1.3;

set in 0, set sel 0, eval, output;
set sel 1, eval, output;

set in 1, set sel 0, eval, output;
set sel 1, eval, output;`;

export const cmp = `|  in   |  sel  |   a   |   b   |
|   0   |   0   |   0   |   0   |
|   0   |   1   |   0   |   0   |
|   1   |   0   |   1   |   0   |
|   1   |   1   |   0   |   1   |`;
