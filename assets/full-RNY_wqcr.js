import{aj as d}from"./index-Dx4IQRAd.js";import{p as R,F as A}from"./index-CIO6JW3G.js";async function e(t,o,s){for(const[r,l]of Object.entries(o))typeof l=="string"?r.endsWith(`${s}`)&&await t.writeFile(r,l):(t.cd(r),await e(t,l,s),t.cd(".."))}async function M(t,o,s,r=!0){const l=(await t.scandir(s??"/")).map(h=>h.name);for(const[h,m]of Object.entries(o)){const B=`${s?`${s}/`:""}${h}`;typeof m=="string"?(r||!l.includes(h))&&await t.writeFile(B,m):(await t.mkdir(B),await M(t,m,B))}}const T=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Nand.hdl
/**
 * Nand gate:
 * if (a and b) out = 0, else out = 1 
 */
CHIP Nand {
    IN a, b;
    OUT out;
    
    PARTS:
    BUILTIN Nand;
}`,b=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Nand.tst

output-list a b out;

set a 0,
set b 0,
eval,
output;

set a 0,
set b 1,
eval,
output;

set a 1,
set b 0,
eval,
output;

set a 1,
set b 1,
eval,
output;`,g=`| a | b |out|
| 0 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |`,w=`|in |out|
| 0 | 1 |
| 1 | 0 |`,S=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Not.hdl
/**
 * Not gate:
 * if (in) out = 0, else out = 1
 */
CHIP Not {
    IN in;
    OUT out;

    PARTS:
    //// Replace this comment with your code.
}`,C=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Not.tst

load Not.hdl,
compare-to Not.cmp,
output-list in out;

set in 0,
eval,
output;

set in 1,
eval,
output;`,x=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/And.hdl
/**
 * And gate:
 * if (a and b) out = 1, else out = 0 
 */
CHIP And {
    IN a, b;
    OUT out;
    
    PARTS:
    //// Replace this comment with your code.
}`,D=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/And.tst

load And.hdl,
compare-to And.cmp,
output-list a b out;

set a 0,
set b 0,
eval,
output;

set a 0,
set b 1,
eval,
output;

set a 1,
set b 0,
eval,
output;

set a 1,
set b 1,
eval,
output;`,P=`| a | b |out|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |`,I=`| a | b |out|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |`,F=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Or.hdl
/**
 * Or gate:
 * if (a or b) out = 1, else out = 0 
 */
CHIP Or {
    IN a, b;
    OUT out;

    PARTS:
    //// Replace this comment with your code.
}`,N=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Or.tst

load Or.hdl,
compare-to Or.cmp,
output-list a b out;

set a 0,
set b 0,
eval,
output;

set a 0,
set b 1,
eval,
output;

set a 1,
set b 0,
eval,
output;

set a 1,
set b 1,
eval,
output;`,E=`| a | b |out|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |`,z=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Xor.hdl
/**
 * Exclusive-or gate:
 * if ((a and Not(b)) or (Not(a) and b)) out = 1, else out = 0
 */
CHIP Xor {
    IN a, b;
    OUT out;

    PARTS:
    //// Replace this comment with your code.
}`,$=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Xor.tst

load Xor.hdl,
compare-to Xor.cmp,
output-list a b out;

set a 0,
set b 0,
eval,
output;

set a 0,
set b 1,
eval,
output;

set a 1,
set b 0,
eval,
output;

set a 1,
set b 1,
eval,
output;`,j=`| a | b |sel|out|
| 0 | 0 | 0 | 0 |
| 0 | 0 | 1 | 0 |
| 0 | 1 | 0 | 0 |
| 0 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |
| 1 | 1 | 1 | 1 |`,O=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Mux.hdl
/** 
 * Multiplexor:
 * if (sel = 0) out = a, else out = b
 */
CHIP Mux {
    IN a, b, sel;
    OUT out;

    PARTS:
    //// Replace this comment with your code.
}`,L=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Mux.tst

load Mux.hdl,
compare-to Mux.cmp,
output-list a b sel out;

set a 0,
set b 0,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set a 0,
set b 1,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set a 1,
set b 0,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set a 1,
set b 1,
set sel 0,
eval,
output;

set sel 1,
eval,
output;`,U=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/DMux.hdl
/**
 * Demultiplexor:
 * [a, b] = [in, 0] if sel = 0
 *          [0, in] if sel = 1
 */
CHIP DMux {
    IN in, sel;
    OUT a, b;

    PARTS:
    //// Replace this comment with your code.
}`,_=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/DMux.tst

load DMux.hdl,
compare-to DMux.cmp,
output-list in sel a b;

set in 0,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set in 1,
set sel 0,
eval,
output;

set sel 1,
eval,
output;`,H=`|in |sel| a | b |
| 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |`,K=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/01/Not16.hdl
/**
 * 16-bit Not gate:
 * for i = 0, ..., 15:
 * out[i] = Not(a[i])
 */
