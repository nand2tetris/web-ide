export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/03/DFF.hdl
/**
 * Data Flip-flop: out(t) = in(t-1) 
 * where t is the current time unit, or clock cycle.
 */
CHIP DFF {
    IN  in;
    OUT out;

    PARTS:
    BUILTIN DFF;
    CLOCKED in;
}`;
