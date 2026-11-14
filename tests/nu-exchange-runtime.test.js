"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const core=require("../nu-exchange-core.js"),guard=require("../nu-exchange-guard.js"),replay=require("../nu-exchange-replay.js"),lock=require("../nu-exchange-lock.js");
function memory(){const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};}
test("registry starts empty and only exposes explicitly registered game assets",()=>{
 core.clear();assert.deepEqual(core.listGames(),[]);assert.deepEqual(core.listAssets(),[]);
 const unregister=core.registerGame({id:"game-a",name:"Game A",assets:[{id:"crystal",label:"Crystal"}],coins:[{id:"nu-coin",label:"N.U Coin"}]});
 assert.equal(core.listAssets()[0].games[0].id,"game-a");assert.equal(core.listCoins()[0].id,"nu-coin");unregister();assert.deepEqual(core.listGames(),[]);
});
test("cross-game settlement remains disabled until both approved adapters exist",()=>{
 core.clear();core.registerGame({id:"a",name:"A",assets:[{id:"coin",label:"Coin"}],transferEnabled:false});core.registerGame({id:"b",name:"B",assets:[{id:"coin",label:"Coin"}],transferEnabled:false});
 assert.equal(core.transferAvailability("a","b","coin",1).reason,"TRANSFER_ADAPTER_NOT_APPROVED");
 assert.equal(core.transferAvailability("a","a","coin",1).reason,"CHOOSE_DIFFERENT_GAMES");
});
test("cooldown begins on the 11th attempted action, not immediately after the 10th success",()=>{
 const store=memory();let now=1000;const g=guard.create({storage:store,now:()=>now});
 for(let i=0;i<10;i++){assert.equal(g.beforeAttempt().allowed,true);assert.equal(g.recordSuccess(),true);}
 assert.equal(g.state().locked,false);assert.equal(g.beforeAttempt().reason,"COOLDOWN");assert.equal(g.state().remainingMs,120000);
 now+=120000;assert.equal(g.beforeAttempt().allowed,true);
});
test("leaving before the 11th attempt resets visit count but not an active cooldown",()=>{
 const store=memory();let now=500;const g=guard.create({storage:store,now:()=>now});
 for(let i=0;i<10;i++)g.recordSuccess();g.leaveVisit();assert.equal(g.state().successes,0);assert.equal(g.beforeAttempt().allowed,true);
});
test("replay modes and looping frame selection use 24 player steps",()=>{
 assert.equal(replay.MODES.length,6);assert.equal(replay.frameIndex(0,24,24000),0);assert.equal(replay.frameIndex(23999,24,24000),23);assert.equal(replay.frameIndex(24000,24,24000),0);
});
test("two-step maintenance latch requires phrase and second confirmation",()=>{
 const store=memory(),l=lock.create(store);assert.equal(l.isLocked(),true);
 assert.equal(l.begin("wrong",1000).ok,false);assert.equal(l.begin(lock.PHRASE,1000).ok,true);
 assert.equal(l.confirm(lock.PHRASE,1200).ok,false);assert.equal(l.confirm(lock.PHRASE,1500).ok,true);assert.equal(l.isLocked(),false);l.relock();assert.equal(l.isLocked(),true);
});
