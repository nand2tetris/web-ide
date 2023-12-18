export const JACK = `
while (R0 > 0) {
    R2 = R2 + R1
    R0 = R0 - 1
}`;

export const VM = `
(_loop_start)
  push constant 0
  push arg 0
  eq
  jump-eq _loop_end

  push arg 1
  push local 0
  add
  pop local 0

  push arg 0
  push constant 1
  sub
  pop arg 0

  jump _loop_start

(_loop_end)
  jump loop_end
`;

export const ASM = `
@R2
M=0
(LOOP)
  @R0
  D=M
  @END
  D;JEQ

  @R1
  D=M
  @R2
  D=D+M
  M=D

  @R0
  M=M-1
  @LOOP
  0;JMP
(END)
  @END
  0;JMP
`;

export const HACK = new Int16Array([
  0x0002, // @R2
  0xda88, // M=0
  0x0000, // (LOOP) @R0
  0xfc10, // D=M
  0x000f, // @END
  0xd302, // D;JEQ
  0x0001, // @R1
  0xfc10, // D=M
  0x0002, // @R2
  0xf090, // D=D+M
  0xd308, // M=D
  0x0000, // @R0
  0xfc88, // M=M-1
  0x0002, // @LOOP
  0xda87, // 0;JMP
  0x000f, // (END) @END
  0xda87, // 0;JMP
]);
