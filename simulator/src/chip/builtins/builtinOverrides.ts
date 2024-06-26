export const builtinOverrides: Record<string, string> = {
  CPU: `CHIP CPU {

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
    Mux16(a=instruction, b=ALUoutput, sel=instruction[15], out=Ainput);
    Not(in=instruction[15], out=Ainstruction);
    Or(a=Ainstruction, b=instruction[5], out=loadA);
    ARegister(in=Ainput, load=loadA, out=Aoutput, out[0..14]=addressM);

    And(a=instruction[15], b=instruction[4], out=loadD);
    DRegister(in=ALUoutput, load=loadD, out=Doutput);

    Mux16(a=Aoutput, b=inM, sel=instruction[12], out=ALUsecondInput);

    ALU(x=Doutput, y=ALUsecondInput, 
        zx=instruction[11], nx=instruction[10], 
        zy=instruction[9], ny=instruction[8],
        f=instruction[7], no=instruction[6], 
        out=ALUoutput, out=outM, ng=negative, zr=zero);

    And(a=instruction[15], b=instruction[3], out=writeM);

    Or(a=negative, b=zero, out=notPositive);
    Not(in=notPositive, out=positive);

    And(a=positive, b=instruction[0], out=j1);
    And(a=zero, b=instruction[1], out=j2);
    And(a=negative, b=instruction[2], out=j3);
    Or(a=j1, b=j2, out=jTemp);
    Or(a=jTemp, b=j3, out=jumpIfC);
    And(a=jumpIfC, b=instruction[15], out=jump);

    PC(reset=reset, inc=true, load=jump, in=Aoutput, out[0..14]=pc);
}`,
};
