export const sol = `CHIP RAM16K {
    IN in[16], load, address[14];
    OUT out[16];

    PARTS:
    // Demux the address to the 4 load channels
    DMux4Way(
        in=load,
        sel=address[12..13],
        a=load1,
        b=load2,
        c=load3,
        d=load4
    );

    // The child blocks
    RAM4K (in=in, load=load1, address=address[0..11], out=ram1);
    RAM4K (in=in, load=load2, address=address[0..11], out=ram2);
    RAM4K (in=in, load=load3, address=address[0..11], out=ram3);
    RAM4K (in=in, load=load4, address=address[0..11], out=ram4);

    // The output logic is a simple muxer
    Mux4Way16(
        a=ram1,
        b=ram2,
        c=ram3,
        d=ram4,
        sel=address[12..13],
        out=out
    );
}`;
