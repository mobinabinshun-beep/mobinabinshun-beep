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
 h.emit("click",{detail:1});h.emit("click",{detail:1,nuSimulated:true});h.emit("change",{});
 assert.ok(seen.some(r=>r.action==="activate"&&r.source==="selective-click"));
 assert.ok(seen.some(r=>r.action==="activate"&&r.source==="simulated-mouse"));
 assert.equal(seen.filter(r=>r.source==="physical-mouse").length,0);
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

const gameSource=fs.readFileSync("nu-games.js","utf8");
test("Generation 1 game-object events carry stable game/object identity and outcomes",()=>{
 assert.match(gameSource,/function recordGameObjectEvent\(target,action,outcome,source,extra\)/);
 assert.match(gameSource,/objectType=gameId==="bubble"\?"bubble":gameId==="mana"\?"mana-orb":gameId==="chaos"\?"chaos-mass"/);
 assert.match(gameSource,/objectId:target&&target.id!=null\?String\(target.id\):null/);
 assert.match(gameSource,/gameId:state.game,waveId:state.save.activeWave/);
 assert.match(gameSource,/recordGameObjectEvent\(target,"spawn","spawned"/);
 assert.match(gameSource,/function traceGameObjectHover\(event\)/);
 assert.match(gameSource,/recordGameObjectEvent\(target,"hit-test","hit"/);
 assert.match(gameSource,/recordGameObjectEvent\(null,"hit-test","miss"/);
});
test("Bubble Hunt, Mana Collector and Chaos Attack emit action, outcome and despawn evidence",()=>{
 assert.match(gameSource,/recordGameObjectEvent\(target,"pop",awarded\?"rewarded":"reward-persist-failed"/);
 assert.match(gameSource,/recordGameObjectEvent\(target,"collect",collected\?"collected":"persist-failed"/);
 assert.match(gameSource,/recordGameObjectEvent\(target,"fire","fired"/);
 assert.match(gameSource,/recordGameObjectEvent\(o,"collision"/);
 assert.match(gameSource,/recordGameObjectEvent\(target,"resolve"/);
 assert.match(gameSource,/recordGameObjectEvent\(target,"despawn"/);
});
test("game-object diagnostics are non-intrusive when the shared core is unavailable or throws",()=>{
 assert.match(gameSource,/if\(!core\|\|typeof core\.record!=="function"\)return null/);
 assert.match(gameSource,/catch\(_\)\{return null;\}/);
});

const worldCss=fs.readFileSync("nu-world.css","utf8");
const indexHtml=fs.readFileSync("index.html","utf8");
test("active game canvas receives physical pointer and touch input",()=>{
 assert.ok(worldCss.includes("#game-view.active .game-stage{pointer-events:auto}"));
 assert.ok(worldCss.includes("#game-view.active .game-stage canvas{pointer-events:auto;touch-action:none}"));
 assert.ok(indexHtml.includes("nu-world.css?v=20261119-gameplay-input-r3"));
});


test("Mana Collector targets cover the playable canvas and use Android-safe touch hit testing",()=>{
 assert.doesNotMatch(gameSource,/if\(!download&&x>w\*\.22&&x<w\*\.78\)continue/);
 assert.match(gameSource,/const x=rnd\(margin,w-margin\)/);
 assert.match(gameSource,/const hitRadius=state\.game==="mana"\?Math\.max\(22,o\.r\+8\)/);
 assert.match(gameSource,/const scaleX=rect\.width>0\?canvas\.clientWidth\/rect\.width:1/);
 assert.match(gameSource,/const scaleY=rect\.height>0\?canvas\.clientHeight\/rect\.height:1/);
 assert.match(gameSource,/canvas\.setPointerCapture\(e\.pointerId\)/);
});
