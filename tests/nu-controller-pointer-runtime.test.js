"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync("nu-controller-pointer.js","utf8");

function harness(){
 const listeners=new Map(),frames=new Map();
 let nextFrame=1;
 const target={classList:{add(){},remove(){}}};
 const makeElement=()=>({
  style:{},className:"",attributes:{},children:[],
  classList:{add(){},remove(){}},
  setAttribute(k,v){this.attributes[k]=v;},
  appendChild(child){this.children.push(child);},
  remove(){},
  dispatchEvent(){return true;}
 });
 const document={
  head:makeElement(),body:makeElement(),
  createElement(){return makeElement();},
  elementFromPoint(){return target;},
  dispatchEvent(){return true;}
 };
 class CustomEvent{constructor(type,options){this.type=type;this.detail=options&&options.detail;}}
 const window={
  document,innerWidth:800,innerHeight:600,navigator:{getGamepads(){return [];}},
  CustomEvent,MouseEvent:CustomEvent,PointerEvent:CustomEvent,
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},
  removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
  dispatchEvent(event){for(const fn of listeners.get(event.type)||[])fn(event);return true;},
  requestAnimationFrame(fn){const id=nextFrame++;frames.set(id,fn);return id;},
  cancelAnimationFrame(id){frames.delete(id);}
 };
 vm.runInNewContext(source,{window,globalThis:window,Math,Number,Array,Object,String});
 return {window,adapter:window.NUControllerPointer,dispatch(type,detail){window.dispatchEvent(new CustomEvent(type,{detail}));}};
}

test("Click-controller starts the simulated cursor without requiring a connected Gamepad API device",()=>{
 const h=harness();
 assert.equal(h.adapter.isEnabled(),false);
 h.adapter.startClickController();
 assert.equal(h.adapter.isEnabled(),true);
 assert.equal(h.adapter.getState().x,400);
 assert.equal(h.adapter.getState().y,300);
 h.adapter.destroy();
});

test("Click-controller direction moves the virtual pointer and reports the new position",()=>{
 const h=harness();
 h.adapter.startClickController();
 const before=h.adapter.getState();
 const moved=h.adapter.move(1,0);
 const after=h.adapter.getState();
 assert.equal(moved,true);
 assert.equal(after.x,before.x+28);
 assert.equal(after.y,before.y);
 h.adapter.destroy();
});

test("Directional events from the click-controller translator move the pointer",()=>{
 const h=harness();
 h.adapter.startClickController();
 const before=h.adapter.getState();
 h.dispatch("nu:controller-direction",{dx:0,dy:1});
 const after=h.adapter.getState();
 assert.equal(after.x,before.x);
 assert.equal(after.y,before.y+28);
 h.adapter.destroy();
});

test("Gateway list navigation keeps ownership and blocks pointer movement until navigation exits",()=>{
 const h=harness();
 h.adapter.startClickController();
 const before=h.adapter.getState();
 h.adapter.setGatewayNavigation(true);
 assert.equal(h.adapter.move(1,0),false);
 assert.deepEqual({x:h.adapter.getState().x,y:h.adapter.getState().y},{x:before.x,y:before.y});
 h.adapter.setGatewayNavigation(false);
 assert.equal(h.adapter.move(1,0),true);
 h.adapter.destroy();
});
