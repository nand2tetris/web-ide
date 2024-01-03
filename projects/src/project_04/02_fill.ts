export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/fill/Fill.tst

// Tests the Fill.hack program in the CPU emulator.

echo "Make the highest speed is selected. Then, select the keyboard, press any key for some time, and inspect the screen.";

repeat {
  ticktock;
}`;

export const autoTst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/fill/FillAutomatic.tst

// This script can be used to test the Fill program automatically, 
// rather than interactively. Specifically, the script sets the keyboard
// memory map (RAM[24576]) to 0, runs a million cycles, then it sets it 
// to 1, runs a million cycles, then it sets it again to 0, and runs a 
// million cycles. These actions simulate the events of leaving the keyboard
// untouched, pressing some key, and then releasing the key.
// After each on of these simulated events, the script outputs the values
// of selected registers from the screen memory map (RAM[16384] - RAM[24576]).
// This is done in order to test that these registers are set to 000...0 or to 
// 111....1 (-1 in decimal), as mandated by how the Fill program should
// react to keyboard events.

output-list RAM[16384]%D2.6.2 RAM[17648]%D2.6.2 RAM[18349]%D2.6.2 RAM[19444]%D2.6.2 RAM[20771]%D2.6.2 RAM[21031]%D2.6.2 RAM[22596]%D2.6.2 RAM[23754]%D2.6.2 RAM[24575]%D2.6.2;

set RAM[24576] 0;    // the keyboard is untouched
repeat 1000000 {
  ticktock;
}
output;              // tests that the screen is white

set RAM[24576] 1;    // a keyboard key is pressed (1 is an arbitrary non-zero value)
repeat 1000000 {
  ticktock;
}
output;              // tests that the screen is black

set RAM[24576] 0;    // the keyboard in untouched
repeat 1000000 {
  ticktock;
}
output;`;

export const autoCmp = `|RAM[16384]|RAM[17648]|RAM[18349]|RAM[19444]|RAM[20771]|RAM[21031]|RAM[22596]|RAM[23754]|RAM[24575]|
|       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |
|      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |
|       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |`;
