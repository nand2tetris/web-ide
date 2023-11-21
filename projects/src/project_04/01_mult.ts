export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/mult/Mult.tst

// Tests the Mult.hack program in the CPU emulator.

output-list RAM[0]%D2.6.2 RAM[1]%D2.6.2 RAM[2]%D2.6.2;

set RAM[0] 0,   // sets test arguments
set RAM[1] 0,
set RAM[2] -1;  // tests that product was initialized to 0
repeat 20 {
  ticktock;
}
set RAM[0] 0,   // restores the arguments in case the program used them
set RAM[1] 0,
output;

set PC 0,
set RAM[0] 1,   // sets test arguments
set RAM[1] 0,
set RAM[2] -1;  // tests that product was initialized to 0
repeat 50 {
  ticktock;
}
set RAM[0] 1,   // restores the arguments in case the program used them
set RAM[1] 0,
output;

set PC 0,
set RAM[0] 0,   // sets test arguments
set RAM[1] 2,
set RAM[2] -1;  // tests that product was initialized to 0
repeat 80 {
  ticktock;
}
set RAM[0] 0,   // restores the arguments in case the program used them
set RAM[1] 2,
output;

set PC 0,
set RAM[0] 3,   // sets test arguments
set RAM[1] 1,
set RAM[2] -1;  // tests that product was initialized to 0
repeat 120 {
  ticktock;
}
set RAM[0] 3,   // restores the arguments in case the program used them
set RAM[1] 1,
output;

set PC 0,
set RAM[0] 2,   // sets test arguments
set RAM[1] 4,
set RAM[2] -1;  // tests that product was initialized to 0
repeat 150 {
  ticktock;
}
set RAM[0] 2,   // restores the arguments in case the program used them
set RAM[1] 4,
output;

set PC 0,
set RAM[0] 6,   // sets test arguments
set RAM[1] 7,
set RAM[2] -1;  // tests that product was initialized to 0
repeat 210 {
  ticktock;
}
set RAM[0] 6,   // restores the arguments in case the program used them
set RAM[1] 7,
output;`;


export const cmp = `|  RAM[0]  |  RAM[1]  |  RAM[2]  |
|       0  |       0  |       0  |
|       1  |       0  |       0  |
|       0  |       2  |       0  |
|       3  |       1  |       3  |
|       2  |       4  |       8  |
|       6  |       7  |      42  |`;