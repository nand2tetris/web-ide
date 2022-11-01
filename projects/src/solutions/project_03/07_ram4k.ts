export const sol = `CHIP RAM4K {
    IN in[16], load, address[12];
    OUT out[16];

    PARTS:
    // Demux the address to the 8 load channels
    DMux8Way(
        in=load,
        sel=address[9..11],
        a=load1,
        b=load2,
        c=load3,
        d=load4,
        e=load5,
        f=load6,
        g=load7,
        h=load8
    );

    // The child blocks
    RAM512 (in=in, load=load1, address=address[0..8], out=ram1);
    RAM512 (in=in, load=load2, address=address[0..8], out=ram2);
    RAM512 (in=in, load=load3, address=address[0..8], out=ram3);
    RAM512 (in=in, load=load4, address=address[0..8], out=ram4);
    RAM512 (in=in, load=load5, address=address[0..8], out=ram5);
    RAM512 (in=in, load=load6, address=address[0..8], out=ram6);
    RAM512 (in=in, load=load7, address=address[0..8], out=ram7);
    RAM512 (in=in, load=load8, address=address[0..8], out=ram8);

    // The output logic is a simple muxer
    Mux8Way16(
        a=ram1,
        b=ram2,
        c=ram3,
        d=ram4,
        e=ram5,
        f=ram6,
        g=ram7,
        h=ram8,
        sel=address[9..11],
        out=out
    );
}`;
