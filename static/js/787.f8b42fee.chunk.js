"use strict";(self.webpackChunk_nand2tetris_web=self.webpackChunk_nand2tetris_web||[]).push([[787],{7737:(e,t,s)=>{s.r(t),s.d(t,{Chip:()=>_,default:()=>M});var n=s(1391),i=s(8256),r=s(8878),a=s(782),l=s(7761),c=s(6980),o=s(2331),d=s(836),u=s(9651),x=s(8739),h=s(7721),p=s(3180);const m=({A:e,op:t,D:s,out:n,flag:i})=>(0,a.jsxs)("div",{className:"alu",children:[(0,a.jsx)("span",{children:"ALU"}),(0,a.jsxs)("svg",{width:"250",height:"250",version:"1.1",children:[(0,a.jsx)("defs",{children:(0,a.jsx)("rect",{x:"34.442518",y:"54.335354",width:"0.91770717",height:"20.780869"})}),(0,a.jsxs)("g",{children:[(0,a.jsx)("polygon",{points:"70,10 180,85 180,165 70,240 70,135 90,125 70,115",stroke:"#000",fill:"#6D97AB"}),(0,a.jsx)("text",{xmlSpace:"preserve",textAnchor:"middle",y:"61",x:"35",fill:"#000000",children:e}),(0,a.jsx)("text",{xmlSpace:"preserve",textAnchor:"middle",y:"176",x:"35",fill:"#000000",children:s}),(0,a.jsx)("text",{xmlSpace:"preserve",textAnchor:"middle",y:"121",x:"207",fill:"#000000",children:n}),(0,a.jsx)("text",{xmlSpace:"preserve",y:"130.50002",x:"110.393929",fill:"#ffffff",fontSize:24,children:x._0.op[t]??"(??)"}),(0,a.jsxs)("g",{children:[(0,a.jsx)("path",{stroke:"black",d:"M 6,67.52217 H 68.675994"}),(0,a.jsx)("path",{stroke:"black",d:"M 68.479388,67.746136 60.290279,61.90711"}),(0,a.jsx)("path",{stroke:"black",d:"m 68.479388,67.40711 -8.189109,5.839026"})]}),(0,a.jsxs)("g",{transform:"translate(0,115.5)",children:[(0,a.jsx)("path",{stroke:"black",d:"M 6,67.52217 H 68.675994"}),(0,a.jsx)("path",{d:"M 68.479388,67.746136 60.290279,61.90711",stroke:"black"}),(0,a.jsx)("path",{stroke:"black",d:"m 68.479388,67.40711 -8.189109,5.839026"})]}),(0,a.jsxs)("g",{transform:"translate(176,57.5)",children:[(0,a.jsx)("path",{stroke:"black",d:"M 6,67.52217 H 68.675994"}),(0,a.jsx)("path",{stroke:"black",d:"M 68.479388,67.746136 60.290279,61.90711"}),(0,a.jsx)("path",{stroke:"black",d:"m 68.479388,67.40711 -8.189109,5.839026"})]})]})]})]});var j=s(7437),f=s(64),g=s(6537),v=s(4668);function b(e){return(0,a.jsx)(f.ce,{name:e.name,memory:e.memory,format:e instanceof l.N4?"asm":"dec",highlight:e.address,count:5})}function k(e,t,s){if(e instanceof c.Hs)return(0,a.jsx)(m,{A:e.in("x").busVoltage,op:e.op(),D:e.in("y").busVoltage,out:e.out().busVoltage,flag:e.out("zr").voltage()===u.RY?x.iI.Zero:e.out("ng").voltage()===u.RY?x.iI.Negative:x.iI.Positive});if(e instanceof o.UZ)return(0,a.jsx)(g.d,{name:e.name??`Chip ${e.id}`,bits:e.bits});if(e instanceof o.PC)return(0,a.jsx)(g.d,{name:"PC",bits:e.bits});if(e instanceof l.s3)return(0,a.jsx)(j.s,{keyboard:e,update:t});if(e instanceof l.ff)return(0,a.jsx)(v.f,{memory:e.memory});if(e instanceof d.XK)return b(e);if(e instanceof d.Z4)return(0,a.jsxs)("span",{children:["RAM ",e.width]});if(e instanceof l.Z8){const t=(0,h.D4)(e.in("instruction").busVoltage);return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(g.d,{name:"A",bits:e.state.A}),(0,a.jsx)(g.d,{name:"D",bits:e.state.D}),(0,a.jsx)(g.d,{name:"PC",bits:e.state.PC}),(0,a.jsx)(m,{A:t.am?e.in("inM").busVoltage:e.state.A,D:e.state.D,out:e.state.ALU,op:t.op,flag:e.state.flag})]})}if(e instanceof l.Sc)return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(g.d,{name:"A",bits:e.cpu.state.A}),(0,a.jsx)(g.d,{name:"D",bits:e.cpu.state.D}),(0,a.jsx)(g.d,{name:"PC",bits:e.cpu.state.PC}),!s?.has(p.XC)&&(0,a.jsx)(v.f,{memory:e.ram.screen.memory}),b(e.rom),b(e.ram.ram)]});const n=[...e.parts].map((e=>k(e,t))).filter((e=>void 0!==e));return n.length>0?(0,a.jsx)(a.Fragment,{children:n}):void 0}var y=s(6513),C=s(7490),w=s(9646),P=s(910),A=s(5005),N=s(1091),E=s(9267),F=s(8029),R=s(3600),S=s(2675),D=s(5168),O=s(3569);const _=()=>{const{setStatus:e}=(0,r.useContext)(P.L),{stores:t,setTool:s}=(0,r.useContext)(R.NQ),{tracking:l}=(0,r.useContext)(F.BR),{state:c,actions:o,dispatch:d}=t.chip,[u,x]=(0,w.b)(c.files.hdl),[h,m]=(0,w.b)(c.files.tst),[j,f]=(0,w.b)(c.files.cmp),[g,v]=(0,w.b)(c.files.out);(0,r.useEffect)((()=>{s("chip")}),[s]),(0,r.useEffect)((()=>{l.trackPage("/chip")}),[l]),(0,r.useEffect)((()=>{l.trackEvent("action","setProject",c.controls.project),l.trackEvent("action","setChip",c.controls.chipName)}),[]);const b=(0,r.useCallback)((e=>{o.setProject(e),l.trackEvent("action","setProject",e)}),[o,l]),_=(0,r.useCallback)((e=>{o.setChip(e),l.trackEvent("action","setChip",e),X.reset()}),[o,l]),M=(0,r.useCallback)((()=>{o.eval(),l.trackEvent("action","eval")}),[o,l]),H=(0,r.useRef)((()=>{}));H.current=async(e={})=>{var t,s,n;const i=I||c.controls.builtinOnly?e.hdl:null!==(t=e.hdl)&&void 0!==t?t:u;await o.updateFiles({hdl:i,tst:null!==(s=e.tst)&&void 0!==s?s:h,cmp:null!==(n=e.cmp)&&void 0!==n?n:j})},(0,r.useEffect)((()=>{H.current({tst:h,cmp:j}),o.reset()}),[h,j]);const L=(0,r.useRef)();(0,r.useEffect)((()=>(L.current=new class extends N.M{async reset(){await H.current(),await o.reset()}finishFrame(){super.finishFrame(),d.current({action:"updateTestStep"})}async tick(){return await o.stepTest()}toggle(){d.current({action:"updateTestStep"})}},()=>{var e;null===(e=L.current)||void 0===e||e.stop()})),[H,o,d]);const B=(0,r.useMemo)((()=>({toggle(){o.clock(),l.trackEvent("action","toggleClock")},reset(){l.trackEvent("action","resetClock"),o.reset()}})),[o]),Z=(0,r.useRef)(null),[I,V]=(0,r.useState)(!1),$=(0,a.jsx)(a.Fragment,{children:(0,a.jsxs)("fieldset",{role:"group",children:[(0,a.jsx)("select",{value:c.controls.project,onChange:({target:{value:e}})=>{b(e)},"data-testid":"project-picker",children:p.NY.map((([e,t])=>(0,a.jsx)("option",{value:e,children:t},e)))}),(0,a.jsx)("select",{value:c.controls.chipName,onChange:({target:{value:e}})=>{_(e)},"data-testid":"chip-picker",children:c.controls.chips.map((e=>(0,a.jsx)("option",{value:e,style:(0,p.GH)(c.controls.project,e)?{color:"var(--light-grey)"}:{},children:`${e} ${(0,p.GH)(c.controls.project,e)?"(given)":""}`},e)))}),(0,a.jsx)("a",{ref:Z,style:{display:"none"}}),(0,a.jsx)("button",{className:"flex-0",onClick:async()=>{if(!Z.current)return;const e=await o.getProjectFiles(),t=await(0,O.y)(e);Z.current.href=t,Z.current.download=`${c.controls.project}`,Z.current.click(),URL.revokeObjectURL(t)},disabled:c.controls.builtinOnly,"data-tooltip":i.Ru._({id:"Ovrln6"}),"data-placement":"left",children:"\u2b07\ufe0f"})]})}),T=(0,a.jsx)(D.Z,{className:"_hdl_panel",isEditorPanel:!0,header:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("div",{tabIndex:0,children:"HDL"}),(0,a.jsx)("fieldset",{children:(0,a.jsxs)("label",{children:[(0,a.jsx)("input",{type:"checkbox",role:"switch",checked:!!c.controls.builtinOnly||I,onChange:()=>{I?(V(!1),o.useBuiltin(!1)):(V(!0),o.useBuiltin(!0,u)),X.reset()},disabled:c.controls.builtinOnly}),(0,a.jsx)(n.x6,{id:"++LBSt"})]})}),$]}),children:(0,a.jsx)(S.K,{className:"flex-1",value:u,error:c.controls.error,onChange:async e=>{x(e),I||await o.saveChip(e),H.current(I||c.controls.builtinOnly?{}:{hdl:e})},grammar:A.xP.parser,language:"hdl",disabled:I||c.controls.builtinOnly})}),[U,J]=(0,r.useState)(!0),K=()=>{e(i.Ru._({id:"Ow/xRO"}))},z=()=>{c.sim.invalid?K():M()},G=(0,a.jsxs)("fieldset",{role:"group",children:[(0,a.jsx)("button",{onClick:z,onKeyDown:z,disabled:!c.sim.pending||!U,children:(0,a.jsx)(n.x6,{id:"J3L683"})}),(0,a.jsx)("button",{onClick:()=>{c.sim.invalid?K():B.reset()},style:{maxWidth:"initial"},disabled:!c.sim.clocked,children:(0,a.jsx)(n.x6,{id:"OfhWJH"})}),(0,a.jsxs)("button",{onClick:()=>{c.sim.invalid?K():B.toggle()},style:{minWidth:"7em",textAlign:"start"},disabled:!c.sim.clocked,children:[(0,a.jsx)(n.x6,{id:"3rHyAJ"}),":","\xa0",(0,a.jsx)(y.wr,{})]})]}),W=function(e,t,s){return[...e.parts].map(((e,n)=>[`${e.id}_${n}`,k(e,t,s)])).filter((([e,t])=>void 0!==t))}({parts:c.sim.chip},(()=>{d.current({action:"updateChip"})}),c.controls.visualizationParameters),X=new C.wG,Y=(0,a.jsx)(D.Z,{className:"_parts_panel",header:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)("div",{children:[(0,a.jsx)(n.x6,{id:"C7rK3y"})," ",c.controls.chipName]}),G]}),children:c.sim.invalid?(0,a.jsx)(n.x6,{id:"RFMyN+"}):(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(C.ZB.Provider,{value:X,children:(0,a.jsx)(C.vl,{sim:c.sim,toggle:o.toggle,setInputValid:J,hideInternal:c.controls.builtinOnly||I})}),W.length>0&&(0,a.jsx)(D.p,{summary:(0,a.jsx)(n.x6,{id:"q3JCcX"}),open:!0,children:(0,a.jsx)("main",{children:W.map((([e,t])=>t))})})]})}),q=(0,a.jsx)(E.B,{runner:L,disabled:c.sim.invalid,showLoad:!1,prefix:c.controls.tests.length>1?(0,a.jsx)("select",{value:c.controls.testName,onChange:({target:{value:e}})=>{o.setTest(e)},"data-testid":"test-picker",children:c.controls.tests.map((e=>(0,a.jsx)("option",{value:e,children:e},e)))}):(0,a.jsx)(a.Fragment,{}),tst:[h,m,c.controls.span],cmp:[j,f],out:[g,v],speed:c.config.speed,onSpeedChange:e=>{d.current({action:"updateConfig",payload:{speed:e}})}});return(0,a.jsxs)("div",{className:"Page ChipPage grid",children:[T,Y,q]})},M=_}}]);