"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync("nu-controller-pointer.js","utf8");

function harness(){
 const listeners=new Map(),frames=new Map(),targetEvents=[];
 let nextFrame=1,pads=[];
 const makeElement=()=>({
  style:{},className:"",attributes:{},children:[],tagName:"DIV",id:"",
  classList:{values:new Set(),add(v){this.values.add(v);},remove(v){this.values.delete(v);}},
  setAttribute(k,v){this.attributes[k]=v;},
  appendChild(child){this.children.push(child);},
  remove(){},
  dispatchEvent(event){targetEvents.push(event.type);return true;}
 });
 const target=makeElement();target.id="target";
 const document={
  head:makeElement(),body:makeElement(),
  createElement(){return makeElement();},
  elementFromPoint(){return target;}
 };
 class TestEvent{
  constructor(type,options){this.type=type;Object.assign(this,options||{});this.isTrusted=false;}
 }
 const window={
  document,innerWidth:800,innerHeight:600,navigator:{getGamepads(){return pads;}},
  Event:TestEvent,CustomEvent:TestEvent,PointerEvent:TestEvent,MouseEvent:TestEvent,
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},
  removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
  dispatchEvent(event){for(const fn of listeners.get(event.type)||[])fn(event);return true;},
  requestAnimationFrame(fn){const id=nextFrame++;frames.set(id,fn);return id;},
  cancelAnimationFrame(id){frames.delete(id);}
 };
 vm.runInNewContext(source,{window,globalThis:window,Math,Number,Array,Object,String});
 return {
  window,adapter:window.NUControllerPointer,target,targetEvents,frames,
  dispatch(type,detail){window.dispatchEvent(new TestEvent(type,{detail}));},
  setPads(value){pads=value;},
  runFrame(time){const entry=frames.entries().next().value;if(!entry)return false;frames.delete(entry[0]);entry[1](time);return true;}
 };
}

test("Click-controller starts the shared simulated pointer without a Gamepad device",()=>{
 const h=harness();
 assert.equal(h.adapter.isEnabled(),false);
 assert.equal(h.adapter.startClickController(),true);
 assert.equal(h.adapter.isEnabled(),true);
 assert.equal(h.adapter.getState().x,400);
 assert.equal(h.adapter.getState().y,300);
 h.adapter.destroy();
});

test("Directional click moves the virtual cursor in discrete 28px steps and updates the real target",()=>{
 const h=harness();
 h.adapter.startClickController();
 const before=h.adapter.getState();
 assert.equal(h.adapter.move(1,0),true);
 const after=h.adapter.getState();
 assert.equal(after.x,before.x+28);
 assert.equal(after.y,before.y);
 assert.ok(h.targetEvents.includes("pointermove"));
 assert.ok(h.target.classList.values.has("nu-simulated-mouse-target"));
 h.adapter.destroy();
});

test("External click-controller direction events move the cursor outside Gateway",()=>{
 const h=harness();
 h.adapter.startClickController();
 const before=h.adapter.getState();
 h.dispatch("nu:controller-direction",{dx:0,dy:1});
 assert.equal(h.adapter.getState().x,before.x);
 assert.equal(h.adapter.getState().y,before.y+28);
 h.adapter.destroy();
});

test("Gateway navigation owns directional input and blocks virtual-pointer movement",()=>{
 const h=harness();
 h.adapter.startClickController();
 const before=h.adapter.getState();
 const seen=[];
 h.window.addEventListener("nu:gateway-direction",e=>seen.push(e.detail));
 h.window.addEventListener("nu:gateway-confirm",e=>seen.push({confirm:true,source:e.detail.source}));
 h.window.addEventListener("nu:gateway-cancel",e=>seen.push({cancel:true,source:e.detail.source}));
 h.adapter.setGatewayNavigation(true);
 assert.equal(h.adapter.move(1,0),false);
 h.dispatch("nu:controller-direction",{dx:0,dy:1});
 h.dispatch("nu:controller-confirm",{});
 h.dispatch("nu:controller-cancel",{});
 assert.deepEqual({x:h.adapter.getState().x,y:h.adapter.getState().y},{x:before.x,y:before.y});
 assert.deepEqual(seen.map(x=>x.dy||x.confirm&&"confirm"||x.cancel&&"cancel"),[1,"confirm","cancel"]);
 h.adapter.setGatewayNavigation(false);
 h.adapter.destroy();
});

test("Virtual mouse confirmation dispatches exactly one pointer click at the current target",()=>{
 const h=harness();
 h.adapter.startClickController();
 h.adapter.move(1,0);
 assert.equal(h.adapter.click(),true);
 assert.equal(h.targetEvents.filter(x=>x==="pointerdown").length,1);
 assert.equal(h.targetEvents.filter(x=>x==="pointerup").length,1);
 assert.equal(h.targetEvents.filter(x=>x==="click").length,1);
 h.adapter.destroy();
});

test("Gamepad uses hierarchical Gateway events while the Gateway owns navigation",()=>{
 const h=harness();
 const buttons=Array.from({length:16},()=>({pressed:false}));
 const pad={index:0,connected:true,buttons,axes:[0,0]};
 h.setPads([pad]);
 const seen=[];
 h.window.addEventListener("nu:gateway-direction",e=>seen.push(["direction",e.detail.dy]));
 h.window.addEventListener("nu:gateway-confirm",()=>seen.push(["confirm"]));
 h.window.addEventListener("nu:gateway-cancel",()=>seen.push(["cancel"]));
 h.adapter.setGatewayNavigation(true);
 h.runFrame(0); // Prime held-state detection; do not act on an already-held button.
 buttons[13].pressed=true;h.runFrame(200);
 buttons[13].pressed=false;buttons[0].pressed=true;h.runFrame(400);
 buttons[0].pressed=false;buttons[1].pressed=true;h.runFrame(600);
 assert.deepEqual(seen,[["direction",1],["confirm"],["cancel"]]);
 h.adapter.setGatewayNavigation(false);
 h.adapter.destroy();
});
