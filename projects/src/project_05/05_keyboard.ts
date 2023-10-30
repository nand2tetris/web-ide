export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/Keyboard.hdl
/**
 * The keyboard (memory map).
 * Outputs the character code of the currently pressed key,
 * or 0 if no key is pressed.
 *
 * This built-in implementation has a visualization side effect.
 */
CHIP Keyboard {
    OUT out[16];

    PARTS:
    BUILTIN Keyboard;
}`;
