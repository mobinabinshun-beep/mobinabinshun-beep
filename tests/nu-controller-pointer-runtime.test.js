"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync("nu-controller-pointer.js","utf8");

function harness(){
 const listeners=new Map();
 const makeElement=()=>({style:{},className:"",attributes:{},children:[],classList:{add(){},remove(){}},setAttribute(k,v){this.attributes[k]=v;},appendChild(child){this.children.push(child);},remove(){},dispatchEvent(){return true;}});
 const target={classList:{add(){},remove(){}},events:[],dispatchEvent(event){this.events.push(event);return true;}};
 const document={head:makeElement(),body:makeElement(),createElement(){return makeElement();},elementFromPoint(){return target;},dispatchEvent(){return true;}};
 class CustomEvent{constructor(type,options){this.type=type;this.detail=options&&options.detail;}}
 const window={document,innerWidth:800,innerHeight:600,navigator:{getGamepads(){return [];}},
  CustomEvent,MouseEvent:CustomEvent,PointerEvent:CustomEvent,
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},
  removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
  dispatchEvent(event){for(const fn of listeners.get(event.type)||[])fn(event);return true;},
  requestAnimationFrame(){return 1;},cancelAnimationFrame(){}};
 vm.runInNewContext(source,{window,globalThis:window,Math,Number,Array,Object,String});
 return {window,target,adapter:window.NUControllerPointer,dispatch(type,detail){window.dispatchEvent(new CustomEvent(type,{detail}));}};
}

test("Click-controller starts the simulated cursor without a connected Gamepad API device",()=>{
 const h=harness();assert.equal(h.adapter.isEnabled(),false);h.adapter.startClickController();
 assert.equal(h.adapter.isEnabled(),true);assert.equal(h.adapter.getState().x,400);assert.equal(h.adapter.getState().y,300);h.adapter.destroy();
});
test("Click-controller direction moves the virtual pointer and reports the new position",()=>{
 const h=harness();h.adapter.startClickController();const before=h.adapter.getState();
 assert.equal(h.adapter.move(1,0),true);const after=h.adapter.getState();
 assert.equal(after.x,428);assert.equal(after.y,300);h.adapter.destroy();
});
test("Directional events from the click-controller translator move the pointer",()=>{
 const h=harness();h.adapter.startClickController();const before=h.adapter.getState();
 h.dispatch("nu:controller-direction",{dx:0,dy:1});const after=h.adapter.getState();
 assert.equal(after.x,before.x);assert.equal(after.y,before.y+28);h.adapter.destroy();
});
test("Gateway list navigation owns direction and blocks simulated-pointer movement",()=>{
 const h=harness();h.adapter.startClickController();const before=h.adapter.getState();
 h.adapter.setGatewayNavigation(true);assert.equal(h.adapter.move(1,0),false);
 assert.equal(h.adapter.getState().x,before.x);assert.equal(h.adapter.getState().y,before.y);
 h.adapter.setGatewayNavigation(false);assert.equal(h.adapter.move(1,0),true);h.adapter.destroy();
});

test("Existing Gateway directional event automatically starts and moves the simulated pointer outside Gateway",()=>{
 const h=harness();h.dispatch("nu:gateway-direction",{x:1,y:0});
 assert.equal(h.adapter.isEnabled(),true);
 assert.equal(h.adapter.getState().x,428);
 assert.equal(h.adapter.getState().y,300);
 h.adapter.destroy();
});

test("Real arrow-key input from a keyboard-emulated click controller moves the pointer without Gamepad API",()=>{
 const h=harness();const before=h.adapter.getState();
 const event={type:"keydown",key:"ArrowRight",repeat:false,altKey:false,ctrlKey:false,metaKey:false,
  preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;}};
 h.window.dispatchEvent(event);const after=h.adapter.getState();
 assert.equal(h.adapter.isEnabled(),true);assert.equal(after.x,428);assert.equal(after.y,300);
 assert.equal(event.defaultPrevented,true);assert.equal(event.stopped,true);h.adapter.destroy();
});
test("Gateway keeps exclusive ownership of arrow keys while hierarchical navigation is active",()=>{
 const h=harness();h.adapter.startClickController();h.adapter.setGatewayNavigation(true);const before=h.adapter.getState();
 const event={type:"keydown",key:"ArrowDown",repeat:false,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;}};
 h.window.dispatchEvent(event);const after=h.adapter.getState();
 assert.equal(after.x,before.x);assert.equal(after.y,before.y);assert.equal(event.defaultPrevented,undefined);
 h.adapter.setGatewayNavigation(false);h.adapter.destroy();
});

test("Virtual pointer movement dispatches pointermove and mousemove to the hit-tested game target",()=>{
 const h=harness();h.adapter.startClickController();h.target.events.length=0;
 assert.equal(h.adapter.move(1,0),true);
 assert.ok(h.target.events.some(event=>event.type==="pointermove"));
 assert.ok(h.target.events.some(event=>event.type==="mousemove"));
 assert.ok(h.target.events.filter(event=>event.type==="pointermove"||event.type==="mousemove").every(event=>event.nuSimulated===true));
 h.adapter.destroy();
});
test("Held keyboard-emulated direction repeat events continue moving the virtual pointer",()=>{
 const h=harness();h.adapter.startClickController();
 const event={type:"keydown",key:"ArrowRight",repeat:true,altKey:false,ctrlKey:false,metaKey:false,
  preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;}};
 h.window.dispatchEvent(event);
 assert.equal(h.adapter.getState().x,428);
 assert.equal(event.defaultPrevented,true);
 h.adapter.destroy();
});
