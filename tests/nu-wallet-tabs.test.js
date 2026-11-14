"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8");
const css=fs.readFileSync("nu-world.css","utf8");
const ui=fs.readFileSync("nu-player-ui.js","utf8");

test("wallet tabs are recessed inside the card before their content panels",()=>{
  const walletPanel=html.indexOf('<div class="glass wallet-panel">');
  const nav=html.indexOf('class="wallet-card-tabs"');
  const balances=html.indexOf('data-wallet-panel="balances"');
  const transactions=html.indexOf('data-wallet-panel="transactions"');
  assert.ok(walletPanel>=0&&nav>walletPanel&&balances>nav&&transactions>balances);
  assert.doesNotMatch(html,/wallet-hologram-title/);
});

test("wallet tabs reveal a floating hologram only on interaction",()=>{
  assert.match(css,/\.wallet-card-tab::after\{content:attr\(data-hologram\)/);
  assert.match(css,/\.wallet-card-tab:hover::after,[\s\S]*?\.wallet-card-tab:focus-visible::after,[\s\S]*?\.wallet-card-tab:active::after/);
  assert.doesNotMatch(css,/\.wallet-card-tab\.is-active::after/);
  assert.match(css,/\.wallet-card-tab\{[\s\S]*?flex:0 1 30%/);
  assert.match(css,/\.wallet-card-tab:hover,[\s\S]*?transform:translateY\(-10px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});

test("Player ID keeps the original stable local identifier behavior",()=>{
  assert.match(ui,/return "NU-"\+Array\.from\(bytes,b=>b\.toString\(16\)\.padStart\(2,"0"\)\)\.join\(""/);
  assert.match(ui,/if\(!s\.playerId\)\{s\.playerId=makePlayerId\(\)/);
  assert.match(html,/class="glass player-id-card classic-player-card"/);
});
