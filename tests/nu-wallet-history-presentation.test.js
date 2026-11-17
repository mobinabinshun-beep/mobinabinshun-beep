"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const ui=fs.readFileSync("nu-player-ui.js","utf8");

test("Wallet groups split asset rows into one concise operation without merging separate operations",()=>{
  assert.match(ui,/function ledgerOperationKey\(item\)/);
  assert.ok(ui.includes(String.raw`return id.replace(/\|(xp|capsule|hp)$/,"");`));
  assert.match(ui,/id\.replace\(\/\\\\\|\(xp\|capsule\|hp\)\$\/,""\)/);
  assert.match(ui,/groupLedgerTransactions\(tx\)\.forEach\(group=>/);
  assert.match(ui,/function mergeLedgerDeltas\(items\)/);
  assert.match(ui,/key!=="hp"&&Number\(value\)!==0/);
});

test("Mana History Ledger uses the same grouped concise operation format",()=>{
  const start=ui.indexOf("function renderManaHistory()");
  const end=ui.indexOf("function buildHumanReport()",start);
  const block=ui.slice(start,end);
  assert.match(block,/groupLedgerTransactions\(entries\)\.forEach\(group=>/);
  assert.match(block,/title\.textContent=names\[source\]||source\.toUpperCase\(\)/);
  assert.doesNotMatch(block,/title\.textContent="MHL · "/);
});

test("Wave health history shows the requested game, damage and HP summary without interaction-count clutter",()=>{
  assert.match(ui,/title\.textContent=gameName\+": "\+signed\(damage\)\+" Damage · "\+signed\(hpDelta\)\+" HP"/);
  assert.match(ui,/detail\.textContent="Wave "/);
  assert.doesNotMatch(ui,/successfulInteractions\|\|0\)\+"\/10 INTERACTIONS"/);
});
