"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const read=name=>fs.readFileSync(name,"utf8");
const html=read("index.html"),casino=read("casino.html"),launcher=read("launcher.html"),studio=read("pixel-art-studio.html");
const js=read("nu-hex-gateway.js"),css=read("nu-hex-gateway.css"),worldCss=read("nu-world.css");
const games=read("nu-games.js"),playerUI=read("nu-player-ui.js"),graphics=read("nu-graphics-runtime.js"),exchange=read("nu-exchange.js"),dynamic=read("nu-dynamic-layers.js");

test("Gateway and simulated pointer mount on every page containing Gateway",()=>{
 assert.match(html,/id="nu-hex-gateway"/);
 assert.match(js,/if\(!root\|\|!scrim\)return/);
 assert.match(js,/classList\.toggle\("nu-game-active",active\)/);
 assert.match(css,/body\.nu-game-active #nu-hex-gateway/);
 assert.match(css,/body\.nu-game-active #menu-open/);
 assert.match(css,/body\.nu-game-active #back-home/);
 for(const page of [casino,launcher,studio])assert.match(page,/id="nu-hex-gateway"/);
 for(const page of [html,casino,launcher,studio]){
  const pointer=page.indexOf("nu-controller-pointer.js"),gateway=page.indexOf("nu-hex-gateway.js");
  assert.ok(pointer>=0&&gateway>pointer,"controller pointer must load before Gateway on every mounted page");
 }
 assert.match(js,/const standalone=!gameView&&utilityViews.length===0/);
 assert.match(js,/const utility=standalone\|\|utilityViews\.some/);
 assert.match(css,/body\.nu-gateway-utility-active #nu-hex-gateway/);
 assert.match(css,/body\.nu-gateway-utility-active \.casino-top \.back-link/);
 assert.match(launcher,/<body class="nu-launcher-page">/);
 assert.match(css,/body\.nu-launcher-page #nu-hex-gateway/);
});

test("Gateway exposes exactly Back, Menu and Profile as one-click actions",()=>{
 for(const action of ["back","menu","profile"]){assert.match(html,new RegExp('data-action="'+action+'"'));assert.match(js,new RegExp(action+":"));}
 assert.doesNotMatch(html,/data-action="(settings|store|wallet|exchange|casino|studio|library)"/);
 assert.doesNotMatch(js,/settings:/);
 assert.match(js,/activate\(item\)/);
 assert.doesNotMatch(js,/clickArmed|hoverTimer|two-step|confirm\(item\)/);
});

test("Opening Gateway freezes the game and all ambient renderers until a decision",()=>{
 assert.match(js,/nu:gateway-open/);assert.match(js,/nu:gateway-close/);
 assert.match(games,/state\.engine\[shouldFreeze\?"pause":"resume"\]/);
 assert.match(games,/setFrozen\(shouldFreeze\)/);
 assert.match(games,/setEnabled\(!shouldFreeze/);
 assert.match(games,/NUBackgroundEngine\.setFrozen/);
 assert.match(games,/NUDynamicLayers\.setFrozen/);
 assert.match(games,/NUPixelWorld\.setEnabled/);
 assert.match(graphics,/nu-gateway-open/);
 assert.match(graphics,/NUDynamicLayers&&g\.NUDynamicLayers\.setFrozen/);
 assert.match(js,/setOpen\(false,false\)/);
 assert.match(js,/nu:menu-dismissed/);
 assert.match(js,/nu:player-overlay-close/);
});

test("Menu is a centered, concise module directory with player modules before games",()=>{
 const items=html.slice(html.indexOf('<div class="menu-backdrop"'),html.indexOf('<div class="intro"'));
 const order=["menu-store","menu-profile","./exchange.html","menu-bag","./pixel-art-studio.html","menu-random","menu-bubble","menu-mana","menu-chaos"].map(x=>items.indexOf(x));
 assert.ok(order.every(x=>x>=0));
 assert.deepEqual(order.slice().sort((a,b)=>a-b),order);
 assert.match(items,/N\.U MENU/);
 assert.match(items,/<kbd>S<\/kbd>/);
 assert.match(items,/<kbd>P<\/kbd>/);
 assert.match(items,/<kbd>E<\/kbd>/);
 assert.match(items,/<kbd>G<\/kbd>/);
 assert.doesNotMatch(items,/<small>|Choose a destination|System profile|Original source/);
 assert.match(worldCss,/\.menu-panel\{width:min\(390px,100%\)/);
});


test("Bag provides Inventory and Wallet destinations with shared shortcuts",()=>{
 assert.match(html,/id="bag-view"/);
 assert.match(html,/id="inventory-view"/);
 assert.match(html,/id="menu-bag"/);
 assert.match(html,/data-bag-destination="inventory"/);
 assert.match(html,/data-bag-destination="wallet"/);
 assert.match(html,/data-wallet-tab="mana"/);
 assert.match(js,/nu-gateway-utility-active/);
 assert.match(css,/nu-gateway-utility-active #nu-hex-gateway/);
});

test("Painting leads the game list and Random Game selects only the three core prototypes",()=>{
 assert.ok(html.indexOf("./pixel-art-studio.html")<html.indexOf('id="menu-random"'));
 assert.ok(html.indexOf('id="menu-random"')<html.indexOf('id="menu-bubble"'));
 assert.match(games,/function chooseGame\(id\)/);
 assert.match(games,/id\|\|games\[Math\.floor\(Math\.random\(\)\*games\.length\)\]\.id/);
 assert.match(games,/data-random-game/);
 assert.doesNotMatch(html,/id="start-random"/);
});

test("Gateway blur and animation pause stay limited to decorative background layers",()=>{
 assert.match(css,/body\.nu-gateway-open \.world>\.sky/);
 assert.match(css,/filter:blur\(2\.5px\)/);
 assert.match(css,/backdrop-filter:none/);
 assert.doesNotMatch(css,/body\.nu-gateway-open \.world,body\.nu-gateway-open/);
 assert.doesNotMatch(css,/body\.nu-gateway-open \.world \*/);
});

test("Gateway keeps responsive geometry, touch, keyboard and reduced-motion support",()=>{
 assert.match(css,/position:fixed/);assert.match(css,/prefers-reduced-motion/);
 assert.match(js,/function layoutItems\(\)/);
 assert.match(js,/window\.addEventListener\("resize",layoutItems/);
 assert.match(js,/window\.addEventListener\("orientationchange",layoutItems/);
 assert.match(js,/pointerType!=="touch"/);
 assert.match(js,/event\.key==="Escape"/);
 assert.match(js,/const tolerance=10/);
});

test("Gateway replaces the duplicate gameplay pause control and hides legacy navigation in-game",()=>{
 assert.match(html,/id="menu-open"/);assert.match(html,/id="back-home"/);
 assert.doesNotMatch(html,/id="finish-round"/);
 assert.match(css,/body\.nu-game-active #menu-open/);
 assert.match(css,/body\.nu-game-active #back-home/);
 assert.match(games,/window\.addEventListener\("nu:gateway-open"/);
 assert.match(games,/window\.addEventListener\("nu:gateway-close"/);
});

test("No unsupported shield meter is introduced",()=>assert.doesNotMatch(html,/id="nbi-shield-bar"/));

test("Gateway orbit exit bounds include the full vertical fan",()=>{
 assert.match(js,/event\.clientY>=rect\.top-orbit-tolerance&&event\.clientY<=rect\.bottom\+orbit\+tolerance/);
});

test("A hidden tab cannot restart frozen game or ambient renderers",()=>{
 assert.match(games,/gatewayOpen=document\.body\.classList\.contains\("nu-gateway-open"\)/);
 assert.match(dynamic,/function resume\(\)\{if\(!profile\|\|!active\|\|frozen\|\|document\.hidden\)return/);
});


test("Main menu traps keyboard focus and restores its opener",()=>{
 assert.match(games,/function openMenu\(\)/);
 assert.match(games,/menuRoot\.addEventListener\("keydown"/);
 assert.match(games,/focusable\[focusable\.length-1\]/);
 assert.match(games,/menuReturnFocus/);
 assert.match(games,/restoreMenuFocus\(\)/);
});

test("Player views manage focus, wallet tabs support arrow navigation, and Enter does not dismiss profile",()=>{
 assert.match(playerUI,/const viewStack=\[\]/);
 assert.match(playerUI,/viewStack\.push\(\{view:activeView,focus:document\.activeElement\}\)/);
 assert.match(playerUI,/const previous=viewStack\.pop\(\)/);
 assert.match(playerUI,/heading\.focus\(\{preventScroll:true\}\)/);
 assert.match(playerUI,/event\.key==="Escape"&&profileView\.classList\.contains\("active"\)/);
 assert.doesNotMatch(playerUI,/event\.key==="Enter"&&profileView\.classList\.contains\("active"\)/);
 assert.match(playerUI,/ArrowLeft/);assert.match(playerUI,/ArrowRight/);assert.match(playerUI,/event\.key==="Home"/);assert.match(playerUI,/event\.key==="End"/);
});

test("Gateway focus loop wraps in both directions and Escape restores the trigger",()=>{
 assert.match(js,/event\.key==="Escape"\)\{event\.preventDefault\(\);setOpen\(false\);trigger\.focus/);
 assert.match(js,/event\.shiftKey&&document\.activeElement===first/);
 assert.match(js,/!event\.shiftKey&&document\.activeElement===last/);
 assert.match(css,/#nu-hex-gateway button:focus-visible/);
});


test("Gateway removes redundant utility-page menu and back controls while Profile keeps Wallet tabs",()=>{
  assert.ok(worldCss.includes("body.nu-gateway-utility-active #menu-open"));
  assert.ok(worldCss.includes("body.nu-gateway-utility-active #menu-profile"));
  assert.ok(worldCss.includes("body.nu-game-active #menu-profile"));
  assert.ok(css.includes("body.nu-gateway-utility-active #bag-back"));
  assert.ok(css.includes("body.nu-gateway-utility-active #wallet-back"));
  assert.match(html,/profile-wallet-tabs/);
  assert.doesNotMatch(html,/id="profile-back"/);
});


// A deterministic DOM/timer harness exercises the actual Gateway runtime rather than
// relying only on source-pattern assertions. The controller adapter is stubbed so this
// suite can prove the direct-input boundary without changing simulated-pointer behavior.
function gatewayRuntimeHarness(){
 const vm=require("node:vm");
 let now=0,nextTimer=0,hitTarget=null,menuClicks=0;
 const timers=new Map(),windowListeners=new Map(),documentListeners=new Map();
 const schedule=(fn,delay)=>{const id=++nextTimer;timers.set(id,{at:now+Number(delay||0),fn});return id;};
 const cancel=id=>timers.delete(id);
 const advance=ms=>{
  const end=now+ms;
  for(;;){
   let chosen=null;
   for(const [id,timer] of timers){if(timer.at<=end&&(!chosen||timer.at<chosen.timer.at))chosen={id,timer};}
   if(!chosen)break;
   timers.delete(chosen.id);now=chosen.timer.at;chosen.timer.fn();
  }
  now=end;
 };
 class ClassList{
  constructor(){this.values=new Set();}
  add(value){this.values.add(value);}
  remove(value){this.values.delete(value);}
  contains(value){return this.values.has(value);}
  toggle(value,force){const next=force===undefined?!this.values.has(value):!!force;if(next)this.values.add(value);else this.values.delete(value);return next;}
 }
 class Element{
  constructor(kind){this.kind=kind;this.listeners=new Map();this.classList=new ClassList();this.attributes={};this.dataset={};this.style={setProperty(){}};this.tabIndex=0;}
  addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(fn);}
  dispatch(type,init={}){
   const event={type,target:this,currentTarget:this,isPrimary:true,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.propagationStopped=true;},...init};
   for(const fn of this.listeners.get(type)||[])fn(event);
   return event;
  }
  closest(selector){if(selector===".nu-gateway-trigger"&&this.kind==="trigger")return this;if(selector===".nu-gateway-item"&&this.kind==="item")return this;return null;}
  setAttribute(key,value){this.attributes[key]=String(value);}
  focus(){document.activeElement=this;}
  getBoundingClientRect(){return {left:100,right:160,top:100,bottom:160};}
 }
 const trigger=new Element("trigger"),items=[new Element("item"),new Element("item"),new Element("item")];
 items[0].dataset.action="menu";items[1].dataset.action="menu";items[2].dataset.action="menu";
 const root=new Element("root"),scrim=new Element("scrim"),gameView=new Element("game-view"),menuButton={click(){menuClicks++;}};
 root.querySelector=selector=>selector===".nu-gateway-trigger"?trigger:null;
 root.querySelectorAll=selector=>selector===".nu-gateway-item"?items:[];
 const body=new Element("body");
 const document={
  body,activeElement:null,
  getElementById(id){if(id==="nu-hex-gateway")return root;if(id==="game-view")return gameView;if(id==="menu-open")return menuButton;return null;},
  querySelector(selector){return selector===".nu-gateway-scrim"?scrim:null;},
  addEventListener(type,fn){if(!documentListeners.has(type))documentListeners.set(type,[]);documentListeners.get(type).push(fn);},
  dispatchEvent(event){for(const fn of documentListeners.get(event.type)||[])fn(event);return true;},
  elementFromPoint(){return hitTarget;}
 };
 const dispatchDocument=(type,init={})=>{
  const event={type,target:init.target||hitTarget,currentTarget:document,isPrimary:true,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.propagationStopped=true;},...init};
  for(const fn of documentListeners.get(type)||[])fn(event);
  return event;
 };
 class FakeEvent{constructor(type,options={}){this.type=type;this.detail=options.detail;}}
 class MutationObserver{constructor(fn){this.fn=fn;}observe(){}disconnect(){}}
 const window={
  document,location:{search:"",href:""},navigator:{getGamepads(){return[];}},
  matchMedia(){return{matches:false};},
  setTimeout:schedule,clearTimeout:cancel,
  addEventListener(type,fn){if(!windowListeners.has(type))windowListeners.set(type,[]);windowListeners.get(type).push(fn);},
  dispatchEvent(event){for(const fn of windowListeners.get(event.type)||[])fn(event);return true;},
  NUControllerPointer:{setEnabled(){},setGatewayNavigation(){}}
 };
 const windowDispatch=(type,detail)=>window.dispatchEvent(new FakeEvent(type,{detail}));
 vm.runInNewContext(fs.readFileSync("nu-hex-gateway.js","utf8"),{
  window,document,MutationObserver,URLSearchParams,Event:FakeEvent,Date,Math,Number,Array,Object,String,
  setTimeout:schedule,clearTimeout:cancel,performance:{now:()=>now}
 });
 return{
  trigger,items,root,document,advance,
  dispatchDocument,
  setHit(target){hitTarget=target;},
  windowDispatch,
  openByClick(){trigger.dispatch("click",{detail:1});},
  menuClicks(){return menuClicks;}
 };
}

test("Direct physical mouse opens Gateway at 200ms, not 199ms",()=>{
 const h=gatewayRuntimeHarness();
 h.trigger.dispatch("pointerenter",{pointerType:"mouse"});
 h.advance(199);assert.equal(h.root.classList.contains("is-open"),false);
 h.advance(1);assert.equal(h.root.classList.contains("is-open"),true);
});

test("A short touch tap opens Gateway immediately; a 200ms touch dwell opens once and pointerup does not toggle it closed",()=>{
 const tap=gatewayRuntimeHarness();
 tap.trigger.dispatch("pointerdown",{pointerType:"touch",pointerId:1});
 tap.trigger.dispatch("pointerup",{pointerType:"touch",pointerId:1});
 assert.equal(tap.root.classList.contains("is-open"),true);

 const dwell=gatewayRuntimeHarness();
 dwell.trigger.dispatch("pointerdown",{pointerType:"touch",pointerId:2});
 dwell.advance(199);assert.equal(dwell.root.classList.contains("is-open"),false);
 dwell.advance(1);assert.equal(dwell.root.classList.contains("is-open"),true);
 dwell.trigger.dispatch("pointerup",{pointerType:"touch",pointerId:2});
 assert.equal(dwell.root.classList.contains("is-open"),true);
});

test("Physical mouse hover on an actionable option executes after 200ms without a prior Select",()=>{
 const h=gatewayRuntimeHarness();h.openByClick();
 h.items[0].dispatch("pointerenter",{pointerType:"mouse"});
 h.advance(199);assert.equal(h.menuClicks(),0);assert.equal(h.root.classList.contains("is-open"),true);
 h.advance(1);assert.equal(h.menuClicks(),1);assert.equal(h.root.classList.contains("is-open"),false);
});

test("Leaving an option before 200ms cancels its pending mouse dwell action",()=>{
 const h=gatewayRuntimeHarness();h.openByClick();
 h.items[0].dispatch("pointerenter",{pointerType:"mouse"});
 h.advance(199);h.items[0].dispatch("pointerleave",{pointerType:"mouse"});
 h.advance(1);assert.equal(h.menuClicks(),0);assert.equal(h.root.classList.contains("is-open"),true);
});

test("Touch option dwell executes once at 200ms and suppresses its compatibility click",()=>{
 const h=gatewayRuntimeHarness();h.openByClick();h.setHit(h.items[0]);
 h.items[0].dispatch("pointerdown",{pointerType:"touch",pointerId:3});
 h.advance(199);assert.equal(h.menuClicks(),0);
 h.advance(1);assert.equal(h.menuClicks(),1);
 h.dispatchDocument("pointerup",{pointerType:"touch",pointerId:3,clientX:10,clientY:10});
 h.items[0].dispatch("click",{detail:1});
 assert.equal(h.menuClicks(),1);
});

test("A short touch tap on an option remains immediate and does not double-execute",()=>{
 const h=gatewayRuntimeHarness();h.openByClick();h.setHit(h.items[0]);
 h.items[0].dispatch("pointerdown",{pointerType:"touch",pointerId:4});
 h.dispatchDocument("pointerup",{pointerType:"touch",pointerId:4,clientX:10,clientY:10});
 h.items[0].dispatch("click",{detail:1});
 h.advance(120);assert.equal(h.menuClicks(),1);
});

test("Changing touch target cancels the old option dwell and starts a fresh 200ms window",()=>{
 const h=gatewayRuntimeHarness();h.openByClick();h.setHit(h.items[0]);
 h.items[0].dispatch("pointerdown",{pointerType:"touch",pointerId:5});
 h.advance(199);h.setHit(h.items[1]);
 h.dispatchDocument("pointermove",{pointerType:"touch",pointerId:5,clientX:20,clientY:20});
 h.advance(1);assert.equal(h.menuClicks(),0);
 h.advance(199);assert.equal(h.menuClicks(),1);
});

test("Simulated pointer still enters Gateway only after 1000ms",()=>{
 const h=gatewayRuntimeHarness();
 h.windowDispatch("nu:simulated-pointer-target",{target:h.trigger,previousTarget:null});
 h.advance(999);assert.equal(h.root.classList.contains("is-open"),false);
 h.advance(1);assert.equal(h.root.classList.contains("is-open"),true);
});


test("Direct physical Gateway dwell is 200ms while simulated-pointer entry remains 1000ms",()=>{
 assert.match(js,/scheduleOpen\(200,"physical-mouse"\)/);
 assert.match(js,/scheduleOpen\(200,"touch"\)/);
 assert.match(js,/scheduleOpen\(1000,"simulated-pointer"\)/);
 assert.match(js,/optionHoverTimer=window\.setTimeout/);
 assert.match(js,/touchOptionTimer=window\.setTimeout/);
 for(const page of [html,casino,launcher,studio]){
  assert.match(page,/nu-hex-gateway\.js\?v=20261119-gateway-200ms-r1/);
 }
});

test("Direct dwell never edits or reclassifies the shared simulated-pointer adapter",()=>{
 const pointer=read("nu-controller-pointer.js");
 assert.match(pointer,/mode:"simulated-mouse"/);
 assert.match(pointer,/setGatewayNavigation\(value\)/);
 assert.match(js,/scheduleOpen\(1000,"simulated-pointer"\)/);
 assert.match(js,/event\.nuSimulated/);
});
