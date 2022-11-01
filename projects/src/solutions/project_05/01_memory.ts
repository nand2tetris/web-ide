export const sol = `CHIP Memory {
    IN in[16], load, address[15];
    OUT out[16];

    PARTS:
    DMux4Way (in=load, sel=address[13..14], a=load0, b=load1, c=loadScreen);
    Or       (a=load0, b=load1, out=loadRAM);
    RAM16K   (in=in, load=loadRAM, address=address[0..13], out=ramOut);
    Screen   (in=in, load=loadScreen, address=address[0..12], out=screenOut);

    // check if keyboard address - 0x6000 = 110 0000 0000 0000
    And    (a=address[13], b=address[14], out=and1314);
    Or8Way (in=address[0..7], out=or0to7);
    Or8Way (in=address[5..12], out=or5to12);
    Or     (a=or0to7, b=or5to12, out=or0to12);
    Not    (in=or0to12, out=zero0to12);
    And    (a=zero0to12, b=and1314, out=keyAddress);

    // if keyboard address, output keyboard contents
    Keyboard  (out=key);
    Mux16     (a=false, b=key, sel=keyAddress, out=keyOut);
    Mux4Way16 (a=ramOut, b=ramOut, c=screenOut, d=keyOut, sel=address[13..14], out=out);

// Alternate implementation for keyboard decoding.
/*
    // check if keyboard address - 0x6000 = 110 0000 0000 0000
    // The output Mux4Way16 selects the range 0x6000 - 0x7FFF (the 1's). 
    // Decode xx0 0000 0000 0000 so that only 0x6000 responds within
    // this range.
    Or8Way (in=address[0..7], out=or0to7);
    Or8Way (in[0]=or0to7, in[1..7]=address[6..12], out=or0to12);
    Not (in=or0to12, out=keyAddress);

    // if keyboard address, output keyboard contents
    Keyboard (out=key);
    Mux16 (a=false, b=key, sel=keyAddress, out=keyOut);

    Mux4Way16 (a=ramOut, b=ramOut, c=screenOut, d=keyOut, sel=address[13..14], out=out);
*/


// Alternate implementation.
//
// The book says "Access to any address>24576 (0x6000) is invalid."  It can be
// argued that any access to an invalid address may return a don't-care value.
// The current keyboard value is as good a don't-care as any, so there is no
// need to decode the specific address.
//
// Some argue that this is poor engineering practice.
// Fully decoding I/O addresses should be encouraged.
/*
    PARTS:
    DMux4Way (in=load, sel=address[13..14], a=load0, b=load1, c=loadScreen);
    Or (a=load0, b=load1, out=loadRAM);
    RAM16K (in=in, load=loadRAM, address=address[0..13], out=ramOut);
    Screen (in=in, load=loadScreen, address=address[0..12], out=screenOut);
    Keyboard (out=keyOut);
    Mux4Way16 (a=ramOut, b=ramOut, c=screenOut, d=keyOut, sel=address[13..14], out=out);
*/
}`;
