export const asm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Fill.asm

// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, 
// the screen should be cleared.

//// Replace this comment with your code.`;

export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/fill/Fill.tst

// Tests the Fill.hack program in the CPU emulator.

echo "Select the highest speed and 'enable keyboard'. Then press any key for some time, and inspect the screen.";

repeat {
  ticktock;
}`;

export const autoTst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/fill/FillAutomatic

// This script can be used to test the Fill program automatically, 
// rather than interactively. Specifically, the script sets the keyboard
// memory map (RAM[24576]) to 0, 1, and then again to 0. This simulates the 
// acts of leaving the keyboard untouched, pressing some key, and then releasing
// the key. After each one of these simulated events, the script outputs the values
// of some selected registers from the screen memory map (RAM[16384]-RAM[24576]).
// This is done in order to test that these registers are set to 000...0 or 111....1, 
// as mandated by how the Fill program should react to the keyboard events.

output-list RAM[16384]%D2.6.2 RAM[17648]%D2.6.2 RAM[18349]%D2.6.2 RAM[19444]%D2.6.2 RAM[20771]%D2.6.2 RAM[21031]%D2.6.2 RAM[22596]%D2.6.2 RAM[23754]%D2.6.2 RAM[24575]%D2.6.2;

set RAM[24576] 0,    // the keyboard is untouched
repeat 1000000 {
  ticktock;
}
output;              // tests that the screen is white

set RAM[24576] 1,    // a keyboard key is pressed
repeat 1000000 {
  ticktock;
}
output;              // tests that the screen is black

set RAM[24576] 0,    // the keyboard is untouched
repeat 1000000 {
  ticktock;
}
output;              // tests that the screen is white`;

export const autoCmp = `|RAM[16384]|RAM[17648]|RAM[18349]|RAM[19444]|RAM[20771]|RAM[21031]|RAM[22596]|RAM[23754]|RAM[24575]|
|       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |
|      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |
|       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |`;
