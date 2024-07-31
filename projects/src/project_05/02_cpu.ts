export const hdl = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/CPU.hdl
/**
 * The Hack Central Processing unit (CPU).
 * Parses the binary code in the instruction input and executes it according to the
 * Hack machine language specification. In the case of a C-instruction, computes the
 * function specified by the instruction. If the instruction specifies to read a memory
 * value, the inM input is expected to contain this value. If the instruction specifies
 * to write a value to the memory, sets the outM output to this value, sets the addressM
 * output to the target address, and asserts the writeM output (when writeM = 0, any
 * value may appear in outM).
 * If the reset input is 0, computes the address of the next instruction and sets the
 * pc output to that value. If the reset input is 1, sets pc to 0.
 * Note: The outM and writeM outputs are combinational: they are affected by the
 * instruction's execution during the current cycle. The addressM and pc outputs are
 * clocked: although they are affected by the instruction's execution, they commit to
 * their new values only in the next cycle.
 */
CHIP CPU {

    IN  inM[16],         // M value input  (M = contents of RAM[A])
        instruction[16], // Instruction for execution
        reset;           // Signals whether to re-start the current
                         // program (reset==1) or continue executing
                         // the current program (reset==0).

    OUT outM[16],        // M value output
        writeM,          // Write to M? 
        addressM[15],    // Address in data memory (of M)
        pc[15];          // address of next instruction

    PARTS:
	//// Replace this comment with your code.
}`;
export const tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/CPU.tst

// Tests the CPU by setting the instruction input to various binary values that
// code Hack instructions, and outputting the values of the registers that are
// supposed to be affected by the instructions.

// Tracks the time, the CPU inputs (inM, instruction, reset bit), the CPU
// outputs (outM, writeM bit, address, pc), and the value of the D-register.

load CPU.hdl,
compare-to CPU.cmp,
output-list time%S1.3.1 inM%D0.6.0 instruction%B0.16.0 reset%B2.1.2 outM%D1.6.0 writeM%B3.1.2 addressM%D1.5.1 pc%D0.5.0 DRegister[]%D1.7.1;

set instruction %B0011000000111001, // @12345
tick, output, tock, output;

set instruction %B1110110000010000, // D=A
tick, output, tock, output;

set instruction %B0101101110100000, // @23456
tick, output, tock, output;

set instruction %B1110000111110000, // AD=A-D
tick, output, tock, output;

set instruction %B0000001111101011, // @1003
tick, output, tock, output;

set instruction %B1110001100001000, // M=D
tick, output, tock, output;

set instruction %B0000001111101100, // @1004
tick, output, tock, output;

set instruction %B1110001110011000, // MD=D-1
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1111010011110000, // AD=D-M
set inM 11111,
tick, output, tock, output;

set instruction %B0000000000001110, // @14
tick, output, tock, output;

set instruction %B1110001100000100, // D;jlt
tick, output, tock, output;

set instruction %B0000001111100111, // @999
tick, output, tock, output;

set instruction %B1111110111100000, // A=M+1
tick, output, tock, output;

set instruction %B1110001100101000, // AM=D
tick, output, tock, output;

set instruction %B0000000000010101, // @21
tick, output, tock, output;

set instruction %B1110011111000010, // D+1;jeq
tick, output, tock, output;

set instruction %B0000000000000010, // @2
tick, output, tock, output;

set instruction %B1110000010111000, // AMD=D+A
tick, output, tock, output;

set instruction %B1111110111001000, // M=M+1
tick, output, tock, output;

set instruction %B1111110010101000, // AM=M-1
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1110111010010000, // D=-1
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set instruction %B1110101010010000, // D=0
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set instruction %B1110111111010000, // D=1
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set reset 1;
tick, output, tock, output;

set instruction %B0111111111111111, // @32767
set reset 0;
tick, output, tock, output;`;
export const cmp = `|time | inM  |  instruction   |reset| outM  |writeM|address| pc  |DRegister|
| 0+  |     0|0011000000111001|  0  |*******|   0  |     0 |    0|       0 |
| 1   |     0|0011000000111001|  0  |*******|   0  | 12345 |    1|       0 |
| 1+  |     0|1110110000010000|  0  |*******|   0  | 12345 |    1|   12345 |
| 2   |     0|1110110000010000|  0  |*******|   0  | 12345 |    2|   12345 |
| 2+  |     0|0101101110100000|  0  |*******|   0  | 12345 |    2|   12345 |
| 3   |     0|0101101110100000|  0  |*******|   0  | 23456 |    3|   12345 |
| 3+  |     0|1110000111110000|  0  |*******|   0  | 23456 |    3|   11111 |
| 4   |     0|1110000111110000|  0  |*******|   0  | 11111 |    4|   11111 |
| 4+  |     0|0000001111101011|  0  |*******|   0  | 11111 |    4|   11111 |
| 5   |     0|0000001111101011|  0  |*******|   0  |  1003 |    5|   11111 |
| 5+  |     0|1110001100001000|  0  |  11111|   1  |  1003 |    5|   11111 |
| 6   |     0|1110001100001000|  0  |  11111|   1  |  1003 |    6|   11111 |
| 6+  |     0|0000001111101100|  0  |*******|   0  |  1003 |    6|   11111 |
| 7   |     0|0000001111101100|  0  |*******|   0  |  1004 |    7|   11111 |
| 7+  |     0|1110001110011000|  0  |  11110|   1  |  1004 |    7|   11110 |
| 8   |     0|1110001110011000|  0  |  11109|   1  |  1004 |    8|   11110 |
| 8+  |     0|0000001111101000|  0  |*******|   0  |  1004 |    8|   11110 |
| 9   |     0|0000001111101000|  0  |*******|   0  |  1000 |    9|   11110 |
| 9+  | 11111|1111010011110000|  0  |*******|   0  |  1000 |    9|      -1 |
| 10  | 11111|1111010011110000|  0  |*******|   0  | 32767 |   10|      -1 |
| 10+ | 11111|0000000000001110|  0  |*******|   0  | 32767 |   10|      -1 |
| 11  | 11111|0000000000001110|  0  |*******|   0  |    14 |   11|      -1 |
| 11+ | 11111|1110001100000100|  0  |*******|   0  |    14 |   11|      -1 |
| 12  | 11111|1110001100000100|  0  |*******|   0  |    14 |   14|      -1 |
| 12+ | 11111|0000001111100111|  0  |*******|   0  |    14 |   14|      -1 |
| 13  | 11111|0000001111100111|  0  |*******|   0  |   999 |   15|      -1 |
| 13+ | 11111|1111110111100000|  0  |*******|   0  |   999 |   15|      -1 |
| 14  | 11111|1111110111100000|  0  |*******|   0  | 11112 |   16|      -1 |
| 14+ | 11111|1110001100101000|  0  |     -1|   1  | 11112 |   16|      -1 |
| 15  | 11111|1110001100101000|  0  |     -1|   1  | 32767 |   17|      -1 |
| 15+ | 11111|0000000000010101|  0  |*******|   0  | 32767 |   17|      -1 |
| 16  | 11111|0000000000010101|  0  |*******|   0  |    21 |   18|      -1 |
| 16+ | 11111|1110011111000010|  0  |*******|   0  |    21 |   18|      -1 |
| 17  | 11111|1110011111000010|  0  |*******|   0  |    21 |   21|      -1 |
| 17+ | 11111|0000000000000010|  0  |*******|   0  |    21 |   21|      -1 |
| 18  | 11111|0000000000000010|  0  |*******|   0  |     2 |   22|      -1 |
| 18+ | 11111|1110000010111000|  0  |      1|   1  |     2 |   22|       1 |
| 19  | 11111|1110000010111000|  0  |      2|   1  |     1 |   23|       1 |
| 19+ | 11111|1111110111001000|  0  |  11112|   1  |     1 |   23|       1 |
| 20  | 11111|1111110111001000|  0  |  11112|   1  |     1 |   24|       1 |
| 20+ | 11111|1111110010101000|  0  |  11110|   1  |     1 |   24|       1 |
| 21  | 11111|1111110010101000|  0  |  11110|   1  | 11110 |   25|       1 |
| 21+ | 11111|0000001111101000|  0  |*******|   0  | 11110 |   25|       1 |
| 22  | 11111|0000001111101000|  0  |*******|   0  |  1000 |   26|       1 |
| 22+ | 11111|1110111010010000|  0  |*******|   0  |  1000 |   26|      -1 |
| 23  | 11111|1110111010010000|  0  |*******|   0  |  1000 |   27|      -1 |
| 23+ | 11111|1110001100000001|  0  |*******|   0  |  1000 |   27|      -1 |
| 24  | 11111|1110001100000001|  0  |*******|   0  |  1000 |   28|      -1 |
| 24+ | 11111|1110001100000010|  0  |*******|   0  |  1000 |   28|      -1 |
| 25  | 11111|1110001100000010|  0  |*******|   0  |  1000 |   29|      -1 |
| 25+ | 11111|1110001100000011|  0  |*******|   0  |  1000 |   29|      -1 |
| 26  | 11111|1110001100000011|  0  |*******|   0  |  1000 |   30|      -1 |
| 26+ | 11111|1110001100000100|  0  |*******|   0  |  1000 |   30|      -1 |
| 27  | 11111|1110001100000100|  0  |*******|   0  |  1000 | 1000|      -1 |
| 27+ | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1000|      -1 |
| 28  | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1000|      -1 |
| 28+ | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1000|      -1 |
| 29  | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1000|      -1 |
| 29+ | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1000|      -1 |
| 30  | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1000|      -1 |
| 30+ | 11111|1110101010010000|  0  |*******|   0  |  1000 | 1000|       0 |
| 31  | 11111|1110101010010000|  0  |*******|   0  |  1000 | 1001|       0 |
| 31+ | 11111|1110001100000001|  0  |*******|   0  |  1000 | 1001|       0 |
| 32  | 11111|1110001100000001|  0  |*******|   0  |  1000 | 1002|       0 |
| 32+ | 11111|1110001100000010|  0  |*******|   0  |  1000 | 1002|       0 |
| 33  | 11111|1110001100000010|  0  |*******|   0  |  1000 | 1000|       0 |
| 33+ | 11111|1110001100000011|  0  |*******|   0  |  1000 | 1000|       0 |
| 34  | 11111|1110001100000011|  0  |*******|   0  |  1000 | 1000|       0 |
| 34+ | 11111|1110001100000100|  0  |*******|   0  |  1000 | 1000|       0 |
| 35  | 11111|1110001100000100|  0  |*******|   0  |  1000 | 1001|       0 |
| 35+ | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1001|       0 |
| 36  | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1002|       0 |
| 36+ | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1002|       0 |
| 37  | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1000|       0 |
| 37+ | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1000|       0 |
| 38  | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1000|       0 |
| 38+ | 11111|1110111111010000|  0  |*******|   0  |  1000 | 1000|       1 |
| 39  | 11111|1110111111010000|  0  |*******|   0  |  1000 | 1001|       1 |
| 39+ | 11111|1110001100000001|  0  |*******|   0  |  1000 | 1001|       1 |
| 40  | 11111|1110001100000001|  0  |*******|   0  |  1000 | 1000|       1 |
| 40+ | 11111|1110001100000010|  0  |*******|   0  |  1000 | 1000|       1 |
| 41  | 11111|1110001100000010|  0  |*******|   0  |  1000 | 1001|       1 |
| 41+ | 11111|1110001100000011|  0  |*******|   0  |  1000 | 1001|       1 |
| 42  | 11111|1110001100000011|  0  |*******|   0  |  1000 | 1000|       1 |
| 42+ | 11111|1110001100000100|  0  |*******|   0  |  1000 | 1000|       1 |
| 43  | 11111|1110001100000100|  0  |*******|   0  |  1000 | 1001|       1 |
| 43+ | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1001|       1 |
| 44  | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1000|       1 |
| 44+ | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1000|       1 |
| 45  | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1001|       1 |
| 45+ | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1001|       1 |
| 46  | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1000|       1 |
| 46+ | 11111|1110001100000111|  1  |*******|   0  |  1000 | 1000|       1 |
| 47  | 11111|1110001100000111|  1  |*******|   0  |  1000 |    0|       1 |
| 47+ | 11111|0111111111111111|  0  |*******|   0  |  1000 |    0|       1 |
| 48  | 11111|0111111111111111|  0  |*******|   0  | 32767 |    1|       1 |`;

