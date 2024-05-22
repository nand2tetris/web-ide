export const MaxTst = `
load Max.asm;
set %0 16548, set %1 12944;

repeat 14 {
   tick, tock;
}
`;
export const MaxAsm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/6/max/Max.asm

// Computes R2 = max(R0, R1)  (R0,R1,R2 refer to RAM[0],RAM[1],RAM[2])
// Usage: Before executing, put two values in R0 and R1.

  // D = R0 - R1
  @R0
  D=M
  @R1
  D=D-M
  // If (D > 0) goto ITSR0
  @ITSR0
  D;JGT
  // Its R1
  @R1
  D=M
  @OUTPUT_D
  0;JMP
(ITSR0)
  @R0
  D=M
(OUTPUT_D)
  @R2
  M=D
(END)
  @END
  0;JMP
`;

export const MaxLAsm = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/6/max/MaxL.asm

// Symbol-less version of the Max.asm program.
// Designed for testing the basic version of the assembler.

@0
D=M
@1
D=D-M
@10
D;JGT
@1
D=M
@12
0;JMP
@0
D=M
@2
M=D
@14
0;JMP`;

export const MaxHack = [
  0, 64528, 1, 62672, 10, 58113, 1, 64528, 12, 60039, 0, 64528, 2, 58120, 14,
  60039,
];
