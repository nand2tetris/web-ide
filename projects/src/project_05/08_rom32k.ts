export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/ROM32K.hdl
/**
 * Read-Only memory (ROM) of 32K registers, each 16-bit wide.
 * Facilitates data read, as follows:
 *     out(t) = ROM32K[address(t)](t)
 * In words: the chip outputs the value stored at the 
 * memory location specified by address.
 *
 * Can be used as the instruction memory of the Hack computer.
 * To that end, the built-in chip implementation supports the handling 
 * of the "ROM32K load Xxx" script command, where Xxx is the name of a
 * text file containing a program written in the binary Hack machine language.
 * When the simulator encounters such a command in a test script,
 * the file's contents is loaded into the simulated ROM32K chip.
 */
 CHIP ROM32K {
    IN  address[15];
    OUT out[16];

    PARTS:
    BUILTIN ROM32K;
}`;
