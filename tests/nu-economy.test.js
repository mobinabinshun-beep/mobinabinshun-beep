import test from "node:test";
import assert from "node:assert/strict";
globalThis.window=globalThis;
await import("../nu-economy.js");
const E=globalThis.NUEconomy;
test("HP capsule costs exactly 10 XP and adds one inventory item",()=>{
 const wallet={xp:25,hp:4},inv={hpPills:0};
 assert.equal(E.buyHpCapsule(wallet,inv),true);
 assert.deepEqual(wallet,{xp:15,hp:4});assert.equal(inv.hpPills,1);
});
test("cannot buy without 10 XP",()=>{
 const wallet={xp:9,hp:4},inv={hpPills:0};
 assert.equal(E.buyHpCapsule(wallet,inv),false);
 assert.equal(wallet.xp,9);assert.equal(inv.hpPills,0);
});
test("at 1 HP, capsule restores 9 and is consumed",()=>{
 const wallet={xp:0,hp:1},inv={hpPills:1};
 assert.equal(E.useHpCapsule(wallet,inv),9);
 assert.equal(wallet.hp,10);assert.equal(inv.hpPills,0);
});
test("at 9 HP, capsule restores only 1",()=>{
 const wallet={hp:9},inv={hpPills:1};
 assert.equal(E.useHpCapsule(wallet,inv),1);
 assert.equal(wallet.hp,10);assert.equal(inv.hpPills,0);
});
test("full HP cannot consume a capsule",()=>{
 const wallet={hp:10},inv={hpPills:1};
 assert.equal(E.useHpCapsule(wallet,inv),0);
 assert.equal(wallet.hp,10);assert.equal(inv.hpPills,1);
});