export const external_tst = `// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/CPU-external.tst

// Tests the CPU by setting the instruction input to various binary values that
// code Hack instructions, and outputting the values of the registers that are
// supposed to be affected by the instructions.

// Tracks the time, the CPU inputs (inM, instruction, reset bit), and the CPU
// outputs (outM, writeM bit, address, pc).

compare-to CPU-external.cmp,
output-list time%S1.3.1 inM%D0.6.0 instruction%B0.16.0 reset%B2.1.2 outM%D1.6.0 writeM%B3.1.2 addressM%D1.5.1 pc%D0.5.0;

set instruction %B0011000000111001, // @12345
tick, output, tock, output;

set instruction %B1110110000010000, // D=A
tick, output, tock, output;

set instruction %B0101101110100000, // @23456
tick, output, tock, output;

set instruction %B1110000111110000, // AD=A-D
tick, output, tock, output;

set instruction %B0000001111101011, // @1003
tick, output, tock, output;

set instruction %B1110001100001000, // M=D
tick, output, tock, output;

set instruction %B0000001111101100, // @1004
tick, output, tock, output;

set instruction %B1110001110011000, // MD=D-1
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1111010011110000, // AD=D-M
set inM 11111,
tick, output, tock, output;

set instruction %B0000000000001110, // @14
tick, output, tock, output;

set instruction %B1110001100000100, // D;jlt
tick, output, tock, output;

set instruction %B0000001111100111, // @999
tick, output, tock, output;

set instruction %B1111110111100000, // A=M+1
tick, output, tock, output;

set instruction %B1110001100101000, // AM=D
tick, output, tock, output;

set instruction %B0000000000010101, // @21
tick, output, tock, output;

set instruction %B1110011111000010, // D+1;jeq
tick, output, tock, output;

set instruction %B0000000000000010, // @2
tick, output, tock, output;

set instruction %B1110000010111000, // AMD=D+A
tick, output, tock, output;

set instruction %B1111110111001000, // M=M+1
tick, output, tock, output;

set instruction %B1111110010101000, // AM=M-1
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1110111010010000, // D=-1
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set instruction %B1110101010010000, // D=0
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set instruction %B1110111111010000, // D=1
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set reset 1;
tick, output, tock, output;

set instruction %B0111111111111111, // @32767
set reset 0;
tick, output, tock, output;`;

