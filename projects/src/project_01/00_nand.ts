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
