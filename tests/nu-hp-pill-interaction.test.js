"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const games=fs.readFileSync(require.resolve("../nu-games.js"),"utf8");
const html=fs.readFileSync(require.resolve("../index.html"),"utf8");
const css=fs.readFileSync(require.resolve("../nu-world.css"),"utf8");
const wallet=require("../nu-wallet.js");

test("HP capsule uses a direct native click listener for pointer, touch and keyboard activation",()=>{
  assert.match(games,/function bindHpPillButton\(\)\{const button=\$\("hp-pill-use"\);if\(!button\)return;button\.addEventListener\("click",e=>\{e\.preventDefault\(\);e\.stopPropagation\(\);if\(button\.hidden\)return;useHpPill\(e\);\}\);\}/);
  assert.match(games,/renderWallet\(\);bindHpPillButton\(\);bindGameAssetProfiles\(\)/);
  assert.doesNotMatch(games,/document\.addEventListener\("pointerup",handleHpPillPointerUp/);
  assert.doesNotMatch(games,/document\.addEventListener\("click",handleHpPillKeyboardClick/);
});

test("successful HUD use captures the icon position before wallet rerender can hide it",()=>{
  assert.match(games,/const anchor=button&&button\.id==="hp-pill-use"\?button\.getBoundingClientRect\(\):null/);
  assert.match(games,/if\(!persistWalletState\(result\.state\)\)return;[\s\S]*?if\(anchor\)showHpPillInteraction\(anchor,result\.restored\)/);
});

test("HP pill interaction pop uses viewport coordinates and cannot be clipped by game-stage overflow",()=>{
  assert.match(games,/function showHpPillInteraction\(anchor,amount\)/);
  assert.match(games,/el\.style\.left=\(anchor\.left\+anchor\.width\/2\)\+"px"/);
  assert.match(games,/document\.body\.appendChild\(el\)/);
  assert.match(css,/#game-view\.active \.hp-bar\{pointer-events:auto!important/);
  assert.match(css,/#game-view\.active \.hp-bar #hp-pill-use\{[^}]*pointer-events:auto!important/);
  assert.match(css,/\.hp-pill-hit-progress\{position:fixed!important/);
});

test("HUD markup is a native button and uses fresh generation 1.20 assets",()=>{
  assert.match(html,/<button class="hp-pill-use" id="hp-pill-use" type="button"/);
  assert.match(html,/nu-games\.js\?v=20261113-hp-pill-direct-click-r1/);
  assert.match(html,/nu-world\.css\?v=20261113-hp-pill-direct-click-r1/);
});

test("HP capsule wallet rules consume exactly one capsule and cap healing at 10 HP",()=>{
  const result=wallet.useHpPill({hp:4,hpPills:2},{id:"hud-interaction-test"});
  assert.equal(result.ok,true);assert.equal(result.restored,6);
  assert.equal(result.state.hp,10);assert.equal(result.state.hpPills,1);
  const full=wallet.useHpPill({hp:10,hpPills:1},{id:"hud-full-test"});
  assert.equal(full.ok,false);assert.equal(full.reason,"HP_FULL");assert.equal(full.state.hpPills,1);
});
