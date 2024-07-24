"use strict";(globalThis.webpackChunk_nand2tetris_web=globalThis.webpackChunk_nand2tetris_web||[]).push([[598],{6598:(e,l,a)=>{a.r(l),a.d(l,{Compiler:()=>g,default:()=>b});var t=a(6458),s=a(8256),n=a(4544),i=a(910),o=a(1916),r=a(8878),d=a(8330),c=a(3508),u=a(2675),h=a(1384),x=a(8029),m=a(3600),v=a(5168),j=a(3499),p=a(782);const g=()=>{const{setStatus:e}=(0,r.useContext)(i.L),{tracking:l}=(0,r.useContext)(x.BR),{stores:a,setTool:g}=(0,r.useContext)(m.NQ),{state:b,dispatch:C,actions:k}=a.compiler,[N,w]=(0,r.useState)(0),[S,E]=(0,r.useState)(!1),T=(0,r.useRef)(null);(0,r.useEffect)((()=>{g("compiler")}),[g]);(0,r.useEffect)((()=>{S||(()=>{const l=b.compiled[b.selected];var a,t;l&&e(l.valid?"":null!==(a=null===(t=l.error)||void 0===t?void 0:t.message)&&void 0!==a?a:"")})()}),[b.selected,b.files,S]);const _=(0,r.useCallback)((e=>{C.current({action:"setSelected",payload:e}),l.trackEvent("tab","change",e)}),[l]);(0,r.useEffect)((()=>{w(Object.keys(b.files).indexOf(b.selected))}),[b.selected]);const F=(0,c.s)(),R=(0,p.jsx)(y,{title:"Create New File",buttonText:"Create",dialog:F,isValid:e=>{var l;return null!==(l=(null===e||void 0===e?void 0:e.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/))&&!Object.keys(b.files).includes(e))&&void 0!==l&&l},onExit:async e=>{e&&(await k.writeFile(e),_(e),E(!1))}});return(0,p.jsxs)("div",{className:"Page CompilerPage grid",children:[(0,p.jsx)(d.N_,{ref:T,to:j.Ay.vm.href,style:{display:"none"}}),R,(0,p.jsx)(v.Z,{className:"code",header:(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)("div",{children:(0,p.jsx)(t.x6,{id:"wdxz7K"})}),(0,p.jsxs)("div",{className:"flex row flex-1",children:[(0,p.jsx)("button",{"data-tooltip":s.Ru._({id:"FZeS2z"}),"data-placement":"right",className:"flex-0",onClick:async()=>{const l=await(0,o.EH)(),a=new n.Q2(new o.Ik(l));C.current({action:"setTitle",payload:`${l.name} / *.jack`});0==(await a.scandir("/")).filter((e=>e.isFile()&&e.name.endsWith(".jack"))).length?(e("No .jack files in the selected folder"),E(!0)):(e(""),E(!1)),k.loadProject(a)},children:"\ud83d\udcc2"}),(0,p.jsx)(f,{}),(0,p.jsx)("button",{"data-tooltip":s.Ru._({id:"oXeVWH"}),"data-placement":"right",className:"flex-0",onClick:()=>{b.fs?F.open():e("No project folder loaded")},children:"+"}),(0,p.jsx)(f,{}),(0,p.jsx)("button",{className:"flex-0","data-tooltip":"Compile all the opened Jack files","data-placement":"bottom",onClick:()=>{b.isValid&&(k.compile(),e("Compiled successfully"))},disabled:!b.isValid,children:"Compile"}),(0,p.jsx)(f,{}),(0,p.jsx)("button",{className:"flex-0",disabled:!b.isCompiled,"data-tooltip":s.Ru._({id:"1/5eLk"}),"data-placement":"bottom",onClick:()=>{var e;b.title&&a.vm.dispatch.current({action:"setTitle",payload:b.title.replace(".jack",".vm")}),a.vm.actions.loadVm((()=>{const e=[];for(const a of Object.keys(b.files)){var l;let t=null!==(l=b.compiled[a].vm)&&void 0!==l?l:"";t=`// Compiled ${a}.jack:\n`.concat(t),e.push({name:a,content:t})}return e})()),null===(e=T.current)||void 0===e||e.click()},children:"Run"})]})]}),children:(0,p.jsx)(h.w,{tabIndex:{value:N,set:w},children:Object.keys(b.files).map((e=>(0,p.jsx)(h.o,{title:`${e}.jack`,onSelect:()=>_(e),style:{backgroundColor:b.compiled[e].valid?void 0:"#ffaaaa"},children:(0,p.jsx)(u.K,{value:b.files[e],onChange:l=>{k.writeFile(e,l)},error:b.compiled[e].error,language:"jack"})},e)))})})]})},b=g;function f(){return(0,p.jsx)("div",{style:{width:"0.25vw"}})}const y=({title:e,buttonText:l,dialog:a,isValid:s,onExit:n})=>{const[i,o]=(0,r.useState)();return(0,p.jsx)("dialog",{open:a.isOpen,children:(0,p.jsxs)("article",{children:[(0,p.jsxs)("header",{children:[(0,p.jsx)(t.x6,{id:"pDgeaz",values:{title:e}}),(0,p.jsx)("a",{className:"close",href:"#root",onClick:e=>{e.preventDefault(),n(),a.close()}})]}),(0,p.jsxs)("main",{children:[(0,p.jsxs)("div",{className:"flex row",children:[(0,p.jsx)("input",{value:i,onChange:e=>o(e.target.value)}),(0,p.jsx)("span",{children:".jack"})]}),(0,p.jsx)("button",{disabled:!s(null!==i&&void 0!==i?i:""),onClick:()=>{a.close(),o(""),n(i)},children:l})]})]})})}},2675:(e,l,a)=>{a.d(l,{K:()=>c});var t=a(6458),s=a(8878),n=a(8029),i=a(782);const o=(0,s.lazy)((()=>Promise.all([a.e(983),a.e(535),a.e(965)]).then(a.bind(a,8965)))),r=({error:e})=>e?(0,i.jsxs)("details",{className:"ErrorPanel",open:!0,children:[(0,i.jsx)("summary",{role:"button",className:"secondary",children:(0,i.jsx)(t.x6,{id:"1tSpqV"})}),(0,i.jsx)("pre",{children:(0,i.jsx)("code",{children:null===e||void 0===e?void 0:e.message})})]}):(0,i.jsx)(i.Fragment,{}),d=({value:e,onChange:l,language:a,disabled:t=!1})=>{const[n,o]=(0,s.useState)(e);return(0,i.jsx)("textarea",{"data-testid":`editor-${a}`,disabled:t,value:n,onChange:e=>{var a;const t=null===(a=e.target)||void 0===a?void 0:a.value;o(t),l(t)}})},c=({className:e="",style:l={},disabled:a=!1,value:t,error:c,onChange:u,onCursorPositionChange:h,grammar:x,language:m,highlight:v,highlightType:j="highlight",customDecorations:p=[],dynamicHeight:g=!1,alwaysRecenter:b=!0,lineNumberTransform:f})=>{const{monaco:y}=(0,s.useContext)(n.BR);return(0,i.jsx)("div",{className:`Editor ${g?"dynamic-height":""} ${e}`,style:l,children:y.canUse&&y.wants?(0,i.jsx)(s.Suspense,{fallback:"Loading...",children:(0,i.jsx)(o,{value:t,onChange:u,onCursorPositionChange:h,language:m,error:c,disabled:a,highlight:v,highlightType:j,customDecorations:p,dynamicHeight:g,alwaysRecenter:b,lineNumberTransform:f})}):(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(d,{value:t,onChange:u,language:m,disabled:a}),(0,i.jsx)(r,{error:c})]})})}},5168:(e,l,a)=>{a.d(l,{p:()=>n,Z:()=>s});var t=a(782);const s=e=>{var l;return(0,t.jsxs)("article",{className:["panel",null!==(l=e.className)&&void 0!==l?l:"",e.isEditorPanel?"editor":""].join(" "),children:[e.header&&(0,t.jsx)("header",{children:e.header}),(0,t.jsx)("main",{children:e.children}),e.footer&&(0,t.jsx)("footer",{children:e.footer})]})},n=e=>{var l;return(0,t.jsxs)("details",{className:null!==(l=e.className)&&void 0!==l?l:"",open:e.open,style:e.style,children:[(0,t.jsx)("summary",{children:(0,t.jsx)("div",{className:"flex row align-baseline",children:e.summary})}),e.children]})}},1384:(e,l,a)=>{a.d(l,{o:()=>n,w:()=>i});var t=a(8878),s=a(782);const n=e=>{const l=(0,t.useId)(),a=`tab-${l}`,n=`panel-${l}`;return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("div",{role:"tab",id:a,"aria-controls":n,style:e.style,children:(0,s.jsxs)("label",{children:[e.title,(0,s.jsx)("input",{type:"radio",name:e.parent,"aria-controls":n,value:a,checked:e.checked,onChange:l=>{var a;return 1==l.target.checked&&(null===(a=e.onSelect)||void 0===a?void 0:a.call(e))}})]})}),(0,s.jsx)("div",{role:"tabpanel",id:n,"aria-labelledby":a,children:e.children})]})},i=e=>{var l,a,n,i;const o=(0,t.useId)(),[r,d]=(0,t.useState)(0),c=null!==(l=null===(a=e.tabIndex)||void 0===a?void 0:a.value)&&void 0!==l?l:r,u=null!==(n=null===(i=e.tabIndex)||void 0===i?void 0:i.set)&&void 0!==n?n:d;return(0,s.jsx)("section",{role:"tablist",style:{"--tab-count":e.children.length},children:t.Children.map(e.children,((e,l)=>(0,t.cloneElement)(e,{checked:l===c,parent:o,idx:l,onSelect:()=>{var a,t;u(l),null===(a=e.props)||void 0===a||null===(t=a.onSelect)||void 0===t||t.call(a)}})))})}}}]);