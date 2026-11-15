"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8");
const css=fs.readFileSync("nu-world.css","utf8");
const ui=fs.readFileSync("nu-player-ui.js","utf8");
const games=fs.readFileSync("nu-games.js","utf8");
const exchange=fs.readFileSync("exchange.html","utf8");
const exchangeCss=fs.readFileSync("nu-exchange.css","utf8");

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
  assert.match(html,/class="demo-profile-card"/);
  for(const id of ["demo-name","demo-call","demo-family","demo-age"])assert.ok(html.includes('id="'+id+'"'));
  assert.doesNotMatch(html,/class="glass player-id-card classic-player-card"/);
});


test("Wallet, Profile and Store share the static Exchange-style neutral world backdrop",()=>{
  assert.ok(ui.includes('classList.toggle("nu-neutral-view-open",view===walletView||view===profileView)'));
  assert.ok(ui.includes('classList.remove("nu-neutral-view-open")'));
  assert.ok(games.includes('document.body.classList.add("nu-neutral-view-open")'));
  assert.ok(games.includes('document.body.classList.remove("nu-neutral-view-open")'));
  assert.match(css,/body\.nu-neutral-view-open \.world\{\s*background:radial-gradient\(ellipse at 50% -15%,#163448 0,transparent 55%\),#071018!important/);
  assert.match(css,/body\.nu-neutral-view-open \.world>#nu-dynamic-layers\{\s*display:none!important/);
  assert.doesNotMatch(css,/nu-wallet-open/);
});

test("the four section backdrops stay static while their foreground functions remain available",()=>{
  const neutral=css.slice(css.lastIndexOf("/* N.U neutral scene mode"));
  assert.doesNotMatch(neutral,/animation\s*:|requestAnimationFrame|canvas\s*\{|filter\s*:/);
  for(const id of ["wallet-view","profile-view","shop-view"])assert.ok(html.includes('id="'+id+'"'));
  assert.match(exchange,/id="market-chart"/);
  assert.match(exchange,/id="asset-chart"/);
  assert.match(exchangeCss,/background:radial-gradient\(ellipse at 50% -15%,#163448 0,transparent 55%\),var\(--bg\)/);
});
