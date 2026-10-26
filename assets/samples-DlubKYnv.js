import{ft as e}from"./index-CGSl8cOI.js";import{t}from"./project_06-DM9oJKk6.js";var n={"TickTock.tst":`// TickTock forever

// Uncomment for a sample progam. Can use any program name in /samples
// ROM32K load Max.hack;

// Uncomment to manually write a program.
// set ROM32K[0] %X4000;
// set ROM32K[1] %XF3C8; // M=-1

repeat {
  tick, tock;
}`};async function r(r){await r.pushd(`/samples`),await e(r,n),await e(r,t),await r.popd()}export{r as loadSamples};