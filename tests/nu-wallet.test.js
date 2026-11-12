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
test("wallet lists only implemented assets and excludes undefined Lore",()=>{
  const rows=wallet.assetRows({xp:14,level:2,mana:3,hp:6,hpPills:1,manaCapsules:2,xCredits:0,nCredits:0,upgrade:0});
  assert.ok(rows.some(row=>row.key==="hpPills"&&row.value===1));
  assert.ok(rows.some(row=>row.key==="xCredits"&&row.value===0));
  assert.ok(!rows.some(row=>row.key==="lore"));
});
test("transaction history remains bounded",()=>{
  const s=wallet.normalizeSave({transactions:Array.from({length:50},(_,i)=>({id:String(i)}))});
  assert.equal(s.transactions.length,wallet.MAX_TRANSACTIONS);
  assert.equal(s.transactions[0].id,"10");
});