export const sol = `CHIP RAM8 {
    IN in[16], load, address[3];
    OUT out[16];

    PARTS:
    // Demux the address to the 8 load channels
    DMux8Way(
        in=load,
        sel=address,
        a=load1,
        b=load2,
        c=load3,
        d=load4,
        e=load5,
        f=load6,
        g=load7,
        h=load8
    );

    // The registers proper
    Register (in=in, load=load1, out=reg1);
    Register (in=in, load=load2, out=reg2);
    Register (in=in, load=load3, out=reg3);
    Register (in=in, load=load4, out=reg4);
    Register (in=in, load=load5, out=reg5);
    Register (in=in, load=load6, out=reg6);
    Register (in=in, load=load7, out=reg7);
    Register (in=in, load=load8, out=reg8);

    // The output logic is a simple muxer
    Mux8Way16(
        a=reg1,
        b=reg2,
        c=reg3,
        d=reg4,
        e=reg5,
        f=reg6,
        g=reg7,
        h=reg8,
        sel=address,
        out=out
    );
}`;
