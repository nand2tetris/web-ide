export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/01/Nand.hdl
/**
 * Nand gate:
 * out = (((a == 1) && (b == 1))), 0, 1) 
 */
CHIP Nand {
    IN  a, b;
    OUT out;

    PARTS:
    BUILTIN Nand;
}`;
