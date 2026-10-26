import{ft as e}from"./index-CGSl8cOI.js";var t={Not:{"Not.hdl":`// REDACTED`},And:{"And.hdl":`CHIP And {
    IN a, b;
    OUT out;

    PARTS:
    Nand(a=a, b=b, out=x);
    Not(in=x, out=out);
}`},Or:{"Or.hdl":`// REDACTED`},XOr:{"XOr.hdl":`// REDACTED`},Mux:{"Mux.hdl":`// REDACTED`},DMux:{"DMux.hdl":`// REDACTED`},Not16:{"Not16.hdl":`// REDACTED`},And16:{"And16.hdl":`CHIP And16 {
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
}`},Or16:{"Or16.hdl":`// REDACTED`},Mux16:{"Mux16.hdl":`// REDACTED`},Mux4Way16:{"Mux4Way16.hdl":`// REDACTED`},Mux8Way16:{"Mux8Way16.hdl":`CHIP Mux8Way16 {
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
}`},DMux4Way:{"DMux4Way.hdl":`// REDACTED`},DMux8Way:{"DMux8Way.hdl":`// REDACTED`},Or8Way:{"Or8Way.hdl":`// REDACTED`}};async function n(n){await n.pushd(`/projects/01`),await e(n,t),await n.popd()}var r={HalfAdder:{"HalfAdder.hdl":`// REDACTED`},FullAdder:{"FullAdder.hdl":`// REDACTED`},Add16:{"Add16.hdl":`// REDACTED`},Inc16:{"Inc16.hdl":`// REDACTED`},AluNoStat:{"AluNoStat.hdl":`// REDACTED`},ALU:{"ALU.hdl":`// REDACTED`}};async function i(t){await t.pushd(`/projects/02`),await e(t,r),await t.popd()}var a={Bit:{"Bit.hdl":`CHIP Bit {
    IN in, load;
    OUT out;

    PARTS:
    
    Mux (a=dffOut, b=in, sel=load, out=muxOut);
    DFF (in=muxOut, out=dffOut, out=out);
}`},Register:{"Register.hdl":`// REDACTED`},PC:{"PC.hdl":`// REDACTED`},RAM8:{"RAM8.hdl":`// REDACTED`},RAM64:{"RAM64.hdl":`// REDACTED`},RAM512:{"RAM512.hdl":`// REDACTED`},RAM4k:{"RAM4k.hdl":`// REDACTED`},RAM16k:{"RAM16k.hdl":`// REDACTED`}};async function o(t){await t.pushd(`/projects/03`),await e(t,a),await t.popd()}var s={Memory:{"Memory.hdl":`// REDACTED`},CPU:{"CPU.hdl":`// REDACTED`},Computer:{"Computer.hdl":`// REDACTED`}};async function c(t){await t.pushd(`/projects/05`),await e(t,s),await t.popd()}var l=!1,u=async e=>{l||=(l=!0,await n(e),await i(e),await o(e),await c(e),!1)};export{u as loadSolutions};