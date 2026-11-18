"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const Wallet=require("../nu-wallet.js");

test("Mana container capacity is one to nine fixed 10-Mana containers",()=>{
  assert.equal(Wallet.normalizeSave({manaCapsules:1,mana:10}).mana,10);
  assert.equal(Wallet.normalizeSave({manaCapsules:9,mana:90}).mana,90);
  assert.equal(Wallet.normalizeSave({manaCapsules:10,mana:120}).manaCapsules,9);
  assert.equal(Wallet.normalizeSave({manaCapsules:10,mana:120}).mana,90);
  assert.equal(Wallet.normalizeSave({manaCapsules:3,mana:50}).mana,30);
});

test("Store charge consumes one full container and arms the shield for the next Chaos Wave",()=>{
  const initial=Wallet.normalizeSave({mana:10,manaCapsules:1,arcaneShieldLevel:1});
  const charged=Wallet.chargeArcaneShield(initial,"store",{id:"shield-store-1"});
  assert.equal(charged.ok,true);
  assert.equal(charged.state.mana,0);
  assert.equal(charged.state.arcaneShieldCharge,10);
  assert.equal(charged.state.arcaneShieldPrepared,true);
  assert.equal(charged.transaction.signedAmount,-10);
  assert.equal(charged.transaction.category,"ARCANE_SHIELD_CHARGE");
  const started=Wallet.beginWave(charged.state,"chaos");
  assert.equal(started.state.arcaneShieldPrepared,false);
  assert.ok(started.state.arcaneShieldUsedWaveIds.includes(started.waveId));
  const second=Wallet.chargeArcaneShield(started.state,"in_game");
  assert.equal(second.ok,false);
  assert.equal(second.reason,"SHIELD_ALREADY_CHARGED");
});

test("Store shield charge rejects insufficient Mana, active Wave, and stacking",()=>{
  assert.equal(Wallet.chargeArcaneShield({mana:9},"store").reason,"INSUFFICIENT_MANA");
  const active=Wallet.beginWave({mana:10},"chaos").state;
  assert.equal(Wallet.chargeArcaneShield(active,"store").reason,"STORE_CHARGE_REQUIRES_NO_ACTIVE_WAVE");
  const charged=Wallet.chargeArcaneShield({mana:20,arcaneShieldCharge:2},"store");
  assert.equal(charged.reason,"SHIELD_ALREADY_CHARGED");
});

test("Level one cannot recharge in-game; level two can charge once per gameplay Wave",()=>{
  const wave1=Wallet.beginWave({mana:20,arcaneShieldLevel:1},"chaos");
  assert.equal(Wallet.chargeArcaneShield(wave1.state,"in_game").reason,"SHIELD_UPGRADE_REQUIRED");
  const wave2=Wallet.beginWave({mana:20,manaCapsules:2,arcaneShieldLevel:2},"chaos");
  const charged=Wallet.chargeArcaneShield(wave2.state,"in_game");
  assert.equal(charged.ok,true);
  assert.equal(charged.state.mana,10);
  assert.equal(charged.state.arcaneShieldCharge,10);
  assert.equal(charged.state.activeWave.aggregates["OUTGOING|mana|ARCANE_SHIELD_CHARGE"].amount,-10);
  const depleted=Wallet.resolveChaosHits(charged.state,Array.from({length:10},(_,i)=>"mass-"+i));
  assert.equal(depleted.ok,true);
  assert.equal(depleted.absorbed,10);
  assert.equal(depleted.hpDamage,0);
  assert.equal(depleted.state.arcaneShieldCharge,0);
  assert.equal(Wallet.chargeArcaneShield(depleted.state,"in_game").reason,"WAVE_CHARGE_ALREADY_USED");
});

test("Shield absorbs hits before HP and duplicate target resolution is idempotent",()=>{
  const wave=Wallet.beginWave({mana:20,hp:10,arcaneShieldLevel:2},"chaos");
  const charged=Wallet.chargeArcaneShield(wave.state,"in_game");
  const first=Wallet.resolveChaosHits(charged.state,["a","b","c","c"]);
  assert.equal(first.resolvedCount,3);
  assert.equal(first.absorbed,3);
  assert.equal(first.hpDamage,0);
  assert.equal(first.state.arcaneShieldCharge,7);
  const second=Wallet.resolveChaosHits(first.state,["a","b","d"]);
  assert.equal(second.resolvedCount,1);
  assert.equal(second.absorbed,1);
  assert.equal(second.hpDamage,0);
  assert.equal(second.state.arcaneShieldCharge,6);
});

test("partial shield charge carries to the next Wave and can be recharged once after depletion",()=>{
  const firstWave=Wallet.beginWave({mana:30,manaCapsules:3,hp:10,arcaneShieldLevel:2},"chaos");
  const charged=Wallet.chargeArcaneShield(firstWave.state,"in_game");
  const partial=Wallet.resolveChaosHits(charged.state,["1","2","3","4"]);
  assert.equal(partial.state.arcaneShieldCharge,6);
  const closed=Wallet.settleWave(partial.state,"completed");
  const nextWave=Wallet.beginWave(closed.state,"chaos");
  assert.equal(nextWave.state.arcaneShieldCharge,6);
  const depleted=Wallet.resolveChaosHits(nextWave.state,["5","6","7","8","9","10"]);
  assert.equal(depleted.state.arcaneShieldCharge,0);
  assert.equal(depleted.state.hp,10);
  const recharged=Wallet.chargeArcaneShield(depleted.state,"in_game");
  assert.equal(recharged.ok,true);
  assert.equal(recharged.state.mana,10);
  assert.equal(recharged.state.arcaneShieldCharge,10);
});

