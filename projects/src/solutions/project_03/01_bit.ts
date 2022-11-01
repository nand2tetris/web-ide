export const sol = `CHIP Bit {
    IN in, load;
    OUT out;

    PARTS:
    
    Mux (a=dffOut, b=in, sel=load, out=muxOut);
    DFF (in=muxOut, out=dffOut, out=out);
}`;
