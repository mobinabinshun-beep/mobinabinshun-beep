"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

test("wallet profile and transactions are nested after the audit trail, not shown as a separate bridge panel",()=>{
 const html=fs.readFileSync(path.join(__dirname,"../exchange.html"),"utf8");
 const audit=html.indexOf('class="exchange-panel audit-trail-panel"');
 const movements=html.indexOf('id="asset-transactions"');
 const wallet=html.indexOf('id="wallet-connection"');
 assert.ok(audit>=0&&movements>audit&&wallet>movements);
 assert.doesNotMatch(html,/wallet-bridge-panel/);
 assert.match(html,/AUDIT TRAIL[\s\S]*?RECENT ASSET MOVEMENTS[\s\S]*?LOCAL SAVE/);
});

test("audit animation observes canonical player, asset and transaction changes",()=>{
 const js=fs.readFileSync(path.join(__dirname,"../nu-exchange.js"),"utf8");
 assert.match(js,/function auditSignature\(save\)/);
 assert.match(js,/assets:NUWallet\.assetRows\(save\),transactions:save\.transactions/);
 assert.match(js,/nu:wallet:audit-updated/);
 assert.match(js,/\.audit-trail-panel/);
 assert.doesNotMatch(js,/lastLedgerSignature/);
});

test("wallet bridge reads the same canonical local save and does not construct a second balance",()=>{
 const oldStorage=global.localStorage,oldNU=global.NU,oldWallet=global.NUWallet;
 const fixture={playerId:"PLAYER-7",displayName:"Test Explorer",level:4,xp:120,mana:3,hp:8,hpPills:1,manaCapsules:1,casinoCredits:40,xCredits:5,nCredits:2,transactions:[{id:"tx-a",at:"2026-11-15T08:00:00.000Z",kind:"reward",title:"Quest reward",deltas:{xp:20}}]};
 global.localStorage={getItem(){return null;},setItem(){}};
 global.NU={load(){return fixture;}};
 global.NUWallet=require("../nu-wallet.js");
 try{
  delete require.cache[require.resolve("../nu-exchange-engines.js")];
  const engines=require("../nu-exchange-engines.js");
  const view=engines.walletEngine.read();
  assert.equal(view.source,"nu-world-save-v1");
  assert.equal(view.player.id,"PLAYER-7");
  assert.equal(view.player.displayName,"Test Explorer");
  assert.equal(view.assets.find(a=>a.key==="xp").value,120);
  assert.deepEqual(view.transactions,fixture.transactions.slice(-10).reverse());
  assert.equal(view.mode,"LOCAL_READ_ONLY");
 }finally{
  if(oldStorage===undefined)delete global.localStorage;else global.localStorage=oldStorage;
  if(oldNU===undefined)delete global.NU;else global.NU=oldNU;
  if(oldWallet===undefined)delete global.NUWallet;else global.NUWallet=oldWallet;
  delete require.cache[require.resolve("../nu-exchange-engines.js")];
 }
});

test("audit feedback remains responsive and respects reduced-motion preferences",()=>{
 const css=fs.readFileSync(path.join(__dirname,"../nu-exchange.css"),"utf8");
 assert.match(css,/@media\(max-width:560px\)[\s\S]*?wallet-audit-subsection/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)[\s\S]*?audit-trail-panel\.audit-updated/);
});
