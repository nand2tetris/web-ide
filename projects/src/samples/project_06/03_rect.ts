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
// File name: projects/6/rect/Rect.asm

// Draws a rectangle at the top-left corner of the screen.
// The rectangle is 16 pixels wide, and R0 pixels high.
// Usage: Before executing, put a value in R0.

   // If (R0 <= 0) goto END else n = R0
   @R0
   D=M
   @END
   D;JLE 
   @n
   M=D
   // addr = base address of first screen row
   @SCREEN
   D=A
   @addr
   M=D
(LOOP)
   // RAM[addr] = -1
   @addr
   A=M
   M=-1
   // addr = base address of next screen row
   @addr
   D=M
   @32
   D=D+A
   @addr
   M=D
   // decrements n and loops
   @n
   M=M-1
   D=M
   @LOOP
   D;JGT
(END)
   @END
   0;JMP`;

export const RectHack = [
  0, 64528, 24, 58118, 16, 58120, 16384, 60432, 17, 58120, 17, 64544, 61064, 17,
  64528, 32, 57488, 17, 58120, 16, 64648, 64528, 10, 58113, 24, 60039,
];
