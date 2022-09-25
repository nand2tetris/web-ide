export const hdl = `/**
 * The complete address space of the Hack computer's memory,
 * including RAM and memory-mapped I/O. 
 * The chip facilitates read and write operations, as follows:
 *     Read:  out(t) = Memory[address(t)](t)
 *     Write: if load(t-1) then Memory[address(t-1)](t) = in(t-1)
 * In words: the chip always outputs the value stored at the memory 
 * location specified by address. If load==1, the in value is loaded 
 * into the memory location specified by address. This value becomes 
 * available through the out output from the next time step onward.
 * Address space rules:
 * Only the upper 16K+8K+1 words of the Memory chip are used. 
 * Access to address>0x6000 is invalid. Access to any address in 
 * the range 0x4000-0x5FFF results in accessing the screen memory 
 * map. Access to address 0x6000 results in accessing the keyboard 
 * memory map. The behavior in these addresses is described in the 
 * Screen and Keyboard chip specifications given in the book.
 */

CHIP Memory {
    IN in[16], load, address[15];
    OUT out[16];

    PARTS:
}`;
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
export const tst = `output-list in%D1.6.1 load%B2.1.2 address%B1.15.1 out%D1.6.1;

// Set RAM[0] = -1
set address 0,
set in   -1, set load 1, tick, output; tock, output;

// RAM[0] holds value
set in 9999, set load 0, tick, output; tock, output;

// Did not also write to upper RAM or Screen
set address %X2000, eval, output;
set address %X4000, eval, output;

// Set RAM[0x2000] = 2222
set address %X2000,
set in 2222, set load 1, tick, output; tock, output;

// RAM[0x2000] holds value
set in 9999, set load 0, tick, output; tock, output;

// Did not also write to lower RAM or Screen
set address 0, eval, output;
set address %X4000, eval, output;

set load 0,	// Low order address bits connected
set address %X0001, eval, output;
set address %X0002, eval, output;
set address %X0004, eval, output;
set address %X0008, eval, output;
set address %X0010, eval, output;
set address %X0020, eval, output;
set address %X0040, eval, output;
set address %X0080, eval, output;
set address %X0100, eval, output;
set address %X0200, eval, output;
set address %X0400, eval, output;
set address %X0800, eval, output;
set address %X1000, eval, output;
set address %X2000, eval, output;

// RAM[1234] = 1234
set address %X1234,
set in 1234, set load 1, tick, output; tock, output;

// Did not also write to upper RAM or Screen 
set load 0,
set address %X2234, eval, output;
set address %X6234, eval, output;

// RAM[0x2345] = 2345
set address %X2345,
set in 2345, set load 1, tick, output; tock, output;

// Did not also write to lower RAM or Screen 
set load 0,
set address %X0345, eval, output;
set address %X4345, eval, output;

// Keyboard test

// set address 24576,
// echo "Click the Keyboard icon and hold down the 'K' key (uppercase) until you see the next message (it should appear shortly after that) ...",
// It's important to keep holding the key down since if the system is busy,
// the memory will zero itself before being outputted.

/*
set Keyboard 'K';
while out <> 75 {
    eval,
}
clear-echo, output;
output;
*/

// Screen test

set load 1, set in -1, set address %X4FCF, tick, tock, output;
set address %X504F, tick, tock, output;

// Did not also write to lower or upper RAM
set address %X0FCF, eval, output;
set address %X2FCF, eval, output;

set load 0,				// Low order address bits connected
set address %X4FCE, eval, output;
set address %X4FCD, eval, output;
set address %X4FCB, eval, output;
set address %X4FC7, eval, output;
set address %X4FDF, eval, output;
set address %X4FEF, eval, output;
set address %X4F8F, eval, output;
set address %X4F4F, eval, output;
set address %X4ECF, eval, output;
set address %X4DCF, eval, output;
set address %X4BCF, eval, output;
set address %X47CF, eval, output;
set address %X5FCF, eval, output;


set load 0, set address 24576,
echo "Make sure you see ONLY two horizontal lines in the middle of the screen. Change Keyboard to 'Y' (uppercase) to continue ...",

while out <> 89 {
    eval;
}
clear-echo, output;
output;`;
export const cmp = `|   in   |load |     address     |  out   |
|     -1 |  1  | 000000000000000 |      0 |
|     -1 |  1  | 000000000000000 |     -1 |
|   9999 |  0  | 000000000000000 |     -1 |
|   9999 |  0  | 000000000000000 |     -1 |
|   9999 |  0  | 010000000000000 |      0 |
|   9999 |  0  | 100000000000000 |      0 |
|   2222 |  1  | 010000000000000 |      0 |
|   2222 |  1  | 010000000000000 |   2222 |
|   9999 |  0  | 010000000000000 |   2222 |
|   9999 |  0  | 010000000000000 |   2222 |
|   9999 |  0  | 000000000000000 |     -1 |
|   9999 |  0  | 100000000000000 |      0 |
|   9999 |  0  | 000000000000001 |      0 |
|   9999 |  0  | 000000000000010 |      0 |
|   9999 |  0  | 000000000000100 |      0 |
|   9999 |  0  | 000000000001000 |      0 |
|   9999 |  0  | 000000000010000 |      0 |
|   9999 |  0  | 000000000100000 |      0 |
|   9999 |  0  | 000000001000000 |      0 |
|   9999 |  0  | 000000010000000 |      0 |
|   9999 |  0  | 000000100000000 |      0 |
|   9999 |  0  | 000001000000000 |      0 |
|   9999 |  0  | 000010000000000 |      0 |
|   9999 |  0  | 000100000000000 |      0 |
|   9999 |  0  | 001000000000000 |      0 |
|   9999 |  0  | 010000000000000 |   2222 |
|   1234 |  1  | 001001000110100 |      0 |
|   1234 |  1  | 001001000110100 |   1234 |
|   1234 |  0  | 010001000110100 |      0 |
|   1234 |  0  | 110001000110100 |      0 |
|   2345 |  1  | 010001101000101 |      0 |
|   2345 |  1  | 010001101000101 |   2345 |
|   2345 |  0  | 000001101000101 |      0 |
|   2345 |  0  | 100001101000101 |      0 |
|     -1 |  1  | 100111111001111 |     -1 |
|     -1 |  1  | 101000001001111 |     -1 |
|     -1 |  1  | 000111111001111 |      0 |
|     -1 |  1  | 010111111001111 |      0 |
|     -1 |  0  | 100111111001110 |      0 |
|     -1 |  0  | 100111111001101 |      0 |
|     -1 |  0  | 100111111001011 |      0 |
|     -1 |  0  | 100111111000111 |      0 |
|     -1 |  0  | 100111111011111 |      0 |
|     -1 |  0  | 100111111101111 |      0 |
|     -1 |  0  | 100111110001111 |      0 |
|     -1 |  0  | 100111101001111 |      0 |
|     -1 |  0  | 100111011001111 |      0 |
|     -1 |  0  | 100110111001111 |      0 |
|     -1 |  0  | 100101111001111 |      0 |
|     -1 |  0  | 100011111001111 |      0 |
|     -1 |  0  | 101111111001111 |      0 |`;