export const external_cmp = `|time | inM  |  instruction   |reset| outM  |writeM|address| pc  |
| 0+  |     0|0011000000111001|  0  |*******|   0  |     0 |    0|
| 1   |     0|0011000000111001|  0  |*******|   0  | 12345 |    1|
| 1+  |     0|1110110000010000|  0  |*******|   0  | 12345 |    1|
| 2   |     0|1110110000010000|  0  |*******|   0  | 12345 |    2|
| 2+  |     0|0101101110100000|  0  |*******|   0  | 12345 |    2|
| 3   |     0|0101101110100000|  0  |*******|   0  | 23456 |    3|
| 3+  |     0|1110000111110000|  0  |*******|   0  | 23456 |    3|
| 4   |     0|1110000111110000|  0  |*******|   0  | 11111 |    4|
| 4+  |     0|0000001111101011|  0  |*******|   0  | 11111 |    4|
| 5   |     0|0000001111101011|  0  |*******|   0  |  1003 |    5|
| 5+  |     0|1110001100001000|  0  |  11111|   1  |  1003 |    5|
| 6   |     0|1110001100001000|  0  |  11111|   1  |  1003 |    6|
| 6+  |     0|0000001111101100|  0  |*******|   0  |  1003 |    6|
| 7   |     0|0000001111101100|  0  |*******|   0  |  1004 |    7|
| 7+  |     0|1110001110011000|  0  |  11110|   1  |  1004 |    7|
| 8   |     0|1110001110011000|  0  |  11109|   1  |  1004 |    8|
| 8+  |     0|0000001111101000|  0  |*******|   0  |  1004 |    8|
| 9   |     0|0000001111101000|  0  |*******|   0  |  1000 |    9|
| 9+  | 11111|1111010011110000|  0  |*******|   0  |  1000 |    9|
| 10  | 11111|1111010011110000|  0  |*******|   0  | 32767 |   10|
| 10+ | 11111|0000000000001110|  0  |*******|   0  | 32767 |   10|
| 11  | 11111|0000000000001110|  0  |*******|   0  |    14 |   11|
| 11+ | 11111|1110001100000100|  0  |*******|   0  |    14 |   11|
| 12  | 11111|1110001100000100|  0  |*******|   0  |    14 |   14|
| 12+ | 11111|0000001111100111|  0  |*******|   0  |    14 |   14|
| 13  | 11111|0000001111100111|  0  |*******|   0  |   999 |   15|
| 13+ | 11111|1111110111100000|  0  |*******|   0  |   999 |   15|
| 14  | 11111|1111110111100000|  0  |*******|   0  | 11112 |   16|
| 14+ | 11111|1110001100101000|  0  |     -1|   1  | 11112 |   16|
| 15  | 11111|1110001100101000|  0  |     -1|   1  | 32767 |   17|
| 15+ | 11111|0000000000010101|  0  |*******|   0  | 32767 |   17|
| 16  | 11111|0000000000010101|  0  |*******|   0  |    21 |   18|
| 16+ | 11111|1110011111000010|  0  |*******|   0  |    21 |   18|
| 17  | 11111|1110011111000010|  0  |*******|   0  |    21 |   21|
| 17+ | 11111|0000000000000010|  0  |*******|   0  |    21 |   21|
| 18  | 11111|0000000000000010|  0  |*******|   0  |     2 |   22|
| 18+ | 11111|1110000010111000|  0  |      1|   1  |     2 |   22|
| 19  | 11111|1110000010111000|  0  |      2|   1  |     1 |   23|
| 19+ | 11111|1111110111001000|  0  |  11112|   1  |     1 |   23|
| 20  | 11111|1111110111001000|  0  |  11112|   1  |     1 |   24|
| 20+ | 11111|1111110010101000|  0  |  11110|   1  |     1 |   24|
| 21  | 11111|1111110010101000|  0  |  11110|   1  | 11110 |   25|
| 21+ | 11111|0000001111101000|  0  |*******|   0  | 11110 |   25|
| 22  | 11111|0000001111101000|  0  |*******|   0  |  1000 |   26|
| 22+ | 11111|1110111010010000|  0  |*******|   0  |  1000 |   26|
| 23  | 11111|1110111010010000|  0  |*******|   0  |  1000 |   27|
| 23+ | 11111|1110001100000001|  0  |*******|   0  |  1000 |   27|
| 24  | 11111|1110001100000001|  0  |*******|   0  |  1000 |   28|
| 24+ | 11111|1110001100000010|  0  |*******|   0  |  1000 |   28|
| 25  | 11111|1110001100000010|  0  |*******|   0  |  1000 |   29|
| 25+ | 11111|1110001100000011|  0  |*******|   0  |  1000 |   29|
| 26  | 11111|1110001100000011|  0  |*******|   0  |  1000 |   30|
| 26+ | 11111|1110001100000100|  0  |*******|   0  |  1000 |   30|
| 27  | 11111|1110001100000100|  0  |*******|   0  |  1000 | 1000|
| 27+ | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1000|
| 28  | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1000|
| 28+ | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1000|
| 29  | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1000|
| 29+ | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1000|
| 30  | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1000|
| 30+ | 11111|1110101010010000|  0  |*******|   0  |  1000 | 1000|
| 31  | 11111|1110101010010000|  0  |*******|   0  |  1000 | 1001|
| 31+ | 11111|1110001100000001|  0  |*******|   0  |  1000 | 1001|
| 32  | 11111|1110001100000001|  0  |*******|   0  |  1000 | 1002|
| 32+ | 11111|1110001100000010|  0  |*******|   0  |  1000 | 1002|
| 33  | 11111|1110001100000010|  0  |*******|   0  |  1000 | 1000|
| 33+ | 11111|1110001100000011|  0  |*******|   0  |  1000 | 1000|
| 34  | 11111|1110001100000011|  0  |*******|   0  |  1000 | 1000|
| 34+ | 11111|1110001100000100|  0  |*******|   0  |  1000 | 1000|
| 35  | 11111|1110001100000100|  0  |*******|   0  |  1000 | 1001|
| 35+ | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1001|
| 36  | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1002|
| 36+ | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1002|
| 37  | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1000|
| 37+ | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1000|
| 38  | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1000|
| 38+ | 11111|1110111111010000|  0  |*******|   0  |  1000 | 1000|
| 39  | 11111|1110111111010000|  0  |*******|   0  |  1000 | 1001|
| 39+ | 11111|1110001100000001|  0  |*******|   0  |  1000 | 1001|
| 40  | 11111|1110001100000001|  0  |*******|   0  |  1000 | 1000|
| 40+ | 11111|1110001100000010|  0  |*******|   0  |  1000 | 1000|
| 41  | 11111|1110001100000010|  0  |*******|   0  |  1000 | 1001|
| 41+ | 11111|1110001100000011|  0  |*******|   0  |  1000 | 1001|
| 42  | 11111|1110001100000011|  0  |*******|   0  |  1000 | 1000|
| 42+ | 11111|1110001100000100|  0  |*******|   0  |  1000 | 1000|
| 43  | 11111|1110001100000100|  0  |*******|   0  |  1000 | 1001|
| 43+ | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1001|
| 44  | 11111|1110001100000101|  0  |*******|   0  |  1000 | 1000|
| 44+ | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1000|
| 45  | 11111|1110001100000110|  0  |*******|   0  |  1000 | 1001|
| 45+ | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1001|
| 46  | 11111|1110001100000111|  0  |*******|   0  |  1000 | 1000|
| 46+ | 11111|1110001100000111|  1  |*******|   0  |  1000 | 1000|
| 47  | 11111|1110001100000111|  1  |*******|   0  |  1000 |    0|
| 47+ | 11111|0111111111111111|  0  |*******|   0  |  1000 |    0|
| 48  | 11111|0111111111111111|  0  |*******|   0  | 32767 |    1|`;
