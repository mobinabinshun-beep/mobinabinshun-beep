"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync("nu-interaction-core.js","utf8");
function harness(){
 const listeners=new Map(),records=[];
 const target={nodeType:1,tagName:"BUTTON",id:"gateway-option",textContent:"Profile",value:"profile",
  getAttribute(name){return name==="aria-label"?"Profile":null;},closest(){return this;}};
 class CustomEvent{constructor(type,options){this.type=type;this.detail=options&&options.detail;}}
 const win={document:{},CustomEvent,addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);},
  dispatchEvent(event){records.push(event);for(const fn of listeners.get(event.type)||[])fn(event);return true;}};
 vm.runInNewContext(source,{window:win,globalThis:win,Date,JSON,String,Array,Map});
 return {win,target,core:win.NUInteractionCore,emit(type,props={}){const event={type,target,...props};for(const fn of listeners.get(type)||[])fn(event);return event;},records};
}
test("core exposes independent direct mouse, touch, selective and virtual translators",()=>{
 const h=harness();const t=h.core.translators;
 assert.equal(t.mouse.mode,"direct");assert.equal(t.touch.mode,"direct");
 assert.equal(t.selective.mode,"semantic");assert.equal(t.simulatedMouse.mode,"virtual");
});
test("physical mouse and touch are normalized without conflating sources",()=>{
 const h=harness(),seen=[];h.core.on("interaction",r=>seen.push(r));
 h.emit("pointerdown",{pointerType:"mouse",button:0});
 h.emit("pointermove",{pointerType:"mouse",clientX:120,clientY:80});
 h.emit("pointerdown",{pointerType:"touch",pointerId:4});
 h.emit("pointermove",{pointerType:"touch",pointerId:4,clientX:20,clientY:30});
 h.emit("pointerup",{pointerType:"touch",pointerId:4});
 assert.ok(seen.some(r=>r.source==="physical-mouse"&&r.action==="hover"));
 assert.ok(seen.some(r=>r.source==="physical-mouse"&&r.action==="press"));
 assert.ok(seen.some(r=>r.source==="direct-touch"&&r.action==="move"));
 assert.ok(seen.some(r=>r.source==="direct-touch"&&r.action==="activate"));
});
test("selective click and select events produce semantic actions",()=>{
 const h=harness(),seen=[];h.core.on("interaction",r=>seen.push(r));
 h.emit("click",{detail:1});h.emit("change",{});
 assert.ok(seen.some(r=>r.action==="activate"&&r.source==="selective-click"));
 assert.ok(seen.some(r=>r.action==="select"&&r.source==="selective-control"));
});
test("virtual mouse and Gateway hierarchy events enter the shared debug ledger",()=>{
 const h=harness(),seen=[];h.core.on("interaction",r=>seen.push(r));
 h.emit("nu:simulated-pointer-move",{detail:{x:428,y:300}});
 h.emit("nu:gateway-direction",{detail:{x:0,y:1}});
 h.emit("nu:gateway-confirm",{detail:{}});
 assert.deepEqual(seen.map(r=>r.action),["move","navigate","confirm"]);
 assert.equal(JSON.parse(h.core.exportReport()).schema,"nu-interaction-debug/v1");
});
test("instrumentation is bounded and caller errors cannot break interaction dispatch",()=>{
 const h=harness();h.core.on("interaction",()=>{throw new Error("observer failure");});
 for(let i=0;i<260;i++)h.core.record("execute","test",h.target,{index:i});
 assert.equal(h.core.snapshot().length,240);
});
