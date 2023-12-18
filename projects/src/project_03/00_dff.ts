export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/03/DFF.hdl
/**
 * Data Flip-flop:
 * maintains its current value:
 * out(t+1) = in(t)
 */
CHIP DFF {
    IN  in;
    OUT out;

    PARTS:
    BUILTIN DFF;
    CLOCKED in;
}`;
