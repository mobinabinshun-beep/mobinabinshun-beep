"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const wallet=require("../nu-wallet.js");

test("HP pill purchase deducts exactly 10 XP and adds exactly one capsule",()=>{
  const before={xp:25,hp:4,hpPills:0};
  const result=wallet.buyHpPill(before,{id:"purchase-1",at:"2026-11-12T00:00:00.000Z"});
  assert.equal(result.ok,true);
  assert.equal(result.state.xp,15);
  assert.equal(result.state.hpPills,1);
  assert.deepEqual(result.transaction.deltas,{xp:-10,hpPills:1});
  assert.equal(before.xp,25);
  assert.equal(before.hpPills,0);
});
test("purchase fails without enough XP and does not mutate balances",()=>{
  const before={xp:9,hpPills:2};
  const result=wallet.buyHpPill(before,{id:"purchase-fail"});
  assert.equal(result.ok,false);
  assert.equal(result.reason,"INSUFFICIENT_XP");
  assert.equal(result.state.xp,9);
  assert.equal(result.state.hpPills,2);
  assert.equal(result.state.transactions.length,0);
});
test("one capsule heals by at most 10 HP and is consumed once",()=>{
  const result=wallet.useHpPill({hp:3,hpPills:2},{id:"use-1"});
  assert.equal(result.ok,true);
  assert.equal(result.restored,7);
  assert.equal(result.state.hp,10);
  assert.equal(result.state.hpPills,1);
  assert.deepEqual(result.transaction.deltas,{hp:7,hpPills:-1});
});
test("consumption fails when inventory is empty",()=>{
  const result=wallet.useHpPill({hp:3,hpPills:0},{id:"use-empty"});
  assert.equal(result.ok,false);
  assert.equal(result.reason,"NO_HP_CAPSULE");
  assert.equal(result.state.hp,3);
});
test("consumption fails at full HP without spending a capsule",()=>{
  const result=wallet.useHpPill({hp:10,hpPills:1},{id:"use-full"});
  assert.equal(result.ok,false);
  assert.equal(result.reason,"HP_FULL");
  assert.equal(result.state.hpPills,1);
});
test("normalization clamps HP, Mana and upgrade to their supported ranges",()=>{
  const s=wallet.normalizeSave({hp:18,hpPills:-2,mana:99,manaCapsules:2,upgrade:20,xp:4});
  assert.equal(s.hp,10);
  assert.equal(s.hpPills,0);
  assert.equal(s.mana,20);
  assert.equal(s.upgrade,9);
  assert.equal(s.xp,4);
});
test("wallet save normalization preserves the existing local Player ID",()=>{
  const existingId="NU-ABCDEF012345";
  const normalized=wallet.normalizeSave({playerId:existingId,displayName:"Explorer"});
  assert.equal(normalized.playerId,existingId);
  assert.equal(normalized.displayName,"Explorer");
});
test("wallet lists only implemented assets and excludes undefined Lore",()=>{
  const rows=wallet.assetRows({xp:14,level:2,mana:3,hp:6,hpPills:1,manaCapsules:2,xCredits:0,nCredits:0,upgrade:0});
  assert.ok(rows.some(row=>row.key==="hpPills"&&row.value===1));
  assert.ok(!rows.some(row=>["xCredits","nCredits","upgrade","lore"].includes(row.key)));
});
test("zero-balance assets stay hidden and appear after the first earned unit",()=>{
  const empty=wallet.assetRows({xp:0,mana:0,hp:0,hpPills:0,manaCapsules:0,casinoCredits:0,xCredits:0,nCredits:0,assets:{nuTestShard:0}});
  assert.deepEqual(empty,[]);
  assert.equal(wallet.registerAsset({key:"nuTestShard",label:"N.U Test Shard",group:"game"}),true);
  const before=wallet.assetRows({xp:0,mana:0,hp:0,hpPills:0,manaCapsules:0,casinoCredits:0,xCredits:0,nCredits:0,assets:{nuTestShard:0}});
  assert.deepEqual(before,[]);
  const after=wallet.assetRows({xp:0,mana:0,hp:0,hpPills:0,manaCapsules:0,casinoCredits:0,xCredits:0,nCredits:0,assets:{nuTestShard:1}});
  assert.deepEqual(after.map(row=>[row.key,row.value]),[["nuTestShard",1]]);
});
test("transaction history remains bounded",()=>{
  const s=wallet.normalizeSave({transactions:Array.from({length:50},(_,i)=>({id:String(i)}))});
  assert.equal(wallet.MAX_TRANSACTIONS,24);
  assert.equal(s.transactions.length,24);
  assert.equal(s.transactions[0].id,"26");
});
test("new transaction writes also keep the stored ledger capped at 24",()=>{
  let save={xp:0,level:1};
  for(let i=0;i<35;i++)save=wallet.grantXP(save,1,{id:"cap-"+i}).state;
  assert.equal(save.transactions.length,24);
  assert.equal(save.transactions[0].id,"cap-11");
});
test("studio XP reward increments shared XP and level with an auditable transaction",()=>{
  const result=wallet.grantXP({xp:98,level:1},5,{id:"studio-art-1",title:"Studio export"});
  assert.equal(result.ok,true);
  assert.equal(result.state.xp,103);
  assert.equal(result.state.level,2);
  assert.deepEqual(result.transaction.deltas,{xp:5});
});
test("the same studio export reward cannot be claimed twice",()=>{
  const first=wallet.grantXP({xp:10},7,{id:"studio-fingerprint"});
  const second=wallet.grantXP(first.state,7,{id:"studio-fingerprint"});
  assert.equal(first.ok,true);
  assert.equal(second.ok,false);
  assert.equal(second.reason,"DUPLICATE_REWARD");
  assert.equal(second.state.xp,17);
});
test("game asset projections show only relevant owned assets",()=>{
  const save={xp:20,mana:4,hp:6,hpPills:2,manaCapsules:1};
  assert.deepEqual(wallet.gameAssetRows(save,"bubble").map(x=>x.key),["xp","hp","hpPills"]);
  assert.deepEqual(wallet.gameAssetRows(save,"mana").map(x=>x.key),["mana","hp","manaCapsules"]);
  assert.deepEqual(wallet.gameAssetRows(save,"chaos").map(x=>x.key),["xp","mana","hp","hpPills","manaCapsules"]);
});

test("asset history reconstructs the recorded balance path from signed deltas",()=>{
  const save={xp:18,transactions:[
    {id:"a",at:"2026-11-13T10:00:00.000Z",title:"Reward",deltas:{xp:10}},
    {id:"b",at:"2026-11-13T11:00:00.000Z",title:"Purchase",deltas:{xp:-2}}
  ]};
  const points=wallet.assetHistory(save,"xp");
  assert.deepEqual(points.map(p=>p.balance),[10,20,18]);
  assert.deepEqual(points.map(p=>p.delta),[0,10,-2]);
});
test("asset history excludes unimplemented assets and never fabricates rates",()=>{
  assert.deepEqual(wallet.assetHistory({xp:10,transactions:[]},"xCredits"),[]);
  assert.equal(wallet.assetHistory({xp:10,transactions:[]},"xp").at(-1).balance,10);
});
test("casino credits are included as an owned Generation 1 wallet asset",()=>{
  const rows=wallet.assetRows({casinoCredits:77});
  assert.ok(rows.some(row=>row.key==="casinoCredits"&&row.value===77));
});
