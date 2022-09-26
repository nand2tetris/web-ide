export const RectTst = `
load Rect.asm;
set %0 16;

repeat {
   tick, tock;
}
`;
export const RectAsm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/06/rect/Rect.asm

// Draws a rectangle at the top-left corner of the screen.
// The rectangle is 16 pixels wide and R0 pixels high.

   @0
   D=M
   @INFINITE_LOOP
   D;JLE 
   @counter
   M=D
   @SCREEN
   D=A
   @address
   M=D
(LOOP)
   @address
   A=M
   M=-1
   @address
   D=M
   @32
   D=D+A
   @address
   M=D
   @counter
   MD=M-1
   @LOOP
   D;JGT
(INFINITE_LOOP)
   @INFINITE_LOOP
   0;JMP`;

export const RectHack = [
  0, 64528, 23, 58118, 16, 62216, 16384, 60432, 17, 62216, 17, 64544, 65160, 17,
  64528, 32, 57488, 17, 62216, 16, 61464, 10, 58113, 23, 60039,
];
