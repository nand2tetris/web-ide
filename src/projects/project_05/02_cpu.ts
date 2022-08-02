export const hdl = `/**
 * The Hack CPU (Central Processing unit), consisting of an ALU,
 * two registers named A and D, and a program counter named PC.
 * The CPU is designed to fetch and execute instructions written in 
 * the Hack machine language. In particular, functions as follows:
 * Executes the inputted instruction according to the Hack machine 
 * language specification. The D and A in the language specification
 * refer to CPU-resident registers, while M refers to the external
 * memory location addressed by A, i.e. to Memory[A]. The inM input 
 * holds the value of this location. If the current instruction needs 
 * to write a value to M, the value is placed in outM, the address 
 * of the target location is placed in the addressM output, and the 
 * writeM control bit is asserted. (When writeM==0, any value may 
 * appear in outM). The outM and writeM outputs are combinational: 
 * they are affected instantaneously by the execution of the current 
 * instruction. The addressM and pc outputs are clocked: although they 
 * are affected by the execution of the current instruction, they commit 
 * to their new values only in the next time step. If reset==1 then the 
 * CPU jumps to address 0 (i.e. pc is set to 0 in next time step) rather 
 * than to the address resulting from executing the current instruction. 
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
}`;
export const sol = `CHIP CPU {
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

    // From figure 5.9
    Not(in=instruction[15], out=aInstruction);
    Mux16(
        b=false,
        a=instruction,
        sel=aInstruction,
        out[12]=a,
        out[11]=c1,
        out[10]=c2,
        out[9]=c3,
        out[8]=c4,
        out[7]=c5,
        out[6]=c6,
        out[5]=d1,
        out[4]=d2,
        out[3]=d3,
        out[0..2]=jump
    );

    // Register A will be filled from either the instruction line or the ALU
    Mux16(a=alu, b=instruction, sel=aInstruction, out=regA);

    // Only read 15 bits of memory address in register A
    Or(a=aInstruction, b=d1, out=setA);
    ARegister(in=regA, in[15]=false, load=setA, out[0..14]=addressM, out=A);

    // D register is loaded from the ALU when d2 is set
    DRegister(in=alu, load=d2, out=D);

    Mux16(a=A, b=inM, sel=a, out=AM);

    // ALU control bits are mapped directly in C instructions when in c mode.
    ALU(x=D, y=AM, zx=c1, nx=c2, zy=c3, ny=c4, f=c5, no=c6, out=alu, out=outM, zr=zr, ng=ng);
    And(a=d3, b=true, out=writeM);
    
    // Jump
    Not(in=ng, out=nng);
    Not(in=zr, out=nzr);
    And(a=nng, b=nzr, out=pt); // Positive is not negative and not zero

    And(a=jump[2], b=ng, out=jlt);
    And(a=jump[1], b=zr, out=jeq);
    And(a=jump[0], b=pt, out=jgt);

    And(a=jgt, b=jeq, out=jge);
    And(a=jlt, b=jeq, out=jle);
    And(a=jgt, b=jlt, out=jne);

    And(a=jump[2], b=jump[1], out=jumpu1);
    And(a=jump[0], b=jumpu1, out=jumpu);

    Or(a=jgt, b=jeq, out=j1);
    Or(a=jge, b=j1, out=j2);
    Or(a=jlt, b=j2, out=j3);
    Or(a=jne, b=j3, out=j4);
    Or(a=jle, b=j4, out=j5);
    Or(a=jumpu, b=j5, out=jmp);

    PC(in=A, load=jmp, reset=reset, inc=true, out[0..14]=pc);
}`;
export const tst = `output-list time%S0.4.0 inM%D0.6.0 instruction%B0.16.0 reset%B2.1.2 outM%D1.6.0 writeM%B3.1.3 addressM%D0.5.0 pc%D0.5.0 DRegister[]%D1.6.1;


set instruction %B0011000000111001, // @12345
tick, output, tock, output;

set instruction %B1110110000010000, // D=A
tick, output, tock, output;

set instruction %B0101101110100000, // @23456
tick, output, tock, output;

set instruction %B1110000111010000, // D=A-D
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1110001100001000, // M=D
tick, output, tock, output;

set instruction %B0000001111101001, // @1001
tick, output, tock, output;

set instruction %B1110001110011000, // MD=D-1
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1111010011010000, // D=D-M
set inM 11111,
tick, output, tock, output;

set instruction %B0000000000001110, // @14
tick, output, tock, output;

set instruction %B1110001100000100, // D;jlt
tick, output, tock, output;

set instruction %B0000001111100111, // @999
tick, output, tock, output;

set instruction %B1110110111100000, // A=A+1
tick, output, tock, output;

set instruction %B1110001100001000, // M=D
tick, output, tock, output;

set instruction %B0000000000010101, // @21
tick, output, tock, output;

set instruction %B1110011111000010, // D+1;jeq
tick, output, tock, output;

set instruction %B0000000000000010, // @2
tick, output, tock, output;

set instruction %B1110000010010000, // D=D+A
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
export const cmp = `|time| inM  |  instruction   |reset| outM  |writeM |addre| pc  |DRegiste|
|0+  |     0|0011000000111001|  0  |*******|   0   |    0|    0|      0 |
|1   |     0|0011000000111001|  0  |*******|   0   |12345|    1|      0 |
|1+  |     0|1110110000010000|  0  |*******|   0   |12345|    1|      0 |
|2   |     0|1110110000010000|  0  |*******|   0   |12345|    2|  12345 |
|2+  |     0|0101101110100000|  0  |*******|   0   |12345|    2|  12345 |
|3   |     0|0101101110100000|  0  |*******|   0   |23456|    3|  12345 |
|3+  |     0|1110000111010000|  0  |*******|   0   |23456|    3|  12345 |
|4   |     0|1110000111010000|  0  |*******|   0   |23456|    4|  11111 |
|4+  |     0|0000001111101000|  0  |*******|   0   |23456|    4|  11111 |
|5   |     0|0000001111101000|  0  |*******|   0   | 1000|    5|  11111 |
|5+  |     0|1110001100001000|  0  |  11111|   1   | 1000|    5|  11111 |
|6   |     0|1110001100001000|  0  |  11111|   1   | 1000|    6|  11111 |
|6+  |     0|0000001111101001|  0  |*******|   0   | 1000|    6|  11111 |
|7   |     0|0000001111101001|  0  |*******|   0   | 1001|    7|  11111 |
|7+  |     0|1110001110011000|  0  |  11110|   1   | 1001|    7|  11111 |
|8   |     0|1110001110011000|  0  |  11109|   1   | 1001|    8|  11110 |
|8+  |     0|0000001111101000|  0  |*******|   0   | 1001|    8|  11110 |
|9   |     0|0000001111101000|  0  |*******|   0   | 1000|    9|  11110 |
|9+  | 11111|1111010011010000|  0  |*******|   0   | 1000|    9|  11110 |
|10  | 11111|1111010011010000|  0  |*******|   0   | 1000|   10|     -1 |
|10+ | 11111|0000000000001110|  0  |*******|   0   | 1000|   10|     -1 |
|11  | 11111|0000000000001110|  0  |*******|   0   |   14|   11|     -1 |
|11+ | 11111|1110001100000100|  0  |*******|   0   |   14|   11|     -1 |
|12  | 11111|1110001100000100|  0  |*******|   0   |   14|   14|     -1 |
|12+ | 11111|0000001111100111|  0  |*******|   0   |   14|   14|     -1 |
|13  | 11111|0000001111100111|  0  |*******|   0   |  999|   15|     -1 |
|13+ | 11111|1110110111100000|  0  |*******|   0   |  999|   15|     -1 |
|14  | 11111|1110110111100000|  0  |*******|   0   | 1000|   16|     -1 |
|14+ | 11111|1110001100001000|  0  |     -1|   1   | 1000|   16|     -1 |
|15  | 11111|1110001100001000|  0  |     -1|   1   | 1000|   17|     -1 |
|15+ | 11111|0000000000010101|  0  |*******|   0   | 1000|   17|     -1 |
|16  | 11111|0000000000010101|  0  |*******|   0   |   21|   18|     -1 |
|16+ | 11111|1110011111000010|  0  |*******|   0   |   21|   18|     -1 |
|17  | 11111|1110011111000010|  0  |*******|   0   |   21|   21|     -1 |
|17+ | 11111|0000000000000010|  0  |*******|   0   |   21|   21|     -1 |
|18  | 11111|0000000000000010|  0  |*******|   0   |    2|   22|     -1 |
|18+ | 11111|1110000010010000|  0  |*******|   0   |    2|   22|     -1 |
|19  | 11111|1110000010010000|  0  |*******|   0   |    2|   23|      1 |
|19+ | 11111|0000001111101000|  0  |*******|   0   |    2|   23|      1 |
|20  | 11111|0000001111101000|  0  |*******|   0   | 1000|   24|      1 |
|20+ | 11111|1110111010010000|  0  |*******|   0   | 1000|   24|      1 |
|21  | 11111|1110111010010000|  0  |*******|   0   | 1000|   25|     -1 |
|21+ | 11111|1110001100000001|  0  |*******|   0   | 1000|   25|     -1 |
|22  | 11111|1110001100000001|  0  |*******|   0   | 1000|   26|     -1 |
|22+ | 11111|1110001100000010|  0  |*******|   0   | 1000|   26|     -1 |
|23  | 11111|1110001100000010|  0  |*******|   0   | 1000|   27|     -1 |
|23+ | 11111|1110001100000011|  0  |*******|   0   | 1000|   27|     -1 |
|24  | 11111|1110001100000011|  0  |*******|   0   | 1000|   28|     -1 |
|24+ | 11111|1110001100000100|  0  |*******|   0   | 1000|   28|     -1 |
|25  | 11111|1110001100000100|  0  |*******|   0   | 1000| 1000|     -1 |
|25+ | 11111|1110001100000101|  0  |*******|   0   | 1000| 1000|     -1 |
|26  | 11111|1110001100000101|  0  |*******|   0   | 1000| 1000|     -1 |
|26+ | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|     -1 |
|27  | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|     -1 |
|27+ | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|     -1 |
|28  | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|     -1 |
|28+ | 11111|1110101010010000|  0  |*******|   0   | 1000| 1000|     -1 |
|29  | 11111|1110101010010000|  0  |*******|   0   | 1000| 1001|      0 |
|29+ | 11111|1110001100000001|  0  |*******|   0   | 1000| 1001|      0 |
|30  | 11111|1110001100000001|  0  |*******|   0   | 1000| 1002|      0 |
|30+ | 11111|1110001100000010|  0  |*******|   0   | 1000| 1002|      0 |
|31  | 11111|1110001100000010|  0  |*******|   0   | 1000| 1000|      0 |
|31+ | 11111|1110001100000011|  0  |*******|   0   | 1000| 1000|      0 |
|32  | 11111|1110001100000011|  0  |*******|   0   | 1000| 1000|      0 |
|32+ | 11111|1110001100000100|  0  |*******|   0   | 1000| 1000|      0 |
|33  | 11111|1110001100000100|  0  |*******|   0   | 1000| 1001|      0 |
|33+ | 11111|1110001100000101|  0  |*******|   0   | 1000| 1001|      0 |
|34  | 11111|1110001100000101|  0  |*******|   0   | 1000| 1002|      0 |
|34+ | 11111|1110001100000110|  0  |*******|   0   | 1000| 1002|      0 |
|35  | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|      0 |
|35+ | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|      0 |
|36  | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|      0 |
|36+ | 11111|1110111111010000|  0  |*******|   0   | 1000| 1000|      0 |
|37  | 11111|1110111111010000|  0  |*******|   0   | 1000| 1001|      1 |
|37+ | 11111|1110001100000001|  0  |*******|   0   | 1000| 1001|      1 |
|38  | 11111|1110001100000001|  0  |*******|   0   | 1000| 1000|      1 |
|38+ | 11111|1110001100000010|  0  |*******|   0   | 1000| 1000|      1 |
|39  | 11111|1110001100000010|  0  |*******|   0   | 1000| 1001|      1 |
|39+ | 11111|1110001100000011|  0  |*******|   0   | 1000| 1001|      1 |
|40  | 11111|1110001100000011|  0  |*******|   0   | 1000| 1000|      1 |
|40+ | 11111|1110001100000100|  0  |*******|   0   | 1000| 1000|      1 |
|41  | 11111|1110001100000100|  0  |*******|   0   | 1000| 1001|      1 |
|41+ | 11111|1110001100000101|  0  |*******|   0   | 1000| 1001|      1 |
|42  | 11111|1110001100000101|  0  |*******|   0   | 1000| 1000|      1 |
|42+ | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|      1 |
|43  | 11111|1110001100000110|  0  |*******|   0   | 1000| 1001|      1 |
|43+ | 11111|1110001100000111|  0  |*******|   0   | 1000| 1001|      1 |
|44  | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|      1 |
|44+ | 11111|1110001100000111|  1  |*******|   0   | 1000| 1000|      1 |
|45  | 11111|1110001100000111|  1  |*******|   0   | 1000|    0|      1 |
|45+ | 11111|0111111111111111|  0  |*******|   0   | 1000|    0|      1 |
|46  | 11111|0111111111111111|  0  |*******|   0   |32767|    1|      1 |`;
