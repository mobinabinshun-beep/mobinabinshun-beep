"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync("nu-controller-pointer.js","utf8");

function harness(gamepad=null,gameActive=true){
 const listeners=new Map(),frames=new Map();let frameId=0;
 const makeElement=()=>{const classes=new Set();return {style:{},className:"",attributes:{},children:[],classList:{add(name){classes.add(name);},remove(name){classes.delete(name);},contains(name){return classes.has(name);},toggle(name,force){if(force===undefined)force=!classes.has(name);force?classes.add(name):classes.delete(name);return force;}},setAttribute(k,v){this.attributes[k]=v;},appendChild(child){this.children.push(child);},remove(){},dispatchEvent(){return true;}};};
 const target={classList:{add(){},remove(){}},events:[],dispatchEvent(event){this.events.push(event);return true;}};
 const gameView=makeElement();if(gameActive)gameView.classList.add("active");const canvas=makeElement();
 const document={head:makeElement(),body:makeElement(),createElement(){return makeElement();},getElementById(id){return id==="game-view"?gameView:id==="game-canvas"?canvas:null;},elementFromPoint(){return target;},dispatchEvent(){return true;}};
 class CustomEvent{constructor(type,options){this.type=type;this.detail=options&&options.detail;}}
 let observerCallback=null;
 class MutationObserver{constructor(fn){observerCallback=fn;}observe(){}disconnect(){}}
 const window={document,innerWidth:800,innerHeight:600,navigator:{getGamepads(){return gamepad?[gamepad]:[];}},
  CustomEvent,MouseEvent:CustomEvent,PointerEvent:CustomEvent,KeyboardEvent:CustomEvent,MutationObserver,
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},
  removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
  dispatchEvent(event){for(const fn of listeners.get(event.type)||[])fn(event);return true;},
  requestAnimationFrame(fn){const id=++frameId;frames.set(id,fn);return id;},
  cancelAnimationFrame(id){frames.delete(id);}};
 vm.runInNewContext(source,{window,globalThis:window,Math,Number,Array,Object,String,Set,Map});
 return {window,document,target,gameView,adapter:window.NUControllerPointer,dispatch(type,detail){window.dispatchEvent(new CustomEvent(type,{detail}));},
  step(time){const entry=frames.entries().next().value;if(!entry)return false;frames.delete(entry[0]);entry[1](time);return true;},observe(){observerCallback&&observerCallback();}};
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
test("Gateway open freezes the pointer; Gateway direction events never move or start it",()=>{
 const h=harness();h.adapter.startClickController();const before=h.adapter.getState();
 h.document.body.classList.add("nu-gateway-open");
 assert.equal(h.adapter.move(1,0),false);
 h.dispatch("nu:gateway-direction",{x:1,y:0});
 assert.equal(h.adapter.getState().x,before.x);assert.equal(h.adapter.getState().y,before.y);
 h.adapter.destroy();
});

test("Gateway directional events cannot start or move the gameplay virtual pointer",()=>{
 const h=harness();h.dispatch("nu:gateway-direction",{x:1,y:0});
 assert.equal(h.adapter.isEnabled(),false);
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
test("Keyboard input used inside Gateway cannot move or resume the pointer until keyup and a fresh press",()=>{
 const h=harness();h.adapter.startClickController();const before=h.adapter.getState();
 h.document.body.classList.add("nu-gateway-open");h.dispatch("nu:gateway-open",{});
 const inside={type:"keydown",key:"ArrowDown",repeat:false,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;}};
 h.window.dispatchEvent(inside);
 h.document.body.classList.remove("nu-gateway-open");h.dispatch("nu:gateway-close",{});
 const held={type:"keydown",key:"ArrowDown",repeat:true,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;}};
 h.window.dispatchEvent(held);
 assert.equal(h.adapter.getState().x,before.x);assert.equal(h.adapter.getState().y,before.y);
 assert.equal(held.defaultPrevented,true);assert.equal(held.stopped,true);
 h.window.dispatchEvent({type:"keyup",key:"ArrowDown"});
 const fresh={type:"keydown",key:"ArrowDown",repeat:false,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;}};
 h.window.dispatchEvent(fresh);
 assert.equal(h.adapter.getState().y,before.y+28);h.adapter.destroy();
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

test("A connected gamepad sends direction and one confirm through the shared pointer adapter",()=>{
 const buttons=Array.from({length:16},()=>({pressed:false}));
 const pad={index:0,connected:true,buttons,axes:[0,0]};
 const h=harness(pad);let moves=0;
 h.window.addEventListener("nu:simulated-pointer-move",()=>moves++);
 assert.equal(h.step(0),true);
 buttons[15].pressed=true;assert.equal(h.step(200),true);
 assert.equal(moves,1);assert.equal(h.adapter.getState().x,428);
 buttons[15].pressed=false;assert.equal(h.step(400),true);
 buttons[0].pressed=true;assert.equal(h.step(600),true);
 assert.equal(h.target.events.filter(event=>event.type==="pointerdown").length,1);
 assert.equal(h.target.events.filter(event=>event.type==="pointerup").length,1);
 assert.equal(h.target.events.filter(event=>event.type==="click").length,1);
 h.adapter.destroy();
});
