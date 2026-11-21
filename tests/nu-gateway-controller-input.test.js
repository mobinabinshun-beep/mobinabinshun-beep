"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const html=fs.readFileSync("index.html","utf8");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");
const gatewayCss=fs.readFileSync("nu-hex-gateway.css","utf8");
const games=fs.readFileSync("nu-games.js","utf8");
const graphics=fs.readFileSync("nu-graphics-runtime.js","utf8");
const player=fs.readFileSync("nu-player-ui.js","utf8");
const pause=fs.readFileSync("nu-gateway-pause.js","utf8");
const manifest=fs.readFileSync("NU-GENERATION-1-MANIFEST.json","utf8");

test("Gateway is mounted and remains available across Bag, Inventory, Wallet and Profile",()=>{
 assert.match(html,/id="nu-hex-gateway"/);
 assert.match(gateway,/\["bag-view","wallet-view","inventory-view","profile-view"\]/);
 assert.match(gateway,/profile:.*menu-profile/);
});

test("Gateway is the only visible Back/Pause control in mounted views",()=>{
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #bag-back/);
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #inventory-back/);
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #wallet-back/);
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #profile-back/);
 assert.doesNotMatch(html,/id="finish-round"|PAUSE ROUND|RESUME ROUND/);
});

test("Gateway is the only pause authority and gameplay waits for the first return input",()=>{
 assert.match(games,/gatewayPause\.open\(state\)/);
 assert.match(games,/gatewayPause\.close\(state\)/);
 assert.match(games,/syncGatewayBackgrounds\(state\.paused\)/);
 assert.match(games,/gatewayPause.isAwaitingInteraction\(\)/);
 assert.match(games,/resumeAfterGatewayReturn/);
 assert.doesNotMatch(games,/playerOverlayPaused|gatewayOwnsPause/);
 assert.match(pause,/if\(!state\|\|!state\.active\|\|state\.paused\)return false/);
 assert.match(pause,/if\(!state\|\|!state\.paused\|\|state\.turn>=10\)return false/);
 assert.ok(html.indexOf("nu-gateway-pause.js")<html.indexOf("nu-games.js"));
 assert.match(manifest,/nu-gateway-pause.js/);
 assert.match(games,/window\.addEventListener\("nu:gateway-open",handleGatewayOpen\)/);
 assert.match(games,/window\.addEventListener\("nu:gateway-close",handleGatewayClose\)/);
});

