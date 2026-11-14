"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8");
const css=fs.readFileSync("nu-world.css","utf8");
const ui=fs.readFileSync("nu-player-ui.js","utf8");

test("wallet tabs are docked at the bottom after their content panels",()=>{
  const balances=html.indexOf('data-wallet-panel="balances"');
  const transactions=html.indexOf('data-wallet-panel="transactions"');
  const nav=html.indexOf('class="wallet-card-tabs"');
  assert.ok(balances>=0&&transactions>balances&&nav>transactions);
  assert.match(html,/wallet-hologram-title">PLAYER &amp; USER · BALANCES/);
  assert.match(html,/wallet-hologram-title">TRANSACTION HISTORY/);
});

test("wallet tabs slide upward from below the card edge",()=>{
  assert.match(css,/\.wallet-card-tabs\{[^}]*align-items:flex-end[^}]*margin:24px -22px -22px/s);
  assert.match(css,/\.wallet-card-tab\{[^}]*transform:translateY\(9px\)/s);
  assert.match(css,/\.wallet-card-tab:hover,[^{]*\.wallet-card-tab\.is-active\{[^}]*transform:translateY\(0\)/s);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.wallet-card-tab\{transition:none\}\}/);
});

test("Player ID keeps the original stable local identifier behavior",()=>{
  assert.match(ui,/return "NU-"\+Array\.from\(bytes,b=>b\.toString\(16\)\.padStart\(2,"0"\)\)\.join\(""/);
  assert.match(ui,/if\(!s\.playerId\)\{s\.playerId=makePlayerId\(\)/);
  assert.match(html,/wallet-hologram-title">PLAYER PROFILE/);
});
