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

    // See Figure 5.9 for a schematic of the CPU.

    // From figure 5.9, set all control bits from incoming instruction. 
    Not(in=instruction[15], out=aInstruction);
    Mux16(
        b=false,
        a=instruction,
        sel=aInstruction,
        out[15]=cInst,
        out[12]=a,
        out[11]=c1,
        out[10]=c2,
        out[9]=c3,
        out[8]=c4,
        out[7]=c5,
        out[6]=c6,
        out[5]=d1,
        out[4]=writeD,
        out[3]=writeM,
        out[0..2]=jump
    );

    // Register A will be filled from either the instruction line or the ALU,
    // based on the aInstruction bit (bit 15 of the instruction).
    Mux16(a=alu, b=instruction, sel=aInstruction, out=regA);

    // Only read 15 bits of memory address into register A.
    Or(a=aInstruction, b=d1, out=setA);
    ARegister(in=regA, in[15]=false, load=setA, out[0..14]=addressM, out=A);

    // D register is loaded from the ALU when d2 is set.
    DRegister(in=alu, load=writeD, out=D);

    // Fill the A bus line from either the A register or Memory, based on
    // instruction bit a (12).
    Mux16(a=A, b=inM, sel=a, out=AM);

    // ALU control bits are mapped directly in C instructions when in c mode.
    // If aInstruction is 0, c instructions are 0, and ALU will output 0.
    ALU(
        x=D,
        y=AM,
        zx=c1, nx=c2, zy=c3, ny=c4, f=c5, no=c6,
        out=alu,
        out=outM,
        zr=zr, ng=ng
    );
    
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

    Or8Way(
        in[0]=jgt,
        in[1]=jeq,
        in[2]=jge,
        in[3]=jlt,
        in[4]=jne,
        in[5]=jle,
        out=jmpi,
    );

    And(a=jmpi, b=cInst, out=jmp);

    PC(in=A, load=jmp, reset=reset, inc=true, out[0..14]=pc);
}`;
