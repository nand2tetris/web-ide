export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Nand.hdl
/**
 * Nand gate:
 * if (a and b) out = 0, else out = 1 
 */
CHIP Nand {
    IN a, b;
    OUT out;
    
    PARTS:
    BUILTIN Nand;
}`;

export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Nand.tst

output-list a b out;

set a 0,
set b 0,
eval,
output;

set a 0,
set b 1,
eval,
output;

set a 1,
set b 0,
eval,
output;

set a 1,
set b 1,
eval,
output;`;

export const cmp = `| a | b |out|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |`;
