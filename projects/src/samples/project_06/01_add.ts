export const AddTst = `repeat 6 { tick, tock; }`;
export const AddAsm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.

// Computes R0 = 2 + 3  (R0 refers to RAM[0])

@2
D=A
@3
D=D+A
@0
M=D`;

export const AddHack = [2, 60432, 3, 57488, 0, 58120];
