import{aj as o}from"./index-DgRGIFm2.js";import{F as t}from"./index-DOoSrD0E.js";const e=`// TickTock forever

// Uncomment for a sample progam. Can use any program name in /samples
// ROM32K load Max.hack;

// Uncomment to manually write a program.
// set ROM32K[0] %X4000;
// set ROM32K[1] %XF3C8; // M=-1

repeat {
  tick, tock;
}`,m={"TickTock.tst":e};async function n(a){await a.pushd("/samples"),await o(a,m),await o(a,t),await a.popd()}export{n as loadSamples};
