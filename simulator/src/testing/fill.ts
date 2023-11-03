import { CPU } from "../cpu/cpu.js";
import { SCREEN_OFFSET } from "../cpu/memory.js";

const colorfn = () => (Math.random() * 0xffff) & 0xffff;

export const TickScreen = (cpu: CPU) => {
  let row = 0;
  let col = 0;
  let color = colorfn();
  return () => {
    const index = SCREEN_OFFSET + col + row * 32;
    cpu.RAM.set(index, color);
    col += 1;
    if (col >= 32) {
      col = 0;
      row += 1;
      color = colorfn();
      if (row >= 256) {
        row = 0;
      }
    }
  };
};

export const JACK = `
R2 = 0;
while (true) {
    R2 = !R2
    R0 = 32;
    while (R0-->0) {
        R1 = 256;
        while (R1-->0) {
            SCREEN[R1 * 32 + R1] = R2;
        }
    }
}
`;

export const VM = `
push constant 0 ; pop local 2 ; // R2 = 0;
label loop // while (true) {
    push local 2; not; pop local 2; // R2 = !R2
    push constant 31 ; pop local 0 ; R0 = 32;
    label row // while (R0-->0) {
        push constant 255 ; pop local 1; // R1 = 256;
        label col // while (R1-->0) {
            push local 2;
            push constant SCREEN ; push local 1 ; 
            push local 0; push constant 32;
            call mul 2 ; add ; add ;
            pop pointer 1; pop that 0 // SCREEN[R0 * 32 + R1] = R2;
            push local 1 ; push constant 1; sub ; pop local 1;
        push R1 ; if-goto col // }
        push local 0 ; push constant 1; sub ; pop local 0;
    push R0 ; if-goto row // }
goto loop; //}
`;

export const ASM = `
@R2 M=0 // R2 = 0
(OUTER)
    @R2 D=M M=!D // R2 = !R2
    @32 D=A @R0 M=D // R0 = 32
    (ROW) @R0 D=M @R3 M=D @R0 M=D-1 @ROW_END D;JEQ  // while R0 --> 0
        @256 D=A @R1 M=D // R1 = 256
        (COL) @R1 D=M @R3 M=D @R1 M=D-1 @COL_END D;JEQ  // while R1 --> 0
            @R5 M=0
            @32 D=A @R3 M=D // R3 = 32
            @R1 D=M @R4 M=D // R4 = R1
            (MUL)
                @R3 D=M @MUL_END D;JEQ // while R3 > 0
                @R3 D=M @R5 D=D+M // R5 += R3
                @R3 M=M-1 // R3 -= 1
                @MUL 0;JMP
            (MUL_END) // R5 = 32 * R1
            @R1 D=M @R5 D=M+D @SCREEN D=A+D @R3 M=D // R3 = R1 + R5 + SCREEN
            @R2 D=M @R3 M=D // SCREEN + (R1 * 32 + R1) = R2;
        (COL_END)
    (ROW_END)
(OUTER_END)
`;
export const HACK = ``;
