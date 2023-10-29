export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/ARegister.hdl
/**
 * A 16-bit register named ARegister with the same functionality
 * of the Register chip:
 * If load is asserted, the register's value is set to in;
 * Otherwise, the register maintains its current value.
 * out(t+1) = (load(t), in(t), out(t))
 *
 * This built-in implementation has a visualization side effect.
 */
 CHIP ARegister {
    IN  in[16], load;
    OUT out[16];

    PARTS:
    BUILTIN ARegister;
    CLOCKED in, load;
}`;
