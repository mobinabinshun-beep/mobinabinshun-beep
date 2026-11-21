"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const launcher=fs.readFileSync("launcher.html","utf8");
const casino=fs.readFileSync("casino.html","utf8");
const studio=fs.readFileSync("pixel-art-studio.html","utf8");
const gatewayCss=fs.readFileSync("nu-hex-gateway.css","utf8");

test("Launcher core exposes one reusable simulated-mouse controller adapter",()=>{
 assert.match(pointer,/root\.NUControllerPointer=Object\.assign\(create\(\),\{create,mode:"simulated-mouse"/);
 assert.match(pointer,/capabilities:\{directionalPointer:true,separateConfirm:true/);
 assert.match(index,/nu-controller-pointer\.js/);
 assert.match(launcher,/nu-controller-pointer\.js/);
 assert.ok(casino.includes("nu-controller-pointer.js"));
 assert.ok(studio.includes("nu-controller-pointer.js"));
 assert.ok(casino.indexOf("nu-controller-pointer.js")<casino.indexOf("nu-hex-gateway.js"));
 assert.ok(studio.indexOf("nu-controller-pointer.js")<studio.indexOf("nu-hex-gateway.js"));
 for(const page of [index,casino,launcher,studio])assert.ok(page.includes("nu-controller-pointer.js?v=20261121-independent-r1"));
 assert.ok(index.includes("nu-games.js?v=20261119-android-touch-mana-r1"));
 assert.match(launcher,/<body class="nu-launcher-page">/);
 assert.match(gatewayCss,/body\.nu-launcher-page #nu-hex-gateway/);
 assert.doesNotMatch(gateway,/if\(!root\|\|!scrim\|\|!gameView\)return/);
});

test("D-pad and stick directions move the virtual pointer without activating targets",()=>{
 assert.match(pointer,/b\[12\]/);
 assert.match(pointer,/b\[13\]/);
 assert.match(pointer,/b\[14\]/);
 assert.match(pointer,/b\[15\]/);
 assert.match(pointer,/x\+dx\*step/);
 assert.match(pointer,/y\+dy\*step/);
 assert.match(pointer,/updateTarget\(\)/);
 assert.match(pointer,/lastMove=time/);
 assert.match(pointer,/emit\("nu:gateway-direction"/);
 assert.match(pointer,/if\(\(input\.dx\|\|input\.dy\)&&time-lastMove>=repeat\)/);
 assert.doesNotMatch(pointer,/if\(\(input\.dx\|\|input\.dy\)[^}]*clickTarget/);
});

test("Keyboard-emulated click-controller arrows are captured by the shared pointer adapter outside Gateway",()=>{
 assert.match(pointer,/function onKeyboardInput\(event\)/);
 assert.match(pointer,/keyboard-click-controller/);
 assert.match(pointer,/addEventListener\("keydown",onKeyboardInput,true\)/);
 assert.match(pointer,/if\(event\.key==="Enter"\|\|event\.key===" "\|\|event\.key==="NumpadEnter"\)/);
 assert.match(pointer,/isGatewayOpen\(\)\|\|!isGameplayPointerScreen\(\)/);
});
test("Click-controller directions have an explicit path to move the simulated pointer",()=>{
 assert.match(pointer,/function movePointer\(dx,dy,source\)/);
 assert.match(pointer,/nu:simulated-pointer-direction/);
 assert.match(pointer,/nu:controller-direction/);
 assert.match(pointer,/nu:gateway-direction/);
 assert.match(pointer,/startClickController\(\)/);
 assert.match(pointer,/move\(dx,dy\)\{return movePointer/);
 assert.match(pointer,/emit\("nu:simulated-pointer-move"/);
});
test("A held Down used to exit Gateway cannot move the virtual pointer away from the trigger",()=>{
 assert.match(pointer,/if\(gatewayBlockedUntilNeutral\)\{[\s\S]*?isNeutral\(input\)/);
 assert.match(pointer,/gatewayBlockedUntilNeutral=!isNeutral\(input\)/);
 assert.match(pointer,/if\(gatewayOpen!==gatewayWasOpen\)/);
 assert.doesNotMatch(gateway,/NUControllerPointer/);
});
test("Confirm is a separate click; B remains Gateway cancel",()=>{
 assert.match(pointer,/if\(!primed\)/);
 assert.match(pointer,/if\(input\.confirm&&!confirmDown\)emit\("nu:gateway-confirm",\{\}\)/);
 assert.match(pointer,/if\(input\.cancel&&!cancelDown\).*key:"Escape"/);
 assert.match(pointer,/new win\.MouseEvent\("click"/);
});

test("Gateway never owns or controls the gameplay virtual-pointer adapter",()=>{
 assert.doesNotMatch(gateway,/NUControllerPointer/);
 assert.match(pointer,/gameplayOnly:true/);
 assert.doesNotMatch(gateway,/NUControllerPointer/);
 assert.doesNotMatch(gateway,/window\.addEventListener\("gamepadconnected",startController\)/);
});

test("Gateway Exit from utility views resolves to the main page, not nested history",()=>{
 assert.match(gateway,/else window\.location\.href="\.\/index\.html"/);
 assert.doesNotMatch(gateway,/activeUtility\.id==="inventory-view"\?"inventory-back"/);
});


function makePointerHarness(gameActive=true){
 const listeners=new Map(),frames=new Map(),targetEvents=[],semanticEvents=[];
 let nextFrame=1,observer=null;
 const makeClassList=(initial=[])=>{const values=new Set(initial);return {contains:name=>values.has(name),add:name=>values.add(name),remove:name=>values.delete(name),toggle(name,force){if(force===undefined)force=!values.has(name);force?values.add(name):values.delete(name);return force;}};};
 const target={classList:makeClassList(),dispatchEvent(event){targetEvents.push(event.type);return true;}};
 const view={classList:makeClassList(gameActive?["active"]:[])};
 const canvas={};
 const body={classList:makeClassList(),appendChild(){}};
 const doc={body,head:{appendChild(){}},getElementById(id){return id==="game-view"?view:id==="game-canvas"?canvas:null;},createElement(){return {style:{},classList:makeClassList(),setAttribute(){},remove(){}};},elementFromPoint(){return target;},dispatchEvent(event){return true;}};
 const pad={connected:true,index:0,buttons:Array.from({length:16},()=>({pressed:false})),axes:[0,0]};
 const win={document:doc,innerWidth:800,innerHeight:600,navigator:{getGamepads:()=>[pad]},
  CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail;}},
  PointerEvent:class{constructor(type,options={}){this.type=type;Object.assign(this,options);}},
  MouseEvent:class{constructor(type,options={}){this.type=type;Object.assign(this,options);}},
  KeyboardEvent:class{constructor(type,options={}){this.type=type;Object.assign(this,options);}},
  MutationObserver:class{constructor(callback){observer=callback;}observe(){}disconnect(){}},
  addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);},
  removeEventListener(type,fn){listeners.set(type,(listeners.get(type)||[]).filter(item=>item!==fn));},
  dispatchEvent(event){semanticEvents.push(event);for(const fn of listeners.get(event.type)||[])fn(event);return true;},
  requestAnimationFrame(fn){const id=nextFrame++;frames.set(id,fn);return id;},
  cancelAnimationFrame(id){frames.delete(id);}
 };
 vm.runInNewContext(pointer,{window:win,document:doc,globalThis:win,Map,Array,Number,Math,String,Date,JSON,Object,Set});
 function frame(time){const first=frames.entries().next().value;if(!first)throw new Error("no scheduled animation frame");frames.delete(first[0]);first[1](time);}
 return {win,doc,view,pad,targetEvents,semanticEvents,frame,observer:()=>observer,pointer:win.NUControllerPointer};
}

test("Gameplay virtual pointer is gated to the active game view",()=>{
 const h=makePointerHarness(false);
 h.pointer.startClickController();
 assert.equal(h.pointer.isEnabled(),false);
 h.view.classList.add("active");
 h.observer()();
 assert.equal(h.pointer.isEnabled(),true);
});

test("Gateway freezes virtual-pointer coordinates and event delivery while separate controller navigation continues",()=>{
 const h=makePointerHarness(true);
 h.pointer.startClickController();
 h.pad.buttons[13].pressed=true;
 h.frame(200);
 const before=h.pointer.getState();
 assert.ok(h.targetEvents.includes("pointermove"));
 assert.ok(h.targetEvents.includes("mousemove"));
 h.targetEvents.length=0;
 h.pad.buttons[13].pressed=false;
 h.frame(210);
 h.doc.body.classList.add("nu-gateway-open");
 h.frame(220);
 h.pad.buttons[13].pressed=true;
 h.frame(221);
 let moves=h.semanticEvents.filter(event=>event.type==="nu:gateway-direction");
 assert.equal(moves.length,1);
 assert.equal(moves[0].detail.y,1);
 assert.equal(h.pointer.getState().x,before.x);
 assert.equal(h.pointer.getState().y,before.y);
 assert.deepEqual(h.targetEvents,[]);
 h.frame(411);
 moves=h.semanticEvents.filter(event=>event.type==="nu:gateway-direction");
 assert.equal(moves.length,2,"a sustained hold repeats after the configured interval");
 assert.equal(moves[1].detail.repeat,true);
 assert.deepEqual(h.targetEvents,[]);
});

test("A controller input held through Gateway closure cannot move the pointer until neutral and a fresh press",()=>{
 const h=makePointerHarness(true);
 h.pointer.startClickController();
 h.doc.body.classList.add("nu-gateway-open");
 h.pad.buttons[13].pressed=true;
 h.frame(16);
 const frozen=h.pointer.getState();
 h.doc.body.classList.remove("nu-gateway-open");
 h.frame(32);
 assert.equal(h.pointer.getState().x,frozen.x);
 assert.equal(h.pointer.getState().y,frozen.y);
 assert.deepEqual(h.targetEvents,[]);
 h.pad.buttons[13].pressed=false;
 h.frame(48);
 h.pad.buttons[13].pressed=true;
 h.frame(250);
 assert.notEqual(h.pointer.getState().y,frozen.y);
 assert.ok(h.targetEvents.includes("pointermove"));
});

test("Gateway confirmation is a separate rising-edge action and never a pointer click",()=>{
 const h=makePointerHarness(true);
 h.pointer.startClickController();
 h.doc.body.classList.add("nu-gateway-open");
 h.frame(16);
 h.pad.buttons[0].pressed=true;
 h.frame(32);
 h.frame(33);
 assert.equal(h.semanticEvents.filter(event=>event.type==="nu:gateway-confirm").length,1);
 assert.equal(h.targetEvents.includes("click"),false);
});


test("Keyboard-emulated controller input held through Gateway closure is blocked until keyup and a fresh press",()=>{
 const h=makePointerHarness(true);
 h.pointer.startClickController();
 const startY=h.pointer.getState().y;
 h.doc.body.classList.add("nu-gateway-open");
 h.win.dispatchEvent({type:"nu:gateway-open"});
 h.win.dispatchEvent({type:"keydown",key:"ArrowDown",target:{},preventDefault(){},stopImmediatePropagation(){}});
 h.doc.body.classList.remove("nu-gateway-open");
 h.win.dispatchEvent({type:"nu:gateway-close"});
 h.win.dispatchEvent({type:"keydown",key:"ArrowDown",repeat:true,target:{},preventDefault(){},stopImmediatePropagation(){}});
 assert.equal(h.pointer.getState().y,startY);
 h.win.dispatchEvent({type:"keyup",key:"ArrowDown"});
 h.win.dispatchEvent({type:"keydown",key:"ArrowDown",target:{},preventDefault(){},stopImmediatePropagation(){}});
 assert.equal(h.pointer.getState().y,startY+28);
});