test("unshielded Chaos hits reduce HP by one each and persist a Wave damage aggregate",()=>{
  const wave=Wallet.beginWave({mana:0,hp:4},"chaos");
  const result=Wallet.resolveChaosHits(wave.state,["x","y","z","w","extra"]);
  assert.equal(result.hpDamage,4);
  assert.equal(result.died,true);
  assert.equal(result.state.hp,0);
  assert.equal(result.state.activeWave.aggregates["OUTGOING|hp|CHAOS_BREACH_DAMAGE"].amount,-4);
  assert.equal(result.state.activeWave.resolvedChaosTargetIds.length,5);
});

test("game UI keeps shield controls separate from the locked classic resource HUD",()=>{
  const html=fs.readFileSync("index.html","utf8");
  const games=fs.readFileSync("nu-games.js","utf8");
  const css=fs.readFileSync("nu-arcane-shield.css","utf8");
  assert.match(html,/<div id="arcane-shield-panel" class="nu-arcane-shield"/);
  assert.match(html,/<div class="bars"><span class="hud-chip" id="level-chip">LV 1<\/span>/);
  assert.match(html,/nu-arcane-shield\.css/);
  assert.match(games,/function renderArcaneShield\(/);
  assert.match(games,/function resolveRemainingChaosMasses\(/);
  assert.match(games,/resolveRemainingChaosMasses\("CHAOS_PLAYER_EXIT"\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});

test("N-BI level-one shot atomically spends 10 Mana, neutralizes one target and awards 3 XP",()=>{
  const wave=Wallet.beginWave({mana:20,manaCapsules:2,xp:0},"chaos");
  const registered=Wallet.registerChaosTargets(wave.state,["mass-a","mass-b"]);
  const shot=Wallet.fireNbiShot(registered.state,"mass-a");
  assert.equal(shot.ok,true);
  assert.equal(shot.manaSpent,10);
  assert.equal(shot.xpAwarded,3);
  assert.equal(shot.state.mana,10);
  assert.equal(shot.state.xp,3);
  assert.deepEqual(shot.state.activeWave.pendingChaosTargetIds,["mass-b"]);
  assert.ok(shot.state.activeWave.neutralizedChaosTargetIds.includes("mass-a"));
  assert.equal(shot.state.activeWave.successfulInteractions,1);
  const later=Wallet.resolveChaosHits(shot.state,["mass-a","mass-b"]);
  assert.equal(later.resolvedCount,1);
  assert.equal(later.hpDamage,1);
});

test("pending Chaos targets survive save normalization and are resolved exactly once",()=>{
  const wave=Wallet.beginWave({mana:0,hp:5},"chaos");
  const registered=Wallet.registerChaosTargets(wave.state,["pending-1","pending-2"]);
  const saved=Wallet.normalizeSave(JSON.parse(JSON.stringify(registered.state)));
  const recovered=Wallet.resolveChaosHits(saved,saved.activeWave.pendingChaosTargetIds);
  assert.equal(recovered.resolvedCount,2);
  assert.equal(recovered.hpDamage,2);
  assert.deepEqual(recovered.state.activeWave.pendingChaosTargetIds,[]);
  const duplicate=Wallet.resolveChaosHits(recovered.state,["pending-1","pending-2"]);
  assert.equal(duplicate.resolvedCount,0);
  assert.equal(duplicate.hpDamage,0);
});


test("one X Credit capacity upgrade adds a permanent full container and a separate Mana grant",()=>{
  const result=Wallet.upgradeManaCapacity({xCredits:1,manaCapsules:1,mana:4},{id:"capacity-upgrade-1"});
  assert.equal(result.ok,true);
  assert.equal(result.xCreditsSpent,1);
  assert.equal(result.capacity,2);
  assert.equal(result.maxMana,20);
  assert.equal(result.manaGranted,10);
  assert.equal(result.state.xCredits,0);
  assert.equal(result.state.manaCapsules,2);
  assert.equal(result.state.mana,14);
  assert.equal(result.transactions.length,3);
  assert.equal(result.transactions[0].category,"MANA_CAPACITY_UPGRADE_COST");
  assert.equal(result.transactions[1].category,"MANA_CAPACITY_UPGRADE");
  assert.equal(result.transactions[2].category,"MANA_CAPACITY_UPGRADE_GRANT");
  assert.equal(result.transactions[2].signedAmount,10);
  const duplicate=Wallet.upgradeManaCapacity(result.state,{id:"capacity-upgrade-1"});
  assert.equal(duplicate.ok,false);
  assert.equal(duplicate.reason,"DUPLICATE_TRANSACTION");
});

test("capacity upgrade rejects missing X Credit, active Wave and level-nine capacity without side effects",()=>{
  assert.equal(Wallet.upgradeManaCapacity({xCredits:0,manaCapsules:1,mana:0},{id:"no-x"}).reason,"INSUFFICIENT_X_CREDITS");
  const active=Wallet.beginWave({xCredits:1,manaCapsules:1,mana:0},"chaos");
  assert.equal(Wallet.upgradeManaCapacity(active.state,{id:"active-wave"}).reason,"UPGRADE_REQUIRES_NO_ACTIVE_WAVE");
  assert.equal(Wallet.upgradeManaCapacity({xCredits:1,manaCapsules:9,mana:90},{id:"cap-nine"}).reason,"MAX_MANA_CAPACITY");
  const unchanged=Wallet.normalizeSave({xCredits:0,manaCapsules:1,mana:0});
  assert.equal(unchanged.mana,0);
  assert.equal(unchanged.manaCapsules,1);
});
