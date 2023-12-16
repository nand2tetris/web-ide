export const MaxTst = `
load Max.asm;
set %0 16548, set %1 12944;

repeat 14 {
   tick, tock;
}
`;
export const MaxAsm = `
// Computes R2 = max(R0, R1)

   @R0
   D=M              // D = first number
   @R1
   D=D-M            // D = first number - second number
   @OUTPUT_FIRST
   D;JGT            // if D>0 (first is greater) goto output_first
   @R1
   D=M              // D = second number
   @OUTPUT_D
   0;JMP            // goto output_d
(OUTPUT_FIRST)
   @R0             
   D=M              // D = first number
(OUTPUT_D)
   @R2
   M=D              // M[2] = D (greatest number)
(INFINITE_LOOP)
   @INFINITE_LOOP
   0;JMP
`;

export const MaxHack = [
  0, 64528, 1, 62672, 10, 58113, 1, 64528, 12, 60039, 0, 64528, 2, 58120, 14,
  60039,
];
