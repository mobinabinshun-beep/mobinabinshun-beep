"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const health=require("../nu-health.js");
function memoryStorage(){const values=new Map();return {getItem:key=>values.has(key)?values.get(key):null,setItem:(key,value)=>values.set(key,String(value)),dump:key=>values.get(key)};}

test("health events use a separate storage key and never write into wallet save data",()=>{
  const storage=memoryStorage(),store=health.createHealthStore(storage);
  store.recordDamage({gameId:"bubble",amount:1,hpAfter:9,reason:"test"});
  assert.equal(storage.dump("nu-health-records-v1")!==undefined,true);
  assert.equal(storage.dump("nu-world-save-v1"),undefined);
  assert.equal(health.STORAGE_KEY,"nu-health-records-v1");
});

test("each health category keeps only its five newest events",()=>{
  const store=health.createHealthStore(memoryStorage());
  for(let i=1;i<=7;i++){
    store.recordDamage({gameId:"game-"+i,amount:i,hpAfter:10-i});
    store.recordMedicationUse({gameId:"game-"+i,itemName:"Medicine "+i});
    store.recordHealing({gameId:"game-"+i,amount:i,hpAfter:i,source:"Treatment "+i});
    store.recordDeath({gameId:"game-"+i,reason:"Death "+i});
  }
  assert.deepEqual(store.getHistory("damage").map(event=>event.amount),[3,4,5,6,7]);
  assert.deepEqual(store.getHistory("medicationUses").map(event=>event.itemName),["Medicine 3","Medicine 4","Medicine 5","Medicine 6","Medicine 7"]);
  assert.deepEqual(store.getHistory("healing").map(event=>event.amount),[3,4,5,6,7]);
  assert.deepEqual(store.getHistory("deaths").map(event=>event.reason),["Death 3","Death 4","Death 5","Death 6","Death 7"]);
  for(const category of ["damage","medicationUses","healing","deaths"])assert.equal(store.getHistory(category).length,5);
});

test("medicine, damage, healing and death histories are isolated from one another",()=>{
  const store=health.createHealthStore(memoryStorage());
  store.recordMedicationUse({gameId:"mana",itemName:"Golden HP Capsule",itemType:"medicine",effectAmount:4});
  store.recordDamage({gameId:"chaos",amount:1,hpAfter:4});
  store.recordHealing({gameId:"bubble",amount:2,hpAfter:6,source:"reward"});
  store.recordDeath({gameId:"chaos",hpBefore:1});
  assert.equal(store.getHistory("medicationUses").length,1);
  assert.equal(store.getHistory("damage").length,1);
  assert.equal(store.getHistory("healing").length,1);
  assert.equal(store.getHistory("deaths").length,1);
  assert.equal(store.getHistory("transactions").length,0);
});

test("health event payloads require valid item names and positive amounts",()=>{
  const store=health.createHealthStore(memoryStorage());
  assert.equal(store.recordMedicationUse({gameId:"game"}),false);
  assert.equal(store.recordDamage({gameId:"game",amount:0}),false);
  assert.equal(store.recordHealing({gameId:"game",amount:-1}),false);
  assert.equal(store.getAll().medicationUses.length,0);
  assert.equal(store.getAll().damage.length,0);
  assert.equal(store.getAll().healing.length,0);
});

test("health history remains readable after a new store instance is created",()=>{
  const storage=memoryStorage(),first=health.createHealthStore(storage);
  first.recordDeath({gameId:"chaos",reason:"breach",hpBefore:1});
  const second=health.createHealthStore(storage);
  assert.equal(second.getHistory("deaths")[0].gameId,"chaos");
});
