import{aj as o}from"./index-Dx4IQRAd.js";import{F as t}from"./index-CIO6JW3G.js";const e=`// TickTock forever

// Uncomment for a sample progam. Can use any program name in /samples
// ROM32K load Max.hack;

// Uncomment to manually write a program.
// set ROM32K[0] %X4000;
// set ROM32K[1] %XF3C8; // M=-1

repeat {
  tick, tock;
}`,m={"TickTock.tst":e};async function n(a){await a.pushd("/samples"),await o(a,m),await o(a,t),await a.popd()}export{n as loadSamples};
