"use strict";(self.webpackChunk_nand2tetris_web=self.webpackChunk_nand2tetris_web||[]).push([[744],{5178:(e,t,s)=>{s.r(t),s.d(t,{CPU:()=>x,default:()=>j});var n=s(1391),a=s(1091),r=s(7437),c=s(64),i=s(4668),o=s(8878),d=s(9646),l=s(7022),u=s(910),m=s(8029),p=s(3600),h=s(5168),f=s(9267),g=s(782);const x=()=>{const{filePicker:e}=(0,o.useContext)(m.BR),{setTool:t,stores:s}=(0,o.useContext)(p.NQ),{state:x,actions:j,dispatch:y}=s.cpu,{fs:C}=(0,o.useContext)(u.L),[S,v]=(0,d.b)(x.test.tst),[F,k]=(0,d.b)(x.test.out),[w,b]=(0,d.b)(x.test.cmp),[A,P]=(0,o.useState)(0);(0,o.useEffect)((()=>{t("cpu")}),[t]),(0,o.useEffect)((()=>{j.compileTest(S,w),j.reset()}),[S,w]);const R=(0,o.useRef)(),M=(0,o.useRef)(),[N,T]=(0,o.useState)(!1);(0,o.useEffect)((()=>(R.current=new class extends a.M{async tick(){return j.tick(),!1}finishFrame(){y.current({action:"update"})}reset(){j.reset()}toggle(){y.current({action:"update"})}},M.current=new class extends a.M{async tick(){return j.testStep()}finishFrame(){y.current({action:"update"})}reset(){j.reset()}toggle(){y.current({action:"update"})}},T(!0),()=>{var e,t;null===(e=R.current)||void 0===e||e.stop(),null===(t=M.current)||void 0===t||t.stop()})),[j,y]);return(0,g.jsxs)("div",{className:"Page CpuPage grid "+(2==x.config.screenScale?"large-screen":"normal"),children:[(0,g.jsx)(c.Ay,{name:"ROM",memory:x.sim.ROM,highlight:x.sim.PC,format:x.config.romFormat,fileSelect:async()=>{var t;const s=await e.selectAllowLocal({suffix:[".asm",".hack"]}),n="string"==typeof s?null!==(t=s.split("/").pop())&&void 0!==t?t:"":s.name;var a;return y.current({action:"setTitle",payload:n}),"string"===typeof s?((async e=>{j.setPath(e),j.reset()})(s),{name:null!==(a=s.split("/").pop())&&void 0!==a?a:"",content:await C.readFile(s)}):(j.clearTest(),s)},onSetFormat:e=>{y.current({action:"updateConfig",payload:{romFormat:e}})}}),(0,g.jsx)(c.Ay,{name:"RAM",memory:x.sim.RAM,format:x.config.ramFormat,excludedFormats:["asm"],onChange:()=>{P(A+1)},onSetFormat:e=>{y.current({action:"updateConfig",payload:{ramFormat:e}})}}),(0,g.jsxs)(h.Z,{className:"IO",header:(0,g.jsx)(g.Fragment,{children:(0,g.jsx)("div",{className:"flex-1",children:N&&R.current&&(0,g.jsx)(l.T,{runner:R.current,speed:x.config.speed,onSpeedChange:e=>{y.current({action:"updateConfig",payload:{speed:e}})}})})}),children:[(0,g.jsx)(i.f,{memory:x.sim.Screen,showScaleControls:!0,scale:x.config.screenScale,onScale:e=>{y.current({action:"updateConfig",payload:{screenScale:e}})}},A),(0,g.jsx)(r.s,{update:()=>{y.current({action:"update"})},keyboard:x.sim.Keyboard}),(0,g.jsx)(h.p,{summary:(0,g.jsx)(n.x6,{id:"rdShiY"}),open:!0,children:(0,g.jsx)("main",{children:(0,g.jsx)("div",{children:(0,g.jsxs)("dl",{children:[(0,g.jsx)("dt",{children:"PC"}),(0,g.jsx)("dd",{children:x.sim.PC}),(0,g.jsx)("dt",{children:"A"}),(0,g.jsx)("dd",{children:x.sim.A}),(0,g.jsx)("dt",{children:"D"}),(0,g.jsx)("dd",{children:x.sim.D})]})})})})]}),N&&(0,g.jsx)(f.B,{runner:M,tst:[S,v,x.test.highlight],out:[F,k],cmp:[w,b],tstName:x.test.name,disabled:!x.test.valid,showName:x.tests.length<2,speed:x.config.testSpeed,onSpeedChange:e=>{y.current({action:"updateConfig",payload:{testSpeed:e}}),j.setAnimate(e<=2)},prefix:x.tests.length>1?(0,g.jsx)("select",{value:x.test.name,onChange:({target:{value:e}})=>{j.loadTest(e)},"data-testid":"test-picker",children:x.tests.map((e=>(0,g.jsx)("option",{value:e,children:e},e)))}):(0,g.jsx)(g.Fragment,{})})]})},j=x}}]);