CHIP Not16 {
    IN in[16];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,X=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Not16.tst

load Not16.hdl,
compare-to Not16.cmp,
output-list in%B1.16.1 out%B1.16.1;

set in %B0000000000000000,
eval,
output;

set in %B1111111111111111,
eval,
output;

set in %B1010101010101010,
eval,
output;

set in %B0011110011000011,
eval,
output;

set in %B0001001000110100,
eval,
output;`,V=`|        in        |       out        |
| 0000000000000000 | 1111111111111111 |
| 1111111111111111 | 0000000000000000 |
| 1010101010101010 | 0101010101010101 |
| 0011110011000011 | 1100001100111100 |
| 0001001000110100 | 1110110111001011 |`,W=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/And16.hdl
/**
 * 16-bit And gate:
 * for i = 0, ..., 15:
 * out[i] = a[i] And b[i] 
 */
CHIP And16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,J=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/And16.tst

load And16.hdl,
compare-to And16.cmp,
output-list a%B1.16.1 b%B1.16.1 out%B1.16.1;

set a %B0000000000000000,
set b %B0000000000000000,
eval,
output;

set a %B0000000000000000,
set b %B1111111111111111,
eval,
output;

set a %B1111111111111111,
set b %B1111111111111111,
eval,
output;

set a %B1010101010101010,
set b %B0101010101010101,
eval,
output;

set a %B0011110011000011,
set b %B0000111111110000,
eval,
output;

set a %B0001001000110100,
set b %B1001100001110110,
eval,
output;`,G=`|        a         |        b         |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 0000000000000000 |
| 1111111111111111 | 1111111111111111 | 1111111111111111 |
| 1010101010101010 | 0101010101010101 | 0000000000000000 |
| 0011110011000011 | 0000111111110000 | 0000110011000000 |
| 0001001000110100 | 1001100001110110 | 0001000000110100 |`,q=`|        a         |        b         |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 1111111111111111 |
| 1111111111111111 | 1111111111111111 | 1111111111111111 |
| 1010101010101010 | 0101010101010101 | 1111111111111111 |
| 0011110011000011 | 0000111111110000 | 0011111111110011 |
| 0001001000110100 | 1001100001110110 | 1001101001110110 |`,Q=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Or16.hdl
/**
 * 16-bit Or gate:
 * for i = 0, ..., 15:
 * out[i] = a[i] Or b[i] 
 */
CHIP Or16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,Y=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Or16.tst

load Or16.hdl,
compare-to Or16.cmp,
output-list a%B1.16.1 b%B1.16.1 out%B1.16.1;

set a %B0000000000000000,
set b %B0000000000000000,
eval,
output;

set a %B0000000000000000,
set b %B1111111111111111,
eval,
output;

set a %B1111111111111111,
set b %B1111111111111111,
eval,
output;

set a %B1010101010101010,
set b %B0101010101010101,
eval,
output;

set a %B0011110011000011,
set b %B0000111111110000,
eval,
output;

set a %B0001001000110100,
set b %B1001100001110110,
eval,
output;`,Z=`|        a         |        b         |sel|       out        |
| 0000000000000000 | 0000000000000000 | 0 | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 1 | 0000000000000000 |
| 0000000000000000 | 0001001000110100 | 0 | 0000000000000000 |
| 0000000000000000 | 0001001000110100 | 1 | 0001001000110100 |
| 1001100001110110 | 0000000000000000 | 0 | 1001100001110110 |
| 1001100001110110 | 0000000000000000 | 1 | 0000000000000000 |
| 1010101010101010 | 0101010101010101 | 0 | 1010101010101010 |
| 1010101010101010 | 0101010101010101 | 1 | 0101010101010101 |`,t0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Mux16.hdl
/**
 * 16-bit multiplexor: 
 * for i = 0, ..., 15:
 * if (sel = 0) out[i] = a[i], else out[i] = b[i]
 */
CHIP Mux16 {
    IN a[16], b[16], sel;
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,e0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Mux16.tst

load Mux16.hdl,
compare-to Mux16.cmp,
output-list a%B1.16.1 b%B1.16.1 sel out%B1.16.1;

set a 0,
set b 0,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set a %B0000000000000000,
set b %B0001001000110100,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set a %B1001100001110110,
set b %B0000000000000000,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set a %B1010101010101010,
set b %B0101010101010101,
set sel 0,
eval,
output;

set sel 1,
eval,
output;`,s0=`|        a         |        b         |        c         |        d         | sel  |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  00  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  01  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  10  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  11  | 0000000000000000 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  00  | 0001001000110100 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  01  | 1001100001110110 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  10  | 1010101010101010 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 | 0101010101010101 |  11  | 0101010101010101 |`,o0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Mux4Way16.hdl
/**
 * 4-way 16-bit multiplexor:
 * out = a if sel = 00
 *       b if sel = 01
 *       c if sel = 10
 *       d if sel = 11
 */
CHIP Mux4Way16 {
    IN a[16], b[16], c[16], d[16], sel[2];
    OUT out[16];
    
    PARTS:
    //// Replace this comment with your code.
}`,u0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Mux4Way16.tst

load Mux4Way16.hdl,
compare-to Mux4Way16.cmp,
output-list a%B1.16.1 b%B1.16.1 c%B1.16.1 d%B1.16.1 sel%B2.2.2 out%B1.16.1;

set a 0,
set b 0,
set c 0,
set d 0,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set sel 2,
eval,
output;

set sel 3,
eval,
output;

set a %B0001001000110100,
set b %B1001100001110110,
set c %B1010101010101010,
set d %B0101010101010101,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set sel 2,
eval,
output;

set sel 3,
eval,
output;`,a0=`|        a         |        b         |        c         |        d         |        e         |        f         |        g         |        h         |  sel  |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  000  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  001  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  010  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  011  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  100  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  101  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  110  | 0000000000000000 |
| 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 | 0000000000000000 |  111  | 0000000000000000 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  000  | 0001001000110100 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  001  | 0010001101000101 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  010  | 0011010001010110 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  011  | 0100010101100111 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  100  | 0101011001111000 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  101  | 0110011110001001 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  110  | 0111100010011010 |
| 0001001000110100 | 0010001101000101 | 0011010001010110 | 0100010101100111 | 0101011001111000 | 0110011110001001 | 0111100010011010 | 1000100110101011 |  111  | 1000100110101011 |`,d0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Mux8Way16.hdl
/**
 * 8-way 16-bit multiplexor:
 * out = a if sel = 000
 *       b if sel = 001
 *       c if sel = 010
 *       d if sel = 011
 *       e if sel = 100
 *       f if sel = 101
 *       g if sel = 110
 *       h if sel = 111
 */
CHIP Mux8Way16 {
    IN a[16], b[16], c[16], d[16],
       e[16], f[16], g[16], h[16],
       sel[3];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,i0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Mux8Way16.tst

load Mux8Way16.hdl,
compare-to Mux8Way16.cmp,
output-list a%B1.16.1 b%B1.16.1 c%B1.16.1 d%B1.16.1 e%B1.16.1 f%B1.16.1 g%B1.16.1 h%B1.16.1 sel%B2.3.2 out%B1.16.1;

set a 0,
set b 0,
set c 0,
set d 0,
set e 0,
set f 0,
set g 0,
set h 0,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set sel 2,
eval,
output;

set sel 3,
eval,
output;

set sel 4,
eval,
output;

set sel 5,
eval,
output;

set sel 6,
eval,
output;

set sel 7,
eval,
output;

set a %B0001001000110100,
set b %B0010001101000101,
set c %B0011010001010110,
set d %B0100010101100111,
set e %B0101011001111000,
set f %B0110011110001001,
set g %B0111100010011010,
set h %B1000100110101011,
set sel 0,
eval,
output;

set sel 1,
eval,
output;

set sel 2,
eval,
output;

set sel 3,
eval,
output;

set sel 4,
eval,
output;

set sel 5,
eval,
output;

set sel 6,
eval,
output;

set sel 7,
eval,
output;`,p0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/DMux4Way.hdl
/**
 * 4-way demultiplexor:
 * [a, b, c, d] = [in, 0, 0, 0] if sel = 00
 *                [0, in, 0, 0] if sel = 01
 *                [0, 0, in, 0] if sel = 10
 *                [0, 0, 0, in] if sel = 11
 */
CHIP DMux4Way {
    IN in, sel[2];
    OUT a, b, c, d;

    PARTS:
    //// Replace this comment with your code.
}`,n0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/DMux4Way.tst

load DMux4Way.hdl,
compare-to DMux4Way.cmp,
output-list in sel%B2.2.2 a b c d;

set in 0,
set sel %B00,
eval,
output;

set sel %B01,
eval,
output;

set sel %B10,
eval,
output;

set sel %B11,
eval,
output;

set in 1,
set sel %B00,
eval,
output;

set sel %B01,
eval,
output;

set sel %B10,
eval,
output;

set sel %B11,
eval,
output;`,c0=`|in | sel  | a | b | c | d |
| 0 |  00  | 0 | 0 | 0 | 0 |
| 0 |  01  | 0 | 0 | 0 | 0 |
| 0 |  10  | 0 | 0 | 0 | 0 |
| 0 |  11  | 0 | 0 | 0 | 0 |
| 1 |  00  | 1 | 0 | 0 | 0 |
| 1 |  01  | 0 | 1 | 0 | 0 |
| 1 |  10  | 0 | 0 | 1 | 0 |
| 1 |  11  | 0 | 0 | 0 | 1 |`,r0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/DMux8Way.hdl
/**
 * 8-way demultiplexor:
 * [a, b, c, d, e, f, g, h] = [in, 0,  0,  0,  0,  0,  0,  0] if sel = 000
 *                            [0, in,  0,  0,  0,  0,  0,  0] if sel = 001
 *                            [0,  0, in,  0,  0,  0,  0,  0] if sel = 010
 *                            [0,  0,  0, in,  0,  0,  0,  0] if sel = 011
 *                            [0,  0,  0,  0, in,  0,  0,  0] if sel = 100
 *                            [0,  0,  0,  0,  0, in,  0,  0] if sel = 101
 *                            [0,  0,  0,  0,  0,  0, in,  0] if sel = 110
 *                            [0,  0,  0,  0,  0,  0,  0, in] if sel = 111
 */
CHIP DMux8Way {
    IN in, sel[3];
    OUT a, b, c, d, e, f, g, h;

    PARTS:
    //// Replace this comment with your code.
}`,l0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/DMux8Way.tst

load DMux8Way.hdl,
compare-to DMux8Way.cmp,
output-list in sel%B2.3.2 a b c d e f g h;

set in 0,
set sel %B000,
eval,
output;

set sel %B001,
eval,
output;

set sel %B010,
eval,
output;

set sel %B011,
eval,
output;

set sel %B100,
eval,
output;

set sel %B101,
eval,
output;

set sel %B110,
eval,
output;

set sel %B111,
eval,
output;

set in 1,
set sel %B000,
eval,
output;

set sel %B001,
eval,
output;

set sel %B010,
eval,
output;

set sel %B011,
eval,
output;

set sel %B100,
eval,
output;

set sel %B101,
eval,
output;

set sel %B110,
eval,
output;

set sel %B111,
eval,
output;`,k0=`|in |  sel  | a | b | c | d | e | f | g | h |
| 0 |  000  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  001  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  010  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  011  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  100  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  101  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  110  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 0 |  111  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 |  000  | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 |  001  | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 |  010  | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| 1 |  011  | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| 1 |  100  | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| 1 |  101  | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| 1 |  110  | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| 1 |  111  | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |`,h0=`|     in     |out|
|  00000000  | 0 |
|  11111111  | 1 |
|  00010000  | 1 |
|  00000001  | 1 |
|  00100110  | 1 |`,m0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Or8Way.hdl
/**
 * 8-way Or gate: 
 * out = in[0] Or in[1] Or ... Or in[7]
 */
CHIP Or8Way {
    IN in[8];
    OUT out;

    PARTS:
    //// Replace this comment with your code.
}`,B0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/1/Or8Way.tst

load Or8Way.hdl,
compare-to Or8Way.cmp,
output-list in%B2.8.2 out;

set in %B00000000,
eval,
output;

set in %B11111111,
eval,
output;

set in %B00010000,
eval,
output;

set in %B00000001,
eval,
output;

set in %B00100110,
eval,
output;`,i={"Nand.tst":b,"Nand.cmp":g,"Not.hdl":S,"Not.tst":C,"Not.cmp":w,"And.hdl":x,"And.tst":D,"And.cmp":P,"Or.hdl":F,"Or.tst":N,"Or.cmp":I,"Xor.hdl":z,"Xor.tst":$,"Xor.cmp":E,"Mux.hdl":O,"Mux.tst":L,"Mux.cmp":j,"DMux.hdl":U,"DMux.tst":_,"DMux.cmp":H,"Not16.hdl":K,"Not16.tst":X,"Not16.cmp":V,"And16.hdl":W,"And16.tst":J,"And16.cmp":G,"Or16.hdl":Q,"Or16.tst":Y,"Or16.cmp":q,"Mux16.hdl":t0,"Mux16.tst":e0,"Mux16.cmp":Z,"Mux4Way16.hdl":o0,"Mux4Way16.tst":u0,"Mux4Way16.cmp":s0,"Mux8Way16.hdl":d0,"Mux8Way16.tst":i0,"Mux8Way16.cmp":a0,"DMux4Way.hdl":p0,"DMux4Way.tst":n0,"DMux4Way.cmp":c0,"DMux8Way.hdl":r0,"DMux8Way.tst":l0,"DMux8Way.cmp":k0,"Or8Way.hdl":m0,"Or8Way.tst":B0,"Or8Way.cmp":h0},v0={Nand:T};async function M0(t){await t.pushd("/projects/01"),await d(t,i),await t.popd()}async function y0(t){await t.pushd("/projects/01"),await e(t,i,".tst"),await e(t,i,".cmp"),await t.popd()}const f0=Object.freeze(Object.defineProperty({__proto__:null,BUILTIN_CHIPS:v0,CHIPS:i,resetFiles:M0,resetTests:y0},Symbol.toStringTag,{value:"Module"})),R0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/HalfAdder.hdl
/**
 * Computes the sum of two bits.
 */
CHIP HalfAdder {
    IN a, b;    // 1-bit inputs
    OUT sum,    // Right bit of a + b 
        carry;  // Left bit of a + b

    PARTS:
    //// Replace this comment with your code.
}`,A0=`| a | b |sum|car|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |`,T0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/HalfAdder.tst

load HalfAdder.hdl,
compare-to HalfAdder.cmp,
output-list a b sum carry;

set a 0,
set b 0,
eval,
output;

set a 0,
set b 1,
eval,
output;

set a 1,
set b 0,
eval,
output;

set a 1,
set b 1,
eval,
output;`,b0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/FullAdder.hdl
/**
 * Computes the sum of three bits.
 */
CHIP FullAdder {
    IN a, b, c;  // 1-bit inputs
    OUT sum,     // Right bit of a + b + c
        carry;   // Left bit of a + b + c

    PARTS:
    //// Replace this comment with your code.
}`,g0=`| a | b | c |sum|carry|
| 0 | 0 | 0 | 0 |  0  |
| 0 | 0 | 1 | 1 |  0  |
| 0 | 1 | 0 | 1 |  0  |
| 0 | 1 | 1 | 0 |  1  |
| 1 | 0 | 0 | 1 |  0  |
| 1 | 0 | 1 | 0 |  1  |
| 1 | 1 | 0 | 0 |  1  |
| 1 | 1 | 1 | 1 |  1  |`,w0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/FullAdder.tst

load FullAdder.hdl,
compare-to FullAdder.cmp,
output-list a b c sum carry%B2.1.2;

set a 0,
set b 0,
set c 0,
eval,
output;

set c 1,
eval,
output;

set b 1,
set c 0,
eval,
output;

set c 1,
eval,
output;

set a 1,
set b 0,
set c 0,
eval,
output;

set c 1,
eval,
output;

set b 1,
set c 0,
eval,
output;

set c 1,
eval,
output;`,S0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/Add16.hdl
/**
 * 16-bit adder: Adds two 16-bit two's complement values.
 * The most significant carry bit is ignored.
 */
CHIP Add16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,C0=`|        a         |        b         |       out        |
| 0000000000000000 | 0000000000000000 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 1111111111111111 |
| 1111111111111111 | 1111111111111111 | 1111111111111110 |
| 1010101010101010 | 0101010101010101 | 1111111111111111 |
| 0011110011000011 | 0000111111110000 | 0100110010110011 |
| 0001001000110100 | 1001100001110110 | 1010101010101010 |`,x0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/Add16.tst

load Add16.hdl,
compare-to Add16.cmp,
output-list a%B1.16.1 b%B1.16.1 out%B1.16.1;

set a %B0000000000000000,
set b %B0000000000000000,
eval,
output;

set a %B0000000000000000,
set b %B1111111111111111,
eval,
output;

set a %B1111111111111111,
set b %B1111111111111111,
eval,
output;

set a %B1010101010101010,
set b %B0101010101010101,
eval,
output;

set a %B0011110011000011,
set b %B0000111111110000,
eval,
output;

set a %B0001001000110100,
set b %B1001100001110110,
eval,
output;`,D0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/Inc16.hdl
/**
 * 16-bit incrementer:
 * out = in + 1
 */
CHIP Inc16 {
    IN in[16];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,P0=`|        in        |       out        |
| 0000000000000000 | 0000000000000001 |
| 1111111111111111 | 0000000000000000 |
| 0000000000000101 | 0000000000000110 |
| 1111111111111011 | 1111111111111100 |
`,I0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/Inc16.tst

load Inc16.hdl,
compare-to Inc16.cmp,
output-list in%B1.16.1 out%B1.16.1;

set in %B0000000000000000,  // in = 0
eval,
output;

set in %B1111111111111111,  // in = -1
eval,
output;

set in %B0000000000000101,  // in = 5
eval,
output;

set in %B1111111111111011,  // in = -5
eval,
output;`,F0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/ALU.hdl
/**
 * ALU (Arithmetic Logic Unit):
 * Computes out = one of the following functions:
 *                0, 1, -1,
 *                x, y, !x, !y, -x, -y,
 *                x + 1, y + 1, x - 1, y - 1,
 *                x + y, x - y, y - x,
 *                x & y, x | y
 * on the 16-bit inputs x, y,
 * according to the input bits zx, nx, zy, ny, f, no.
 * In addition, computes the two output bits:
 * if (out == 0) zr = 1, else zr = 0
 * if (out < 0)  ng = 1, else ng = 0
 */
// Implementation: Manipulates the x and y inputs
// and operates on the resulting values, as follows:
// if (zx == 1) sets x = 0        // 16-bit constant
// if (nx == 1) sets x = !x       // bitwise not
// if (zy == 1) sets y = 0        // 16-bit constant
// if (ny == 1) sets y = !y       // bitwise not
// if (f == 1)  sets out = x + y  // integer 2's complement addition
// if (f == 0)  sets out = x & y  // bitwise and
// if (no == 1) sets out = !out   // bitwise not

CHIP ALU {
    IN  
        x[16], y[16],  // 16-bit inputs        
        zx, // zero the x input?
        nx, // negate the x input?
        zy, // zero the y input?
        ny, // negate the y input?
        f,  // compute (out = x + y) or (out = x & y)?
        no; // negate the out output?
    OUT 
        out[16], // 16-bit output
        zr,      // if (out == 0) equals 1, else 0
        ng;      // if (out < 0)  equals 1, else 0

    PARTS:
    //// Replace this comment with your code.
}`,N0=`|        x         |        y         |zx |nx |zy |ny | f |no |       out        |zr |ng |
| 0000000000000000 | 1111111111111111 | 1 | 0 | 1 | 0 | 1 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 1 | 0 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 0 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 0 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 0 | 1 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 0 | 1 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 1 | 1 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 1 | 1 | 1 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 1 | 0 | 1111111111111110 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 0 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 0 | 0 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 1 | 1 | 1 | 1111111111111111 | 0 | 1 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 0 | 0 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 0 | 1 | 0 | 1 | 1111111111111111 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 1 | 0 | 1 | 0 | 1 | 0 | 0000000000000000 | 1 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 1 | 0 | 1 | 0 | 1111111111111111 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 0 | 0 | 0000000000010001 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 0 | 0 | 0000000000000011 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 0 | 1 | 1111111111101110 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 0 | 1 | 1111111111111100 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 1 | 1 | 1111111111101111 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 1 | 1 | 1111111111111101 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 1 | 1 | 1 | 1 | 1 | 0000000000010010 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 1 | 1 | 1 | 0000000000000100 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 1 | 1 | 1 | 0 | 0000000000010000 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 1 | 1 | 0 | 0 | 1 | 0 | 0000000000000010 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 0 | 0 | 1 | 0 | 0000000000010100 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 1 | 0 | 0 | 1 | 1 | 0000000000001110 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 0 | 1 | 1 | 1 | 1111111111110010 | 0 | 1 |
| 0000000000010001 | 0000000000000011 | 0 | 0 | 0 | 0 | 0 | 0 | 0000000000000001 | 0 | 0 |
| 0000000000010001 | 0000000000000011 | 0 | 1 | 0 | 1 | 0 | 1 | 0000000000010011 | 0 | 0 |`,E0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/ALU.tst

load ALU.hdl,
compare-to ALU.cmp,
output-list x%B1.16.1 y%B1.16.1 zx nx zy ny f no out zr ng;

set x %B0000000000000000,  // x = 0
set y %B1111111111111111;  // y = -1

// Compute 0
set zx 1,
set nx 0,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute 1
set zx 1,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute -1
set zx 1,
set nx 1,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 0,
eval,
output;

// Compute y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

// Compute !x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 1,
eval,
output;

// Compute !y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 1,
eval,
output;

// Compute -x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute -y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

// Compute x + 1
set zx 0,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute y + 1
set zx 1,
set nx 1,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute x - 1
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 0,
eval,
output;

// Compute y - 1
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x + y
set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x - y
set zx 0,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

// Compute y - x
set zx 0,
set nx 0,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute x & y
set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

// Compute x | y
set zx 0,
set nx 1,
set zy 0,
set ny 1,
set f  0,
set no 1,
eval,
output;

set x %B000000000010001,  // x = 17
set y %B000000000000011;  // y =  3

// Compute 0
set zx 1,
set nx 0,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute 1
set zx 1,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute -1
set zx 1,
set nx 1,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 0,
eval,
output;

// Compute y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

// Compute !x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 1,
eval,
output;

// Compute !y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 1,
eval,
output;

// Compute -x
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute -y
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

// Compute x + 1
set zx 0,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute y + 1
set zx 1,
set nx 1,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute x - 1
set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 0,
eval,
output;

// Compute y - 1
set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x + y
set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

// Compute x - y
set zx 0,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

// Compute y - x
set zx 0,
set nx 0,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

// Compute x & y
set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

// Compute x | y
set zx 0,
set nx 1,
set zy 0,
set ny 1,
set f  0,
set no 1,
eval,
output;`,z0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/2/ALU-basic.tst

// Tests the basic version of the ALU chip.
// DOES NOT replace the final test provided by ALU.tst.
// Specifically: Tests the ALU logic that computes the 'out' output;
// The 'zr' and 'ng' output bits are ignored.

load ALU.hdl,
compare-to ALU-basic.cmp,
output-list x%B1.16.1 y%B1.16.1 zx nx zy ny f no out%B1.16.1;

set x %B0000000000000000,
set y %B1111111111111111,

set zx 1,
set nx 0,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

set zx 0,
set nx 1,
set zy 0,
set ny 1,
set f  0,
set no 1,
eval,
output;

set x %B101101110100000,
set y %B001111011010010,

set zx 1,
set nx 0,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 1,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  0,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  0,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 1,
set zy 1,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 1,
set ny 1,
set f  1,
set no 0,
eval,
output;

set zx 1,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  1,
set no 0,
eval,
output;

set zx 0,
set nx 1,
set zy 0,
set ny 0,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 1,
set f  1,
set no 1,
eval,
output;

set zx 0,
set nx 0,
set zy 0,
set ny 0,
set f  0,
set no 0,
eval,
output;

set zx 0,
set nx 1,
set zy 0,
set ny 1,
set f  0,
set no 1,
eval,
output;`,$0=`|        x         |        y         |zx |nx |zy |ny | f |no |       out        |
| 0000000000000000 | 1111111111111111 | 1 | 0 | 1 | 0 | 1 | 0 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 1 | 0 | 1 | 0 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 0 | 0 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 0 | 0 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 0 | 1 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 0 | 1 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 1 | 1 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 1 | 1 | 0000000000000001 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 1 | 1 | 1 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 1 | 1 | 1 | 0 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 1 | 1 | 0 | 0 | 1 | 0 | 1111111111111110 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 0 | 1 | 0 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 0 | 0 | 1 | 1 | 0000000000000001 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 1 | 1 | 1 | 1111111111111111 |
| 0000000000000000 | 1111111111111111 | 0 | 0 | 0 | 0 | 0 | 0 | 0000000000000000 |
| 0000000000000000 | 1111111111111111 | 0 | 1 | 0 | 1 | 0 | 1 | 1111111111111111 |
| 0101101110100000 | 0001111011010010 | 1 | 0 | 1 | 0 | 1 | 0 | 0000000000000000 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 1 | 1 | 1 | 1 | 0000000000000001 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 1 | 0 | 1 | 0 | 1111111111111111 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 1 | 1 | 0 | 0 | 0101101110100000 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 0 | 0 | 0 | 0 | 0001111011010010 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 1 | 1 | 0 | 1 | 1010010001011111 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 0 | 0 | 0 | 1 | 1110000100101101 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 1 | 1 | 1 | 1 | 1010010001100000 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 0 | 0 | 1 | 1 | 1110000100101110 |
| 0101101110100000 | 0001111011010010 | 0 | 1 | 1 | 1 | 1 | 1 | 0101101110100001 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 0 | 1 | 1 | 1 | 0001111011010011 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 1 | 1 | 1 | 0 | 0101101110011111 |
| 0101101110100000 | 0001111011010010 | 1 | 1 | 0 | 0 | 1 | 0 | 0001111011010001 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 0 | 0 | 1 | 0 | 0111101001110010 |
| 0101101110100000 | 0001111011010010 | 0 | 1 | 0 | 0 | 1 | 1 | 0011110011001110 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 0 | 1 | 1 | 1 | 1100001100110010 |
| 0101101110100000 | 0001111011010010 | 0 | 0 | 0 | 0 | 0 | 0 | 0001101010000000 |
| 0101101110100000 | 0001111011010010 | 0 | 1 | 0 | 1 | 0 | 1 | 0101111111110010 |`,p={"HalfAdder.hdl":R0,"HalfAdder.tst":T0,"HalfAdder.cmp":A0,"FullAdder.hdl":b0,"FullAdder.tst":w0,"FullAdder.cmp":g0,"Add16.hdl":S0,"Add16.tst":x0,"Add16.cmp":C0,"Inc16.hdl":D0,"Inc16.tst":I0,"Inc16.cmp":P0,"ALU.hdl":F0,"ALU.tst":E0,"ALU.cmp":N0,"ALU-basic.tst":z0,"ALU-basic.cmp":$0},j0={};async function O0(t){await t.pushd("/projects/02"),await d(t,p),await t.popd()}async function L0(t){await t.pushd("/projects/02"),await e(t,p,".tst"),await e(t,p,".cmp"),await t.popd()}const U0=Object.freeze(Object.defineProperty({__proto__:null,BUILTIN_CHIPS:j0,CHIPS:p,resetFiles:O0,resetTests:L0},Symbol.toStringTag,{value:"Module"})),_0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/03/DFF.hdl
/**
 * Data Flip-flop:
 * maintains its current value:
 * out(t+1) = in(t)
 */
CHIP DFF {
    IN  in;
    OUT out;

    PARTS:
    BUILTIN DFF;
    CLOCKED in;
}`,H0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/Bit.hdl
/**
 * 1-bit register:
 * If load is asserted, the register's value is set to in;
 * Otherwise, the register maintains its current value:
 * if (load(t)) out(t+1) = in(t), else out(t+1) = out(t)
 */
CHIP Bit {
    IN in, load;
    OUT out;

    PARTS:
    //// Replace this comment with your code.
}`,K0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/Bit.tst

load Bit.hdl,
compare-to Bit.cmp,
output-list time%S1.4.1 in load%B1.1.2 out;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 1,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 1,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 1,
tick,
output;

tock,
output;

set in 1,
set load 1,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 1,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;

set in 1,
set load 0,
tick,
output;

tock,
output;`,X0=`| time |in |load|out|
| 0+   | 0 | 0  | 0 |
| 1    | 0 | 0  | 0 |
| 1+   | 0 | 1  | 0 |
| 2    | 0 | 1  | 0 |
| 2+   | 1 | 0  | 0 |
| 3    | 1 | 0  | 0 |
| 3+   | 1 | 1  | 0 |
| 4    | 1 | 1  | 1 |
| 4+   | 0 | 0  | 1 |
| 5    | 0 | 0  | 1 |
| 5+   | 1 | 0  | 1 |
| 6    | 1 | 0  | 1 |
| 6+   | 0 | 1  | 1 |
| 7    | 0 | 1  | 0 |
| 7+   | 1 | 1  | 0 |
| 8    | 1 | 1  | 1 |
| 8+   | 0 | 0  | 1 |
| 9    | 0 | 0  | 1 |
| 9+   | 0 | 0  | 1 |
| 10   | 0 | 0  | 1 |
| 10+  | 0 | 0  | 1 |
| 11   | 0 | 0  | 1 |
| 11+  | 0 | 0  | 1 |
| 12   | 0 | 0  | 1 |
| 12+  | 0 | 0  | 1 |
| 13   | 0 | 0  | 1 |
| 13+  | 0 | 0  | 1 |
| 14   | 0 | 0  | 1 |
| 14+  | 0 | 0  | 1 |
| 15   | 0 | 0  | 1 |
| 15+  | 0 | 0  | 1 |
| 16   | 0 | 0  | 1 |
| 16+  | 0 | 0  | 1 |
| 17   | 0 | 0  | 1 |
| 17+  | 0 | 0  | 1 |
| 18   | 0 | 0  | 1 |
| 18+  | 0 | 0  | 1 |
| 19   | 0 | 0  | 1 |
| 19+  | 0 | 0  | 1 |
| 20   | 0 | 0  | 1 |
| 20+  | 0 | 0  | 1 |
| 21   | 0 | 0  | 1 |
| 21+  | 0 | 0  | 1 |
| 22   | 0 | 0  | 1 |
| 22+  | 0 | 0  | 1 |
| 23   | 0 | 0  | 1 |
| 23+  | 0 | 0  | 1 |
| 24   | 0 | 0  | 1 |
| 24+  | 0 | 0  | 1 |
| 25   | 0 | 0  | 1 |
| 25+  | 0 | 0  | 1 |
| 26   | 0 | 0  | 1 |
| 26+  | 0 | 0  | 1 |
| 27   | 0 | 0  | 1 |
| 27+  | 0 | 0  | 1 |
| 28   | 0 | 0  | 1 |
| 28+  | 0 | 0  | 1 |
| 29   | 0 | 0  | 1 |
| 29+  | 0 | 0  | 1 |
| 30   | 0 | 0  | 1 |
| 30+  | 0 | 0  | 1 |
| 31   | 0 | 0  | 1 |
| 31+  | 0 | 0  | 1 |
| 32   | 0 | 0  | 1 |
| 32+  | 0 | 0  | 1 |
| 33   | 0 | 0  | 1 |
| 33+  | 0 | 0  | 1 |
| 34   | 0 | 0  | 1 |
| 34+  | 0 | 0  | 1 |
| 35   | 0 | 0  | 1 |
| 35+  | 0 | 0  | 1 |
| 36   | 0 | 0  | 1 |
| 36+  | 0 | 0  | 1 |
| 37   | 0 | 0  | 1 |
| 37+  | 0 | 0  | 1 |
| 38   | 0 | 0  | 1 |
| 38+  | 0 | 0  | 1 |
| 39   | 0 | 0  | 1 |
| 39+  | 0 | 0  | 1 |
| 40   | 0 | 0  | 1 |
| 40+  | 0 | 0  | 1 |
| 41   | 0 | 0  | 1 |
| 41+  | 0 | 0  | 1 |
| 42   | 0 | 0  | 1 |
| 42+  | 0 | 0  | 1 |
| 43   | 0 | 0  | 1 |
| 43+  | 0 | 0  | 1 |
| 44   | 0 | 0  | 1 |
| 44+  | 0 | 0  | 1 |
| 45   | 0 | 0  | 1 |
| 45+  | 0 | 0  | 1 |
| 46   | 0 | 0  | 1 |
| 46+  | 0 | 0  | 1 |
| 47   | 0 | 0  | 1 |
| 47+  | 0 | 0  | 1 |
| 48   | 0 | 0  | 1 |
| 48+  | 0 | 0  | 1 |
| 49   | 0 | 0  | 1 |
| 49+  | 0 | 0  | 1 |
| 50   | 0 | 0  | 1 |
| 50+  | 0 | 0  | 1 |
| 51   | 0 | 0  | 1 |
| 51+  | 0 | 0  | 1 |
| 52   | 0 | 0  | 1 |
| 52+  | 0 | 0  | 1 |
| 53   | 0 | 0  | 1 |
| 53+  | 0 | 0  | 1 |
| 54   | 0 | 0  | 1 |
| 54+  | 0 | 0  | 1 |
| 55   | 0 | 0  | 1 |
| 55+  | 0 | 0  | 1 |
| 56   | 0 | 0  | 1 |
| 56+  | 0 | 0  | 1 |
| 57   | 0 | 0  | 1 |
| 57+  | 0 | 1  | 1 |
| 58   | 0 | 1  | 0 |
| 58+  | 1 | 0  | 0 |
| 59   | 1 | 0  | 0 |
| 59+  | 1 | 0  | 0 |
| 60   | 1 | 0  | 0 |
| 60+  | 1 | 0  | 0 |
| 61   | 1 | 0  | 0 |
| 61+  | 1 | 0  | 0 |
| 62   | 1 | 0  | 0 |
| 62+  | 1 | 0  | 0 |
| 63   | 1 | 0  | 0 |
| 63+  | 1 | 0  | 0 |
| 64   | 1 | 0  | 0 |
| 64+  | 1 | 0  | 0 |
| 65   | 1 | 0  | 0 |
| 65+  | 1 | 0  | 0 |
| 66   | 1 | 0  | 0 |
| 66+  | 1 | 0  | 0 |
| 67   | 1 | 0  | 0 |
| 67+  | 1 | 0  | 0 |
| 68   | 1 | 0  | 0 |
| 68+  | 1 | 0  | 0 |
| 69   | 1 | 0  | 0 |
| 69+  | 1 | 0  | 0 |
| 70   | 1 | 0  | 0 |
| 70+  | 1 | 0  | 0 |
| 71   | 1 | 0  | 0 |
| 71+  | 1 | 0  | 0 |
| 72   | 1 | 0  | 0 |
| 72+  | 1 | 0  | 0 |
| 73   | 1 | 0  | 0 |
| 73+  | 1 | 0  | 0 |
| 74   | 1 | 0  | 0 |
| 74+  | 1 | 0  | 0 |
| 75   | 1 | 0  | 0 |
| 75+  | 1 | 0  | 0 |
| 76   | 1 | 0  | 0 |
| 76+  | 1 | 0  | 0 |
| 77   | 1 | 0  | 0 |
| 77+  | 1 | 0  | 0 |
| 78   | 1 | 0  | 0 |
| 78+  | 1 | 0  | 0 |
| 79   | 1 | 0  | 0 |
| 79+  | 1 | 0  | 0 |
| 80   | 1 | 0  | 0 |
| 80+  | 1 | 0  | 0 |
| 81   | 1 | 0  | 0 |
| 81+  | 1 | 0  | 0 |
| 82   | 1 | 0  | 0 |
| 82+  | 1 | 0  | 0 |
| 83   | 1 | 0  | 0 |
| 83+  | 1 | 0  | 0 |
| 84   | 1 | 0  | 0 |
| 84+  | 1 | 0  | 0 |
| 85   | 1 | 0  | 0 |
| 85+  | 1 | 0  | 0 |
| 86   | 1 | 0  | 0 |
| 86+  | 1 | 0  | 0 |
| 87   | 1 | 0  | 0 |
| 87+  | 1 | 0  | 0 |
| 88   | 1 | 0  | 0 |
| 88+  | 1 | 0  | 0 |
| 89   | 1 | 0  | 0 |
| 89+  | 1 | 0  | 0 |
| 90   | 1 | 0  | 0 |
| 90+  | 1 | 0  | 0 |
| 91   | 1 | 0  | 0 |
| 91+  | 1 | 0  | 0 |
| 92   | 1 | 0  | 0 |
| 92+  | 1 | 0  | 0 |
| 93   | 1 | 0  | 0 |
| 93+  | 1 | 0  | 0 |
| 94   | 1 | 0  | 0 |
| 94+  | 1 | 0  | 0 |
| 95   | 1 | 0  | 0 |
| 95+  | 1 | 0  | 0 |
| 96   | 1 | 0  | 0 |
| 96+  | 1 | 0  | 0 |
| 97   | 1 | 0  | 0 |
| 97+  | 1 | 0  | 0 |
| 98   | 1 | 0  | 0 |
| 98+  | 1 | 0  | 0 |
| 99   | 1 | 0  | 0 |
| 99+  | 1 | 0  | 0 |
| 100  | 1 | 0  | 0 |
| 100+ | 1 | 0  | 0 |
| 101  | 1 | 0  | 0 |
| 101+ | 1 | 0  | 0 |
| 102  | 1 | 0  | 0 |
| 102+ | 1 | 0  | 0 |
| 103  | 1 | 0  | 0 |
| 103+ | 1 | 0  | 0 |
| 104  | 1 | 0  | 0 |
| 104+ | 1 | 0  | 0 |
| 105  | 1 | 0  | 0 |
| 105+ | 1 | 0  | 0 |
| 106  | 1 | 0  | 0 |
| 106+ | 1 | 0  | 0 |
| 107  | 1 | 0  | 0 |`,V0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/Register.hdl
/**
 * 16-bit register:
 * If load is asserted, the register's value is set to in;
 * Otherwise, the register maintains its current value:
 * if (load(t)) out(t+1) = int(t), else out(t+1) = out(t)
 */
CHIP Register {
    IN in[16], load;
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,W0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/Register.tst

load Register.hdl,
compare-to Register.cmp,
output-list time%S1.3.1 in%D1.6.1 load%B2.1.1 out%D1.6.1;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 1,
tick,
output;

tock,
output;

set in -32123,
set load 0,
tick,
output;

tock,
output;

set in 11111,
set load 0,
tick,
output;

tock,
output;

set in -32123,
set load 1,
tick,
output;

tock,
output;

set in -32123,
set load 1,
tick,
output;

tock,
output;

set in -32123,
set load 0,
tick,
output;

tock,
output;

set in 12345,
set load 1,
tick,
output;

tock,
output;

set in 0,
set load 0,
tick,
output;

tock,
output;

set in 0,
set load 1,
tick,
output;

tock,
output;

set in %B0000000000000001,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000000000000010,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000000000000100,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000000000001000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000000000010000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000000000100000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000000001000000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000000010000000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000000100000000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000001000000000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000010000000000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0000100000000000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0001000000000000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0010000000000000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0100000000000000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1000000000000000,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111111111111110,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111111111111101,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111111111111011,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111111111110111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111111111101111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111111111011111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111111110111111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111111101111111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111111011111111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111110111111111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111101111111111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1111011111111111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1110111111111111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1101111111111111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B1011111111111111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set in %B0111111111111111,
set load 0,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;`,J0=`|time |   in   |load|  out   |
| 0+  |      0 |  0 |      0 |
| 1   |      0 |  0 |      0 |
| 1+  |      0 |  1 |      0 |
| 2   |      0 |  1 |      0 |
| 2+  | -32123 |  0 |      0 |
| 3   | -32123 |  0 |      0 |
| 3+  |  11111 |  0 |      0 |
| 4   |  11111 |  0 |      0 |
| 4+  | -32123 |  1 |      0 |
| 5   | -32123 |  1 | -32123 |
| 5+  | -32123 |  1 | -32123 |
| 6   | -32123 |  1 | -32123 |
| 6+  | -32123 |  0 | -32123 |
| 7   | -32123 |  0 | -32123 |
| 7+  |  12345 |  1 | -32123 |
| 8   |  12345 |  1 |  12345 |
| 8+  |      0 |  0 |  12345 |
| 9   |      0 |  0 |  12345 |
| 9+  |      0 |  1 |  12345 |
| 10  |      0 |  1 |      0 |
| 10+ |      1 |  0 |      0 |
| 11  |      1 |  0 |      0 |
| 11+ |      1 |  1 |      0 |
| 12  |      1 |  1 |      1 |
| 12+ |      2 |  0 |      1 |
| 13  |      2 |  0 |      1 |
| 13+ |      2 |  1 |      1 |
| 14  |      2 |  1 |      2 |
| 14+ |      4 |  0 |      2 |
| 15  |      4 |  0 |      2 |
| 15+ |      4 |  1 |      2 |
| 16  |      4 |  1 |      4 |
| 16+ |      8 |  0 |      4 |
| 17  |      8 |  0 |      4 |
| 17+ |      8 |  1 |      4 |
| 18  |      8 |  1 |      8 |
| 18+ |     16 |  0 |      8 |
| 19  |     16 |  0 |      8 |
| 19+ |     16 |  1 |      8 |
| 20  |     16 |  1 |     16 |
| 20+ |     32 |  0 |     16 |
| 21  |     32 |  0 |     16 |
| 21+ |     32 |  1 |     16 |
| 22  |     32 |  1 |     32 |
| 22+ |     64 |  0 |     32 |
| 23  |     64 |  0 |     32 |
| 23+ |     64 |  1 |     32 |
| 24  |     64 |  1 |     64 |
| 24+ |    128 |  0 |     64 |
| 25  |    128 |  0 |     64 |
| 25+ |    128 |  1 |     64 |
| 26  |    128 |  1 |    128 |
| 26+ |    256 |  0 |    128 |
| 27  |    256 |  0 |    128 |
| 27+ |    256 |  1 |    128 |
| 28  |    256 |  1 |    256 |
| 28+ |    512 |  0 |    256 |
| 29  |    512 |  0 |    256 |
| 29+ |    512 |  1 |    256 |
| 30  |    512 |  1 |    512 |
| 30+ |   1024 |  0 |    512 |
| 31  |   1024 |  0 |    512 |
| 31+ |   1024 |  1 |    512 |
| 32  |   1024 |  1 |   1024 |
| 32+ |   2048 |  0 |   1024 |
| 33  |   2048 |  0 |   1024 |
| 33+ |   2048 |  1 |   1024 |
| 34  |   2048 |  1 |   2048 |
| 34+ |   4096 |  0 |   2048 |
| 35  |   4096 |  0 |   2048 |
| 35+ |   4096 |  1 |   2048 |
| 36  |   4096 |  1 |   4096 |
| 36+ |   8192 |  0 |   4096 |
| 37  |   8192 |  0 |   4096 |
| 37+ |   8192 |  1 |   4096 |
| 38  |   8192 |  1 |   8192 |
| 38+ |  16384 |  0 |   8192 |
| 39  |  16384 |  0 |   8192 |
| 39+ |  16384 |  1 |   8192 |
| 40  |  16384 |  1 |  16384 |
| 40+ | -32768 |  0 |  16384 |
| 41  | -32768 |  0 |  16384 |
| 41+ | -32768 |  1 |  16384 |
| 42  | -32768 |  1 | -32768 |
| 42+ |     -2 |  0 | -32768 |
| 43  |     -2 |  0 | -32768 |
| 43+ |     -2 |  1 | -32768 |
| 44  |     -2 |  1 |     -2 |
| 44+ |     -3 |  0 |     -2 |
| 45  |     -3 |  0 |     -2 |
| 45+ |     -3 |  1 |     -2 |
| 46  |     -3 |  1 |     -3 |
| 46+ |     -5 |  0 |     -3 |
| 47  |     -5 |  0 |     -3 |
| 47+ |     -5 |  1 |     -3 |
| 48  |     -5 |  1 |     -5 |
| 48+ |     -9 |  0 |     -5 |
| 49  |     -9 |  0 |     -5 |
| 49+ |     -9 |  1 |     -5 |
| 50  |     -9 |  1 |     -9 |
| 50+ |    -17 |  0 |     -9 |
| 51  |    -17 |  0 |     -9 |
| 51+ |    -17 |  1 |     -9 |
| 52  |    -17 |  1 |    -17 |
| 52+ |    -33 |  0 |    -17 |
| 53  |    -33 |  0 |    -17 |
| 53+ |    -33 |  1 |    -17 |
| 54  |    -33 |  1 |    -33 |
| 54+ |    -65 |  0 |    -33 |
| 55  |    -65 |  0 |    -33 |
| 55+ |    -65 |  1 |    -33 |
| 56  |    -65 |  1 |    -65 |
| 56+ |   -129 |  0 |    -65 |
| 57  |   -129 |  0 |    -65 |
| 57+ |   -129 |  1 |    -65 |
| 58  |   -129 |  1 |   -129 |
| 58+ |   -257 |  0 |   -129 |
| 59  |   -257 |  0 |   -129 |
| 59+ |   -257 |  1 |   -129 |
| 60  |   -257 |  1 |   -257 |
| 60+ |   -513 |  0 |   -257 |
| 61  |   -513 |  0 |   -257 |
| 61+ |   -513 |  1 |   -257 |
| 62  |   -513 |  1 |   -513 |
| 62+ |  -1025 |  0 |   -513 |
| 63  |  -1025 |  0 |   -513 |
| 63+ |  -1025 |  1 |   -513 |
| 64  |  -1025 |  1 |  -1025 |
| 64+ |  -2049 |  0 |  -1025 |
| 65  |  -2049 |  0 |  -1025 |
| 65+ |  -2049 |  1 |  -1025 |
| 66  |  -2049 |  1 |  -2049 |
| 66+ |  -4097 |  0 |  -2049 |
| 67  |  -4097 |  0 |  -2049 |
| 67+ |  -4097 |  1 |  -2049 |
| 68  |  -4097 |  1 |  -4097 |
| 68+ |  -8193 |  0 |  -4097 |
| 69  |  -8193 |  0 |  -4097 |
| 69+ |  -8193 |  1 |  -4097 |
| 70  |  -8193 |  1 |  -8193 |
| 70+ | -16385 |  0 |  -8193 |
| 71  | -16385 |  0 |  -8193 |
| 71+ | -16385 |  1 |  -8193 |
| 72  | -16385 |  1 | -16385 |
| 72+ |  32767 |  0 | -16385 |
| 73  |  32767 |  0 | -16385 |
| 73+ |  32767 |  1 | -16385 |
| 74  |  32767 |  1 |  32767 |`,G0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/PC.hdl
/**
 * A 16-bit counter.
 * if      reset(t): out(t+1) = 0
 * else if load(t):  out(t+1) = in(t)
 * else if inc(t):   out(t+1) = out(t) + 1
 * else              out(t+1) = out(t)
 */
CHIP PC {
    IN in[16], reset, load, inc;
    OUT out[16];
    
    PARTS:
    //// Replace this comment with your code.
}`,q0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/03/a/PC.tst

load PC.hdl,
compare-to PC.cmp,
output-list time%S1.3.1 in%D1.6.1 reset%B2.1.2 load%B2.1.2 inc%B2.1.2 out%D1.6.1;

set in 0,
set reset 0,
set load 0,
set inc 0,
tick,
output;

tock,
output;

set inc 1,
tick,
output;

tock,
output;

set in -32123,
tick,
output;

tock,
output;

set load 1,
tick,
output;

tock,
output;

set load 0,
tick,
output;

tock,
output;

tick,
output;

tock,
output;

set in 12345,
set load 1,
set inc 0,
tick,
output;

tock,
output;

set reset 1,
tick,
output;

tock,
output;

set reset 0,
set inc 1,
tick,
output;

tock,
output;

set reset 1,
tick,
output;

tock,
output;

set reset 0,
set load 0,
tick,
output;

tock,
output;

set reset 1,
tick,
output;

tock,
output;

set in 0,
set reset 0,
set load 1,
tick,
output;

tock,
output;

set load 0,
set inc 1,
tick,
output;

tock,
output;

set in 22222,
set reset 1,
set inc 0,
tick,
output;

tock,
output;`,Q0=`|time |   in   |reset|load | inc |  out   |
| 0+  |      0 |  0  |  0  |  0  |      0 |
| 1   |      0 |  0  |  0  |  0  |      0 |
| 1+  |      0 |  0  |  0  |  1  |      0 |
| 2   |      0 |  0  |  0  |  1  |      1 |
| 2+  | -32123 |  0  |  0  |  1  |      1 |
| 3   | -32123 |  0  |  0  |  1  |      2 |
| 3+  | -32123 |  0  |  1  |  1  |      2 |
| 4   | -32123 |  0  |  1  |  1  | -32123 |
| 4+  | -32123 |  0  |  0  |  1  | -32123 |
| 5   | -32123 |  0  |  0  |  1  | -32122 |
| 5+  | -32123 |  0  |  0  |  1  | -32122 |
| 6   | -32123 |  0  |  0  |  1  | -32121 |
| 6+  |  12345 |  0  |  1  |  0  | -32121 |
| 7   |  12345 |  0  |  1  |  0  |  12345 |
| 7+  |  12345 |  1  |  1  |  0  |  12345 |
| 8   |  12345 |  1  |  1  |  0  |      0 |
| 8+  |  12345 |  0  |  1  |  1  |      0 |
| 9   |  12345 |  0  |  1  |  1  |  12345 |
| 9+  |  12345 |  1  |  1  |  1  |  12345 |
| 10  |  12345 |  1  |  1  |  1  |      0 |
| 10+ |  12345 |  0  |  0  |  1  |      0 |
| 11  |  12345 |  0  |  0  |  1  |      1 |
| 11+ |  12345 |  1  |  0  |  1  |      1 |
| 12  |  12345 |  1  |  0  |  1  |      0 |
| 12+ |      0 |  0  |  1  |  1  |      0 |
| 13  |      0 |  0  |  1  |  1  |      0 |
| 13+ |      0 |  0  |  0  |  1  |      0 |
| 14  |      0 |  0  |  0  |  1  |      1 |
| 14+ |  22222 |  1  |  0  |  0  |      1 |
| 15  |  22222 |  1  |  0  |  0  |      0 |`,Y0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/RAM8.hdl
/**
 * Memory of eight 16-bit registers.
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 */
CHIP RAM8 {
    IN in[16], load, address[3];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,Z0=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/RAM8.tst

load RAM8.hdl,
compare-to RAM8.cmp,
output-list time%S1.3.1 in%D1.6.1 load%B2.1.1 address%D3.1.3 out%D1.6.1;

set in 0,
set load 0,
set address 0,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set in 11111,
set load 0,
tick,
output;
tock,
output;

set load 1,
set address 1,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;

set in 3333,
set address 3,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 1,
eval,
output;

set in 7777,
tick,
output;
tock,
output;

set load 1,
set address 7,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 3,
eval,
output;

set address 7,
eval,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set in %B0101010101010101,
set address 0,
tick,
output;
tock,
output;
set address 1,
tick,
output,
tock,
output;
set address 2,
tick,
output,
tock,
output;
set address 3,
tick,
output,
tock,
output;
set address 4,
tick,
output,
tock,
output;
set address 5,
tick,
output,
tock,
output;
set address 6,
tick,
output,
tock,
output;
set address 7,
tick,
output,
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 0,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 0,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 1,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 1,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 2,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 2,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 3,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 3,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 4,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 4,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 5,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 5,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 6,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 6,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address 7,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;

set load 1,
set address 7,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;
set address 1,
eval,
output;
set address 2,
eval,
output;
set address 3,
eval,
output;
set address 4,
eval,
output;
set address 5,
eval,
output;
set address 6,
eval,
output;
set address 7,
eval,
output;
`,t1=`|time |   in   |load|address|  out   |
| 0+  |      0 |  0 |   0   |      0 |
| 1   |      0 |  0 |   0   |      0 |
| 1+  |      0 |  1 |   0   |      0 |
| 2   |      0 |  1 |   0   |      0 |
| 2+  |  11111 |  0 |   0   |      0 |
| 3   |  11111 |  0 |   0   |      0 |
| 3+  |  11111 |  1 |   1   |      0 |
| 4   |  11111 |  1 |   1   |  11111 |
| 4+  |  11111 |  0 |   0   |      0 |
| 5   |  11111 |  0 |   0   |      0 |
| 5+  |   3333 |  0 |   3   |      0 |
| 6   |   3333 |  0 |   3   |      0 |
| 6+  |   3333 |  1 |   3   |      0 |
| 7   |   3333 |  1 |   3   |   3333 |
| 7+  |   3333 |  0 |   3   |   3333 |
| 8   |   3333 |  0 |   3   |   3333 |
| 8   |   3333 |  0 |   1   |  11111 |
| 8+  |   7777 |  0 |   1   |  11111 |
| 9   |   7777 |  0 |   1   |  11111 |
| 9+  |   7777 |  1 |   7   |      0 |
| 10  |   7777 |  1 |   7   |   7777 |
| 10+ |   7777 |  0 |   7   |   7777 |
| 11  |   7777 |  0 |   7   |   7777 |
| 11  |   7777 |  0 |   3   |   3333 |
| 11  |   7777 |  0 |   7   |   7777 |
| 11+ |   7777 |  0 |   0   |      0 |
| 12  |   7777 |  0 |   0   |      0 |
| 12  |   7777 |  0 |   1   |  11111 |
| 12  |   7777 |  0 |   2   |      0 |
| 12  |   7777 |  0 |   3   |   3333 |
| 12  |   7777 |  0 |   4   |      0 |
| 12  |   7777 |  0 |   5   |      0 |
| 12  |   7777 |  0 |   6   |      0 |
| 12  |   7777 |  0 |   7   |   7777 |
| 12+ |  21845 |  1 |   0   |      0 |
| 13  |  21845 |  1 |   0   |  21845 |
| 13+ |  21845 |  1 |   1   |  11111 |
| 14  |  21845 |  1 |   1   |  21845 |
| 14+ |  21845 |  1 |   2   |      0 |
| 15  |  21845 |  1 |   2   |  21845 |
| 15+ |  21845 |  1 |   3   |   3333 |
| 16  |  21845 |  1 |   3   |  21845 |
| 16+ |  21845 |  1 |   4   |      0 |
| 17  |  21845 |  1 |   4   |  21845 |
| 17+ |  21845 |  1 |   5   |      0 |
| 18  |  21845 |  1 |   5   |  21845 |
| 18+ |  21845 |  1 |   6   |      0 |
| 19  |  21845 |  1 |   6   |  21845 |
| 19+ |  21845 |  1 |   7   |   7777 |
| 20  |  21845 |  1 |   7   |  21845 |
| 20+ |  21845 |  0 |   0   |  21845 |
| 21  |  21845 |  0 |   0   |  21845 |
| 21  |  21845 |  0 |   1   |  21845 |
| 21  |  21845 |  0 |   2   |  21845 |
| 21  |  21845 |  0 |   3   |  21845 |
| 21  |  21845 |  0 |   4   |  21845 |
| 21  |  21845 |  0 |   5   |  21845 |
| 21  |  21845 |  0 |   6   |  21845 |
| 21  |  21845 |  0 |   7   |  21845 |
| 21+ | -21846 |  1 |   0   |  21845 |
| 22  | -21846 |  1 |   0   | -21846 |
| 22+ | -21846 |  0 |   0   | -21846 |
| 23  | -21846 |  0 |   0   | -21846 |
| 23  | -21846 |  0 |   1   |  21845 |
| 23  | -21846 |  0 |   2   |  21845 |
| 23  | -21846 |  0 |   3   |  21845 |
| 23  | -21846 |  0 |   4   |  21845 |
| 23  | -21846 |  0 |   5   |  21845 |
| 23  | -21846 |  0 |   6   |  21845 |
| 23  | -21846 |  0 |   7   |  21845 |
| 23+ |  21845 |  1 |   0   | -21846 |
| 24  |  21845 |  1 |   0   |  21845 |
| 24+ | -21846 |  1 |   1   |  21845 |
| 25  | -21846 |  1 |   1   | -21846 |
| 25+ | -21846 |  0 |   0   |  21845 |
| 26  | -21846 |  0 |   0   |  21845 |
| 26  | -21846 |  0 |   1   | -21846 |
| 26  | -21846 |  0 |   2   |  21845 |
| 26  | -21846 |  0 |   3   |  21845 |
| 26  | -21846 |  0 |   4   |  21845 |
| 26  | -21846 |  0 |   5   |  21845 |
| 26  | -21846 |  0 |   6   |  21845 |
| 26  | -21846 |  0 |   7   |  21845 |
| 26+ |  21845 |  1 |   1   | -21846 |
| 27  |  21845 |  1 |   1   |  21845 |
| 27+ | -21846 |  1 |   2   |  21845 |
| 28  | -21846 |  1 |   2   | -21846 |
| 28+ | -21846 |  0 |   0   |  21845 |
| 29  | -21846 |  0 |   0   |  21845 |
| 29  | -21846 |  0 |   1   |  21845 |
| 29  | -21846 |  0 |   2   | -21846 |
| 29  | -21846 |  0 |   3   |  21845 |
| 29  | -21846 |  0 |   4   |  21845 |
| 29  | -21846 |  0 |   5   |  21845 |
| 29  | -21846 |  0 |   6   |  21845 |
| 29  | -21846 |  0 |   7   |  21845 |
| 29+ |  21845 |  1 |   2   | -21846 |
| 30  |  21845 |  1 |   2   |  21845 |
| 30+ | -21846 |  1 |   3   |  21845 |
| 31  | -21846 |  1 |   3   | -21846 |
| 31+ | -21846 |  0 |   0   |  21845 |
| 32  | -21846 |  0 |   0   |  21845 |
| 32  | -21846 |  0 |   1   |  21845 |
| 32  | -21846 |  0 |   2   |  21845 |
| 32  | -21846 |  0 |   3   | -21846 |
| 32  | -21846 |  0 |   4   |  21845 |
| 32  | -21846 |  0 |   5   |  21845 |
| 32  | -21846 |  0 |   6   |  21845 |
| 32  | -21846 |  0 |   7   |  21845 |
| 32+ |  21845 |  1 |   3   | -21846 |
| 33  |  21845 |  1 |   3   |  21845 |
| 33+ | -21846 |  1 |   4   |  21845 |
| 34  | -21846 |  1 |   4   | -21846 |
| 34+ | -21846 |  0 |   0   |  21845 |
| 35  | -21846 |  0 |   0   |  21845 |
| 35  | -21846 |  0 |   1   |  21845 |
| 35  | -21846 |  0 |   2   |  21845 |
| 35  | -21846 |  0 |   3   |  21845 |
| 35  | -21846 |  0 |   4   | -21846 |
| 35  | -21846 |  0 |   5   |  21845 |
| 35  | -21846 |  0 |   6   |  21845 |
| 35  | -21846 |  0 |   7   |  21845 |
| 35+ |  21845 |  1 |   4   | -21846 |
| 36  |  21845 |  1 |   4   |  21845 |
| 36+ | -21846 |  1 |   5   |  21845 |
| 37  | -21846 |  1 |   5   | -21846 |
| 37+ | -21846 |  0 |   0   |  21845 |
| 38  | -21846 |  0 |   0   |  21845 |
| 38  | -21846 |  0 |   1   |  21845 |
| 38  | -21846 |  0 |   2   |  21845 |
| 38  | -21846 |  0 |   3   |  21845 |
| 38  | -21846 |  0 |   4   |  21845 |
| 38  | -21846 |  0 |   5   | -21846 |
| 38  | -21846 |  0 |   6   |  21845 |
| 38  | -21846 |  0 |   7   |  21845 |
| 38+ |  21845 |  1 |   5   | -21846 |
| 39  |  21845 |  1 |   5   |  21845 |
| 39+ | -21846 |  1 |   6   |  21845 |
| 40  | -21846 |  1 |   6   | -21846 |
| 40+ | -21846 |  0 |   0   |  21845 |
| 41  | -21846 |  0 |   0   |  21845 |
| 41  | -21846 |  0 |   1   |  21845 |
| 41  | -21846 |  0 |   2   |  21845 |
| 41  | -21846 |  0 |   3   |  21845 |
| 41  | -21846 |  0 |   4   |  21845 |
| 41  | -21846 |  0 |   5   |  21845 |
| 41  | -21846 |  0 |   6   | -21846 |
| 41  | -21846 |  0 |   7   |  21845 |
| 41+ |  21845 |  1 |   6   | -21846 |
| 42  |  21845 |  1 |   6   |  21845 |
| 42+ | -21846 |  1 |   7   |  21845 |
| 43  | -21846 |  1 |   7   | -21846 |
| 43+ | -21846 |  0 |   0   |  21845 |
| 44  | -21846 |  0 |   0   |  21845 |
| 44  | -21846 |  0 |   1   |  21845 |
| 44  | -21846 |  0 |   2   |  21845 |
| 44  | -21846 |  0 |   3   |  21845 |
| 44  | -21846 |  0 |   4   |  21845 |
| 44  | -21846 |  0 |   5   |  21845 |
| 44  | -21846 |  0 |   6   |  21845 |
| 44  | -21846 |  0 |   7   | -21846 |
| 44+ |  21845 |  1 |   7   | -21846 |
| 45  |  21845 |  1 |   7   |  21845 |
| 45+ |  21845 |  0 |   0   |  21845 |
| 46  |  21845 |  0 |   0   |  21845 |
| 46  |  21845 |  0 |   1   |  21845 |
| 46  |  21845 |  0 |   2   |  21845 |
| 46  |  21845 |  0 |   3   |  21845 |
| 46  |  21845 |  0 |   4   |  21845 |
| 46  |  21845 |  0 |   5   |  21845 |
| 46  |  21845 |  0 |   6   |  21845 |
| 46  |  21845 |  0 |   7   |  21845 |`,e1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/RAM64.hdl
/**
 * Memory of sixty four 16-bit registers.
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 */
CHIP RAM64 {
    IN in[16], load, address[6];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,s1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/a/RAM64.tst

load RAM64.hdl,
compare-to RAM64.cmp,
output-list time%S1.3.1 in%D1.6.1 load%B2.1.1 address%D2.3.2 out%D1.6.1;

set in 0,
set load 0,
set address 0,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set in 1313,
set load 0,
tick,
output;
tock,
output;

set load 1,
set address 13,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;

set in 4747,
set address 47,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 13,
eval,
output;

set in 6363,
tick,
output;
tock,
output;

set load 1,
set address 63,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 47,
eval,
output;

set address 63,
eval,
output;


set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
tick,
output,
tock,
output;
set address %B101010,
tick,
output,
tock,
output;
set address %B101011,
tick,
output,
tock,
output;
set address %B101100,
tick,
output,
tock,
output;
set address %B101101,
tick,
output,
tock,
output;
set address %B101110,
tick,
output,
tock,
output;
set address %B101111,
tick,
output,
tock,
output;

set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;

set load 1,
set address %B101000,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;

set load 1,
set address %B101000,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101001,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;

set load 1,
set address %B101001,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;

set load 1,
set address %B101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101011,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;

set load 1,
set address %B101011,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101100,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;

set load 1,
set address %B101100,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;

set load 1,
set address %B101101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101110,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;

set load 1,
set address %B101110,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101111,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;

set load 1,
set address %B101111,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B101000,
tick,
output;
tock,
output;
set address %B101001,
eval,
output;
set address %B101010,
eval,
output;
set address %B101011,
eval,
output;
set address %B101100,
eval,
output;
set address %B101101,
eval,
output;
set address %B101110,
eval,
output;
set address %B101111,
eval,
output;


set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
tick,
output,
tock,
output;
set address %B010101,
tick,
output,
tock,
output;
set address %B011101,
tick,
output,
tock,
output;
set address %B100101,
tick,
output,
tock,
output;
set address %B101101,
tick,
output,
tock,
output;
set address %B110101,
tick,
output,
tock,
output;
set address %B111101,
tick,
output,
tock,
output;

set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;

set load 1,
set address %B000101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;

set load 1,
set address %B000101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B001101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;

set load 1,
set address %B001101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;

set load 1,
set address %B010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B011101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;

set load 1,
set address %B011101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B100101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;

set load 1,
set address %B100101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;

set load 1,
set address %B101101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B110101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;

set load 1,
set address %B110101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B111101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;

set load 1,
set address %B111101,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B000101,
tick,
output;
tock,
output;
set address %B001101,
eval,
output;
set address %B010101,
eval,
output;
set address %B011101,
eval,
output;
set address %B100101,
eval,
output;
set address %B101101,
eval,
output;
set address %B110101,
eval,
output;
set address %B111101,
eval,
output;`,o1=`|time |   in   |load|address|  out   |
| 0+  |      0 |  0 |    0  |      0 |
| 1   |      0 |  0 |    0  |      0 |
| 1+  |      0 |  1 |    0  |      0 |
| 2   |      0 |  1 |    0  |      0 |
| 2+  |   1313 |  0 |    0  |      0 |
| 3   |   1313 |  0 |    0  |      0 |
| 3+  |   1313 |  1 |   13  |      0 |
| 4   |   1313 |  1 |   13  |   1313 |
| 4+  |   1313 |  0 |    0  |      0 |
| 5   |   1313 |  0 |    0  |      0 |
| 5+  |   4747 |  0 |   47  |      0 |
| 6   |   4747 |  0 |   47  |      0 |
| 6+  |   4747 |  1 |   47  |      0 |
| 7   |   4747 |  1 |   47  |   4747 |
| 7+  |   4747 |  0 |   47  |   4747 |
| 8   |   4747 |  0 |   47  |   4747 |
| 8   |   4747 |  0 |   13  |   1313 |
| 8+  |   6363 |  0 |   13  |   1313 |
| 9   |   6363 |  0 |   13  |   1313 |
| 9+  |   6363 |  1 |   63  |      0 |
| 10  |   6363 |  1 |   63  |   6363 |
| 10+ |   6363 |  0 |   63  |   6363 |
| 11  |   6363 |  0 |   63  |   6363 |
| 11  |   6363 |  0 |   47  |   4747 |
| 11  |   6363 |  0 |   63  |   6363 |
| 11+ |   6363 |  0 |   40  |      0 |
| 12  |   6363 |  0 |   40  |      0 |
| 12  |   6363 |  0 |   41  |      0 |
| 12  |   6363 |  0 |   42  |      0 |
| 12  |   6363 |  0 |   43  |      0 |
| 12  |   6363 |  0 |   44  |      0 |
| 12  |   6363 |  0 |   45  |      0 |
| 12  |   6363 |  0 |   46  |      0 |
| 12  |   6363 |  0 |   47  |   4747 |
| 12+ |  21845 |  1 |   40  |      0 |
| 13  |  21845 |  1 |   40  |  21845 |
| 13+ |  21845 |  1 |   41  |      0 |
| 14  |  21845 |  1 |   41  |  21845 |
| 14+ |  21845 |  1 |   42  |      0 |
| 15  |  21845 |  1 |   42  |  21845 |
| 15+ |  21845 |  1 |   43  |      0 |
| 16  |  21845 |  1 |   43  |  21845 |
| 16+ |  21845 |  1 |   44  |      0 |
| 17  |  21845 |  1 |   44  |  21845 |
| 17+ |  21845 |  1 |   45  |      0 |
| 18  |  21845 |  1 |   45  |  21845 |
| 18+ |  21845 |  1 |   46  |      0 |
| 19  |  21845 |  1 |   46  |  21845 |
| 19+ |  21845 |  1 |   47  |   4747 |
| 20  |  21845 |  1 |   47  |  21845 |
| 20+ |  21845 |  0 |   40  |  21845 |
| 21  |  21845 |  0 |   40  |  21845 |
| 21  |  21845 |  0 |   41  |  21845 |
| 21  |  21845 |  0 |   42  |  21845 |
| 21  |  21845 |  0 |   43  |  21845 |
| 21  |  21845 |  0 |   44  |  21845 |
| 21  |  21845 |  0 |   45  |  21845 |
| 21  |  21845 |  0 |   46  |  21845 |
| 21  |  21845 |  0 |   47  |  21845 |
| 21+ | -21846 |  1 |   40  |  21845 |
| 22  | -21846 |  1 |   40  | -21846 |
| 22+ | -21846 |  0 |   40  | -21846 |
| 23  | -21846 |  0 |   40  | -21846 |
| 23  | -21846 |  0 |   41  |  21845 |
| 23  | -21846 |  0 |   42  |  21845 |
| 23  | -21846 |  0 |   43  |  21845 |
| 23  | -21846 |  0 |   44  |  21845 |
| 23  | -21846 |  0 |   45  |  21845 |
| 23  | -21846 |  0 |   46  |  21845 |
| 23  | -21846 |  0 |   47  |  21845 |
| 23+ |  21845 |  1 |   40  | -21846 |
| 24  |  21845 |  1 |   40  |  21845 |
| 24+ | -21846 |  1 |   41  |  21845 |
| 25  | -21846 |  1 |   41  | -21846 |
| 25+ | -21846 |  0 |   40  |  21845 |
| 26  | -21846 |  0 |   40  |  21845 |
| 26  | -21846 |  0 |   41  | -21846 |
| 26  | -21846 |  0 |   42  |  21845 |
| 26  | -21846 |  0 |   43  |  21845 |
| 26  | -21846 |  0 |   44  |  21845 |
| 26  | -21846 |  0 |   45  |  21845 |
| 26  | -21846 |  0 |   46  |  21845 |
| 26  | -21846 |  0 |   47  |  21845 |
| 26+ |  21845 |  1 |   41  | -21846 |
| 27  |  21845 |  1 |   41  |  21845 |
| 27+ | -21846 |  1 |   42  |  21845 |
| 28  | -21846 |  1 |   42  | -21846 |
| 28+ | -21846 |  0 |   40  |  21845 |
| 29  | -21846 |  0 |   40  |  21845 |
| 29  | -21846 |  0 |   41  |  21845 |
| 29  | -21846 |  0 |   42  | -21846 |
| 29  | -21846 |  0 |   43  |  21845 |
| 29  | -21846 |  0 |   44  |  21845 |
| 29  | -21846 |  0 |   45  |  21845 |
| 29  | -21846 |  0 |   46  |  21845 |
| 29  | -21846 |  0 |   47  |  21845 |
| 29+ |  21845 |  1 |   42  | -21846 |
| 30  |  21845 |  1 |   42  |  21845 |
| 30+ | -21846 |  1 |   43  |  21845 |
| 31  | -21846 |  1 |   43  | -21846 |
| 31+ | -21846 |  0 |   40  |  21845 |
| 32  | -21846 |  0 |   40  |  21845 |
| 32  | -21846 |  0 |   41  |  21845 |
| 32  | -21846 |  0 |   42  |  21845 |
| 32  | -21846 |  0 |   43  | -21846 |
| 32  | -21846 |  0 |   44  |  21845 |
| 32  | -21846 |  0 |   45  |  21845 |
| 32  | -21846 |  0 |   46  |  21845 |
| 32  | -21846 |  0 |   47  |  21845 |
| 32+ |  21845 |  1 |   43  | -21846 |
| 33  |  21845 |  1 |   43  |  21845 |
| 33+ | -21846 |  1 |   44  |  21845 |
| 34  | -21846 |  1 |   44  | -21846 |
| 34+ | -21846 |  0 |   40  |  21845 |
| 35  | -21846 |  0 |   40  |  21845 |
| 35  | -21846 |  0 |   41  |  21845 |
| 35  | -21846 |  0 |   42  |  21845 |
| 35  | -21846 |  0 |   43  |  21845 |
| 35  | -21846 |  0 |   44  | -21846 |
| 35  | -21846 |  0 |   45  |  21845 |
| 35  | -21846 |  0 |   46  |  21845 |
| 35  | -21846 |  0 |   47  |  21845 |
| 35+ |  21845 |  1 |   44  | -21846 |
| 36  |  21845 |  1 |   44  |  21845 |
| 36+ | -21846 |  1 |   45  |  21845 |
| 37  | -21846 |  1 |   45  | -21846 |
| 37+ | -21846 |  0 |   40  |  21845 |
| 38  | -21846 |  0 |   40  |  21845 |
| 38  | -21846 |  0 |   41  |  21845 |
| 38  | -21846 |  0 |   42  |  21845 |
| 38  | -21846 |  0 |   43  |  21845 |
| 38  | -21846 |  0 |   44  |  21845 |
| 38  | -21846 |  0 |   45  | -21846 |
| 38  | -21846 |  0 |   46  |  21845 |
| 38  | -21846 |  0 |   47  |  21845 |
| 38+ |  21845 |  1 |   45  | -21846 |
| 39  |  21845 |  1 |   45  |  21845 |
| 39+ | -21846 |  1 |   46  |  21845 |
| 40  | -21846 |  1 |   46  | -21846 |
| 40+ | -21846 |  0 |   40  |  21845 |
| 41  | -21846 |  0 |   40  |  21845 |
| 41  | -21846 |  0 |   41  |  21845 |
| 41  | -21846 |  0 |   42  |  21845 |
| 41  | -21846 |  0 |   43  |  21845 |
| 41  | -21846 |  0 |   44  |  21845 |
| 41  | -21846 |  0 |   45  |  21845 |
| 41  | -21846 |  0 |   46  | -21846 |
| 41  | -21846 |  0 |   47  |  21845 |
| 41+ |  21845 |  1 |   46  | -21846 |
| 42  |  21845 |  1 |   46  |  21845 |
| 42+ | -21846 |  1 |   47  |  21845 |
| 43  | -21846 |  1 |   47  | -21846 |
| 43+ | -21846 |  0 |   40  |  21845 |
| 44  | -21846 |  0 |   40  |  21845 |
| 44  | -21846 |  0 |   41  |  21845 |
| 44  | -21846 |  0 |   42  |  21845 |
| 44  | -21846 |  0 |   43  |  21845 |
| 44  | -21846 |  0 |   44  |  21845 |
| 44  | -21846 |  0 |   45  |  21845 |
| 44  | -21846 |  0 |   46  |  21845 |
| 44  | -21846 |  0 |   47  | -21846 |
| 44+ |  21845 |  1 |   47  | -21846 |
| 45  |  21845 |  1 |   47  |  21845 |
| 45+ |  21845 |  0 |   40  |  21845 |
| 46  |  21845 |  0 |   40  |  21845 |
| 46  |  21845 |  0 |   41  |  21845 |
| 46  |  21845 |  0 |   42  |  21845 |
| 46  |  21845 |  0 |   43  |  21845 |
| 46  |  21845 |  0 |   44  |  21845 |
| 46  |  21845 |  0 |   45  |  21845 |
| 46  |  21845 |  0 |   46  |  21845 |
| 46  |  21845 |  0 |   47  |  21845 |
| 46+ |  21845 |  0 |    5  |      0 |
| 47  |  21845 |  0 |    5  |      0 |
| 47  |  21845 |  0 |   13  |   1313 |
| 47  |  21845 |  0 |   21  |      0 |
| 47  |  21845 |  0 |   29  |      0 |
| 47  |  21845 |  0 |   37  |      0 |
| 47  |  21845 |  0 |   45  |  21845 |
| 47  |  21845 |  0 |   53  |      0 |
| 47  |  21845 |  0 |   61  |      0 |
| 47+ |  21845 |  1 |    5  |      0 |
| 48  |  21845 |  1 |    5  |  21845 |
| 48+ |  21845 |  1 |   13  |   1313 |
| 49  |  21845 |  1 |   13  |  21845 |
| 49+ |  21845 |  1 |   21  |      0 |
| 50  |  21845 |  1 |   21  |  21845 |
| 50+ |  21845 |  1 |   29  |      0 |
| 51  |  21845 |  1 |   29  |  21845 |
| 51+ |  21845 |  1 |   37  |      0 |
| 52  |  21845 |  1 |   37  |  21845 |
| 52+ |  21845 |  1 |   45  |  21845 |
| 53  |  21845 |  1 |   45  |  21845 |
| 53+ |  21845 |  1 |   53  |      0 |
| 54  |  21845 |  1 |   53  |  21845 |
| 54+ |  21845 |  1 |   61  |      0 |
| 55  |  21845 |  1 |   61  |  21845 |
| 55+ |  21845 |  0 |    5  |  21845 |
| 56  |  21845 |  0 |    5  |  21845 |
| 56  |  21845 |  0 |   13  |  21845 |
| 56  |  21845 |  0 |   21  |  21845 |
| 56  |  21845 |  0 |   29  |  21845 |
| 56  |  21845 |  0 |   37  |  21845 |
| 56  |  21845 |  0 |   45  |  21845 |
| 56  |  21845 |  0 |   53  |  21845 |
| 56  |  21845 |  0 |   61  |  21845 |
| 56+ | -21846 |  1 |    5  |  21845 |
| 57  | -21846 |  1 |    5  | -21846 |
| 57+ | -21846 |  0 |    5  | -21846 |
| 58  | -21846 |  0 |    5  | -21846 |
| 58  | -21846 |  0 |   13  |  21845 |
| 58  | -21846 |  0 |   21  |  21845 |
| 58  | -21846 |  0 |   29  |  21845 |
| 58  | -21846 |  0 |   37  |  21845 |
| 58  | -21846 |  0 |   45  |  21845 |
| 58  | -21846 |  0 |   53  |  21845 |
| 58  | -21846 |  0 |   61  |  21845 |
| 58+ |  21845 |  1 |    5  | -21846 |
| 59  |  21845 |  1 |    5  |  21845 |
| 59+ | -21846 |  1 |   13  |  21845 |
| 60  | -21846 |  1 |   13  | -21846 |
| 60+ | -21846 |  0 |    5  |  21845 |
| 61  | -21846 |  0 |    5  |  21845 |
| 61  | -21846 |  0 |   13  | -21846 |
| 61  | -21846 |  0 |   21  |  21845 |
| 61  | -21846 |  0 |   29  |  21845 |
| 61  | -21846 |  0 |   37  |  21845 |
| 61  | -21846 |  0 |   45  |  21845 |
| 61  | -21846 |  0 |   53  |  21845 |
| 61  | -21846 |  0 |   61  |  21845 |
| 61+ |  21845 |  1 |   13  | -21846 |
| 62  |  21845 |  1 |   13  |  21845 |
| 62+ | -21846 |  1 |   21  |  21845 |
| 63  | -21846 |  1 |   21  | -21846 |
| 63+ | -21846 |  0 |    5  |  21845 |
| 64  | -21846 |  0 |    5  |  21845 |
| 64  | -21846 |  0 |   13  |  21845 |
| 64  | -21846 |  0 |   21  | -21846 |
| 64  | -21846 |  0 |   29  |  21845 |
| 64  | -21846 |  0 |   37  |  21845 |
| 64  | -21846 |  0 |   45  |  21845 |
| 64  | -21846 |  0 |   53  |  21845 |
| 64  | -21846 |  0 |   61  |  21845 |
| 64+ |  21845 |  1 |   21  | -21846 |
| 65  |  21845 |  1 |   21  |  21845 |
| 65+ | -21846 |  1 |   29  |  21845 |
| 66  | -21846 |  1 |   29  | -21846 |
| 66+ | -21846 |  0 |    5  |  21845 |
| 67  | -21846 |  0 |    5  |  21845 |
| 67  | -21846 |  0 |   13  |  21845 |
| 67  | -21846 |  0 |   21  |  21845 |
| 67  | -21846 |  0 |   29  | -21846 |
| 67  | -21846 |  0 |   37  |  21845 |
| 67  | -21846 |  0 |   45  |  21845 |
| 67  | -21846 |  0 |   53  |  21845 |
| 67  | -21846 |  0 |   61  |  21845 |
| 67+ |  21845 |  1 |   29  | -21846 |
| 68  |  21845 |  1 |   29  |  21845 |
| 68+ | -21846 |  1 |   37  |  21845 |
| 69  | -21846 |  1 |   37  | -21846 |
| 69+ | -21846 |  0 |    5  |  21845 |
| 70  | -21846 |  0 |    5  |  21845 |
| 70  | -21846 |  0 |   13  |  21845 |
| 70  | -21846 |  0 |   21  |  21845 |
| 70  | -21846 |  0 |   29  |  21845 |
| 70  | -21846 |  0 |   37  | -21846 |
| 70  | -21846 |  0 |   45  |  21845 |
| 70  | -21846 |  0 |   53  |  21845 |
| 70  | -21846 |  0 |   61  |  21845 |
| 70+ |  21845 |  1 |   37  | -21846 |
| 71  |  21845 |  1 |   37  |  21845 |
| 71+ | -21846 |  1 |   45  |  21845 |
| 72  | -21846 |  1 |   45  | -21846 |
| 72+ | -21846 |  0 |    5  |  21845 |
| 73  | -21846 |  0 |    5  |  21845 |
| 73  | -21846 |  0 |   13  |  21845 |
| 73  | -21846 |  0 |   21  |  21845 |
| 73  | -21846 |  0 |   29  |  21845 |
| 73  | -21846 |  0 |   37  |  21845 |
| 73  | -21846 |  0 |   45  | -21846 |
| 73  | -21846 |  0 |   53  |  21845 |
| 73  | -21846 |  0 |   61  |  21845 |
| 73+ |  21845 |  1 |   45  | -21846 |
| 74  |  21845 |  1 |   45  |  21845 |
| 74+ | -21846 |  1 |   53  |  21845 |
| 75  | -21846 |  1 |   53  | -21846 |
| 75+ | -21846 |  0 |    5  |  21845 |
| 76  | -21846 |  0 |    5  |  21845 |
| 76  | -21846 |  0 |   13  |  21845 |
| 76  | -21846 |  0 |   21  |  21845 |
| 76  | -21846 |  0 |   29  |  21845 |
| 76  | -21846 |  0 |   37  |  21845 |
| 76  | -21846 |  0 |   45  |  21845 |
| 76  | -21846 |  0 |   53  | -21846 |
| 76  | -21846 |  0 |   61  |  21845 |
| 76+ |  21845 |  1 |   53  | -21846 |
| 77  |  21845 |  1 |   53  |  21845 |
| 77+ | -21846 |  1 |   61  |  21845 |
| 78  | -21846 |  1 |   61  | -21846 |
| 78+ | -21846 |  0 |    5  |  21845 |
| 79  | -21846 |  0 |    5  |  21845 |
| 79  | -21846 |  0 |   13  |  21845 |
| 79  | -21846 |  0 |   21  |  21845 |
| 79  | -21846 |  0 |   29  |  21845 |
| 79  | -21846 |  0 |   37  |  21845 |
| 79  | -21846 |  0 |   45  |  21845 |
| 79  | -21846 |  0 |   53  |  21845 |
| 79  | -21846 |  0 |   61  | -21846 |
| 79+ |  21845 |  1 |   61  | -21846 |
| 80  |  21845 |  1 |   61  |  21845 |
| 80+ |  21845 |  0 |    5  |  21845 |
| 81  |  21845 |  0 |    5  |  21845 |
| 81  |  21845 |  0 |   13  |  21845 |
| 81  |  21845 |  0 |   21  |  21845 |
| 81  |  21845 |  0 |   29  |  21845 |
| 81  |  21845 |  0 |   37  |  21845 |
| 81  |  21845 |  0 |   45  |  21845 |
| 81  |  21845 |  0 |   53  |  21845 |
| 81  |  21845 |  0 |   61  |  21845 |`,u1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM512.hdl
/**
 * Memory of 512 16-bit registers.
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 */
CHIP RAM512 {
    IN in[16], load, address[9];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,a1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM512.tst

load RAM512.hdl,
compare-to RAM512.cmp,
output-list time%S1.3.1 in%D1.6.1 load%B2.1.1 address%D2.3.2 out%D1.6.1;

set in 0,
set load 0,
set address 0,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set in 13099,
set load 0,
tick,
output;
tock,
output;

set load 1,
set address 130,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;

set in 4729,
set address 472,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 130,
eval,
output;

set in 5119,
tick,
output;
tock,
output;

set load 1,
set address 511,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 472,
eval,
output;

set address 511,
eval,
output;


set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
tick,
output,
tock,
output;
set address %B010101010,
tick,
output,
tock,
output;
set address %B010101011,
tick,
output,
tock,
output;
set address %B010101100,
tick,
output,
tock,
output;
set address %B010101101,
tick,
output,
tock,
output;
set address %B010101110,
tick,
output,
tock,
output;
set address %B010101111,
tick,
output,
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101000,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101000,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101001,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101001,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101011,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101011,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101100,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101100,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101110,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101110,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101111,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;

set load 1,
set address %B010101111,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B010101000,
tick,
output;
tock,
output;
set address %B010101001,
eval,
output;
set address %B010101010,
eval,
output;
set address %B010101011,
eval,
output;
set address %B010101100,
eval,
output;
set address %B010101101,
eval,
output;
set address %B010101110,
eval,
output;
set address %B010101111,
eval,
output;


set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
tick,
output,
tock,
output;
set address %B010101010,
tick,
output,
tock,
output;
set address %B011101010,
tick,
output,
tock,
output;
set address %B100101010,
tick,
output,
tock,
output;
set address %B101101010,
tick,
output,
tock,
output;
set address %B110101010,
tick,
output,
tock,
output;
set address %B111101010,
tick,
output,
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B000101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B000101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B001101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B001101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B010101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B011101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B011101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B100101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B100101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B101101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B110101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B110101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B111101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;

set load 1,
set address %B111101010,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B000101010,
tick,
output;
tock,
output;
set address %B001101010,
eval,
output;
set address %B010101010,
eval,
output;
set address %B011101010,
eval,
output;
set address %B100101010,
eval,
output;
set address %B101101010,
eval,
output;
set address %B110101010,
eval,
output;
set address %B111101010,
eval,
output;
`,d1=`|time |   in   |load|address|  out   |
| 0+  |      0 |  0 |    0  |      0 |
| 1   |      0 |  0 |    0  |      0 |
| 1+  |      0 |  1 |    0  |      0 |
| 2   |      0 |  1 |    0  |      0 |
| 2+  |  13099 |  0 |    0  |      0 |
| 3   |  13099 |  0 |    0  |      0 |
| 3+  |  13099 |  1 |  130  |      0 |
| 4   |  13099 |  1 |  130  |  13099 |
| 4+  |  13099 |  0 |    0  |      0 |
| 5   |  13099 |  0 |    0  |      0 |
| 5+  |   4729 |  0 |  472  |      0 |
| 6   |   4729 |  0 |  472  |      0 |
| 6+  |   4729 |  1 |  472  |      0 |
| 7   |   4729 |  1 |  472  |   4729 |
| 7+  |   4729 |  0 |  472  |   4729 |
| 8   |   4729 |  0 |  472  |   4729 |
| 8   |   4729 |  0 |  130  |  13099 |
| 8+  |   5119 |  0 |  130  |  13099 |
| 9   |   5119 |  0 |  130  |  13099 |
| 9+  |   5119 |  1 |  511  |      0 |
| 10  |   5119 |  1 |  511  |   5119 |
| 10+ |   5119 |  0 |  511  |   5119 |
| 11  |   5119 |  0 |  511  |   5119 |
| 11  |   5119 |  0 |  472  |   4729 |
| 11  |   5119 |  0 |  511  |   5119 |
| 11+ |   5119 |  0 |  168  |      0 |
| 12  |   5119 |  0 |  168  |      0 |
| 12  |   5119 |  0 |  169  |      0 |
| 12  |   5119 |  0 |  170  |      0 |
| 12  |   5119 |  0 |  171  |      0 |
| 12  |   5119 |  0 |  172  |      0 |
| 12  |   5119 |  0 |  173  |      0 |
| 12  |   5119 |  0 |  174  |      0 |
| 12  |   5119 |  0 |  175  |      0 |
| 12+ |  21845 |  1 |  168  |      0 |
| 13  |  21845 |  1 |  168  |  21845 |
| 13+ |  21845 |  1 |  169  |      0 |
| 14  |  21845 |  1 |  169  |  21845 |
| 14+ |  21845 |  1 |  170  |      0 |
| 15  |  21845 |  1 |  170  |  21845 |
| 15+ |  21845 |  1 |  171  |      0 |
| 16  |  21845 |  1 |  171  |  21845 |
| 16+ |  21845 |  1 |  172  |      0 |
| 17  |  21845 |  1 |  172  |  21845 |
| 17+ |  21845 |  1 |  173  |      0 |
| 18  |  21845 |  1 |  173  |  21845 |
| 18+ |  21845 |  1 |  174  |      0 |
| 19  |  21845 |  1 |  174  |  21845 |
| 19+ |  21845 |  1 |  175  |      0 |
| 20  |  21845 |  1 |  175  |  21845 |
| 20+ |  21845 |  0 |  168  |  21845 |
| 21  |  21845 |  0 |  168  |  21845 |
| 21  |  21845 |  0 |  169  |  21845 |
| 21  |  21845 |  0 |  170  |  21845 |
| 21  |  21845 |  0 |  171  |  21845 |
| 21  |  21845 |  0 |  172  |  21845 |
| 21  |  21845 |  0 |  173  |  21845 |
| 21  |  21845 |  0 |  174  |  21845 |
| 21  |  21845 |  0 |  175  |  21845 |
| 21+ | -21846 |  1 |  168  |  21845 |
| 22  | -21846 |  1 |  168  | -21846 |
| 22+ | -21846 |  0 |  168  | -21846 |
| 23  | -21846 |  0 |  168  | -21846 |
| 23  | -21846 |  0 |  169  |  21845 |
| 23  | -21846 |  0 |  170  |  21845 |
| 23  | -21846 |  0 |  171  |  21845 |
| 23  | -21846 |  0 |  172  |  21845 |
| 23  | -21846 |  0 |  173  |  21845 |
| 23  | -21846 |  0 |  174  |  21845 |
| 23  | -21846 |  0 |  175  |  21845 |
| 23+ |  21845 |  1 |  168  | -21846 |
| 24  |  21845 |  1 |  168  |  21845 |
| 24+ | -21846 |  1 |  169  |  21845 |
| 25  | -21846 |  1 |  169  | -21846 |
| 25+ | -21846 |  0 |  168  |  21845 |
| 26  | -21846 |  0 |  168  |  21845 |
| 26  | -21846 |  0 |  169  | -21846 |
| 26  | -21846 |  0 |  170  |  21845 |
| 26  | -21846 |  0 |  171  |  21845 |
| 26  | -21846 |  0 |  172  |  21845 |
| 26  | -21846 |  0 |  173  |  21845 |
| 26  | -21846 |  0 |  174  |  21845 |
| 26  | -21846 |  0 |  175  |  21845 |
| 26+ |  21845 |  1 |  169  | -21846 |
| 27  |  21845 |  1 |  169  |  21845 |
| 27+ | -21846 |  1 |  170  |  21845 |
| 28  | -21846 |  1 |  170  | -21846 |
| 28+ | -21846 |  0 |  168  |  21845 |
| 29  | -21846 |  0 |  168  |  21845 |
| 29  | -21846 |  0 |  169  |  21845 |
| 29  | -21846 |  0 |  170  | -21846 |
| 29  | -21846 |  0 |  171  |  21845 |
| 29  | -21846 |  0 |  172  |  21845 |
| 29  | -21846 |  0 |  173  |  21845 |
| 29  | -21846 |  0 |  174  |  21845 |
| 29  | -21846 |  0 |  175  |  21845 |
| 29+ |  21845 |  1 |  170  | -21846 |
| 30  |  21845 |  1 |  170  |  21845 |
| 30+ | -21846 |  1 |  171  |  21845 |
| 31  | -21846 |  1 |  171  | -21846 |
| 31+ | -21846 |  0 |  168  |  21845 |
| 32  | -21846 |  0 |  168  |  21845 |
| 32  | -21846 |  0 |  169  |  21845 |
| 32  | -21846 |  0 |  170  |  21845 |
| 32  | -21846 |  0 |  171  | -21846 |
| 32  | -21846 |  0 |  172  |  21845 |
| 32  | -21846 |  0 |  173  |  21845 |
| 32  | -21846 |  0 |  174  |  21845 |
| 32  | -21846 |  0 |  175  |  21845 |
| 32+ |  21845 |  1 |  171  | -21846 |
| 33  |  21845 |  1 |  171  |  21845 |
| 33+ | -21846 |  1 |  172  |  21845 |
| 34  | -21846 |  1 |  172  | -21846 |
| 34+ | -21846 |  0 |  168  |  21845 |
| 35  | -21846 |  0 |  168  |  21845 |
| 35  | -21846 |  0 |  169  |  21845 |
| 35  | -21846 |  0 |  170  |  21845 |
| 35  | -21846 |  0 |  171  |  21845 |
| 35  | -21846 |  0 |  172  | -21846 |
| 35  | -21846 |  0 |  173  |  21845 |
| 35  | -21846 |  0 |  174  |  21845 |
| 35  | -21846 |  0 |  175  |  21845 |
| 35+ |  21845 |  1 |  172  | -21846 |
| 36  |  21845 |  1 |  172  |  21845 |
| 36+ | -21846 |  1 |  173  |  21845 |
| 37  | -21846 |  1 |  173  | -21846 |
| 37+ | -21846 |  0 |  168  |  21845 |
| 38  | -21846 |  0 |  168  |  21845 |
| 38  | -21846 |  0 |  169  |  21845 |
| 38  | -21846 |  0 |  170  |  21845 |
| 38  | -21846 |  0 |  171  |  21845 |
| 38  | -21846 |  0 |  172  |  21845 |
| 38  | -21846 |  0 |  173  | -21846 |
| 38  | -21846 |  0 |  174  |  21845 |
| 38  | -21846 |  0 |  175  |  21845 |
| 38+ |  21845 |  1 |  173  | -21846 |
| 39  |  21845 |  1 |  173  |  21845 |
| 39+ | -21846 |  1 |  174  |  21845 |
| 40  | -21846 |  1 |  174  | -21846 |
| 40+ | -21846 |  0 |  168  |  21845 |
| 41  | -21846 |  0 |  168  |  21845 |
| 41  | -21846 |  0 |  169  |  21845 |
| 41  | -21846 |  0 |  170  |  21845 |
| 41  | -21846 |  0 |  171  |  21845 |
| 41  | -21846 |  0 |  172  |  21845 |
| 41  | -21846 |  0 |  173  |  21845 |
| 41  | -21846 |  0 |  174  | -21846 |
| 41  | -21846 |  0 |  175  |  21845 |
| 41+ |  21845 |  1 |  174  | -21846 |
| 42  |  21845 |  1 |  174  |  21845 |
| 42+ | -21846 |  1 |  175  |  21845 |
| 43  | -21846 |  1 |  175  | -21846 |
| 43+ | -21846 |  0 |  168  |  21845 |
| 44  | -21846 |  0 |  168  |  21845 |
| 44  | -21846 |  0 |  169  |  21845 |
| 44  | -21846 |  0 |  170  |  21845 |
| 44  | -21846 |  0 |  171  |  21845 |
| 44  | -21846 |  0 |  172  |  21845 |
| 44  | -21846 |  0 |  173  |  21845 |
| 44  | -21846 |  0 |  174  |  21845 |
| 44  | -21846 |  0 |  175  | -21846 |
| 44+ |  21845 |  1 |  175  | -21846 |
| 45  |  21845 |  1 |  175  |  21845 |
| 45+ |  21845 |  0 |  168  |  21845 |
| 46  |  21845 |  0 |  168  |  21845 |
| 46  |  21845 |  0 |  169  |  21845 |
| 46  |  21845 |  0 |  170  |  21845 |
| 46  |  21845 |  0 |  171  |  21845 |
| 46  |  21845 |  0 |  172  |  21845 |
| 46  |  21845 |  0 |  173  |  21845 |
| 46  |  21845 |  0 |  174  |  21845 |
| 46  |  21845 |  0 |  175  |  21845 |
| 46+ |  21845 |  0 |   42  |      0 |
| 47  |  21845 |  0 |   42  |      0 |
| 47  |  21845 |  0 |  106  |      0 |
| 47  |  21845 |  0 |  170  |  21845 |
| 47  |  21845 |  0 |  234  |      0 |
| 47  |  21845 |  0 |  298  |      0 |
| 47  |  21845 |  0 |  362  |      0 |
| 47  |  21845 |  0 |  426  |      0 |
| 47  |  21845 |  0 |  490  |      0 |
| 47+ |  21845 |  1 |   42  |      0 |
| 48  |  21845 |  1 |   42  |  21845 |
| 48+ |  21845 |  1 |  106  |      0 |
| 49  |  21845 |  1 |  106  |  21845 |
| 49+ |  21845 |  1 |  170  |  21845 |
| 50  |  21845 |  1 |  170  |  21845 |
| 50+ |  21845 |  1 |  234  |      0 |
| 51  |  21845 |  1 |  234  |  21845 |
| 51+ |  21845 |  1 |  298  |      0 |
| 52  |  21845 |  1 |  298  |  21845 |
| 52+ |  21845 |  1 |  362  |      0 |
| 53  |  21845 |  1 |  362  |  21845 |
| 53+ |  21845 |  1 |  426  |      0 |
| 54  |  21845 |  1 |  426  |  21845 |
| 54+ |  21845 |  1 |  490  |      0 |
| 55  |  21845 |  1 |  490  |  21845 |
| 55+ |  21845 |  0 |   42  |  21845 |
| 56  |  21845 |  0 |   42  |  21845 |
| 56  |  21845 |  0 |  106  |  21845 |
| 56  |  21845 |  0 |  170  |  21845 |
| 56  |  21845 |  0 |  234  |  21845 |
| 56  |  21845 |  0 |  298  |  21845 |
| 56  |  21845 |  0 |  362  |  21845 |
| 56  |  21845 |  0 |  426  |  21845 |
| 56  |  21845 |  0 |  490  |  21845 |
| 56+ | -21846 |  1 |   42  |  21845 |
| 57  | -21846 |  1 |   42  | -21846 |
| 57+ | -21846 |  0 |   42  | -21846 |
| 58  | -21846 |  0 |   42  | -21846 |
| 58  | -21846 |  0 |  106  |  21845 |
| 58  | -21846 |  0 |  170  |  21845 |
| 58  | -21846 |  0 |  234  |  21845 |
| 58  | -21846 |  0 |  298  |  21845 |
| 58  | -21846 |  0 |  362  |  21845 |
| 58  | -21846 |  0 |  426  |  21845 |
| 58  | -21846 |  0 |  490  |  21845 |
| 58+ |  21845 |  1 |   42  | -21846 |
| 59  |  21845 |  1 |   42  |  21845 |
| 59+ | -21846 |  1 |  106  |  21845 |
| 60  | -21846 |  1 |  106  | -21846 |
| 60+ | -21846 |  0 |   42  |  21845 |
| 61  | -21846 |  0 |   42  |  21845 |
| 61  | -21846 |  0 |  106  | -21846 |
| 61  | -21846 |  0 |  170  |  21845 |
| 61  | -21846 |  0 |  234  |  21845 |
| 61  | -21846 |  0 |  298  |  21845 |
| 61  | -21846 |  0 |  362  |  21845 |
| 61  | -21846 |  0 |  426  |  21845 |
| 61  | -21846 |  0 |  490  |  21845 |
| 61+ |  21845 |  1 |  106  | -21846 |
| 62  |  21845 |  1 |  106  |  21845 |
| 62+ | -21846 |  1 |  170  |  21845 |
| 63  | -21846 |  1 |  170  | -21846 |
| 63+ | -21846 |  0 |   42  |  21845 |
| 64  | -21846 |  0 |   42  |  21845 |
| 64  | -21846 |  0 |  106  |  21845 |
| 64  | -21846 |  0 |  170  | -21846 |
| 64  | -21846 |  0 |  234  |  21845 |
| 64  | -21846 |  0 |  298  |  21845 |
| 64  | -21846 |  0 |  362  |  21845 |
| 64  | -21846 |  0 |  426  |  21845 |
| 64  | -21846 |  0 |  490  |  21845 |
| 64+ |  21845 |  1 |  170  | -21846 |
| 65  |  21845 |  1 |  170  |  21845 |
| 65+ | -21846 |  1 |  234  |  21845 |
| 66  | -21846 |  1 |  234  | -21846 |
| 66+ | -21846 |  0 |   42  |  21845 |
| 67  | -21846 |  0 |   42  |  21845 |
| 67  | -21846 |  0 |  106  |  21845 |
| 67  | -21846 |  0 |  170  |  21845 |
| 67  | -21846 |  0 |  234  | -21846 |
| 67  | -21846 |  0 |  298  |  21845 |
| 67  | -21846 |  0 |  362  |  21845 |
| 67  | -21846 |  0 |  426  |  21845 |
| 67  | -21846 |  0 |  490  |  21845 |
| 67+ |  21845 |  1 |  234  | -21846 |
| 68  |  21845 |  1 |  234  |  21845 |
| 68+ | -21846 |  1 |  298  |  21845 |
| 69  | -21846 |  1 |  298  | -21846 |
| 69+ | -21846 |  0 |   42  |  21845 |
| 70  | -21846 |  0 |   42  |  21845 |
| 70  | -21846 |  0 |  106  |  21845 |
| 70  | -21846 |  0 |  170  |  21845 |
| 70  | -21846 |  0 |  234  |  21845 |
| 70  | -21846 |  0 |  298  | -21846 |
| 70  | -21846 |  0 |  362  |  21845 |
| 70  | -21846 |  0 |  426  |  21845 |
| 70  | -21846 |  0 |  490  |  21845 |
| 70+ |  21845 |  1 |  298  | -21846 |
| 71  |  21845 |  1 |  298  |  21845 |
| 71+ | -21846 |  1 |  362  |  21845 |
| 72  | -21846 |  1 |  362  | -21846 |
| 72+ | -21846 |  0 |   42  |  21845 |
| 73  | -21846 |  0 |   42  |  21845 |
| 73  | -21846 |  0 |  106  |  21845 |
| 73  | -21846 |  0 |  170  |  21845 |
| 73  | -21846 |  0 |  234  |  21845 |
| 73  | -21846 |  0 |  298  |  21845 |
| 73  | -21846 |  0 |  362  | -21846 |
| 73  | -21846 |  0 |  426  |  21845 |
| 73  | -21846 |  0 |  490  |  21845 |
| 73+ |  21845 |  1 |  362  | -21846 |
| 74  |  21845 |  1 |  362  |  21845 |
| 74+ | -21846 |  1 |  426  |  21845 |
| 75  | -21846 |  1 |  426  | -21846 |
| 75+ | -21846 |  0 |   42  |  21845 |
| 76  | -21846 |  0 |   42  |  21845 |
| 76  | -21846 |  0 |  106  |  21845 |
| 76  | -21846 |  0 |  170  |  21845 |
| 76  | -21846 |  0 |  234  |  21845 |
| 76  | -21846 |  0 |  298  |  21845 |
| 76  | -21846 |  0 |  362  |  21845 |
| 76  | -21846 |  0 |  426  | -21846 |
| 76  | -21846 |  0 |  490  |  21845 |
| 76+ |  21845 |  1 |  426  | -21846 |
| 77  |  21845 |  1 |  426  |  21845 |
| 77+ | -21846 |  1 |  490  |  21845 |
| 78  | -21846 |  1 |  490  | -21846 |
| 78+ | -21846 |  0 |   42  |  21845 |
| 79  | -21846 |  0 |   42  |  21845 |
| 79  | -21846 |  0 |  106  |  21845 |
| 79  | -21846 |  0 |  170  |  21845 |
| 79  | -21846 |  0 |  234  |  21845 |
| 79  | -21846 |  0 |  298  |  21845 |
| 79  | -21846 |  0 |  362  |  21845 |
| 79  | -21846 |  0 |  426  |  21845 |
| 79  | -21846 |  0 |  490  | -21846 |
| 79+ |  21845 |  1 |  490  | -21846 |
| 80  |  21845 |  1 |  490  |  21845 |
| 80+ |  21845 |  0 |   42  |  21845 |
| 81  |  21845 |  0 |   42  |  21845 |
| 81  |  21845 |  0 |  106  |  21845 |
| 81  |  21845 |  0 |  170  |  21845 |
| 81  |  21845 |  0 |  234  |  21845 |
| 81  |  21845 |  0 |  298  |  21845 |
| 81  |  21845 |  0 |  362  |  21845 |
| 81  |  21845 |  0 |  426  |  21845 |
| 81  |  21845 |  0 |  490  |  21845 |`,i1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM4K.hdl
/**
 * Memory of 4K 16-bit registers.
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 */
CHIP RAM4K {
    IN in[16], load, address[12];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,p1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM4K.tst

load RAM4K.hdl,
compare-to RAM4K.cmp,
output-list time%S1.3.1 in%D1.6.1 load%B2.1.1 address%D2.4.2 out%D1.6.1;

set in 0,
set load 0,
set address 0,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set in 1111,
set load 0,
tick,
output;
tock,
output;

set load 1,
set address 1111,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;

set in 3513,
set address 3513,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 1111,
eval,
output;

set in 4095,
tick,
output;
tock,
output;

set load 1,
set address 4095,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 3513,
eval,
output;

set address 4095,
eval,
output;


set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
tick,
output,
tock,
output;
set address %B101010101010,
tick,
output,
tock,
output;
set address %B101010101011,
tick,
output,
tock,
output;
set address %B101010101100,
tick,
output,
tock,
output;
set address %B101010101101,
tick,
output,
tock,
output;
set address %B101010101110,
tick,
output,
tock,
output;
set address %B101010101111,
tick,
output,
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101000,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101000,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101001,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101001,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101011,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101011,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101100,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101100,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101110,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101110,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101010101111,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;

set load 1,
set address %B101010101111,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B101010101000,
tick,
output;
tock,
output;
set address %B101010101001,
eval,
output;
set address %B101010101010,
eval,
output;
set address %B101010101011,
eval,
output;
set address %B101010101100,
eval,
output;
set address %B101010101101,
eval,
output;
set address %B101010101110,
eval,
output;
set address %B101010101111,
eval,
output;


set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
tick,
output,
tock,
output;
set address %B010101010101,
tick,
output,
tock,
output;
set address %B011101010101,
tick,
output,
tock,
output;
set address %B100101010101,
tick,
output,
tock,
output;
set address %B101101010101,
tick,
output,
tock,
output;
set address %B110101010101,
tick,
output,
tock,
output;
set address %B111101010101,
tick,
output,
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B000101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B000101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B001101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B001101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B010101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B010101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B011101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B011101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B100101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B100101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B101101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B101101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B110101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B110101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B111101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;

set load 1,
set address %B111101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B000101010101,
tick,
output;
tock,
output;
set address %B001101010101,
eval,
output;
set address %B010101010101,
eval,
output;
set address %B011101010101,
eval,
output;
set address %B100101010101,
eval,
output;
set address %B101101010101,
eval,
output;
set address %B110101010101,
eval,
output;
set address %B111101010101,
eval,
output;`,n1=`|time |   in   |load|address |  out   |
| 0+  |      0 |  0 |     0  |      0 |
| 1   |      0 |  0 |     0  |      0 |
| 1+  |      0 |  1 |     0  |      0 |
| 2   |      0 |  1 |     0  |      0 |
| 2+  |   1111 |  0 |     0  |      0 |
| 3   |   1111 |  0 |     0  |      0 |
| 3+  |   1111 |  1 |  1111  |      0 |
| 4   |   1111 |  1 |  1111  |   1111 |
| 4+  |   1111 |  0 |     0  |      0 |
| 5   |   1111 |  0 |     0  |      0 |
| 5+  |   3513 |  0 |  3513  |      0 |
| 6   |   3513 |  0 |  3513  |      0 |
| 6+  |   3513 |  1 |  3513  |      0 |
| 7   |   3513 |  1 |  3513  |   3513 |
| 7+  |   3513 |  0 |  3513  |   3513 |
| 8   |   3513 |  0 |  3513  |   3513 |
| 8   |   3513 |  0 |  1111  |   1111 |
| 8+  |   4095 |  0 |  1111  |   1111 |
| 9   |   4095 |  0 |  1111  |   1111 |
| 9+  |   4095 |  1 |  4095  |      0 |
| 10  |   4095 |  1 |  4095  |   4095 |
| 10+ |   4095 |  0 |  4095  |   4095 |
| 11  |   4095 |  0 |  4095  |   4095 |
| 11  |   4095 |  0 |  3513  |   3513 |
| 11  |   4095 |  0 |  4095  |   4095 |
| 11+ |   4095 |  0 |  2728  |      0 |
| 12  |   4095 |  0 |  2728  |      0 |
| 12  |   4095 |  0 |  2729  |      0 |
| 12  |   4095 |  0 |  2730  |      0 |
| 12  |   4095 |  0 |  2731  |      0 |
| 12  |   4095 |  0 |  2732  |      0 |
| 12  |   4095 |  0 |  2733  |      0 |
| 12  |   4095 |  0 |  2734  |      0 |
| 12  |   4095 |  0 |  2735  |      0 |
| 12+ |  21845 |  1 |  2728  |      0 |
| 13  |  21845 |  1 |  2728  |  21845 |
| 13+ |  21845 |  1 |  2729  |      0 |
| 14  |  21845 |  1 |  2729  |  21845 |
| 14+ |  21845 |  1 |  2730  |      0 |
| 15  |  21845 |  1 |  2730  |  21845 |
| 15+ |  21845 |  1 |  2731  |      0 |
| 16  |  21845 |  1 |  2731  |  21845 |
| 16+ |  21845 |  1 |  2732  |      0 |
| 17  |  21845 |  1 |  2732  |  21845 |
| 17+ |  21845 |  1 |  2733  |      0 |
| 18  |  21845 |  1 |  2733  |  21845 |
| 18+ |  21845 |  1 |  2734  |      0 |
| 19  |  21845 |  1 |  2734  |  21845 |
| 19+ |  21845 |  1 |  2735  |      0 |
| 20  |  21845 |  1 |  2735  |  21845 |
| 20+ |  21845 |  0 |  2728  |  21845 |
| 21  |  21845 |  0 |  2728  |  21845 |
| 21  |  21845 |  0 |  2729  |  21845 |
| 21  |  21845 |  0 |  2730  |  21845 |
| 21  |  21845 |  0 |  2731  |  21845 |
| 21  |  21845 |  0 |  2732  |  21845 |
| 21  |  21845 |  0 |  2733  |  21845 |
| 21  |  21845 |  0 |  2734  |  21845 |
| 21  |  21845 |  0 |  2735  |  21845 |
| 21+ | -21846 |  1 |  2728  |  21845 |
| 22  | -21846 |  1 |  2728  | -21846 |
| 22+ | -21846 |  0 |  2728  | -21846 |
| 23  | -21846 |  0 |  2728  | -21846 |
| 23  | -21846 |  0 |  2729  |  21845 |
| 23  | -21846 |  0 |  2730  |  21845 |
| 23  | -21846 |  0 |  2731  |  21845 |
| 23  | -21846 |  0 |  2732  |  21845 |
| 23  | -21846 |  0 |  2733  |  21845 |
| 23  | -21846 |  0 |  2734  |  21845 |
| 23  | -21846 |  0 |  2735  |  21845 |
| 23+ |  21845 |  1 |  2728  | -21846 |
| 24  |  21845 |  1 |  2728  |  21845 |
| 24+ | -21846 |  1 |  2729  |  21845 |
| 25  | -21846 |  1 |  2729  | -21846 |
| 25+ | -21846 |  0 |  2728  |  21845 |
| 26  | -21846 |  0 |  2728  |  21845 |
| 26  | -21846 |  0 |  2729  | -21846 |
| 26  | -21846 |  0 |  2730  |  21845 |
| 26  | -21846 |  0 |  2731  |  21845 |
| 26  | -21846 |  0 |  2732  |  21845 |
| 26  | -21846 |  0 |  2733  |  21845 |
| 26  | -21846 |  0 |  2734  |  21845 |
| 26  | -21846 |  0 |  2735  |  21845 |
| 26+ |  21845 |  1 |  2729  | -21846 |
| 27  |  21845 |  1 |  2729  |  21845 |
| 27+ | -21846 |  1 |  2730  |  21845 |
| 28  | -21846 |  1 |  2730  | -21846 |
| 28+ | -21846 |  0 |  2728  |  21845 |
| 29  | -21846 |  0 |  2728  |  21845 |
| 29  | -21846 |  0 |  2729  |  21845 |
| 29  | -21846 |  0 |  2730  | -21846 |
| 29  | -21846 |  0 |  2731  |  21845 |
| 29  | -21846 |  0 |  2732  |  21845 |
| 29  | -21846 |  0 |  2733  |  21845 |
| 29  | -21846 |  0 |  2734  |  21845 |
| 29  | -21846 |  0 |  2735  |  21845 |
| 29+ |  21845 |  1 |  2730  | -21846 |
| 30  |  21845 |  1 |  2730  |  21845 |
| 30+ | -21846 |  1 |  2731  |  21845 |
| 31  | -21846 |  1 |  2731  | -21846 |
| 31+ | -21846 |  0 |  2728  |  21845 |
| 32  | -21846 |  0 |  2728  |  21845 |
| 32  | -21846 |  0 |  2729  |  21845 |
| 32  | -21846 |  0 |  2730  |  21845 |
| 32  | -21846 |  0 |  2731  | -21846 |
| 32  | -21846 |  0 |  2732  |  21845 |
| 32  | -21846 |  0 |  2733  |  21845 |
| 32  | -21846 |  0 |  2734  |  21845 |
| 32  | -21846 |  0 |  2735  |  21845 |
| 32+ |  21845 |  1 |  2731  | -21846 |
| 33  |  21845 |  1 |  2731  |  21845 |
| 33+ | -21846 |  1 |  2732  |  21845 |
| 34  | -21846 |  1 |  2732  | -21846 |
| 34+ | -21846 |  0 |  2728  |  21845 |
| 35  | -21846 |  0 |  2728  |  21845 |
| 35  | -21846 |  0 |  2729  |  21845 |
| 35  | -21846 |  0 |  2730  |  21845 |
| 35  | -21846 |  0 |  2731  |  21845 |
| 35  | -21846 |  0 |  2732  | -21846 |
| 35  | -21846 |  0 |  2733  |  21845 |
| 35  | -21846 |  0 |  2734  |  21845 |
| 35  | -21846 |  0 |  2735  |  21845 |
| 35+ |  21845 |  1 |  2732  | -21846 |
| 36  |  21845 |  1 |  2732  |  21845 |
| 36+ | -21846 |  1 |  2733  |  21845 |
| 37  | -21846 |  1 |  2733  | -21846 |
| 37+ | -21846 |  0 |  2728  |  21845 |
| 38  | -21846 |  0 |  2728  |  21845 |
| 38  | -21846 |  0 |  2729  |  21845 |
| 38  | -21846 |  0 |  2730  |  21845 |
| 38  | -21846 |  0 |  2731  |  21845 |
| 38  | -21846 |  0 |  2732  |  21845 |
| 38  | -21846 |  0 |  2733  | -21846 |
| 38  | -21846 |  0 |  2734  |  21845 |
| 38  | -21846 |  0 |  2735  |  21845 |
| 38+ |  21845 |  1 |  2733  | -21846 |
| 39  |  21845 |  1 |  2733  |  21845 |
| 39+ | -21846 |  1 |  2734  |  21845 |
| 40  | -21846 |  1 |  2734  | -21846 |
| 40+ | -21846 |  0 |  2728  |  21845 |
| 41  | -21846 |  0 |  2728  |  21845 |
| 41  | -21846 |  0 |  2729  |  21845 |
| 41  | -21846 |  0 |  2730  |  21845 |
| 41  | -21846 |  0 |  2731  |  21845 |
| 41  | -21846 |  0 |  2732  |  21845 |
| 41  | -21846 |  0 |  2733  |  21845 |
| 41  | -21846 |  0 |  2734  | -21846 |
| 41  | -21846 |  0 |  2735  |  21845 |
| 41+ |  21845 |  1 |  2734  | -21846 |
| 42  |  21845 |  1 |  2734  |  21845 |
| 42+ | -21846 |  1 |  2735  |  21845 |
| 43  | -21846 |  1 |  2735  | -21846 |
| 43+ | -21846 |  0 |  2728  |  21845 |
| 44  | -21846 |  0 |  2728  |  21845 |
| 44  | -21846 |  0 |  2729  |  21845 |
| 44  | -21846 |  0 |  2730  |  21845 |
| 44  | -21846 |  0 |  2731  |  21845 |
| 44  | -21846 |  0 |  2732  |  21845 |
| 44  | -21846 |  0 |  2733  |  21845 |
| 44  | -21846 |  0 |  2734  |  21845 |
| 44  | -21846 |  0 |  2735  | -21846 |
| 44+ |  21845 |  1 |  2735  | -21846 |
| 45  |  21845 |  1 |  2735  |  21845 |
| 45+ |  21845 |  0 |  2728  |  21845 |
| 46  |  21845 |  0 |  2728  |  21845 |
| 46  |  21845 |  0 |  2729  |  21845 |
| 46  |  21845 |  0 |  2730  |  21845 |
| 46  |  21845 |  0 |  2731  |  21845 |
| 46  |  21845 |  0 |  2732  |  21845 |
| 46  |  21845 |  0 |  2733  |  21845 |
| 46  |  21845 |  0 |  2734  |  21845 |
| 46  |  21845 |  0 |  2735  |  21845 |
| 46+ |  21845 |  0 |   341  |      0 |
| 47  |  21845 |  0 |   341  |      0 |
| 47  |  21845 |  0 |   853  |      0 |
| 47  |  21845 |  0 |  1365  |      0 |
| 47  |  21845 |  0 |  1877  |      0 |
| 47  |  21845 |  0 |  2389  |      0 |
| 47  |  21845 |  0 |  2901  |      0 |
| 47  |  21845 |  0 |  3413  |      0 |
| 47  |  21845 |  0 |  3925  |      0 |
| 47+ |  21845 |  1 |   341  |      0 |
| 48  |  21845 |  1 |   341  |  21845 |
| 48+ |  21845 |  1 |   853  |      0 |
| 49  |  21845 |  1 |   853  |  21845 |
| 49+ |  21845 |  1 |  1365  |      0 |
| 50  |  21845 |  1 |  1365  |  21845 |
| 50+ |  21845 |  1 |  1877  |      0 |
| 51  |  21845 |  1 |  1877  |  21845 |
| 51+ |  21845 |  1 |  2389  |      0 |
| 52  |  21845 |  1 |  2389  |  21845 |
| 52+ |  21845 |  1 |  2901  |      0 |
| 53  |  21845 |  1 |  2901  |  21845 |
| 53+ |  21845 |  1 |  3413  |      0 |
| 54  |  21845 |  1 |  3413  |  21845 |
| 54+ |  21845 |  1 |  3925  |      0 |
| 55  |  21845 |  1 |  3925  |  21845 |
| 55+ |  21845 |  0 |   341  |  21845 |
| 56  |  21845 |  0 |   341  |  21845 |
| 56  |  21845 |  0 |   853  |  21845 |
| 56  |  21845 |  0 |  1365  |  21845 |
| 56  |  21845 |  0 |  1877  |  21845 |
| 56  |  21845 |  0 |  2389  |  21845 |
| 56  |  21845 |  0 |  2901  |  21845 |
| 56  |  21845 |  0 |  3413  |  21845 |
| 56  |  21845 |  0 |  3925  |  21845 |
| 56+ | -21846 |  1 |   341  |  21845 |
| 57  | -21846 |  1 |   341  | -21846 |
| 57+ | -21846 |  0 |   341  | -21846 |
| 58  | -21846 |  0 |   341  | -21846 |
| 58  | -21846 |  0 |   853  |  21845 |
| 58  | -21846 |  0 |  1365  |  21845 |
| 58  | -21846 |  0 |  1877  |  21845 |
| 58  | -21846 |  0 |  2389  |  21845 |
| 58  | -21846 |  0 |  2901  |  21845 |
| 58  | -21846 |  0 |  3413  |  21845 |
| 58  | -21846 |  0 |  3925  |  21845 |
| 58+ |  21845 |  1 |   341  | -21846 |
| 59  |  21845 |  1 |   341  |  21845 |
| 59+ | -21846 |  1 |   853  |  21845 |
| 60  | -21846 |  1 |   853  | -21846 |
| 60+ | -21846 |  0 |   341  |  21845 |
| 61  | -21846 |  0 |   341  |  21845 |
| 61  | -21846 |  0 |   853  | -21846 |
| 61  | -21846 |  0 |  1365  |  21845 |
| 61  | -21846 |  0 |  1877  |  21845 |
| 61  | -21846 |  0 |  2389  |  21845 |
| 61  | -21846 |  0 |  2901  |  21845 |
| 61  | -21846 |  0 |  3413  |  21845 |
| 61  | -21846 |  0 |  3925  |  21845 |
| 61+ |  21845 |  1 |   853  | -21846 |
| 62  |  21845 |  1 |   853  |  21845 |
| 62+ | -21846 |  1 |  1365  |  21845 |
| 63  | -21846 |  1 |  1365  | -21846 |
| 63+ | -21846 |  0 |   341  |  21845 |
| 64  | -21846 |  0 |   341  |  21845 |
| 64  | -21846 |  0 |   853  |  21845 |
| 64  | -21846 |  0 |  1365  | -21846 |
| 64  | -21846 |  0 |  1877  |  21845 |
| 64  | -21846 |  0 |  2389  |  21845 |
| 64  | -21846 |  0 |  2901  |  21845 |
| 64  | -21846 |  0 |  3413  |  21845 |
| 64  | -21846 |  0 |  3925  |  21845 |
| 64+ |  21845 |  1 |  1365  | -21846 |
| 65  |  21845 |  1 |  1365  |  21845 |
| 65+ | -21846 |  1 |  1877  |  21845 |
| 66  | -21846 |  1 |  1877  | -21846 |
| 66+ | -21846 |  0 |   341  |  21845 |
| 67  | -21846 |  0 |   341  |  21845 |
| 67  | -21846 |  0 |   853  |  21845 |
| 67  | -21846 |  0 |  1365  |  21845 |
| 67  | -21846 |  0 |  1877  | -21846 |
| 67  | -21846 |  0 |  2389  |  21845 |
| 67  | -21846 |  0 |  2901  |  21845 |
| 67  | -21846 |  0 |  3413  |  21845 |
| 67  | -21846 |  0 |  3925  |  21845 |
| 67+ |  21845 |  1 |  1877  | -21846 |
| 68  |  21845 |  1 |  1877  |  21845 |
| 68+ | -21846 |  1 |  2389  |  21845 |
| 69  | -21846 |  1 |  2389  | -21846 |
| 69+ | -21846 |  0 |   341  |  21845 |
| 70  | -21846 |  0 |   341  |  21845 |
| 70  | -21846 |  0 |   853  |  21845 |
| 70  | -21846 |  0 |  1365  |  21845 |
| 70  | -21846 |  0 |  1877  |  21845 |
| 70  | -21846 |  0 |  2389  | -21846 |
| 70  | -21846 |  0 |  2901  |  21845 |
| 70  | -21846 |  0 |  3413  |  21845 |
| 70  | -21846 |  0 |  3925  |  21845 |
| 70+ |  21845 |  1 |  2389  | -21846 |
| 71  |  21845 |  1 |  2389  |  21845 |
| 71+ | -21846 |  1 |  2901  |  21845 |
| 72  | -21846 |  1 |  2901  | -21846 |
| 72+ | -21846 |  0 |   341  |  21845 |
| 73  | -21846 |  0 |   341  |  21845 |
| 73  | -21846 |  0 |   853  |  21845 |
| 73  | -21846 |  0 |  1365  |  21845 |
| 73  | -21846 |  0 |  1877  |  21845 |
| 73  | -21846 |  0 |  2389  |  21845 |
| 73  | -21846 |  0 |  2901  | -21846 |
| 73  | -21846 |  0 |  3413  |  21845 |
| 73  | -21846 |  0 |  3925  |  21845 |
| 73+ |  21845 |  1 |  2901  | -21846 |
| 74  |  21845 |  1 |  2901  |  21845 |
| 74+ | -21846 |  1 |  3413  |  21845 |
| 75  | -21846 |  1 |  3413  | -21846 |
| 75+ | -21846 |  0 |   341  |  21845 |
| 76  | -21846 |  0 |   341  |  21845 |
| 76  | -21846 |  0 |   853  |  21845 |
| 76  | -21846 |  0 |  1365  |  21845 |
| 76  | -21846 |  0 |  1877  |  21845 |
| 76  | -21846 |  0 |  2389  |  21845 |
| 76  | -21846 |  0 |  2901  |  21845 |
| 76  | -21846 |  0 |  3413  | -21846 |
| 76  | -21846 |  0 |  3925  |  21845 |
| 76+ |  21845 |  1 |  3413  | -21846 |
| 77  |  21845 |  1 |  3413  |  21845 |
| 77+ | -21846 |  1 |  3925  |  21845 |
| 78  | -21846 |  1 |  3925  | -21846 |
| 78+ | -21846 |  0 |   341  |  21845 |
| 79  | -21846 |  0 |   341  |  21845 |
| 79  | -21846 |  0 |   853  |  21845 |
| 79  | -21846 |  0 |  1365  |  21845 |
| 79  | -21846 |  0 |  1877  |  21845 |
| 79  | -21846 |  0 |  2389  |  21845 |
| 79  | -21846 |  0 |  2901  |  21845 |
| 79  | -21846 |  0 |  3413  |  21845 |
| 79  | -21846 |  0 |  3925  | -21846 |
| 79+ |  21845 |  1 |  3925  | -21846 |
| 80  |  21845 |  1 |  3925  |  21845 |
| 80+ |  21845 |  0 |   341  |  21845 |
| 81  |  21845 |  0 |   341  |  21845 |
| 81  |  21845 |  0 |   853  |  21845 |
| 81  |  21845 |  0 |  1365  |  21845 |
| 81  |  21845 |  0 |  1877  |  21845 |
| 81  |  21845 |  0 |  2389  |  21845 |
| 81  |  21845 |  0 |  2901  |  21845 |
| 81  |  21845 |  0 |  3413  |  21845 |
| 81  |  21845 |  0 |  3925  |  21845 |`,y=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM16K.hdl
/**
 * Memory of 16K 16-bit registers.
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 */
CHIP RAM16K {
    IN in[16], load, address[14];
    OUT out[16];

    PARTS:
    //// Replace this comment with your code.
}`,c1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/3/b/RAM16K.tst

load RAM16K.hdl,
compare-to RAM16K.cmp,
output-list time%S1.3.1 in%D1.6.1 load%B2.1.1 address%D2.5.2 out%D1.6.1;

set in 0,
set load 0,
set address 0,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set in 4321,
set load 0,
tick,
output;
tock,
output;

set load 1,
set address 4321,
tick,
output;
tock,
output;

set load 0,
set address 0,
tick,
output;
tock,
output;

set in 12345,
set address 12345,
tick,
output;
tock,
output;

set load 1,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 4321,
eval,
output;

set in 16383,
tick,
output;
tock,
output;

set load 1,
set address 16383,
tick,
output;
tock,
output;

set load 0,
tick,
output;
tock,
output;

set address 12345,
eval,
output;

set address 16383,
eval,
output;


set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
tick,
output,
tock,
output;
set address %B10101010101010,
tick,
output,
tock,
output;
set address %B10101010101011,
tick,
output,
tock,
output;
set address %B10101010101100,
tick,
output,
tock,
output;
set address %B10101010101101,
tick,
output,
tock,
output;
set address %B10101010101110,
tick,
output,
tock,
output;
set address %B10101010101111,
tick,
output,
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101000,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101000,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101001,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101001,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101010,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101010,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101011,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101011,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101100,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101100,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101110,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101110,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10101010101111,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;

set load 1,
set address %B10101010101111,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B10101010101000,
tick,
output;
tock,
output;
set address %B10101010101001,
eval,
output;
set address %B10101010101010,
eval,
output;
set address %B10101010101011,
eval,
output;
set address %B10101010101100,
eval,
output;
set address %B10101010101101,
eval,
output;
set address %B10101010101110,
eval,
output;
set address %B10101010101111,
eval,
output;


set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set in %B0101010101010101,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
tick,
output,
tock,
output;
set address %B01010101010101,
tick,
output,
tock,
output;
set address %B01110101010101,
tick,
output,
tock,
output;
set address %B10010101010101,
tick,
output,
tock,
output;
set address %B10110101010101,
tick,
output,
tock,
output;
set address %B11010101010101,
tick,
output,
tock,
output;
set address %B11110101010101,
tick,
output,
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B00010101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B00010101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B00110101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B00110101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B01010101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B01010101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B01110101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B01110101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10010101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B10010101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B10110101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B10110101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B11010101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B11010101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;
set address %B11110101010101,
set in %B1010101010101010,
tick,
output;
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;

set load 1,
set address %B11110101010101,
set in %B0101010101010101,
tick,
output,
tock,
output;

set load 0,
set address %B00010101010101,
tick,
output;
tock,
output;
set address %B00110101010101,
eval,
output;
set address %B01010101010101,
eval,
output;
set address %B01110101010101,
eval,
output;
set address %B10010101010101,
eval,
output;
set address %B10110101010101,
eval,
output;
set address %B11010101010101,
eval,
output;
set address %B11110101010101,
eval,
output;`,r1=`|time |   in   |load| address |  out   |
| 0+  |      0 |  0 |      0  |      0 |
| 1   |      0 |  0 |      0  |      0 |
| 1+  |      0 |  1 |      0  |      0 |
| 2   |      0 |  1 |      0  |      0 |
| 2+  |   4321 |  0 |      0  |      0 |
| 3   |   4321 |  0 |      0  |      0 |
| 3+  |   4321 |  1 |   4321  |      0 |
| 4   |   4321 |  1 |   4321  |   4321 |
| 4+  |   4321 |  0 |      0  |      0 |
| 5   |   4321 |  0 |      0  |      0 |
| 5+  |  12345 |  0 |  12345  |      0 |
| 6   |  12345 |  0 |  12345  |      0 |
| 6+  |  12345 |  1 |  12345  |      0 |
| 7   |  12345 |  1 |  12345  |  12345 |
| 7+  |  12345 |  0 |  12345  |  12345 |
| 8   |  12345 |  0 |  12345  |  12345 |
| 8   |  12345 |  0 |   4321  |   4321 |
| 8+  |  16383 |  0 |   4321  |   4321 |
| 9   |  16383 |  0 |   4321  |   4321 |
| 9+  |  16383 |  1 |  16383  |      0 |
| 10  |  16383 |  1 |  16383  |  16383 |
| 10+ |  16383 |  0 |  16383  |  16383 |
| 11  |  16383 |  0 |  16383  |  16383 |
| 11  |  16383 |  0 |  12345  |  12345 |
| 11  |  16383 |  0 |  16383  |  16383 |
| 11+ |  16383 |  0 |  10920  |      0 |
| 12  |  16383 |  0 |  10920  |      0 |
| 12  |  16383 |  0 |  10921  |      0 |
| 12  |  16383 |  0 |  10922  |      0 |
| 12  |  16383 |  0 |  10923  |      0 |
| 12  |  16383 |  0 |  10924  |      0 |
| 12  |  16383 |  0 |  10925  |      0 |
| 12  |  16383 |  0 |  10926  |      0 |
| 12  |  16383 |  0 |  10927  |      0 |
| 12+ |  21845 |  1 |  10920  |      0 |
| 13  |  21845 |  1 |  10920  |  21845 |
| 13+ |  21845 |  1 |  10921  |      0 |
| 14  |  21845 |  1 |  10921  |  21845 |
| 14+ |  21845 |  1 |  10922  |      0 |
| 15  |  21845 |  1 |  10922  |  21845 |
| 15+ |  21845 |  1 |  10923  |      0 |
| 16  |  21845 |  1 |  10923  |  21845 |
| 16+ |  21845 |  1 |  10924  |      0 |
| 17  |  21845 |  1 |  10924  |  21845 |
| 17+ |  21845 |  1 |  10925  |      0 |
| 18  |  21845 |  1 |  10925  |  21845 |
| 18+ |  21845 |  1 |  10926  |      0 |
| 19  |  21845 |  1 |  10926  |  21845 |
| 19+ |  21845 |  1 |  10927  |      0 |
| 20  |  21845 |  1 |  10927  |  21845 |
| 20+ |  21845 |  0 |  10920  |  21845 |
| 21  |  21845 |  0 |  10920  |  21845 |
| 21  |  21845 |  0 |  10921  |  21845 |
| 21  |  21845 |  0 |  10922  |  21845 |
| 21  |  21845 |  0 |  10923  |  21845 |
| 21  |  21845 |  0 |  10924  |  21845 |
| 21  |  21845 |  0 |  10925  |  21845 |
| 21  |  21845 |  0 |  10926  |  21845 |
| 21  |  21845 |  0 |  10927  |  21845 |
| 21+ | -21846 |  1 |  10920  |  21845 |
| 22  | -21846 |  1 |  10920  | -21846 |
| 22+ | -21846 |  0 |  10920  | -21846 |
| 23  | -21846 |  0 |  10920  | -21846 |
| 23  | -21846 |  0 |  10921  |  21845 |
| 23  | -21846 |  0 |  10922  |  21845 |
| 23  | -21846 |  0 |  10923  |  21845 |
| 23  | -21846 |  0 |  10924  |  21845 |
| 23  | -21846 |  0 |  10925  |  21845 |
| 23  | -21846 |  0 |  10926  |  21845 |
| 23  | -21846 |  0 |  10927  |  21845 |
| 23+ |  21845 |  1 |  10920  | -21846 |
| 24  |  21845 |  1 |  10920  |  21845 |
| 24+ | -21846 |  1 |  10921  |  21845 |
| 25  | -21846 |  1 |  10921  | -21846 |
| 25+ | -21846 |  0 |  10920  |  21845 |
| 26  | -21846 |  0 |  10920  |  21845 |
| 26  | -21846 |  0 |  10921  | -21846 |
| 26  | -21846 |  0 |  10922  |  21845 |
| 26  | -21846 |  0 |  10923  |  21845 |
| 26  | -21846 |  0 |  10924  |  21845 |
| 26  | -21846 |  0 |  10925  |  21845 |
| 26  | -21846 |  0 |  10926  |  21845 |
| 26  | -21846 |  0 |  10927  |  21845 |
| 26+ |  21845 |  1 |  10921  | -21846 |
| 27  |  21845 |  1 |  10921  |  21845 |
| 27+ | -21846 |  1 |  10922  |  21845 |
| 28  | -21846 |  1 |  10922  | -21846 |
| 28+ | -21846 |  0 |  10920  |  21845 |
| 29  | -21846 |  0 |  10920  |  21845 |
| 29  | -21846 |  0 |  10921  |  21845 |
| 29  | -21846 |  0 |  10922  | -21846 |
| 29  | -21846 |  0 |  10923  |  21845 |
| 29  | -21846 |  0 |  10924  |  21845 |
| 29  | -21846 |  0 |  10925  |  21845 |
| 29  | -21846 |  0 |  10926  |  21845 |
| 29  | -21846 |  0 |  10927  |  21845 |
| 29+ |  21845 |  1 |  10922  | -21846 |
| 30  |  21845 |  1 |  10922  |  21845 |
| 30+ | -21846 |  1 |  10923  |  21845 |
| 31  | -21846 |  1 |  10923  | -21846 |
| 31+ | -21846 |  0 |  10920  |  21845 |
| 32  | -21846 |  0 |  10920  |  21845 |
| 32  | -21846 |  0 |  10921  |  21845 |
| 32  | -21846 |  0 |  10922  |  21845 |
| 32  | -21846 |  0 |  10923  | -21846 |
| 32  | -21846 |  0 |  10924  |  21845 |
| 32  | -21846 |  0 |  10925  |  21845 |
| 32  | -21846 |  0 |  10926  |  21845 |
| 32  | -21846 |  0 |  10927  |  21845 |
| 32+ |  21845 |  1 |  10923  | -21846 |
| 33  |  21845 |  1 |  10923  |  21845 |
| 33+ | -21846 |  1 |  10924  |  21845 |
| 34  | -21846 |  1 |  10924  | -21846 |
| 34+ | -21846 |  0 |  10920  |  21845 |
| 35  | -21846 |  0 |  10920  |  21845 |
| 35  | -21846 |  0 |  10921  |  21845 |
| 35  | -21846 |  0 |  10922  |  21845 |
| 35  | -21846 |  0 |  10923  |  21845 |
| 35  | -21846 |  0 |  10924  | -21846 |
| 35  | -21846 |  0 |  10925  |  21845 |
| 35  | -21846 |  0 |  10926  |  21845 |
| 35  | -21846 |  0 |  10927  |  21845 |
| 35+ |  21845 |  1 |  10924  | -21846 |
| 36  |  21845 |  1 |  10924  |  21845 |
| 36+ | -21846 |  1 |  10925  |  21845 |
| 37  | -21846 |  1 |  10925  | -21846 |
| 37+ | -21846 |  0 |  10920  |  21845 |
| 38  | -21846 |  0 |  10920  |  21845 |
| 38  | -21846 |  0 |  10921  |  21845 |
| 38  | -21846 |  0 |  10922  |  21845 |
| 38  | -21846 |  0 |  10923  |  21845 |
| 38  | -21846 |  0 |  10924  |  21845 |
| 38  | -21846 |  0 |  10925  | -21846 |
| 38  | -21846 |  0 |  10926  |  21845 |
| 38  | -21846 |  0 |  10927  |  21845 |
| 38+ |  21845 |  1 |  10925  | -21846 |
| 39  |  21845 |  1 |  10925  |  21845 |
| 39+ | -21846 |  1 |  10926  |  21845 |
| 40  | -21846 |  1 |  10926  | -21846 |
| 40+ | -21846 |  0 |  10920  |  21845 |
| 41  | -21846 |  0 |  10920  |  21845 |
| 41  | -21846 |  0 |  10921  |  21845 |
| 41  | -21846 |  0 |  10922  |  21845 |
| 41  | -21846 |  0 |  10923  |  21845 |
| 41  | -21846 |  0 |  10924  |  21845 |
| 41  | -21846 |  0 |  10925  |  21845 |
| 41  | -21846 |  0 |  10926  | -21846 |
| 41  | -21846 |  0 |  10927  |  21845 |
| 41+ |  21845 |  1 |  10926  | -21846 |
| 42  |  21845 |  1 |  10926  |  21845 |
| 42+ | -21846 |  1 |  10927  |  21845 |
| 43  | -21846 |  1 |  10927  | -21846 |
| 43+ | -21846 |  0 |  10920  |  21845 |
| 44  | -21846 |  0 |  10920  |  21845 |
| 44  | -21846 |  0 |  10921  |  21845 |
| 44  | -21846 |  0 |  10922  |  21845 |
| 44  | -21846 |  0 |  10923  |  21845 |
| 44  | -21846 |  0 |  10924  |  21845 |
| 44  | -21846 |  0 |  10925  |  21845 |
| 44  | -21846 |  0 |  10926  |  21845 |
| 44  | -21846 |  0 |  10927  | -21846 |
| 44+ |  21845 |  1 |  10927  | -21846 |
| 45  |  21845 |  1 |  10927  |  21845 |
| 45+ |  21845 |  0 |  10920  |  21845 |
| 46  |  21845 |  0 |  10920  |  21845 |
| 46  |  21845 |  0 |  10921  |  21845 |
| 46  |  21845 |  0 |  10922  |  21845 |
| 46  |  21845 |  0 |  10923  |  21845 |
| 46  |  21845 |  0 |  10924  |  21845 |
| 46  |  21845 |  0 |  10925  |  21845 |
| 46  |  21845 |  0 |  10926  |  21845 |
| 46  |  21845 |  0 |  10927  |  21845 |
| 46+ |  21845 |  0 |   1365  |      0 |
| 47  |  21845 |  0 |   1365  |      0 |
| 47  |  21845 |  0 |   3413  |      0 |
| 47  |  21845 |  0 |   5461  |      0 |
| 47  |  21845 |  0 |   7509  |      0 |
| 47  |  21845 |  0 |   9557  |      0 |
| 47  |  21845 |  0 |  11605  |      0 |
| 47  |  21845 |  0 |  13653  |      0 |
| 47  |  21845 |  0 |  15701  |      0 |
| 47+ |  21845 |  1 |   1365  |      0 |
| 48  |  21845 |  1 |   1365  |  21845 |
| 48+ |  21845 |  1 |   3413  |      0 |
| 49  |  21845 |  1 |   3413  |  21845 |
| 49+ |  21845 |  1 |   5461  |      0 |
| 50  |  21845 |  1 |   5461  |  21845 |
| 50+ |  21845 |  1 |   7509  |      0 |
| 51  |  21845 |  1 |   7509  |  21845 |
| 51+ |  21845 |  1 |   9557  |      0 |
| 52  |  21845 |  1 |   9557  |  21845 |
| 52+ |  21845 |  1 |  11605  |      0 |
| 53  |  21845 |  1 |  11605  |  21845 |
| 53+ |  21845 |  1 |  13653  |      0 |
| 54  |  21845 |  1 |  13653  |  21845 |
| 54+ |  21845 |  1 |  15701  |      0 |
| 55  |  21845 |  1 |  15701  |  21845 |
| 55+ |  21845 |  0 |   1365  |  21845 |
| 56  |  21845 |  0 |   1365  |  21845 |
| 56  |  21845 |  0 |   3413  |  21845 |
| 56  |  21845 |  0 |   5461  |  21845 |
| 56  |  21845 |  0 |   7509  |  21845 |
| 56  |  21845 |  0 |   9557  |  21845 |
| 56  |  21845 |  0 |  11605  |  21845 |
| 56  |  21845 |  0 |  13653  |  21845 |
| 56  |  21845 |  0 |  15701  |  21845 |
| 56+ | -21846 |  1 |   1365  |  21845 |
| 57  | -21846 |  1 |   1365  | -21846 |
| 57+ | -21846 |  0 |   1365  | -21846 |
| 58  | -21846 |  0 |   1365  | -21846 |
| 58  | -21846 |  0 |   3413  |  21845 |
| 58  | -21846 |  0 |   5461  |  21845 |
| 58  | -21846 |  0 |   7509  |  21845 |
| 58  | -21846 |  0 |   9557  |  21845 |
| 58  | -21846 |  0 |  11605  |  21845 |
| 58  | -21846 |  0 |  13653  |  21845 |
| 58  | -21846 |  0 |  15701  |  21845 |
| 58+ |  21845 |  1 |   1365  | -21846 |
| 59  |  21845 |  1 |   1365  |  21845 |
| 59+ | -21846 |  1 |   3413  |  21845 |
| 60  | -21846 |  1 |   3413  | -21846 |
| 60+ | -21846 |  0 |   1365  |  21845 |
| 61  | -21846 |  0 |   1365  |  21845 |
| 61  | -21846 |  0 |   3413  | -21846 |
| 61  | -21846 |  0 |   5461  |  21845 |
| 61  | -21846 |  0 |   7509  |  21845 |
| 61  | -21846 |  0 |   9557  |  21845 |
| 61  | -21846 |  0 |  11605  |  21845 |
| 61  | -21846 |  0 |  13653  |  21845 |
| 61  | -21846 |  0 |  15701  |  21845 |
| 61+ |  21845 |  1 |   3413  | -21846 |
| 62  |  21845 |  1 |   3413  |  21845 |
| 62+ | -21846 |  1 |   5461  |  21845 |
| 63  | -21846 |  1 |   5461  | -21846 |
| 63+ | -21846 |  0 |   1365  |  21845 |
| 64  | -21846 |  0 |   1365  |  21845 |
| 64  | -21846 |  0 |   3413  |  21845 |
| 64  | -21846 |  0 |   5461  | -21846 |
| 64  | -21846 |  0 |   7509  |  21845 |
| 64  | -21846 |  0 |   9557  |  21845 |
| 64  | -21846 |  0 |  11605  |  21845 |
| 64  | -21846 |  0 |  13653  |  21845 |
| 64  | -21846 |  0 |  15701  |  21845 |
| 64+ |  21845 |  1 |   5461  | -21846 |
| 65  |  21845 |  1 |   5461  |  21845 |
| 65+ | -21846 |  1 |   7509  |  21845 |
| 66  | -21846 |  1 |   7509  | -21846 |
| 66+ | -21846 |  0 |   1365  |  21845 |
| 67  | -21846 |  0 |   1365  |  21845 |
| 67  | -21846 |  0 |   3413  |  21845 |
| 67  | -21846 |  0 |   5461  |  21845 |
| 67  | -21846 |  0 |   7509  | -21846 |
| 67  | -21846 |  0 |   9557  |  21845 |
| 67  | -21846 |  0 |  11605  |  21845 |
| 67  | -21846 |  0 |  13653  |  21845 |
| 67  | -21846 |  0 |  15701  |  21845 |
| 67+ |  21845 |  1 |   7509  | -21846 |
| 68  |  21845 |  1 |   7509  |  21845 |
| 68+ | -21846 |  1 |   9557  |  21845 |
| 69  | -21846 |  1 |   9557  | -21846 |
| 69+ | -21846 |  0 |   1365  |  21845 |
| 70  | -21846 |  0 |   1365  |  21845 |
| 70  | -21846 |  0 |   3413  |  21845 |
| 70  | -21846 |  0 |   5461  |  21845 |
| 70  | -21846 |  0 |   7509  |  21845 |
| 70  | -21846 |  0 |   9557  | -21846 |
| 70  | -21846 |  0 |  11605  |  21845 |
| 70  | -21846 |  0 |  13653  |  21845 |
| 70  | -21846 |  0 |  15701  |  21845 |
| 70+ |  21845 |  1 |   9557  | -21846 |
| 71  |  21845 |  1 |   9557  |  21845 |
| 71+ | -21846 |  1 |  11605  |  21845 |
| 72  | -21846 |  1 |  11605  | -21846 |
| 72+ | -21846 |  0 |   1365  |  21845 |
| 73  | -21846 |  0 |   1365  |  21845 |
| 73  | -21846 |  0 |   3413  |  21845 |
| 73  | -21846 |  0 |   5461  |  21845 |
| 73  | -21846 |  0 |   7509  |  21845 |
| 73  | -21846 |  0 |   9557  |  21845 |
| 73  | -21846 |  0 |  11605  | -21846 |
| 73  | -21846 |  0 |  13653  |  21845 |
| 73  | -21846 |  0 |  15701  |  21845 |
| 73+ |  21845 |  1 |  11605  | -21846 |
| 74  |  21845 |  1 |  11605  |  21845 |
| 74+ | -21846 |  1 |  13653  |  21845 |
| 75  | -21846 |  1 |  13653  | -21846 |
| 75+ | -21846 |  0 |   1365  |  21845 |
| 76  | -21846 |  0 |   1365  |  21845 |
| 76  | -21846 |  0 |   3413  |  21845 |
| 76  | -21846 |  0 |   5461  |  21845 |
| 76  | -21846 |  0 |   7509  |  21845 |
| 76  | -21846 |  0 |   9557  |  21845 |
| 76  | -21846 |  0 |  11605  |  21845 |
| 76  | -21846 |  0 |  13653  | -21846 |
| 76  | -21846 |  0 |  15701  |  21845 |
| 76+ |  21845 |  1 |  13653  | -21846 |
| 77  |  21845 |  1 |  13653  |  21845 |
| 77+ | -21846 |  1 |  15701  |  21845 |
| 78  | -21846 |  1 |  15701  | -21846 |
| 78+ | -21846 |  0 |   1365  |  21845 |
| 79  | -21846 |  0 |   1365  |  21845 |
| 79  | -21846 |  0 |   3413  |  21845 |
| 79  | -21846 |  0 |   5461  |  21845 |
| 79  | -21846 |  0 |   7509  |  21845 |
| 79  | -21846 |  0 |   9557  |  21845 |
| 79  | -21846 |  0 |  11605  |  21845 |
| 79  | -21846 |  0 |  13653  |  21845 |
| 79  | -21846 |  0 |  15701  | -21846 |
| 79+ |  21845 |  1 |  15701  | -21846 |
| 80  |  21845 |  1 |  15701  |  21845 |
| 80+ |  21845 |  0 |   1365  |  21845 |
| 81  |  21845 |  0 |   1365  |  21845 |
| 81  |  21845 |  0 |   3413  |  21845 |
| 81  |  21845 |  0 |   5461  |  21845 |
| 81  |  21845 |  0 |   7509  |  21845 |
| 81  |  21845 |  0 |   9557  |  21845 |
| 81  |  21845 |  0 |  11605  |  21845 |
| 81  |  21845 |  0 |  13653  |  21845 |
| 81  |  21845 |  0 |  15701  |  21845 |`,n={"Bit.hdl":H0,"Bit.tst":K0,"Bit.cmp":X0,"Register.hdl":V0,"Register.tst":W0,"Register.cmp":J0,"PC.hdl":G0,"PC.tst":q0,"PC.cmp":Q0,"RAM8.hdl":Y0,"RAM8.tst":Z0,"RAM8.cmp":t1,"RAM64.hdl":e1,"RAM64.tst":s1,"RAM64.cmp":o1,"RAM512.hdl":u1,"RAM512.tst":a1,"RAM512.cmp":d1,"RAM4K.hdl":i1,"RAM4K.tst":p1,"RAM4K.cmp":n1,"RAM16K.hdl":y,"RAM16K.tst":c1,"RAM16K.cmp":r1},l1={DFF:_0};async function k1(t){await t.pushd("/projects/03"),await d(t,n),await t.popd()}async function h1(t){await t.pushd("/projects/03"),await e(t,n,".tst"),await e(t,n,".cmp"),await t.popd()}const m1=Object.freeze(Object.defineProperty({__proto__:null,BUILTIN_CHIPS:l1,CHIPS:n,resetFiles:k1,resetTests:h1},Symbol.toStringTag,{value:"Module"})),B1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
// The algorithm is based on repetitive addition.

//// Replace this comment with your code.`,v1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/mult/Mult.tst

// Tests the Mult program, designed to compute R2 = R0 * R1.
// Tests the program by having it multiply several sets of
// R0 and R1 values.

load Mult.asm,
compare-to Mult.cmp,
output-list RAM[0]%D2.6.2 RAM[1]%D2.6.2 RAM[2]%D2.6.2;

set RAM[0] 0,   // Sets R0 and R1 to some input values
set RAM[1] 0,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 20 {
  ticktock;
}
set RAM[0] 0,   // Restores R0 and R1 in case the program changed them
set RAM[1] 0,
output;

set PC 0,
set RAM[0] 1,   // Sets R0 and R1 to some input values
set RAM[1] 0,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 50 {
  ticktock;
}
set RAM[0] 1,   // Restores R0 and R1 in case the program changed them
set RAM[1] 0,
output;

set PC 0,
set RAM[0] 0,   // Sets R0 and R1 to some input values
set RAM[1] 2,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 80 {
  ticktock;
}
set RAM[0] 0,   // Restores R0 and R1 in case the program changed them
set RAM[1] 2,
output;

set PC 0,
set RAM[0] 3,   // Sets R0 and R1 to some input values
set RAM[1] 1,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 120 {
  ticktock;
}
set RAM[0] 3,   // Restores R0 and R1 in case the program changed them
set RAM[1] 1,
output;

set PC 0,
set RAM[0] 2,   // Sets R0 and R1 to some input values
set RAM[1] 4,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 150 {
  ticktock;
}
set RAM[0] 2,   // Restores R0 and R1 in case the program changed them
set RAM[1] 4,
output;

set PC 0,
set RAM[0] 6,   // Sets R0 and R1 to some input values
set RAM[1] 7,
set RAM[2] -1;  // Ensures that the program initialized R2 to 0
repeat 210 {
  ticktock;
}
set RAM[0] 6,   // Restores R0 and R1 in case the program changed them
set RAM[1] 7,
output;`,M1=`|  RAM[0]  |  RAM[1]  |  RAM[2]  |
|       0  |       0  |       0  |
|       1  |       0  |       0  |
|       0  |       2  |       0  |
|       3  |       1  |       3  |
|       2  |       4  |       8  |
|       6  |       7  |      42  |`,y1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Fill.asm

// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, 
// the screen should be cleared.

//// Replace this comment with your code.`,f1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/fill/Fill.tst

// Tests the Fill.hack program in the CPU emulator.

load Fill.asm;
echo "Select the highest speed and 'enable keyboard'. Then press any key for some time, and inspect the screen.";

repeat {
  ticktock;
}`,R1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/fill/FillAutomatic

// This script can be used to test the Fill program automatically, 
// rather than interactively. Specifically, the script sets the keyboard
// memory map (RAM[24576]) to 0, 1, and then again to 0. This simulates the 
// acts of leaving the keyboard untouched, pressing some key, and then releasing
// the key. After each one of these simulated events, the script outputs the values
// of some selected registers from the screen memory map (RAM[16384]-RAM[24576]).
// This is done in order to test that these registers are set to 000...0 or 111....1, 
// as mandated by how the Fill program should react to the keyboard events.

load Fill.asm,
compare-to FillAutomatic.cmp,
output-list RAM[16384]%D2.6.2 RAM[17648]%D2.6.2 RAM[18349]%D2.6.2 RAM[19444]%D2.6.2 RAM[20771]%D2.6.2 RAM[21031]%D2.6.2 RAM[22596]%D2.6.2 RAM[23754]%D2.6.2 RAM[24575]%D2.6.2;

set RAM[24576] 0,    // the keyboard is untouched
repeat 1000000 {
  ticktock;
}
output;              // tests that the screen is white

set RAM[24576] 1,    // a keyboard key is pressed
repeat 1000000 {
  ticktock;
}
output;              // tests that the screen is black

set RAM[24576] 0,    // the keyboard is untouched
repeat 1000000 {
  ticktock;
}
output;              // tests that the screen is white`,A1=`|RAM[16384]|RAM[17648]|RAM[18349]|RAM[19444]|RAM[20771]|RAM[21031]|RAM[22596]|RAM[23754]|RAM[24575]|
|       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |
|      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |      -1  |
|       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |       0  |`,k={Mult:{"Mult.asm":B1,"Mult.tst":v1,"Mult.cmp":M1},Fill:{"Fill.asm":y1,"Fill.tst":f1,"FillAutomatic.tst":R1,"FillAutomatic.cmp":A1}};async function T1(t){await t.pushd("/projects/04"),await d(t,k),await t.popd()}async function b1(t){await t.pushd("/projects/04"),await e(t,k,".tst"),await e(t,k,".cmp"),await t.popd()}const g1=Object.freeze(Object.defineProperty({__proto__:null,TESTS:k,resetFiles:T1,resetTests:b1},Symbol.toStringTag,{value:"Module"})),w1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/Memory.hdl
/**
 * The complete address space of the Hack computer's memory,
 * including RAM and memory-mapped I/O. 
 * The chip facilitates read and write operations, as follows:
 *     Read:  out(t) = Memory[address(t)](t)
 *     Write: if load(t-1) then Memory[address(t-1)](t) = in(t-1)
 * In words: the chip always outputs the value stored at the memory 
 * location specified by address. If load=1, the in value is loaded 
 * into the memory location specified by address. This value becomes 
 * available through the out output from the next time step onward.
 * Address space rules:
 * Only the upper 16K+8K+1 words of the Memory chip are used. 
 * Access to address>0x6000 is invalid and reads 0. Access to any address
 * in the range 0x4000-0x5FFF results in accessing the screen memory 
 * map. Access to address 0x6000 results in accessing the keyboard 
 * memory map. The behavior in these addresses is described in the Screen
 * and Keyboard chip specifications given in the lectures and the book.
 */
CHIP Memory {
    IN in[16], load, address[15];
    OUT out[16];

    PARTS:
	//// Replace this comment with your code.
}`,S1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/Memory.tst

// Tests the Memory chip by inputting values to selected addresses, 
// verifying that these addresses were indeed written to, and verifying  
// that other addresses were not accessed by mistake. In particular, we 
// focus on probing the registers in addresses 'lower RAM', 'upper RAM',
// and 'Screen', which correspond to 0, %X2000, and %X4000 in Hexadecimal 
// (0, 8192 (8K), and 16385 (16K+1) in decimal).

load Memory.hdl,
compare-to Memory.cmp,
output-list in%D1.6.1 load%B2.1.2 address%B1.15.1 out%D1.6.1;

echo "Before you run this script, select the 'Screen' option from the 'View' menu";

// We've noticed a common design mistake in several students' Memory.hdl files.
// This error leads to zeros being written in the offset of inactive memory segments
// instead of the intended location. To identify this issue, the test should check not
// only for incorrect writes into the wrong segment but also for any unexpected changes.
// To prepare for this, we've initialized the memory with a specific number in the areas
// where these erroneous writes might happen.

//// Sets RAM[2000], RAM[4000] = 12345 (for the following overwrite test)
set in 12345, set load 1, set address %X2000, tick, output; tock, output;
set address %X4000, tick, output; tock, output;

set in -1,				// Sets RAM[0] = -1
set load 1,
set address 0,
tick,
output;
tock,
output;

set in 9999,			// RAM[0] holds value
set load 0,
tick,
output;
tock,
output;

set address %X2000,		// Did not also write to upper RAM or Screen
eval,
output;
set address %X4000,
eval,
output;

//// Sets RAM[0], RAM[4000] = 12345 (for following overwrite test)
set in 12345, set load 1, set address %X0000, tick, output; tock, output;
set address %X4000, tick, output; tock, output;

set in 2222,			// Sets RAM[2000] = 2222
set load 1,
set address %X2000,
tick,
output;
tock,
output;

set in 9999,			// RAM[2000] holds value
set load 0,
tick,
output;
tock,
output;

set address 0,			// Did not also write to lower RAM or Screen
eval,
output;
set address %X4000,
eval,
output;

set load 0,				// Low order address bits connected
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

set address %X1234,		// RAM[1234] = 1234
set in 1234,
set load 1,
tick,
output;
tock,
output;

set load 0,
set address %X2234,		// Did not also write to upper RAM or Screen 
eval, output;
set address %X6234,
eval, output;

set address %X2345,		// RAM[2345] = 2345
set in 2345,
set load 1,
tick,
output;
tock,
output;

set load 0,
set address %X0345,		// Did not also write to lower RAM or Screen 
eval, output;
set address %X4345,
eval, output;

//// Clears the overwrite detection value from the screen
set in 0, set load 1, set address %X4000, tick, output; tock, output;

// Keyboard test

set address 24576,
echo "Click the Keyboard icon and hold down the 'K' key (uppercase) until you see the next message...",
// It's important to keep holding the key down since if the system is busy,
// the memory will zero itself before being outputted.

while out <> 75 {
    tick, tock;     // tick, tock prevents hang if sync. parts used in KB path.
}

clear-echo,
output;

// Screen test

//// Sets RAM[0FCF], RAM[2FCF] = 12345 (for following overwrite test)
set in 12345, set load 1, set address %X0FCF, tick, output; tock, output;
set address %X2FCF, tick, output; tock, output;

set load 1,
set in -1,
set address %X4FCF,
tick,
tock,
output,

set address %X504F,
tick,
tock,
output;

set address %X0FCF,		// Did not also write to lower or upper RAM
eval,
output;
set address %X2FCF,
eval,
output;

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

set load 0,
set address 24576,
echo "Two horizontal lines should be in the middle of the screen. Hold down 'Y' (uppercase) until you see the next message ...",
// It's important to keep holding the key down since if the system is busy,
// the memory will zero itself before being outputted.

while out <> 89 {
    tick, tock;     // tick, tock prevents hang if sync. parts used in KB path.
}

clear-echo,
output;`,C1=`|   in   |load |     address     |  out   |
|  12345 |  1  | 010000000000000 |      0 |
|  12345 |  1  | 010000000000000 |  12345 |
|  12345 |  1  | 100000000000000 |      0 |
|  12345 |  1  | 100000000000000 |  12345 |
|     -1 |  1  | 000000000000000 |      0 |
|     -1 |  1  | 000000000000000 |     -1 |
|   9999 |  0  | 000000000000000 |     -1 |
|   9999 |  0  | 000000000000000 |     -1 |
|   9999 |  0  | 010000000000000 |  12345 |
|   9999 |  0  | 100000000000000 |  12345 |
|  12345 |  1  | 000000000000000 |     -1 |
|  12345 |  1  | 000000000000000 |  12345 |
|  12345 |  1  | 100000000000000 |  12345 |
|  12345 |  1  | 100000000000000 |  12345 |
|   2222 |  1  | 010000000000000 |  12345 |
|   2222 |  1  | 010000000000000 |   2222 |
|   9999 |  0  | 010000000000000 |   2222 |
|   9999 |  0  | 010000000000000 |   2222 |
|   9999 |  0  | 000000000000000 |  12345 |
|   9999 |  0  | 100000000000000 |  12345 |
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
|      0 |  1  | 100000000000000 |  12345 |
|      0 |  1  | 100000000000000 |      0 |
|      0 |  1  | 110000000000000 |     75 |
|  12345 |  1  | 000111111001111 |      0 |
|  12345 |  1  | 000111111001111 |  12345 |
|  12345 |  1  | 010111111001111 |      0 |
|  12345 |  1  | 010111111001111 |  12345 |
|     -1 |  1  | 100111111001111 |     -1 |
|     -1 |  1  | 101000001001111 |     -1 |
|     -1 |  1  | 000111111001111 |  12345 |
|     -1 |  1  | 010111111001111 |  12345 |
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
|     -1 |  0  | 101111111001111 |      0 |
|     -1 |  0  | 110000000000000 |     89 |`,x1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/CPU.hdl
/**
 * The Hack Central Processing unit (CPU).
 * Parses the binary code in the instruction input and executes it according to the
 * Hack machine language specification. In the case of a C-instruction, computes the
 * function specified by the instruction. If the instruction specifies to read a memory
 * value, the inM input is expected to contain this value. If the instruction specifies
 * to write a value to the memory, sets the outM output to this value, sets the addressM
 * output to the target address, and asserts the writeM output (when writeM = 0, any
 * value may appear in outM).
 * If the reset input is 0, computes the address of the next instruction and sets the
 * pc output to that value. If the reset input is 1, sets pc to 0.
 * Note: The outM and writeM outputs are combinational: they are affected by the
 * instruction's execution during the current cycle. The addressM and pc outputs are
 * clocked: although they are affected by the instruction's execution, they commit to
 * their new values only in the next cycle.
 */
CHIP CPU {

    IN  inM[16],         // M value input  (M = contents of RAM[A])
        instruction[16], // Instruction for execution
        reset;           // Signals whether to re-start the current
                         // program (reset==1) or continue executing
                         // the current program (reset==0).

    OUT outM[16],        // M value output
        writeM,          // Write to M? 
        addressM[15],    // Address in data memory (of M)
        pc[15];          // address of next instruction

    PARTS:
	//// Replace this comment with your code.
}`,D1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/CPU.tst

load CPU.hdl,
compare-to CPU.cmp,
output-list time%S0.4.0 inM%D0.6.0 instruction%B0.16.0 reset%B2.1.2 outM%D1.6.0 writeM%B3.1.3 addressM%D0.5.0 pc%D0.5.0 DRegister[]%D1.6.1;


set instruction %B0011000000111001, // @12345
tick, output, tock, output;

set instruction %B1110110000010000, // D=A
tick, output, tock, output;

set instruction %B0101101110100000, // @23456
tick, output, tock, output;

set instruction %B1110000111010000, // D=A-D
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1110001100001000, // M=D
tick, output, tock, output;

set instruction %B0000001111101001, // @1001
tick, output, tock, output;

set instruction %B1110001110011000, // MD=D-1
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1111010011010000, // D=D-M
set inM 11111,
tick, output, tock, output;

set instruction %B0000000000001110, // @14
tick, output, tock, output;

set instruction %B1110001100000100, // D;jlt
tick, output, tock, output;

set instruction %B0000001111100111, // @999
tick, output, tock, output;

set instruction %B1110110111100000, // A=A+1
tick, output, tock, output;

set instruction %B1110001100001000, // M=D
tick, output, tock, output;

set instruction %B0000000000010101, // @21
tick, output, tock, output;

set instruction %B1110011111000010, // D+1;jeq
tick, output, tock, output;

set instruction %B0000000000000010, // @2
tick, output, tock, output;

set instruction %B1110000010010000, // D=D+A
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1110111010010000, // D=-1
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set instruction %B1110101010010000, // D=0
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set instruction %B1110111111010000, // D=1
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set reset 1;
tick, output, tock, output;

set instruction %B0111111111111111, // @32767
set reset 0;
tick, output, tock, output;`,P1=`|time| inM  |  instruction   |reset| outM  |writeM |addre| pc  |DRegiste|
|0+  |     0|0011000000111001|  0  |*******|   0   |    0|    0|      0 |
|1   |     0|0011000000111001|  0  |*******|   0   |12345|    1|      0 |
|1+  |     0|1110110000010000|  0  |*******|   0   |12345|    1|  12345 |
|2   |     0|1110110000010000|  0  |*******|   0   |12345|    2|  12345 |
|2+  |     0|0101101110100000|  0  |*******|   0   |12345|    2|  12345 |
|3   |     0|0101101110100000|  0  |*******|   0   |23456|    3|  12345 |
|3+  |     0|1110000111010000|  0  |*******|   0   |23456|    3|  11111 |
|4   |     0|1110000111010000|  0  |*******|   0   |23456|    4|  11111 |
|4+  |     0|0000001111101000|  0  |*******|   0   |23456|    4|  11111 |
|5   |     0|0000001111101000|  0  |*******|   0   | 1000|    5|  11111 |
|5+  |     0|1110001100001000|  0  |  11111|   1   | 1000|    5|  11111 |
|6   |     0|1110001100001000|  0  |  11111|   1   | 1000|    6|  11111 |
|6+  |     0|0000001111101001|  0  |*******|   0   | 1000|    6|  11111 |
|7   |     0|0000001111101001|  0  |*******|   0   | 1001|    7|  11111 |
|7+  |     0|1110001110011000|  0  |  11110|   1   | 1001|    7|  11110 |
|8   |     0|1110001110011000|  0  |  11109|   1   | 1001|    8|  11110 |
|8+  |     0|0000001111101000|  0  |*******|   0   | 1001|    8|  11110 |
|9   |     0|0000001111101000|  0  |*******|   0   | 1000|    9|  11110 |
|9+  | 11111|1111010011010000|  0  |*******|   0   | 1000|    9|     -1 |
|10  | 11111|1111010011010000|  0  |*******|   0   | 1000|   10|     -1 |
|10+ | 11111|0000000000001110|  0  |*******|   0   | 1000|   10|     -1 |
|11  | 11111|0000000000001110|  0  |*******|   0   |   14|   11|     -1 |
|11+ | 11111|1110001100000100|  0  |*******|   0   |   14|   11|     -1 |
|12  | 11111|1110001100000100|  0  |*******|   0   |   14|   14|     -1 |
|12+ | 11111|0000001111100111|  0  |*******|   0   |   14|   14|     -1 |
|13  | 11111|0000001111100111|  0  |*******|   0   |  999|   15|     -1 |
|13+ | 11111|1110110111100000|  0  |*******|   0   |  999|   15|     -1 |
|14  | 11111|1110110111100000|  0  |*******|   0   | 1000|   16|     -1 |
|14+ | 11111|1110001100001000|  0  |     -1|   1   | 1000|   16|     -1 |
|15  | 11111|1110001100001000|  0  |     -1|   1   | 1000|   17|     -1 |
|15+ | 11111|0000000000010101|  0  |*******|   0   | 1000|   17|     -1 |
|16  | 11111|0000000000010101|  0  |*******|   0   |   21|   18|     -1 |
|16+ | 11111|1110011111000010|  0  |*******|   0   |   21|   18|     -1 |
|17  | 11111|1110011111000010|  0  |*******|   0   |   21|   21|     -1 |
|17+ | 11111|0000000000000010|  0  |*******|   0   |   21|   21|     -1 |
|18  | 11111|0000000000000010|  0  |*******|   0   |    2|   22|     -1 |
|18+ | 11111|1110000010010000|  0  |*******|   0   |    2|   22|      1 |
|19  | 11111|1110000010010000|  0  |*******|   0   |    2|   23|      1 |
|19+ | 11111|0000001111101000|  0  |*******|   0   |    2|   23|      1 |
|20  | 11111|0000001111101000|  0  |*******|   0   | 1000|   24|      1 |
|20+ | 11111|1110111010010000|  0  |*******|   0   | 1000|   24|     -1 |
|21  | 11111|1110111010010000|  0  |*******|   0   | 1000|   25|     -1 |
|21+ | 11111|1110001100000001|  0  |*******|   0   | 1000|   25|     -1 |
|22  | 11111|1110001100000001|  0  |*******|   0   | 1000|   26|     -1 |
|22+ | 11111|1110001100000010|  0  |*******|   0   | 1000|   26|     -1 |
|23  | 11111|1110001100000010|  0  |*******|   0   | 1000|   27|     -1 |
|23+ | 11111|1110001100000011|  0  |*******|   0   | 1000|   27|     -1 |
|24  | 11111|1110001100000011|  0  |*******|   0   | 1000|   28|     -1 |
|24+ | 11111|1110001100000100|  0  |*******|   0   | 1000|   28|     -1 |
|25  | 11111|1110001100000100|  0  |*******|   0   | 1000| 1000|     -1 |
|25+ | 11111|1110001100000101|  0  |*******|   0   | 1000| 1000|     -1 |
|26  | 11111|1110001100000101|  0  |*******|   0   | 1000| 1000|     -1 |
|26+ | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|     -1 |
|27  | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|     -1 |
|27+ | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|     -1 |
|28  | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|     -1 |
|28+ | 11111|1110101010010000|  0  |*******|   0   | 1000| 1000|      0 |
|29  | 11111|1110101010010000|  0  |*******|   0   | 1000| 1001|      0 |
|29+ | 11111|1110001100000001|  0  |*******|   0   | 1000| 1001|      0 |
|30  | 11111|1110001100000001|  0  |*******|   0   | 1000| 1002|      0 |
|30+ | 11111|1110001100000010|  0  |*******|   0   | 1000| 1002|      0 |
|31  | 11111|1110001100000010|  0  |*******|   0   | 1000| 1000|      0 |
|31+ | 11111|1110001100000011|  0  |*******|   0   | 1000| 1000|      0 |
|32  | 11111|1110001100000011|  0  |*******|   0   | 1000| 1000|      0 |
|32+ | 11111|1110001100000100|  0  |*******|   0   | 1000| 1000|      0 |
|33  | 11111|1110001100000100|  0  |*******|   0   | 1000| 1001|      0 |
|33+ | 11111|1110001100000101|  0  |*******|   0   | 1000| 1001|      0 |
|34  | 11111|1110001100000101|  0  |*******|   0   | 1000| 1002|      0 |
|34+ | 11111|1110001100000110|  0  |*******|   0   | 1000| 1002|      0 |
|35  | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|      0 |
|35+ | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|      0 |
|36  | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|      0 |
|36+ | 11111|1110111111010000|  0  |*******|   0   | 1000| 1000|      1 |
|37  | 11111|1110111111010000|  0  |*******|   0   | 1000| 1001|      1 |
|37+ | 11111|1110001100000001|  0  |*******|   0   | 1000| 1001|      1 |
|38  | 11111|1110001100000001|  0  |*******|   0   | 1000| 1000|      1 |
|38+ | 11111|1110001100000010|  0  |*******|   0   | 1000| 1000|      1 |
|39  | 11111|1110001100000010|  0  |*******|   0   | 1000| 1001|      1 |
|39+ | 11111|1110001100000011|  0  |*******|   0   | 1000| 1001|      1 |
|40  | 11111|1110001100000011|  0  |*******|   0   | 1000| 1000|      1 |
|40+ | 11111|1110001100000100|  0  |*******|   0   | 1000| 1000|      1 |
|41  | 11111|1110001100000100|  0  |*******|   0   | 1000| 1001|      1 |
|41+ | 11111|1110001100000101|  0  |*******|   0   | 1000| 1001|      1 |
|42  | 11111|1110001100000101|  0  |*******|   0   | 1000| 1000|      1 |
|42+ | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|      1 |
|43  | 11111|1110001100000110|  0  |*******|   0   | 1000| 1001|      1 |
|43+ | 11111|1110001100000111|  0  |*******|   0   | 1000| 1001|      1 |
|44  | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|      1 |
|44+ | 11111|1110001100000111|  1  |*******|   0   | 1000| 1000|      1 |
|45  | 11111|1110001100000111|  1  |*******|   0   | 1000|    0|      1 |
|45+ | 11111|0111111111111111|  0  |*******|   0   | 1000|    0|      1 |
|46  | 11111|0111111111111111|  0  |*******|   0   |32767|    1|      1 |`,I1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/CPU-external.tst

load CPU.hdl,
output-list time%S0.4.0 inM%D0.6.0 instruction%B0.16.0 reset%B2.1.2 outM%D1.6.0 writeM%B3.1.3 addressM%D0.5.0 pc%D0.5.0;


set instruction %B0011000000111001, // @12345
tick, output, tock, output;

set instruction %B1110110000010000, // D=A
tick, output, tock, output;

set instruction %B0101101110100000, // @23456
tick, output, tock, output;

set instruction %B1110000111010000, // D=A-D
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1110001100001000, // M=D
tick, output, tock, output;

set instruction %B0000001111101001, // @1001
tick, output, tock, output;

set instruction %B1110001110011000, // MD=D-1
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1111010011010000, // D=D-M
set inM 11111,
tick, output, tock, output;

set instruction %B0000000000001110, // @14
tick, output, tock, output;

set instruction %B1110001100000100, // D;jlt
tick, output, tock, output;

set instruction %B0000001111100111, // @999
tick, output, tock, output;

set instruction %B1110110111100000, // A=A+1
tick, output, tock, output;

set instruction %B1110001100001000, // M=D
tick, output, tock, output;

set instruction %B0000000000010101, // @21
tick, output, tock, output;

set instruction %B1110011111000010, // D+1;jeq
tick, output, tock, output;

set instruction %B0000000000000010, // @2
tick, output, tock, output;

set instruction %B1110000010010000, // D=D+A
tick, output, tock, output;

set instruction %B0000001111101000, // @1000
tick, output, tock, output;

set instruction %B1110111010010000, // D=-1
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set instruction %B1110101010010000, // D=0
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set instruction %B1110111111010000, // D=1
tick, output, tock, output;

set instruction %B1110001100000001, // D;JGT
tick, output, tock, output;

set instruction %B1110001100000010, // D;JEQ
tick, output, tock, output;

set instruction %B1110001100000011, // D;JGE
tick, output, tock, output;

set instruction %B1110001100000100, // D;JLT
tick, output, tock, output;

set instruction %B1110001100000101, // D;JNE
tick, output, tock, output;

set instruction %B1110001100000110, // D;JLE
tick, output, tock, output;

set instruction %B1110001100000111, // D;JMP
tick, output, tock, output;

set reset 1;
tick, output, tock, output;

set instruction %B0111111111111111, // @32767
set reset 0;
tick, output, tock, output;`,F1=`|time| inM  |  instruction   |reset| outM  |writeM |addre| pc  |
|0+  |     0|0011000000111001|  0  |*******|   0   |    0|    0|
|1   |     0|0011000000111001|  0  |*******|   0   |12345|    1|
|1+  |     0|1110110000010000|  0  |*******|   0   |12345|    1|
|2   |     0|1110110000010000|  0  |*******|   0   |12345|    2|
|2+  |     0|0101101110100000|  0  |*******|   0   |12345|    2|
|3   |     0|0101101110100000|  0  |*******|   0   |23456|    3|
|3+  |     0|1110000111010000|  0  |*******|   0   |23456|    3|
|4   |     0|1110000111010000|  0  |*******|   0   |23456|    4|
|4+  |     0|0000001111101000|  0  |*******|   0   |23456|    4|
|5   |     0|0000001111101000|  0  |*******|   0   | 1000|    5|
|5+  |     0|1110001100001000|  0  |  11111|   1   | 1000|    5|
|6   |     0|1110001100001000|  0  |  11111|   1   | 1000|    6|
|6+  |     0|0000001111101001|  0  |*******|   0   | 1000|    6|
|7   |     0|0000001111101001|  0  |*******|   0   | 1001|    7|
|7+  |     0|1110001110011000|  0  |  11110|   1   | 1001|    7|
|8   |     0|1110001110011000|  0  |  11109|   1   | 1001|    8|
|8+  |     0|0000001111101000|  0  |*******|   0   | 1001|    8|
|9   |     0|0000001111101000|  0  |*******|   0   | 1000|    9|
|9+  | 11111|1111010011010000|  0  |*******|   0   | 1000|    9|
|10  | 11111|1111010011010000|  0  |*******|   0   | 1000|   10|
|10+ | 11111|0000000000001110|  0  |*******|   0   | 1000|   10|
|11  | 11111|0000000000001110|  0  |*******|   0   |   14|   11|
|11+ | 11111|1110001100000100|  0  |*******|   0   |   14|   11|
|12  | 11111|1110001100000100|  0  |*******|   0   |   14|   14|
|12+ | 11111|0000001111100111|  0  |*******|   0   |   14|   14|
|13  | 11111|0000001111100111|  0  |*******|   0   |  999|   15|
|13+ | 11111|1110110111100000|  0  |*******|   0   |  999|   15|
|14  | 11111|1110110111100000|  0  |*******|   0   | 1000|   16|
|14+ | 11111|1110001100001000|  0  |     -1|   1   | 1000|   16|
|15  | 11111|1110001100001000|  0  |     -1|   1   | 1000|   17|
|15+ | 11111|0000000000010101|  0  |*******|   0   | 1000|   17|
|16  | 11111|0000000000010101|  0  |*******|   0   |   21|   18|
|16+ | 11111|1110011111000010|  0  |*******|   0   |   21|   18|
|17  | 11111|1110011111000010|  0  |*******|   0   |   21|   21|
|17+ | 11111|0000000000000010|  0  |*******|   0   |   21|   21|
|18  | 11111|0000000000000010|  0  |*******|   0   |    2|   22|
|18+ | 11111|1110000010010000|  0  |*******|   0   |    2|   22|
|19  | 11111|1110000010010000|  0  |*******|   0   |    2|   23|
|19+ | 11111|0000001111101000|  0  |*******|   0   |    2|   23|
|20  | 11111|0000001111101000|  0  |*******|   0   | 1000|   24|
|20+ | 11111|1110111010010000|  0  |*******|   0   | 1000|   24|
|21  | 11111|1110111010010000|  0  |*******|   0   | 1000|   25|
|21+ | 11111|1110001100000001|  0  |*******|   0   | 1000|   25|
|22  | 11111|1110001100000001|  0  |*******|   0   | 1000|   26|
|22+ | 11111|1110001100000010|  0  |*******|   0   | 1000|   26|
|23  | 11111|1110001100000010|  0  |*******|   0   | 1000|   27|
|23+ | 11111|1110001100000011|  0  |*******|   0   | 1000|   27|
|24  | 11111|1110001100000011|  0  |*******|   0   | 1000|   28|
|24+ | 11111|1110001100000100|  0  |*******|   0   | 1000|   28|
|25  | 11111|1110001100000100|  0  |*******|   0   | 1000| 1000|
|25+ | 11111|1110001100000101|  0  |*******|   0   | 1000| 1000|
|26  | 11111|1110001100000101|  0  |*******|   0   | 1000| 1000|
|26+ | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|
|27  | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|
|27+ | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|
|28  | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|
|28+ | 11111|1110101010010000|  0  |*******|   0   | 1000| 1000|
|29  | 11111|1110101010010000|  0  |*******|   0   | 1000| 1001|
|29+ | 11111|1110001100000001|  0  |*******|   0   | 1000| 1001|
|30  | 11111|1110001100000001|  0  |*******|   0   | 1000| 1002|
|30+ | 11111|1110001100000010|  0  |*******|   0   | 1000| 1002|
|31  | 11111|1110001100000010|  0  |*******|   0   | 1000| 1000|
|31+ | 11111|1110001100000011|  0  |*******|   0   | 1000| 1000|
|32  | 11111|1110001100000011|  0  |*******|   0   | 1000| 1000|
|32+ | 11111|1110001100000100|  0  |*******|   0   | 1000| 1000|
|33  | 11111|1110001100000100|  0  |*******|   0   | 1000| 1001|
|33+ | 11111|1110001100000101|  0  |*******|   0   | 1000| 1001|
|34  | 11111|1110001100000101|  0  |*******|   0   | 1000| 1002|
|34+ | 11111|1110001100000110|  0  |*******|   0   | 1000| 1002|
|35  | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|
|35+ | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|
|36  | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|
|36+ | 11111|1110111111010000|  0  |*******|   0   | 1000| 1000|
|37  | 11111|1110111111010000|  0  |*******|   0   | 1000| 1001|
|37+ | 11111|1110001100000001|  0  |*******|   0   | 1000| 1001|
|38  | 11111|1110001100000001|  0  |*******|   0   | 1000| 1000|
|38+ | 11111|1110001100000010|  0  |*******|   0   | 1000| 1000|
|39  | 11111|1110001100000010|  0  |*******|   0   | 1000| 1001|
|39+ | 11111|1110001100000011|  0  |*******|   0   | 1000| 1001|
|40  | 11111|1110001100000011|  0  |*******|   0   | 1000| 1000|
|40+ | 11111|1110001100000100|  0  |*******|   0   | 1000| 1000|
|41  | 11111|1110001100000100|  0  |*******|   0   | 1000| 1001|
|41+ | 11111|1110001100000101|  0  |*******|   0   | 1000| 1001|
|42  | 11111|1110001100000101|  0  |*******|   0   | 1000| 1000|
|42+ | 11111|1110001100000110|  0  |*******|   0   | 1000| 1000|
|43  | 11111|1110001100000110|  0  |*******|   0   | 1000| 1001|
|43+ | 11111|1110001100000111|  0  |*******|   0   | 1000| 1001|
|44  | 11111|1110001100000111|  0  |*******|   0   | 1000| 1000|
|44+ | 11111|1110001100000111|  1  |*******|   0   | 1000| 1000|
|45  | 11111|1110001100000111|  1  |*******|   0   | 1000|    0|
|45+ | 11111|0111111111111111|  0  |*******|   0   | 1000|    0|
|46  | 11111|0111111111111111|  0  |*******|   0   |32767|    1|
`,N1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/Computer.hdl
/**
 * The Hack computer, consisting of CPU, ROM and RAM.
 * When reset = 0, the program stored in the ROM executes.
 * When reset = 1, the program's execution restarts. 
 * Thus, to start running the currently loaded program,
 * set reset to 1, and then set it to 0. 
 * From this point onwards, the user is at the mercy of the software.
 * Depending on the program's code, and whether the code is correct,
 * the screen may show some output, the user may be expected to enter
 * some input using the keyboard, or the program may do some procerssing. 
 */
CHIP Computer {

    IN reset;

    PARTS:
    //// Replace this comment with your code.
}`,E1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/ComputerAdd.tst

// Tests the Computer chip by having it execute the program Add.hack.
// The program adds up the constants 2 and 3 and writes the result in RAM[0]. 

// Tracks the values of the time, reset bit, A-register, D-register,
// program counter, R0, R1, and R2.

load Computer.hdl,
compare-to ComputerAdd.cmp,
output-list time%S1.3.1 reset%B2.1.2 ARegister[0]%D1.7.1 DRegister[0]%D1.7.1 PC[]%D0.4.0 RAM16K[0]%D1.7.1 RAM16K[1]%D1.7.1 RAM16K[2]%D1.7.1;

// Loads the binary program Add.hack into the computer's instruction memory 
ROM32K load Add.hack,
output;

// First run (at the beginning PC=0)
repeat 6 {
    tick, tock, output;
}

// Resets the PC
set reset 1,
set RAM16K[0] 0,
tick, tock, output;

// Second run, to check that the PC was reset correctly.
set reset 0,

repeat 6 {
    tick, tock, output;
}`,z1=`|time |reset|ARegister|DRegister|PC[]|RAM16K[0]|RAM16K[1]|RAM16K[2]|
| 0   |  0  |       0 |       0 |   0|       0 |       0 |       0 |
| 1   |  0  |       2 |       0 |   1|       0 |       0 |       0 |
| 2   |  0  |       2 |       2 |   2|       0 |       0 |       0 |
| 3   |  0  |       3 |       2 |   3|       0 |       0 |       0 |
| 4   |  0  |       3 |       5 |   4|       0 |       0 |       0 |
| 5   |  0  |       0 |       5 |   5|       0 |       0 |       0 |
| 6   |  0  |       0 |       5 |   6|       5 |       0 |       0 |
| 7   |  1  |       0 |       5 |   0|       0 |       0 |       0 |
| 8   |  0  |       2 |       5 |   1|       0 |       0 |       0 |
| 9   |  0  |       2 |       2 |   2|       0 |       0 |       0 |
| 10  |  0  |       3 |       2 |   3|       0 |       0 |       0 |
| 11  |  0  |       3 |       5 |   4|       0 |       0 |       0 |
| 12  |  0  |       0 |       5 |   5|       0 |       0 |       0 |
| 13  |  0  |       0 |       5 |   6|       5 |       0 |       0 |`,$1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/ComputerMax.tst

// Tests the Computer chip by having it execute the program Max.hack.
// The program computes maximum(R0, R1) and writes the result in RAM[2].

// Tracks the values of the time, reset bit, A-register, D-register,
// program counter, R0, R1, and R2.
load Computer.hdl,
compare-to ComputerMax.cmp,
output-list time%S1.3.1 reset%B2.1.2 ARegister[]%D1.7.1 DRegister[]%D1.7.1 PC[]%D0.4.0 RAM16K[0]%D1.7.1 RAM16K[1]%D1.7.1 RAM16K[2]%D1.7.1;

// Loads the binary program Add.hack into the computer's instruction memory 
ROM32K load Max.hack,

// first run: computes max(3,5)
set RAM16K[0] 3,
set RAM16K[1] 5,
output;

repeat 14 {
    tick, tock, output;
}

// resets the PC
set reset 1,
tick, tock, output;

// second run: computes max(23456,12345)
set reset 0,
set RAM16K[0] 23456,
set RAM16K[1] 12345,
output;

// The run on these inputs requires less cycles (different branching)
repeat 10 {
    tick, tock, output;
}
`,j1=`|time |reset|ARegister|DRegister|PC[]|RAM16K[0]|RAM16K[1]|RAM16K[2]|
| 0   |  0  |       0 |       0 |   0|       3 |       5 |       0 |
| 1   |  0  |       0 |       0 |   1|       3 |       5 |       0 |
| 2   |  0  |       0 |       3 |   2|       3 |       5 |       0 |
| 3   |  0  |       1 |       3 |   3|       3 |       5 |       0 |
| 4   |  0  |       1 |      -2 |   4|       3 |       5 |       0 |
| 5   |  0  |      10 |      -2 |   5|       3 |       5 |       0 |
| 6   |  0  |      10 |      -2 |   6|       3 |       5 |       0 |
| 7   |  0  |       1 |      -2 |   7|       3 |       5 |       0 |
| 8   |  0  |       1 |       5 |   8|       3 |       5 |       0 |
| 9   |  0  |      12 |       5 |   9|       3 |       5 |       0 |
| 10  |  0  |      12 |       5 |  12|       3 |       5 |       0 |
| 11  |  0  |       2 |       5 |  13|       3 |       5 |       0 |
| 12  |  0  |       2 |       5 |  14|       3 |       5 |       5 |
| 13  |  0  |      14 |       5 |  15|       3 |       5 |       5 |
| 14  |  0  |      14 |       5 |  14|       3 |       5 |       5 |
| 15  |  1  |      14 |       5 |   0|       3 |       5 |       5 |
| 15  |  0  |      14 |       5 |   0|   23456 |   12345 |       5 |
| 16  |  0  |       0 |       5 |   1|   23456 |   12345 |       5 |
| 17  |  0  |       0 |   23456 |   2|   23456 |   12345 |       5 |
| 18  |  0  |       1 |   23456 |   3|   23456 |   12345 |       5 |
| 19  |  0  |       1 |   11111 |   4|   23456 |   12345 |       5 |
| 20  |  0  |      10 |   11111 |   5|   23456 |   12345 |       5 |
| 21  |  0  |      10 |   11111 |  10|   23456 |   12345 |       5 |
| 22  |  0  |       0 |   11111 |  11|   23456 |   12345 |       5 |
| 23  |  0  |       0 |   23456 |  12|   23456 |   12345 |       5 |
| 24  |  0  |       2 |   23456 |  13|   23456 |   12345 |       5 |
| 25  |  0  |       2 |   23456 |  14|   23456 |   12345 |   23456 |`,O1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/5/ComputerRect.tst

// Tests the Computer chip by having it execute the program Rect.hack.
// The program draws a rectangle of width 16 pixels and length RAM[0]
// at the top left corner of the screen.

// Tracks the values of the time, A-register, D-register, program counter, R0, R1, and R2.
load Computer.hdl,
compare-to ComputerRect.cmp,
output-list time%S1.3.1 ARegister[]%D1.7.1 DRegister[]%D1.7.1 PC[]%D0.4.0 RAM16K[0]%D1.7.1 RAM16K[1]%D1.7.1 RAM16K[2]%D1.7.1;

// Loads the binary program Rect.hack into the computer's instruction memory 
ROM32K load Rect.hack,

echo "Before you run this script, select the 'Screen' option from the 'View' menu";

echo "A small rectangle should be drawn at the top left of the screen (the 'Screen' option of the 'View' menu should be selected.)";

// Draws a rectangle consisting of 4 rows (each 16 pixels wide)
set RAM16K[0] 4,
output;

repeat 63 {
    tick, tock, output;
}`,L1=`|time |ARegister|DRegister|PC[]|RAM16K[0]|RAM16K[1]|RAM16K[2]|
| 0   |       0 |       0 |   0|       4 |       0 |       0 |
| 1   |       0 |       0 |   1|       4 |       0 |       0 |
| 2   |       0 |       4 |   2|       4 |       0 |       0 |
| 3   |      23 |       4 |   3|       4 |       0 |       0 |
| 4   |      23 |       4 |   4|       4 |       0 |       0 |
| 5   |      16 |       4 |   5|       4 |       0 |       0 |
| 6   |      16 |       4 |   6|       4 |       0 |       0 |
| 7   |   16384 |       4 |   7|       4 |       0 |       0 |
| 8   |   16384 |   16384 |   8|       4 |       0 |       0 |
| 9   |      17 |   16384 |   9|       4 |       0 |       0 |
| 10  |      17 |   16384 |  10|       4 |       0 |       0 |
| 11  |      17 |   16384 |  11|       4 |       0 |       0 |
| 12  |   16384 |   16384 |  12|       4 |       0 |       0 |
| 13  |   16384 |   16384 |  13|       4 |       0 |       0 |
| 14  |      17 |   16384 |  14|       4 |       0 |       0 |
| 15  |      17 |   16384 |  15|       4 |       0 |       0 |
| 16  |      32 |   16384 |  16|       4 |       0 |       0 |
| 17  |      32 |   16416 |  17|       4 |       0 |       0 |
| 18  |      17 |   16416 |  18|       4 |       0 |       0 |
| 19  |      17 |   16416 |  19|       4 |       0 |       0 |
| 20  |      16 |   16416 |  20|       4 |       0 |       0 |
| 21  |      16 |       3 |  21|       4 |       0 |       0 |
| 22  |      10 |       3 |  22|       4 |       0 |       0 |
| 23  |      10 |       3 |  10|       4 |       0 |       0 |
| 24  |      17 |       3 |  11|       4 |       0 |       0 |
| 25  |   16416 |       3 |  12|       4 |       0 |       0 |
| 26  |   16416 |       3 |  13|       4 |       0 |       0 |
| 27  |      17 |       3 |  14|       4 |       0 |       0 |
| 28  |      17 |   16416 |  15|       4 |       0 |       0 |
| 29  |      32 |   16416 |  16|       4 |       0 |       0 |
| 30  |      32 |   16448 |  17|       4 |       0 |       0 |
| 31  |      17 |   16448 |  18|       4 |       0 |       0 |
| 32  |      17 |   16448 |  19|       4 |       0 |       0 |
| 33  |      16 |   16448 |  20|       4 |       0 |       0 |
| 34  |      16 |       2 |  21|       4 |       0 |       0 |
| 35  |      10 |       2 |  22|       4 |       0 |       0 |
| 36  |      10 |       2 |  10|       4 |       0 |       0 |
| 37  |      17 |       2 |  11|       4 |       0 |       0 |
| 38  |   16448 |       2 |  12|       4 |       0 |       0 |
| 39  |   16448 |       2 |  13|       4 |       0 |       0 |
| 40  |      17 |       2 |  14|       4 |       0 |       0 |
| 41  |      17 |   16448 |  15|       4 |       0 |       0 |
| 42  |      32 |   16448 |  16|       4 |       0 |       0 |
| 43  |      32 |   16480 |  17|       4 |       0 |       0 |
| 44  |      17 |   16480 |  18|       4 |       0 |       0 |
| 45  |      17 |   16480 |  19|       4 |       0 |       0 |
| 46  |      16 |   16480 |  20|       4 |       0 |       0 |
| 47  |      16 |       1 |  21|       4 |       0 |       0 |
| 48  |      10 |       1 |  22|       4 |       0 |       0 |
| 49  |      10 |       1 |  10|       4 |       0 |       0 |
| 50  |      17 |       1 |  11|       4 |       0 |       0 |
| 51  |   16480 |       1 |  12|       4 |       0 |       0 |
| 52  |   16480 |       1 |  13|       4 |       0 |       0 |
| 53  |      17 |       1 |  14|       4 |       0 |       0 |
| 54  |      17 |   16480 |  15|       4 |       0 |       0 |
| 55  |      32 |   16480 |  16|       4 |       0 |       0 |
| 56  |      32 |   16512 |  17|       4 |       0 |       0 |
| 57  |      17 |   16512 |  18|       4 |       0 |       0 |
| 58  |      17 |   16512 |  19|       4 |       0 |       0 |
| 59  |      16 |   16512 |  20|       4 |       0 |       0 |
| 60  |      16 |       0 |  21|       4 |       0 |       0 |
| 61  |      10 |       0 |  22|       4 |       0 |       0 |
| 62  |      10 |       0 |  23|       4 |       0 |       0 |
| 63  |      23 |       0 |  24|       4 |       0 |       0 |`,U1=`
0000000000000010
1110110000010000
0000000000000011
1110000010010000
0000000000000000
1110001100001000
`,_1=`0000000000000000
1111110000010000
0000000000000001
1111010011010000
0000000000001010
1110001100000001
0000000000000001
1111110000010000
0000000000001100
1110101010000111
0000000000000000
1111110000010000
0000000000000010
1110001100001000
0000000000001110
1110101010000111`,H1=`
0000000000000000
1111110000010000
0000000000010111
1110001100000110
0000000000010000
1110001100001000
0100000000000000
1110110000010000
0000000000010001
1110001100001000
0000000000010001
1111110000100000
1110111010001000
0000000000010001
1111110000010000
0000000000100000
1110000010010000
0000000000010001
1110001100001000
0000000000010000
1111110010011000
0000000000001010
1110001100000001
0000000000010111
1110101010000111`,K1=`// Tests Max.hack on the CPU emulator. Reads inputs from RAM[0] and RAM[1]
// and asserts the maximum lands in RAM[2].

load Max.hack,
compare-to MaxRam.cmp,
output-list RAM[0]%D2.6.2 RAM[1]%D2.6.2 RAM[2]%D2.6.2;

set PC 0,
set RAM[0] 3,
set RAM[1] 5,
set RAM[2] 0;
repeat 14 {
  ticktock;
}
output;

set PC 0,
set RAM[0] 23456,
set RAM[1] 12345,
set RAM[2] 0;
repeat 14 {
  ticktock;
}
output;`,X1=`|  RAM[0]  |  RAM[1]  |  RAM[2]  |
|       3  |       5  |       5  |
|   23456  |   12345  |   23456  |`,V1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/Screen.hdl
/**
 * The Screen (memory map).
 * Same functionality as a 16-bit 8K RAM:
 * If load is asserted, the value of the register selected by
 * address is set to in; Otherwise, the value does not change.
 * The value of the selected register is emitted by out.
 *
 * This built-in implementation has the side effect of continuously 
 * refreshing a visual 256 by 512 black-and-white screen, simulated 
 * by the simulator. Each row in the visual screen is represented 
 * by 32 consecutive 16-bit words, starting at the top left corner 
 * of the visual screen. Thus the pixel at row r from the top and 
 * column c from the left (0<=r<256, 0<=c<512) reflects the c%16 
 * bit (counting from LSB to MSB) of the word found in Screen[r*32+c/16]. 
 */
CHIP Screen {
    IN  in[16],    // what to write
    load,          // write-enable bit
    address[13];   // where to read/write
    OUT out[16];   // Screen value at the given address

    PARTS:
    BUILTIN Screen;
    CLOCKED in, load;
}`,W1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/Keyboard.hdl
/**
 * The keyboard (memory map).
 * Outputs the character code of the currently pressed key,
 * or 0 if no key is pressed.
 *
 * This built-in implementation has a visualization side effect.
 */
CHIP Keyboard {
    OUT out[16];

    PARTS:
    BUILTIN Keyboard;
}`,J1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/DRegister.hdl
/**
 * A 16-bit register named DRegister with the same functionality
 * of the Register chip:
 * If load is asserted, the register's value is set to in;
 * Otherwise, the register maintains its current value.
 * out(t+1) = (load(t), in(t), out(t))
 *
 * This built-in implementation has a visualization side effect.
 */
CHIP DRegister {
    IN  in[16], load;
    OUT out[16];

    PARTS:
    BUILTIN DRegister;
    CLOCKED in, load;
}`,G1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/ARegister.hdl
/**
 * A 16-bit register named ARegister with the same functionality
 * of the Register chip:
 * If load is asserted, the register's value is set to in;
 * Otherwise, the register maintains its current value.
 * out(t+1) = (load(t), in(t), out(t))
 *
 * This built-in implementation has a visualization side effect.
 */
 CHIP ARegister {
    IN  in[16], load;
    OUT out[16];

    PARTS:
    BUILTIN ARegister;
    CLOCKED in, load;
}`,q1=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/05/ROM32K.hdl
/**
 * Read-Only memory (ROM) of 32K registers, each 16-bit wide.
 * Facilitates data read, as follows:
 *     out(t) = ROM32K[address(t)](t)
 * In words: the chip outputs the value stored at the 
 * memory location specified by address.
 *
 * Can be used as the instruction memory of the Hack computer.
 * To that end, the built-in chip implementation supports the handling 
 * of the "ROM32K load Xxx" script command, where Xxx is the name of a
 * text file containing a program written in the binary Hack machine language.
 * When the simulator encounters such a command in a test script,
 * the file's contents is loaded into the simulated ROM32K chip.
 */
 CHIP ROM32K {
    IN  address[15];
    OUT out[16];

    PARTS:
    BUILTIN ROM32K;
}`,c={"Memory.hdl":w1,"Memory.tst":S1,"Memory.cmp":C1,"CPU.hdl":x1,"CPU.tst":D1,"CPU.cmp":P1,"CPU-external.tst":I1,"CPU-external.cmp":F1,"Computer.hdl":N1,"ComputerAdd.tst":E1,"ComputerAdd.cmp":z1,"ComputerMax.tst":$1,"ComputerMax.cmp":j1,"ComputerRect.tst":O1,"ComputerRect.cmp":L1,"MaxRam.tst":K1,"MaxRam.cmp":X1,"Add.hack":U1,"Max.hack":_1,"Rect.hack":H1},Q1={Screen:V1,Keyboard:W1,DRegister:J1,ARegister:G1,ROM32K:q1,RAM16K:y.replace("//// Replace this comment with your code.","BUILTIN RAM16K;")};async function Y1(t){await t.pushd("/projects/05"),await d(t,c),await t.popd()}async function Z1(t){await t.pushd("/projects/05"),await e(t,c,".tst"),await e(t,c,".cmp"),await t.popd()}const tt=Object.freeze(Object.defineProperty({__proto__:null,BUILTIN_CHIPS:Q1,CHIPS:c,resetFiles:Y1,resetTests:Z1},Symbol.toStringTag,{value:"Module"})),et=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/SimpleAdd/SimpleAdd.vm

// Pushes and adds two constants.

push constant 7
push constant 8
add
`,st=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/SimpleAdd/SimpleAddVME.tst

// Tests and illustrates SimpleAdd.vm on the VM simulator.

load SimpleAdd.vm,
compare-to SimpleAdd.cmp,

set RAM[0] 256,  // initializes the stack pointer

repeat 3 {       // SimpleAdd.vm has 3 VM commands
  vmstep;
}

// Outputs the stack pointer and the value at the stack's base
output-list RAM[0]%D2.6.2 RAM[256]%D2.6.2;
output;`,ot=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/SimpleAdd/SimpleAdd.tst

// Tests SimpleAdd.asm on the CPU emulator.

compare-to SimpleAdd.cmp,

set RAM[0] 256,  // initializes the stack pointer 

repeat 60 {      // enough cycles to complete the execution
  ticktock;
}

// Outputs the stack pointer and the value at the stack's base
output-list RAM[0]%D2.6.2 RAM[256]%D2.6.2;
output;
`,ut=`|  RAM[0]  | RAM[256] |
|     257  |      15  |
`,at=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/StackTest/StackTest.vm

// Executes a sequence of arithmetic and logical operations on the stack. 

push constant 17
push constant 17
eq
push constant 17
push constant 16
eq
push constant 16
push constant 17
eq
push constant 892
push constant 891
lt
push constant 891
push constant 892
lt
push constant 891
push constant 891
lt
push constant 32767
push constant 32766
gt
push constant 32766
push constant 32767
gt
push constant 32766
push constant 32766
gt
push constant 57
push constant 31
push constant 53
add
push constant 112
sub
neg
and
push constant 82
or
not
`,dt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/StackTest/StackTestVME.tst

// Tests and illustrates StackTest.vm on the VM simulator.

load StackTest.vm,
compare-to StackTest.cmp,

set RAM[0] 256,  // initializes the stack pointer

repeat 38 {      // StackTest.vm has 38 VM commands
  vmstep;
}

// Outputs the stack pointer (RAM[0]) and the stack contents: RAM[256]-RAM[265]
output-list RAM[0]%D2.6.2 
        RAM[256]%D2.6.2 RAM[257]%D2.6.2 RAM[258]%D2.6.2 RAM[259]%D2.6.2 RAM[260]%D2.6.2;
output;
output-list RAM[261]%D2.6.2 RAM[262]%D2.6.2 RAM[263]%D2.6.2 RAM[264]%D2.6.2 RAM[265]%D2.6.2;
output;
`,it=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/StackArithmetic/StackTest/StackTest.tst

// Tests StackTest.asm on the CPU emulator.

compare-to StackTest.cmp,

set RAM[0] 256,  // initializes the stack pointer

repeat 1000 {    // enough cycles to complete the execution
  ticktock;
}

// Outputs the stack pointer and the stack contents: RAM[256]-RAM[265]
output-list RAM[0]%D2.6.2 
        RAM[256]%D2.6.2 RAM[257]%D2.6.2 RAM[258]%D2.6.2 RAM[259]%D2.6.2 RAM[260]%D2.6.2;
output;
output-list RAM[261]%D2.6.2 RAM[262]%D2.6.2 RAM[263]%D2.6.2 RAM[264]%D2.6.2 RAM[265]%D2.6.2;
output;
`,pt=`|  RAM[0]  | RAM[256] | RAM[257] | RAM[258] | RAM[259] | RAM[260] |
|     266  |      -1  |       0  |       0  |       0  |      -1  |
| RAM[261] | RAM[262] | RAM[263] | RAM[264] | RAM[265] |
|       0  |      -1  |       0  |       0  |     -91  |
`,nt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/BasicTest/BasicTest.vm

// Executes pop and push commands.

push constant 10
pop local 0
push constant 21
push constant 22
pop argument 2
pop argument 1
push constant 36
pop this 6
push constant 42
push constant 45
pop that 5
pop that 2
push constant 510
pop temp 6
push local 0
push that 5
add
push argument 1
sub
push this 6
push this 6
add
sub
push temp 6
add
`,ct=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/BasicTest/BasicTestVME.tst

// Tests and illustrates BasicTest.vm on the VM simulator.
// Starts by setting the stack pointer and the base addresses
// of relevant memory segments to selected RAM addresses.

load BasicTest.vm,
compare-to BasicTest.cmp,

set sp 256,        // stack pointer
set local 300,     // base address of the local segment
set argument 400,  // base address of the argument segment
set this 3000,     // base address of the this segment
set that 3010,     // base address of the that segment

repeat 25 {        // BasicTest.vm has 25 VM commands
  vmstep;
}

// Outputs the value at the stack's base and some values from the tested memory segments
output-list RAM[256]%D1.6.1 RAM[300]%D1.6.1 RAM[401]%D1.6.1 
            RAM[402]%D1.6.1 RAM[3006]%D1.6.1 RAM[3012]%D1.6.1
            RAM[3015]%D1.6.1 RAM[11]%D1.6.1;
output;
`,rt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/BasicTest/BasicTest.tst

// Tests BasicTest.asm on the CPU emulator.

compare-to BasicTest.cmp,

set RAM[0] 256,   // stack pointer
set RAM[1] 300,   // base address of the local segment
set RAM[2] 400,   // base address of the argument segment
set RAM[3] 3000,  // base address of the this segment
set RAM[4] 3010,  // base address of the that segment

repeat 600 {      // enough cycles to complete the execution
  ticktock;
}

// Outputs the value at the stack's base and some values from the tested memory segments
output-list RAM[256]%D1.6.1 RAM[300]%D1.6.1 RAM[401]%D1.6.1 
            RAM[402]%D1.6.1 RAM[3006]%D1.6.1 RAM[3012]%D1.6.1
            RAM[3015]%D1.6.1 RAM[11]%D1.6.1;
output;
`,lt=`|RAM[256]|RAM[300]|RAM[401]|RAM[402]|RAM[3006|RAM[3012|RAM[3015|RAM[11] |
|    472 |     10 |     21 |     22 |     36 |     42 |     45 |    510 |`,kt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/PointerTest/PointerTest.vm

// Executes pop and push commands using the 
// pointer, this, and that segments.

push constant 3030
pop pointer 0
push constant 3040
pop pointer 1
push constant 32
pop this 2
push constant 46
pop that 6
push pointer 0
push pointer 1
add
push this 2
sub
push that 6
add
`,ht=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/PointerTest/PointerTestVME.tst

// Tests and illustrates PointerTest.vm on the VM simulator.

load PointerTest.vm,
compare-to PointerTest.cmp,

set RAM[0] 256,   // initializes the stack pointer

repeat 15 {       // PointerTest.vm has 15 VM commands
  vmstep;
}

// Outputs the stack base, THIS, THAT, and
// some values from the the this and that segments
output-list RAM[256]%D1.6.1 RAM[3]%D1.6.1 RAM[4]%D1.6.1
            RAM[3032]%D1.6.1 RAM[3046]%D1.6.1;
output;
`,mt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/PointerTest/PointerTest.tst

// Tests PointerTest.asm on the CPU emulator.

compare-to PointerTest.cmp,

set RAM[0] 256,   // initializes the stack pointer

repeat 450 {      // enough cycles to complete the execution
  ticktock;
}

// Outputs the value at the stack's base, THIS, THAT, and
// some values from the the this and that segments
output-list RAM[256]%D1.6.1 RAM[3]%D1.6.1 
            RAM[4]%D1.6.1 RAM[3032]%D1.6.1 RAM[3046]%D1.6.1;
output;
`,Bt=`|RAM[256]| RAM[3] | RAM[4] |RAM[3032|RAM[3046|
  |   6084 |   3030 |   3040 |     32 |     46 |`,vt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/StaticTest/StaticTest.vm

// Executes pop and push commands using the static segment.

push constant 111
push constant 333
push constant 888
pop static 8
pop static 3
pop static 1
push static 3
push static 1
sub
push static 8
add
`,Mt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/StaticTest/StaticTestVME.tst

// Tests and illustrates StaticTest.vm on the VM simulator.

load StaticTest.vm,
compare-to StaticTest.cmp,

set sp 256,    // initializes the stack pointer

repeat 11 {    // StaticTest.vm has 11 VM commands
  vmstep;
}

// Outputs the value at the stack's base 
output-list RAM[256]%D1.6.1;
output;
`,yt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/7/MemoryAccess/StaticTest/StaticTest.tst

// Tests StaticTest.asm on the CPU emulator.

compare-to StaticTest.cmp,

set RAM[0] 256,    // initializes the stack pointer

repeat 200 {       // enough cycles to complete the execution
  ticktock;
}

// Outputs the value at the stack's base 
output-list RAM[256]%D1.6.1;
output;
`,ft=`|RAM[256]|
|   1110 |`,u={SimpleAdd:{"SimpleAdd.vm":et,"SimpleAddVME.tst":st,"SimpleAdd.cmp":ut,"SimpleAdd.tst":ot},StackTest:{"StackTest.vm":at,"StackTestVME.tst":dt,"StackTest.cmp":pt,"StackTest.tst":it},BasicTest:{"BasicTest.vm":nt,"BasicTestVME.tst":ct,"BasicTest.cmp":lt,"BasicTest.tst":rt},PointerTest:{"PointerTest.vm":kt,"PointerTestVME.tst":ht,"PointerTest.cmp":Bt,"PointerTest.tst":mt},StaticTest:{"StaticTest.vm":vt,"StaticTestVME.tst":Mt,"StaticTest.cmp":ft,"StaticTest.tst":yt}};async function Rt(t){await t.pushd("/projects/07"),await d(t,u),await t.popd()}async function At(t){await t.pushd("/projects/07"),await e(t,u,".tst"),await e(t,u,"VME.tst"),await e(t,u,".cmp"),await t.popd()}const Tt=Object.freeze(Object.defineProperty({__proto__:null,VMS:u,resetFiles:Rt,resetTests:At},Symbol.toStringTag,{value:"Module"})),bt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/ProgramFlow/BasicLoop/BasicLoop.vm

// Computes the sum 1 + 2 + ... + n and pushes the result onto
// the stack. The value n is given in argument[0], which must be 
// initialized by the caller of this code.

	push constant 0    
	pop local 0         // sum = 0
label LOOP
	push argument 0     
	push local 0
	add
	pop local 0	        // sum = sum + n
	push argument 0
	push constant 1
	sub
	pop argument 0      // n--
	push argument 0
	if-goto LOOP        // if n > 0, goto LOOP
	push local 0        // else, pushes sum to the stack's top
`,gt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/ProgramFlow/BasicLoop/BasicLoopVME.tst

// Tests and illustrates BasicLoop.vm on the VM emulator.
// Before executing the code, initializes the stack pointer
// and the base addresses of the local and argument segments,
// and sets argument[0].

load BasicLoop.vm,
compare-to BasicLoop.cmp,

set sp 256,
set local 300,
set argument 400,
set argument[0] 3,

repeat 33 {
 	vmstep;
}

// Outputs the stack pointer and the value at the stack's base
output-list RAM[0]%D1.6.1 RAM[256]%D1.6.1;
output;
`,wt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/ProgramFlow/BasicLoop/BasicLoop.tst

// Tests BasicLoop.asm on the CPU emulator.
// Before executing the code, initializes the stack pointer
// and the base addresses of the local and argument segments,
// and sets argument[0].

compare-to BasicLoop.cmp,

set RAM[0] 256,  // SP
set RAM[1] 300,  // LCL
set RAM[2] 400,  // ARG
set RAM[400] 3,  // argument 0

repeat 600 {
	ticktock;
}

// Outputs the stack pointer and the value at the stack's base
output-list RAM[0]%D1.6.1 RAM[256]%D1.6.1;
output;
`,St=`| RAM[0] |RAM[256]|
|    257 |      6 |
`,Ct=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/ProgramFlow/FibonacciSeries/FibonacciSeries.vm

// Puts the first n elements of the Fibonacci series in the memory,
// starting at address addr. n and addr are given in argument[0] and
// argument[1], which must be initialized by the caller of this code.

	push argument 1         // sets THAT, the base address of the
	pop pointer 1           // that segment, to argument[1]
	push constant 0         // sets the series' first and second
	pop that 0              // elements to 0 and 1, respectively       
	push constant 1   
	pop that 1              
	push argument 0         // sets n, the number of remaining elements
	push constant 2         // to be computed, to argument[0] minus 2,
	sub                     // since 2 elements were already computed.
	pop argument 0          

label LOOP
	push argument 0
	if-goto COMPUTE_ELEMENT // if n > 0, goto COMPUTE_ELEMENT
	goto END                // otherwise, goto END

label COMPUTE_ELEMENT
    // that[2] = that[0] + that[1]
	push that 0
	push that 1
	add
	pop that 2
	// THAT += 1 (updates the base address of that)
	push pointer 1
	push constant 1
	add
	pop pointer 1 
	// updates n-- and loops          
	push argument 0
	push constant 1
	sub
	pop argument 0          
	goto LOOP

label END
`,xt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/ProgramFlow/FibonacciSeries/FibonacciSeriesVME.tst

// Tests and illustrates FibonacciSeries.vm on the VM emulator.
// Before executing the code, initializes the stack pointer
// and the base addresses of the local and argument segments,
// and sets argument[0] to n and argument [1] to the base address
// of the generated series.

load FibonacciSeries.vm,
compare-to FibonacciSeries.cmp,

set sp 256,
set local 300,
set argument 400,
set argument[0] 6,
set argument[1] 3000,

repeat 73 {
	vmstep;
}

// Outputs the series of values generated and written by the code.
output-list RAM[3000]%D1.6.2 RAM[3001]%D1.6.2 RAM[3002]%D1.6.2 
            RAM[3003]%D1.6.2 RAM[3004]%D1.6.2 RAM[3005]%D1.6.2;
output;
`,Dt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/ProgramFlow/FibonacciSeries/FibonacciSeries.tst

// Tests FibonacciSeries.asm on the CPU emulator.
// Before executing the code, initializes the stack pointer
// and the base addresses of the local and argument segments,
// and sets argument[0] and argument [1].

compare-to FibonacciSeries.cmp,

set RAM[0] 256,    // SP
set RAM[1] 300,    // LCL
set RAM[2] 400,    // ARG
set RAM[400] 6,    // argument[0], n
set RAM[401] 3000, // argument[1], base address of the generated series

repeat 1100 {
	ticktock;
}

// Outputs the series of values generated and written by the code.
output-list RAM[3000]%D1.6.2 RAM[3001]%D1.6.2 RAM[3002]%D1.6.2 
            RAM[3003]%D1.6.2 RAM[3004]%D1.6.2 RAM[3005]%D1.6.2;
output;
`,Pt=`|RAM[3000]|RAM[3001]|RAM[3002]|RAM[3003]|RAM[3004]|RAM[3005]|
|      0  |      1  |      1  |      2  |      3  |      5  |
`,It=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/SimpleFunction/SimpleFunction.vm

// Performs a simple calculation and returns the result.
// argument[0] and argument[1] must be set by the caller.

function SimpleFunction.test 2
	push local 0
	push local 1
	add
	not
	push argument 0
	add
	push argument 1
	sub
	return
`,Ft=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/SimpleFunction/SimpleFunctionVME.tst

// Tests and illustrates SimpleFunction.vm in the VM emulator. 
// Before executing the code, initializes the stack pointer
// and the base addresses of some of the memory segments, 
// and sets some values in the argument segment.

load SimpleFunction.vm,
compare-to SimpleFunction.cmp,

set sp 317,
set local 317,
set argument 310,
set this 3000,
set that 4000,
set argument[0] 1234,
set argument[1] 37,
set argument[2] 9,
set argument[3] 305,
set argument[4] 300,
set argument[5] 3010,
set argument[6] 4010,

repeat 10 {
	vmstep;
}

// Outputs SP, LCL, ARG, THIS, THAT, and the return value.
output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1 
            RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[310]%D1.6.1;
output;
`,Nt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/SimpleFunction/SimpleFunction.tst

// Tests SimpleFunction.asm in the CPU emulator.
// In particular, tests how the assembly implementation of the 'function'
// VM command initializes local variables, and how the assembly implementation
// of the 'return' VM command handles the return value, SP, LCL, ARG, THIS, and THAT. 
// Before executing the code, initializes the stack pointer and the pointers of some
// of the memory segments, and sets some values in the argument segment.

compare-to SimpleFunction.cmp,

set RAM[0] 317,    // SP
set RAM[1] 317,    // LCL
set RAM[2] 310,    // ARG
set RAM[3] 3000,   // THIS
set RAM[4] 4000,   // THAT
set RAM[310] 1234, 
set RAM[311] 37,    
set RAM[312] 1000, 
set RAM[313] 305,
set RAM[314] 300,
set RAM[315] 3010,
set RAM[316] 4010, 

repeat 300 {
	ticktock;
}

// Outputs SP, LCL, ARG, THIS, THAT, and the return value.
output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1 
            RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[310]%D1.6.1;
output;
`,Et=`| RAM[0] | RAM[1] | RAM[2] | RAM[3] | RAM[4] |RAM[310]|
|    311 |    305 |    300 |   3010 |   4010 |   1196 |
`,zt=`// Sys.vm. Tested by the NestedCall test script.
// Consists of three functions: Sys.init, Sys.main, and Sys.add12.

// Calls Sys.main() and stores a return value in temp 1.
// Does not return (enters infinite loop).
// The VM implementation starts running the Sys.init function, by default.
function Sys.init 0
	push constant 4000	// tests that THIS and THAT are handled correctly
	pop pointer 0
	push constant 5000
	pop pointer 1
	call Sys.main 0
	pop temp 1
	label LOOP
	goto LOOP

// Sets locals 1, 2 and 3 to some values. Leaves locals 0 and 4 unchanged, 
// to test that the 'function' VM command initializes them to 0 (the test 
// script sets them to -1 before this code starts running).
// Calls Sys.add12(123) and stores the return value (should be 135) in temp 0.
// Returns local 0 + local 1 + local 2 + local 3 + local 4 (should be 456), to 
// confirm that locals were not mangled by the function call.
function Sys.main 5
	push constant 4001
	pop pointer 0
	push constant 5001
	pop pointer 1
	push constant 200
	pop local 1
	push constant 40
	pop local 2
	push constant 6
	pop local 3
	push constant 123
	call Sys.add12 1
	pop temp 0
	push local 0
	push local 1
	push local 2
	push local 3
	push local 4
	add
	add
	add
	add
	return

// Returns (argument 0) + 12.
function Sys.add12 0
	push constant 4002
	pop pointer 0
	push constant 5002
	pop pointer 1
	push argument 0
	push constant 12
	add
	return
`,$t=`// Tests and illustrates how the VM implementation handles function-call-and-return,
// by executing the functions in Sys.vm in the VM emulator.
// In particular, loads and runs the functions in Sys.vm.

load Sys.vm,
compare-to NestedCall.cmp,
output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1 RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[5]%D1.6.1 RAM[6]%D1.6.1;

set RAM[0] 261,
set RAM[1] 261,
set RAM[2] 256,
set RAM[3] -3,
set RAM[4] -4,
set RAM[5] -1, // test results
set RAM[6] -1,
set RAM[256] 1234, // fake stack frame from call Sys.init
set RAM[257] -1,
set RAM[258] -2,
set RAM[259] -3,
set RAM[260] -4,

set RAM[261] -1, // Initialize stack to check for local segment
set RAM[262] -1, // being cleared to zero.
set RAM[263] -1,
set RAM[264] -1,
set RAM[265] -1,
set RAM[266] -1,
set RAM[267] -1,
set RAM[268] -1,
set RAM[269] -1,
set RAM[270] -1,
set RAM[271] -1,
set RAM[272] -1,
set RAM[273] -1,
set RAM[274] -1,
set RAM[275] -1,
set RAM[276] -1,
set RAM[277] -1,
set RAM[278] -1,
set RAM[279] -1,
set RAM[280] -1,
set RAM[281] -1,
set RAM[282] -1,
set RAM[283] -1,
set RAM[284] -1,
set RAM[285] -1,
set RAM[286] -1,
set RAM[287] -1,
set RAM[288] -1,
set RAM[289] -1,
set RAM[290] -1,
set RAM[291] -1,
set RAM[292] -1,
set RAM[293] -1,
set RAM[294] -1,
set RAM[295] -1,
set RAM[296] -1,
set RAM[297] -1,
set RAM[298] -1,
set RAM[299] -1,

set sp 261,
set local 261,
set argument 256,
set this 3000,
set that 4000;

repeat 50 {
	vmstep;
}
output;
`,jt=`// Tests how the VM implementation handles function-call-and-return,
// by executing the functions in Sys.vm.
// In particular, loads and runs NestedCall.asm, which results when 
// the VM translator is applied to the NestedCall folder, which 
// includes only one VM file: Sys.vm.

compare-to NestedCall.cmp,

set RAM[0] 261,
set RAM[1] 261,
set RAM[2] 256,
set RAM[3] -3,
set RAM[4] -4,
set RAM[5] -1,     // test results
set RAM[6] -1,
set RAM[256] 1234, // fake stack frame from call Sys.init
set RAM[257] -1,
set RAM[258] -2,
set RAM[259] -3,
set RAM[260] -4,

set RAM[261] -1,   // Initializes the stack, to check that the local segment
set RAM[262] -1,   // is initialized to zeros by the 'function' VM command.
set RAM[263] -1,
set RAM[264] -1,
set RAM[265] -1,
set RAM[266] -1,
set RAM[267] -1,
set RAM[268] -1,
set RAM[269] -1,
set RAM[270] -1,
set RAM[271] -1,
set RAM[272] -1,
set RAM[273] -1,
set RAM[274] -1,
set RAM[275] -1,
set RAM[276] -1,
set RAM[277] -1,
set RAM[278] -1,
set RAM[279] -1,
set RAM[280] -1,
set RAM[281] -1,
set RAM[282] -1,
set RAM[283] -1,
set RAM[284] -1,
set RAM[285] -1,
set RAM[286] -1,
set RAM[287] -1,
set RAM[288] -1,
set RAM[289] -1,
set RAM[290] -1,
set RAM[291] -1,
set RAM[292] -1,
set RAM[293] -1,
set RAM[294] -1,
set RAM[295] -1,
set RAM[296] -1,
set RAM[297] -1,
set RAM[298] -1,
set RAM[299] -1,

repeat 4000 {
	ticktock;
}

output-list RAM[0]%D1.6.1 RAM[1]%D1.6.1 RAM[2]%D1.6.1 RAM[3]%D1.6.1 RAM[4]%D1.6.1 RAM[5]%D1.6.1 RAM[6]%D1.6.1;
output;
`,Ot=`| RAM[0] | RAM[1] | RAM[2] | RAM[3] | RAM[4] | RAM[5] | RAM[6] |
|    261 |    261 |    256 |   4000 |   5000 |    135 |    246 |
`,Lt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/FibonacciElement/Main.vm

// Contains one function: Main.fibonacci.

// Computes the n'th element of the Fibonacci series, recursively.
// n is given in argument[0]. Called by the Sys.init function 
// (part of the Sys.vm file), which sets argument[0] to an input
// value and then calls Main.fibonacci.
function Main.fibonacci 0
	push argument 0
	push constant 2
	lt                     
	if-goto N_LT_2        
	goto N_GE_2
label N_LT_2               // if n < 2 returns n
	push argument 0        
	return
label N_GE_2               // if n >= 2 returns fib(n - 2) + fib(n - 1)
	push argument 0
	push constant 2
	sub
	call Main.fibonacci 1  // computes fib(n - 2)
	push argument 0
	push constant 1
	sub
	call Main.fibonacci 1  // computes fib(n - 1)
	add                    // returns fib(n - 1) + fib(n - 2)
	return
`,Ut=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/FibonacciElement/Sys.vm

// Containts one function: Sys.init.

// Pushes a constant n onto the stack, and calls the Main.fibonacii
// function, which computes the n'th element of the Fibonacci series.
// Note that by convention, the Sys.init function is called "automatically" 
// by the bootstrap code generated by the VM translator.
function Sys.init 0
    // Computes fibonacci(4)
	push constant 4
	// Calls the function, informing that one argument was pushed onto the stack
	call Main.fibonacci 1
label END  
	goto END  // loops infinitely`,_t=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/FibonacciElement/FibonacciElementVME.tst

// Tests and illustrates the given Fibonacci element program on the VM emulator.

load,
compare-to FibonacciElement.cmp,

set sp 261,

repeat 110 {
  vmstep;
}

// Outputs the stack pointer and the value at the stack's base.
// That's where the implementation should put the return value.  
output-list RAM[0]%D1.6.1 RAM[261]%D1.6.1;
output;
`,Ht=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/FibonacciElement/FibonacciElement.tst

// Tests FibonacciElement.asm on the CPU emulator. 
// FibonacciElement.asm results from translating Main.vm and Sys.vm into
// a single assembly program, stored in the file FibonacciElement.asm.

compare-to FibonacciElement.cmp,

repeat 6000 {
	ticktock;
}

// Outputs the stack pointer and the value at the stack's base.
// That's where the implementation should put the return value.
output-list RAM[0]%D1.6.1 RAM[261]%D1.6.1;
output;
`,Kt=`| RAM[0] |RAM[261]|
|    262 |      3 |
`,Xt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/StaticsTest/Class1.vm

// Stores two supplied arguments in static[0] and static[1].
function Class1.set 0
	push argument 0
	pop static 0
	push argument 1
	pop static 1
	push constant 0
	return

// Returns static[0] - static[1].
function Class1.get 0
	push static 0
	push static 1
	sub
	return`,Vt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/StaticsTest/Class2.vm

// Stores two supplied arguments in static[0] and static[1].
function Class2.set 0
	push argument 0
	pop static 0
	push argument 1
	pop static 1
	push constant 0
	return

// Returns static[0] - static[1].
function Class2.get 0
	push static 0
	push static 1
	sub
	return`,Wt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/StaticsTest/Sys.vm

// Tests that different functions, stored in two different 
// class files, manipulate the static segment correctly. 

function Sys.init 0
	push constant 6
	push constant 8
	call Class1.set 2
	pop temp 0 // dumps the return value
	push constant 23
	push constant 15
	call Class2.set 2
	pop temp 0 // dumps the return value
	call Class1.get 0
	call Class2.get 0
label END
	goto END`,Jt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/StaticsTest/StaticsTestVME.tst

// Tests and illustrates the statics test on the VM emulator.

load,
compare-to StaticsTest.cmp,

set sp 261,

repeat 36 {
	vmstep;
}

output-list RAM[0]%D1.6.1 RAM[261]%D1.6.1 RAM[262]%D1.6.1;
output;
`,Gt=`// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/8/FunctionCalls/StaticsTest/StaticsTest.tst

// Tests StaticTest.asm in the CPU emulator.
// This assembly file results from translating the staticsTest folder.

compare-to StaticsTest.cmp,

set RAM[0] 256,

repeat 2500 {
	ticktock;
}

output-list RAM[0]%D1.6.1 RAM[261]%D1.6.1 RAM[262]%D1.6.1;
output;
`,qt=`| RAM[0] |RAM[261]|RAM[262]|
|    263 |     -2 |      8 |
`,a={BasicLoop:{"BasicLoop.vm":bt,"BasicLoopVME.tst":gt,"BasicLoop.cmp":St,"BasicLoop.tst":wt},FibonacciSeries:{"FibonacciSeries.vm":Ct,"FibonacciSeriesVME.tst":xt,"FibonacciSeries.cmp":Pt,"FibonacciSeries.tst":Dt},SimpleFunction:{"SimpleFunction.vm":It,"SimpleFunctionVME.tst":Ft,"SimpleFunction.cmp":Et,"SimpleFunction.tst":Nt},NestedCall:{"Sys.vm":zt,"NestedCallVME.tst":$t,"NestedCall.cmp":Ot,"NestedCall.tst":jt},FibonacciElement:{"Sys.vm":Ut,"Main.vm":Lt,"FibonacciElementVME.tst":_t,"FibonacciElement.cmp":Kt,"FibonacciElement.tst":Ht},StaticsTest:{"Class1.vm":Xt,"Class2.vm":Vt,"Sys.vm":Wt,"StaticsTestVME.tst":Jt,"StaticsTest.cmp":qt,"StaticsTest.tst":Gt}};async function Qt(t){await t.pushd("/projects/08"),await d(t,a),await t.popd()}async function Yt(t){await t.pushd("/projects/08"),await e(t,a,".tst"),await e(t,a,"VME.tst"),await e(t,a,".cmp"),await t.popd()}const Zt=Object.freeze(Object.defineProperty({__proto__:null,VMS:a,resetFiles:Qt,resetTests:Yt},Symbol.toStringTag,{value:"Module"})),v={1:f0,2:U0,3:m1,4:g1,5:tt,6:R,7:Tt,8:Zt},f=Object.keys(v),te={1:i,2:p,3:n,4:k,5:c,6:A,7:u,8:a},oe=async(t,o=f)=>{for(const s of o)await v[s].resetFiles(t)},ue=async(t,o=f)=>{for(const s of o)await v[s].resetTests(t)},ae=async t=>{await M(t,te,"/",!1)};({...i,...p,...n,...c,...u,...a});export{f as ProjectIDs,v as Projects,ae as createFiles,oe as resetFiles,ue as resetTests};
