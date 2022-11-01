export const sol = `CHIP RAM512 {
    IN in[16], load, address[9];
    OUT out[16];

    PARTS:
    // Demux the address to the 8 load channels
    DMux8Way(
        in=load,
        sel=address[6..8],
        a=loada,
        b=loadb,
        c=loadc,
        d=loadd,
        e=loade,
        f=loadf,
        g=loadg,
        h=loadh
    );

    // The child blocks
    RAM64 (in=in, load=loada, address=address[0..5], out=rama);
    RAM64 (in=in, load=loadb, address=address[0..5], out=ramb);
    RAM64 (in=in, load=loadc, address=address[0..5], out=ramc);
    RAM64 (in=in, load=loadd, address=address[0..5], out=ramd);
    RAM64 (in=in, load=loade, address=address[0..5], out=rame);
    RAM64 (in=in, load=loadf, address=address[0..5], out=ramf);
    RAM64 (in=in, load=loadg, address=address[0..5], out=ramg);
    RAM64 (in=in, load=loadh, address=address[0..5], out=ramh);

    // The output logic is a simple muxer
    Mux8Way16(
        a=rama,
        b=ramb,
        c=ramc,
        d=ramd,
        e=rame,
        f=ramf,
        g=ramg,
        h=ramh,
        sel=address[6..8],
        out=out
    );
}`;
