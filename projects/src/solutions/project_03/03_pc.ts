export const sol = `CHIP PC {
    IN in[16], load, inc, reset;
    OUT out[16];

    PARTS:
    // The internal 'self' pin tracks the current state of the PC. The 'pc' pin
    // tracks the next value of the PC. Based on 'inc', 'lost', and 'reset',
    // one of 'self', 'pc', and 'false' will be put on 'next' and used as the
    // input value of the Register, which will always load that value and write
    // its current value to 'self'.

    Inc16 (in=self, out=pc);

    Mux16 (sel=inc,   a=self, b=pc,    out=pin0);
    Mux16 (sel=load,  a=pin0, b=in,    out=pin1);
    Mux16 (sel=reset, a=pin1, b=false, out=next);

    Register (in=next, load=true, out=out, out=self);
}`;
