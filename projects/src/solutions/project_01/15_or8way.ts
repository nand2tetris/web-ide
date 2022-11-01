export const sol = `CHIP Or8Way {
    IN in[8];
    OUT out;

    PARTS:
    Or (a=in[0], b=in[1], out=or01);
    Or (a=in[2], b=in[3], out=or23);
    Or (a=in[4], b=in[5], out=or45);
    Or (a=in[6], b=in[7], out=or67);
    Or (a=or01, b=or23, out=or0123);
    Or (a=or45, b=or67, out=or4567);
    Or (a=or0123, b=or4567, out=out);
}`;
