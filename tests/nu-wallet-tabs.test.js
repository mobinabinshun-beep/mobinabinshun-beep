"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8");
const css=fs.readFileSync("nu-world.css","utf8");
const ui=fs.readFileSync("nu-player-ui.js","utf8");

test("wallet tabs are docked at the top before their content panels",()=>{
  const walletPanel=html.indexOf('<div class="glass wallet-panel">');
  const nav=html.indexOf('class="wallet-card-tabs"');
  const balances=html.indexOf('data-wallet-panel="balances"');
  const transactions=html.indexOf('data-wallet-panel="transactions"');
  assert.ok(walletPanel>=0&&nav>walletPanel&&balances>nav&&transactions>balances);
  assert.match(html,/wallet-hologram-title">PLAYER &amp; USER · BALANCES/);
  assert.match(html,/wallet-hologram-title">TRANSACTION HISTORY/);
});

test("wallet tabs rise upward from the upper card edge",()=>{
  assert.match(css,/\.wallet-card-tabs\{align-items:flex-start;margin:-22px -22px 24px/);
  assert.match(css,/\.wallet-card-tab\{border-top:0;[\s\S]*?transform:translateY\(9px\)/);
  assert.match(css,/\.wallet-card-tab:hover,[\s\S]*?transform:translateY\(0\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.wallet-card-tab\{transition:none\}\}/);
});

test("Player ID keeps the original stable local identifier behavior",()=>{
  assert.match(ui,/return "NU-"\+Array\.from\(bytes,b=>b\.toString\(16\)\.padStart\(2,"0"\)\)\.join\(""/);
  assert.match(ui,/if\(!s\.playerId\)\{s\.playerId=makePlayerId\(\)/);
  assert.match(html,/class="glass player-id-card classic-player-card"/);
});
