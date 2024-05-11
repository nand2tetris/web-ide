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
// The rectangle is 16 pixels wide and R0 pixels high.
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
   MD=M-1
   @LOOP
   D;JGT
(END)
   @END
   0;JMP`;

export const RectLAsm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/6/rect/RectL.asm

// Symbol-less version of the Rect.asm program.
// Designed for testing the basic version of the assembler.

@0
D=M
@23
D;JLE 
@16
M=D
@16384
D=A
@17
M=D
@17
A=M
M=-1
@17
D=M
@32
D=D+A
@17
M=D
@16
MD=M-1
@10
D;JGT
@23
0;JMP`;

export const RectHack = [
  0, 64528, 23, 58118, 16, 58120, 16384, 60432, 17, 58120, 17, 64544, 61064, 17,
  64528, 32, 57488, 17, 58120, 16, 64664, 10, 58113, 23, 60039,
];
