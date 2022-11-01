export const sol = `CHIP RAM64 {
    IN in[16], load, address[6];
    OUT out[16];

    PARTS:
    // Demux the address to the 8 load channels
    DMux8Way(
        in=load,
        sel=address[3..5],
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
    RAM8 (in=in, load=load1, address=address[0..2], out=ram1);
    RAM8 (in=in, load=load2, address=address[0..2], out=ram2);
    RAM8 (in=in, load=load3, address=address[0..2], out=ram3);
    RAM8 (in=in, load=load4, address=address[0..2], out=ram4);
    RAM8 (in=in, load=load5, address=address[0..2], out=ram5);
    RAM8 (in=in, load=load6, address=address[0..2], out=ram6);
    RAM8 (in=in, load=load7, address=address[0..2], out=ram7);
    RAM8 (in=in, load=load8, address=address[0..2], out=ram8);

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
        sel=address[3..5],
        out=out
    );
}`;
