import{aj as t}from"./index-Dx4IQRAd.js";const l="// REDACTED",s=`CHIP And {
    IN a, b;
    OUT out;

    PARTS:
    Nand(a=a, b=b, out=x);
    Not(in=x, out=out);
}`,u="// REDACTED",d="// REDACTED",n="// REDACTED",e="// REDACTED",A="// REDACTED",c=`CHIP And16 {
    IN a[16], b[16];
    OUT out[16];

    PARTS:
    And (a=a[0],  b=b[0],  out=out[0]);
    And (a=a[1],  b=b[1],  out=out[1]);
    And (a=a[2],  b=b[2],  out=out[2]);
    And (a=a[3],  b=b[3],  out=out[3]);
    And (a=a[4],  b=b[4],  out=out[4]);
    And (a=a[5],  b=b[5],  out=out[5]);
    And (a=a[6],  b=b[6],  out=out[6]);
    And (a=a[7],  b=b[7],  out=out[7]);
    And (a=a[8],  b=b[8],  out=out[8]);
    And (a=a[9],  b=b[9],  out=out[9]);
    And (a=a[10], b=b[10], out=out[10]);
    And (a=a[11], b=b[11], out=out[11]);
    And (a=a[12], b=b[12], out=out[12]);
    And (a=a[13], b=b[13], out=out[13]);
    And (a=a[14], b=b[14], out=out[14]);
    And (a=a[15], b=b[15], out=out[15]);
}`,D="// REDACTED",b="// REDACTED",E="// REDACTED",i=`CHIP Mux8Way16 {
    IN a[16], b[16], c[16], d[16],
       e[16], f[16], g[16], h[16],
       sel[3];
    OUT out[16];

    PARTS:
    // Binary tree of 2-way multiplexors
    Mux16 (a=a,    b=b,    sel=sel[0], out=ab);
    Mux16 (a=c,    b=d,    sel=sel[0], out=cd);
    Mux16 (a=e,    b=f,    sel=sel[0], out=ef);
    Mux16 (a=g,    b=h,    sel=sel[0], out=gh);
    Mux16 (a=ab,   b=cd,   sel=sel[1], out=abcd);
    Mux16 (a=ef,   b=gh,   sel=sel[1], out=efgh);
    Mux16 (a=abcd, b=efgh, sel=sel[2], out=out);


// Alternate implementation
//
// This implementation replaces the upper two layers of the
// tree with 4-way multiplexors.
/*
    Mux4Way16 (a=a, b=b, c=c, d=d, sel=sel[0..1], out=abcd);
    Mux4Way16 (a=e, b=f, c=g, d=h, sel=sel[0..1], out=efgh);
    Mux16     (a=abcd, b=efgh, sel=sel[2], out=out);
*/

// Alternate implementation
//
// Some students make a Mux8Way chip and apply it 16 times as in Not16.
}`,h="// REDACTED",R="// REDACTED",r="// REDACTED",M={Not:{"Not.hdl":l},And:{"And.hdl":s},Or:{"Or.hdl":u},XOr:{"XOr.hdl":d},Mux:{"Mux.hdl":n},DMux:{"DMux.hdl":e},Not16:{"Not16.hdl":A},And16:{"And16.hdl":c},Or16:{"Or16.hdl":D},Mux16:{"Mux16.hdl":b},Mux4Way16:{"Mux4Way16.hdl":E},Mux8Way16:{"Mux8Way16.hdl":i},DMux4Way:{"DMux4Way.hdl":h},DMux8Way:{"DMux8Way.hdl":R},Or8Way:{"Or8Way.hdl":r}};async function $(o){await o.pushd("/projects/01"),await t(o,M),await o.popd()}const C="// REDACTED",T="// REDACTED",x="// REDACTED",p="// REDACTED",y="// REDACTED",m="// REDACTED",w={HalfAdder:{"HalfAdder.hdl":C},FullAdder:{"FullAdder.hdl":T},Add16:{"Add16.hdl":x},Inc16:{"Inc16.hdl":p},AluNoStat:{"AluNoStat.hdl":y},ALU:{"ALU.hdl":m}};async function O(o){await o.pushd("/projects/02"),await t(o,w),await o.popd()}const S=`CHIP Bit {
    IN in, load;
    OUT out;

    PARTS:
    
    Mux (a=dffOut, b=in, sel=load, out=muxOut);
    DFF (in=muxOut, out=dffOut, out=out);
}`,f="// REDACTED",W="// REDACTED",N="// REDACTED",g="// REDACTED",P="// REDACTED",I="// REDACTED",U="// REDACTED",j={Bit:{"Bit.hdl":S},Register:{"Register.hdl":f},PC:{"PC.hdl":W},RAM8:{"RAM8.hdl":N},RAM64:{"RAM64.hdl":g},RAM512:{"RAM512.hdl":P},RAM4k:{"RAM4k.hdl":I},RAM16k:{"RAM16k.hdl":U}};async function k(o){await o.pushd("/projects/03"),await t(o,j),await o.popd()}const H="// REDACTED",L="// REDACTED",B="// REDACTED",F={Memory:{"Memory.hdl":H},CPU:{"CPU.hdl":L},Computer:{"Computer.hdl":B}};async function X(o){await o.pushd("/projects/05"),await t(o,F),await o.popd()}let a=!1;const v=async o=>{a||(a=!0,await $(o),await O(o),await k(o),await X(o),a=!1)};export{v as loadSolutions};