test("Gateway freezes gameplay and ambient renderers while keeping foreground controls outside the scrim",()=>{
 assert.match(games,/cancelAnimationFrame\(state\.raf\)/);
 assert.match(games,/NUBackgroundEngine\.setFrozen/);
 assert.match(games,/NUDynamicLayers\.setFrozen/);
 assert.match(games,/NUPixelWorld\.setEnabled/);
 assert.match(graphics,/nu-gateway-open/);
 assert.match(gatewayCss,/body\.nu-gateway-open \.world>#world-canvas/);
 assert.match(gatewayCss,/backdrop-filter:none/);
 assert.match(gatewayCss,/body\.nu-gateway-open \.shell\{position:relative;z-index:115\}/);
 assert.match(games,/document\.body\.classList\.contains\("nu-gateway-open"\)/);
});

test("Gateway keyboard controls move through options and confirm the selected destination",()=>{
 assert.match(gateway,/event\.key==="ArrowDown"\|\|event\.key==="ArrowRight"/);
 assert.match(gateway,/event\.key==="ArrowUp"\|\|event\.key==="ArrowLeft"/);
 assert.match(gateway,/event\.key==="Enter"\|\|event\.key===" "/);
 assert.match(gateway,/function moveSelection\(direction\)/);
});

test("Gateway mouse hover visibly selects and a click activates one destination",()=>{
 assert.match(gateway,/pointerenter/);
 assert.match(gateway,/function select\(item\)/);
 assert.match(gateway,/item\.setAttribute\("aria-pressed","true"\)/);
 assert.match(gateway,/item\.addEventListener\("click"/);
 assert.match(gateway,/function activate\(item\)/);
});

test("Shared controller adapter maps D-pad/stick to virtual pointer and A/B to confirm/cancel",()=>{
 const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
 assert.doesNotMatch(gateway,/NUControllerPointer/);
 assert.match(pointer,/navigator&&win\.navigator\.getGamepads/);
 assert.match(pointer,/b\[12\]/);
 assert.match(pointer,/b\[15\]/);
 assert.match(pointer,/b\[0\]/);
 assert.match(pointer,/b\[1\]/);
 assert.match(pointer,/key:"Escape"/);
});

test("Simulated mouse uses the Gateway list, one extra Down exits, and pointer must leave before re-entry",()=>{
 const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
 assert.match(pointer,/function isGatewayOpen\(\)/);
 assert.match(pointer,/nu:gateway-direction/);
 assert.match(pointer,/nu:gateway-confirm/);
 assert.match(pointer,/nu:simulated-pointer-target/);
 assert.match(pointer,/function hasConnectedGamepad\(\)/);
 assert.match(pointer,/gamepaddisconnected/);
 assert.match(pointer,/gamepadconnected/);
 assert.match(gateway,/scheduleOpen\(1000,"simulated-pointer"\)/);
 assert.match(gateway,/scheduleOpen\(500,"physical-mouse"\)/);
 assert.match(gateway,/if\(event\.pointerType==="mouse"&&open\)activate\(item\)/);
 assert.doesNotMatch(gateway,/scheduleDwellActivation/);
 assert.match(gateway,/if\(!wasMoved\)activate\(item\)/);
 assert.match(gateway,/select\(items\[current\+1\]\)/);
 assert.match(gateway,/scheduleOpen\(500,"touch"\)/);
 assert.match(gateway,/if\(!open\)cancelScheduledOpen\(\)/);
 assert.match(gateway,/event.pointerType!=="touch"\|\|event.isPrimary===false/);
 assert.match(gateway,/suppressClickUntil=Date.now\(\)\+1000/);
 assert.match(gateway,/requiresSimulatedPointerExit=true/);
 assert.match(gateway,/current>=items.length-1/);
 assert.match(gateway,/setOpen\(false,true,"controller-exit"\)/);
 assert.match(gateway,/direction\.y>0\)moveGatewaySelection\(1\)/);
 assert.match(gateway,/direction\.y<0\)moveGatewaySelection\(-1\)/);
});
test("Gateway options are frozen before they become actionable and remain controller-selectable",()=>{
 assert.ok(gateway.indexOf('new Event("nu:gateway-open")')<gateway.indexOf('root.classList.toggle("is-open",open)'));
 assert.doesNotMatch(gateway,/NUControllerPointer/);
 assert.match(gateway,/function moveGatewaySelection\(direction\)/);
});
test("One shared adapter owns gamepad pointer movement and activation",()=>{
 const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
 assert.match(pointer,/navigator&&win\.navigator\.getGamepads/);
 assert.match(pointer,/function tick\(time\)/);
 assert.match(pointer,/b\[0\]/);
 assert.match(pointer,/target\.dispatchEvent\(down\)/);
 assert.match(games,/window\.addEventListener\("nu:simulated-pointer-move"/);
 assert.doesNotMatch(games,/navigator\.getGamepads|function pollGamepad|gamepadconnected|startGamepad|stopGamepad/);
 assert.match(games,/function moveKeyboardTarget\(direction\)/);
 assert.match(games,/event\.key==="ArrowRight"\|\|event\.key==="ArrowDown"/);
});
test("Nested player navigation preserves Wallet → Profile → Wallet → Bag history",()=>{
 assert.match(player,/const viewStack=\[\]/);
 assert.match(player,/viewStack\.push\(\{view:activeView,focus:document\.activeElement\}\)/);
 assert.match(player,/const previous=viewStack\.pop\(\)/);
 assert.match(player,/if\(tab==="profile"\)\{open\(profileView\);return;\}/);
 assert.match(gateway,/else window\.location\.href="\.\/index\.html"/);
});

test("Hidden tabs freeze gameplay while the shared pointer adapter remains the only gamepad poller",()=>{
 const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
 assert.match(games,/document\.addEventListener\("visibilitychange"/);
 assert.doesNotMatch(games,/stopGamepad|startGamepad|pollGamepad|navigator\.getGamepads/);
 assert.match(games,/if\(state\.active&&!state\.paused\)/);
 assert.match(gateway,/window\.addEventListener\("blur"/);
 assert.doesNotMatch(gateway,/NUControllerPointer/);
 assert.match(pointer,/function tick\(time\)/);
});


function makeGatewayHarness(){
 let now=0,nextTimer=1;
 const timers=new Map(),windowListeners=new Map(),documentListeners=new Map(),events=[];
 const makeClassList=()=>{const values=new Set();return {contains:name=>values.has(name),add:name=>values.add(name),remove:name=>values.delete(name),toggle(name,force){if(force===undefined)force=!values.has(name);force?values.add(name):values.delete(name);return force;}};};
 const listeners=()=>({addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(fn);},listeners:new Map()});
 const makeElement=(action)=>{const el={dataset:{action},classList:makeClassList(),style:{setProperty(){}},tabIndex:-1,attributes:{},handlers:new Map(),addEventListener(type,fn){if(!this.handlers.has(type))this.handlers.set(type,[]);this.handlers.get(type).push(fn);},setAttribute(name,value){this.attributes[name]=value;},focus(){document.activeElement=this;},click(){this.clicked=(this.clicked||0)+1;for(const fn of this.handlers.get("click")||[])fn({preventDefault(){},stopPropagation(){},detail:0});},getBoundingClientRect(){return {left:100,top:100,right:160,bottom:160};}};return el;};
 const trigger=makeElement("trigger"),items=["back","menu","profile"].map(makeElement),scrim=makeElement("scrim"),root=makeElement("root");
 root.querySelector=()=>trigger;root.querySelectorAll=()=>items;
 const gameView={classList:makeClassList()};gameView.classList.add("active");
 const backHome=makeElement("back-home"),menuOpen=makeElement("menu-open");
 const body={classList:makeClassList()};
 const document={body,activeElement:trigger,handlers:documentListeners,
  getElementById(id){return id==="nu-hex-gateway"?root:id==="game-view"?gameView:id==="back-home"?backHome:id==="menu-open"?menuOpen:null;},
  querySelector(selector){return selector===".nu-gateway-scrim"?scrim:null;},
  addEventListener(type,fn){if(!documentListeners.has(type))documentListeners.set(type,[]);documentListeners.get(type).push(fn);}
 };
 const MutationObserver=class{observe(){}disconnect(){}};
 const window={document,innerWidth:1200,location:{search:"",href:""},handlers:windowListeners,
  matchMedia(){return {matches:false};},
  addEventListener(type,fn){if(!windowListeners.has(type))windowListeners.set(type,[]);windowListeners.get(type).push(fn);},
  dispatchEvent(event){events.push(event.type);for(const fn of windowListeners.get(event.type)||[])fn(event);return true;},
  setTimeout(fn,delay){const id=nextTimer++;timers.set(id,{at:now+delay,fn});return id;},
  clearTimeout(id){timers.delete(id);},
  MutationObserver
 };
 function advance(ms){now+=ms;let ran=true;while(ran){ran=false;const due=[...timers.entries()].filter(([,timer])=>timer.at<=now).sort((a,b)=>a[1].at-b[1].at);if(due.length){const [id,timer]=due[0];timers.delete(id);timer.fn();ran=true;}}}
 function dispatchWindow(type,detail={}){window.dispatchEvent({type,detail});}
 function dispatchDocument(type,event){for(const fn of documentListeners.get(type)||[])fn(event);}
 const EventClass=class{constructor(type){this.type=type;}};
 vm.runInNewContext(gateway,{window,document,Event:EventClass,URLSearchParams,performance:{now:()=>now},Date,Math,Map,Set,Array,String,Number,Boolean,MutationObserver,clearTimeout:id=>window.clearTimeout(id),setTimeout:(fn,delay)=>window.setTimeout(fn,delay)});
 return {window,document,body,trigger,items,scrim,backHome,menuOpen,events,advance,dispatchWindow,dispatchDocument};
}

test("Gateway controller directions select one option per event; only separate confirm activates",()=>{
 const h=makeGatewayHarness();
 h.trigger.handlers.get("pointerenter")[0]({pointerType:"mouse"});
 h.advance(500);
 assert.equal(h.body.classList.contains("nu-gateway-open"),true);
 h.dispatchWindow("nu:gateway-direction",{x:0,y:1});
 assert.equal(h.items[0].classList.contains("is-selected"),true);
 assert.equal(h.menuOpen.clicked||0,0);
 h.dispatchWindow("nu:gateway-direction",{x:0,y:1});
 assert.equal(h.items[0].classList.contains("is-selected"),false);
 assert.equal(h.items[1].classList.contains("is-selected"),true);
 assert.equal(h.menuOpen.clicked||0,0);
 h.dispatchWindow("nu:gateway-confirm",{});
 h.advance(120);
 assert.equal(h.menuOpen.clicked,1);
 assert.equal(h.body.classList.contains("nu-gateway-open"),false);
});

test("Down beyond the final Gateway option exits without activating any option",()=>{
 const h=makeGatewayHarness();
 h.trigger.handlers.get("pointerenter")[0]({pointerType:"mouse"});
 h.advance(500);
 h.dispatchWindow("nu:gateway-direction",{x:0,y:1});
 h.dispatchWindow("nu:gateway-direction",{x:0,y:1});
 h.dispatchWindow("nu:gateway-direction",{x:0,y:1});
 assert.equal(h.items[2].classList.contains("is-selected"),true);
 h.dispatchWindow("nu:gateway-direction",{x:0,y:1});
 assert.equal(h.body.classList.contains("nu-gateway-open"),false);
 assert.equal(h.backHome.clicked||0,0);
 assert.equal(h.menuOpen.clicked||0,0);
 assert.ok(h.events.includes("nu:gateway-close"));
});

test("Physical mouse hover activates an option directly without a click",()=>{
 const h=makeGatewayHarness();
 h.trigger.handlers.get("pointerenter")[0]({pointerType:"mouse"});
 h.advance(500);
 h.items[1].handlers.get("pointerenter")[0]({pointerType:"mouse"});
 h.advance(120);
 assert.equal(h.menuOpen.clicked,1);
});

test("A continuing touch leaving the Gateway interaction zone closes it and keeps the return hold",()=>{
 const h=makeGatewayHarness();
 h.trigger.handlers.get("pointerdown")[0]({pointerType:"touch",isPrimary:true,pointerId:7,clientX:120,clientY:120,preventDefault(){}});
 h.advance(500);
 assert.equal(h.body.classList.contains("nu-gateway-open"),true);
 h.dispatchDocument("pointermove",{pointerType:"touch",pointerId:7,clientX:500,clientY:500});
 h.advance(111);
 h.dispatchDocument("pointermove",{pointerType:"touch",pointerId:7,clientX:500,clientY:500});
 assert.equal(h.body.classList.contains("nu-gateway-open"),false);
 assert.ok(h.events.includes("nu:gateway-close"));
});

test("Physical mouse leaving the Gateway interaction zone closes it",()=>{
 const h=makeGatewayHarness();
 h.trigger.handlers.get("pointerenter")[0]({pointerType:"mouse"});
 h.advance(500);
 h.dispatchDocument("pointermove",{pointerType:"mouse",clientX:500,clientY:500});
 h.advance(111);
 h.dispatchDocument("pointermove",{pointerType:"mouse",clientX:500,clientY:500});
 assert.equal(h.body.classList.contains("nu-gateway-open"),false);
 assert.ok(h.events.includes("nu:gateway-close"));
});


test("Touch can open Gateway, lift the opening finger, then tap an option separately",()=>{
 const h=makeGatewayHarness();
 h.trigger.handlers.get("pointerdown")[0]({pointerType:"touch",isPrimary:true,pointerId:7,clientX:120,clientY:120,preventDefault(){}});
 h.advance(500);
 h.trigger.handlers.get("pointerup")[0]({pointerType:"touch",isPrimary:true,pointerId:7,preventDefault(){},stopPropagation(){}});
 assert.equal(h.body.classList.contains("nu-gateway-open"),true);
 h.items[1].handlers.get("pointerdown")[0]({pointerType:"touch",pointerId:8,clientX:120,clientY:220});
 h.items[1].handlers.get("pointerup")[0]({pointerType:"touch",pointerId:8,preventDefault(){},stopPropagation(){}});
 h.advance(120);
 assert.equal(h.menuOpen.clicked,1);
 assert.equal(h.body.classList.contains("nu-gateway-open"),false);
});

test("A fresh outside touch after lifting the opening finger closes Gateway",()=>{
 const h=makeGatewayHarness();
 h.trigger.handlers.get("pointerdown")[0]({pointerType:"touch",isPrimary:true,pointerId:7,clientX:120,clientY:120,preventDefault(){}});
 h.advance(500);
 h.trigger.handlers.get("pointerup")[0]({pointerType:"touch",isPrimary:true,pointerId:7,preventDefault(){},stopPropagation(){}});
 assert.equal(h.body.classList.contains("nu-gateway-open"),true);
 h.scrim.handlers.get("click")[0]();
 assert.equal(h.body.classList.contains("nu-gateway-open"),false);
 assert.ok(h.events.includes("nu:gateway-close"));
});
