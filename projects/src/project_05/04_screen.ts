export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/Screen.hdl
/**
 * The Screen (memory map).
 * Same functionality as a 16-bit 8K RAM:
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 *
 * This built-in implementation has the side effect of continuously 
 * refreshing a visual 256 by 512 black-and-white screen, simulated 
 * by the simulator. Each row in the visual screen is represented 
 * by 32 consecutive 16-bit words, starting at the top left corner 
 * of the visual screen. Thus the pixel at row r from the top and 
 * column c from the left (0<=r<256, 0<=c<512) reflects the c%16 
 * bit (counting from LSB to MSB) of the word found in Screen[r*32+c/16]. 
 */
CHIP Screen {
    IN  in[16],    // what to write
    load,          // write-enable bit
    address[13];   // where to read/write
    OUT out[16];   // Screen value at the given address

    PARTS:
    BUILTIN Screen;
    CLOCKED in, load;
}`;
