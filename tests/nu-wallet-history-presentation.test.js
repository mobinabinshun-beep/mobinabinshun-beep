"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const ui=fs.readFileSync("nu-player-ui.js","utf8");

test("Wallet groups split asset rows into one concise operation without merging separate operations",()=>{
  assert.ok(ui.includes("function ledgerOperationKey(item)"));
  assert.ok(ui.includes('return id.replace(/\\|(xp|capsule|hp)$/,"");'));
  assert.ok(ui.includes("groupLedgerTransactions(tx).forEach(group=>"));
  assert.ok(ui.includes("function mergeLedgerDeltas(items)"));
  assert.ok(ui.includes('key!=="hp"&&Number(value)!==0'));
});

test("Mana History Ledger uses the same grouped concise operation format",()=>{
  const start=ui.indexOf("function renderManaHistory()");
  const end=ui.indexOf("function buildHumanReport()",start);
  const block=ui.slice(start,end);
  assert.ok(block.includes("groupLedgerTransactions(entries).forEach(group=>"));
  assert.ok(block.includes("title.textContent=names[source]||source.toUpperCase()"));
  assert.ok(!block.includes('title.textContent="MHL · "'));
});

test("Wave health history shows game, total damage and net HP without interaction-count clutter",()=>{
  assert.ok(ui.includes('title.textContent=gameName+": "+signed(damage)+" Damage · "+signed(hpDelta)+" HP"'));
  assert.ok(ui.includes('detail.textContent="Wave "+String(item.waveId||"").slice(-5)+" · "+when'));
  assert.ok(!ui.includes('String(item.successfulInteractions||0)+"/10 INTERACTIONS"'));
});
