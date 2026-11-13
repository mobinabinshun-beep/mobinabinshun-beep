"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const games=fs.readFileSync(require.resolve("../nu-games.js"),"utf8");
const html=fs.readFileSync(require.resolve("../index.html"),"utf8");
const css=fs.readFileSync(require.resolve("../nu-world.css"),"utf8");
const wallet=require("../nu-wallet.js");

test("HP capsule HUD uses a standard click action with pointer propagation isolated",()=>{
  assert.match(games,/hpPillButton\.addEventListener\("click",e=>\{e\.preventDefault\(\);e\.stopPropagation\(\);useHpPill\(e\);\}\)/);
  assert.match(games,/hpPillButton\.addEventListener\("pointerdown",e=>e\.stopPropagation\(\)\)/);
  assert.match(games,/hpPillButton\.addEventListener\("pointerup",e=>e\.stopPropagation\(\)\)/);
  assert.doesNotMatch(games,/hpPillButton\.addEventListener\("pointerup",e=>\{[^}]*useHpPill/);
});

test("successful HUD capsule use emits a coordinate-anchored HP interaction pop",()=>{
  assert.match(games,/function showHpPillInteraction\(button,amount\)/);
  assert.match(games,/el\.className="hit-progress hp-pill-hit-progress"/);
  assert.match(games,/showHpPillInteraction\(e\.currentTarget,result\.restored\)/);
  assert.match(css,/\.hp-pill-hit-progress/);
  assert.match(css,/prefers-reduced-motion:reduce\).*\.hp-pill-hit-progress/);
});

test("HUD markup exposes a real button and cache-busted generation 1.18 scripts",()=>{
  assert.match(html,/<button class="hp-pill-use" id="hp-pill-use" type="button"/);
  assert.match(html,/nu-games\.js\?v=20261113-hp-pill-interaction-r1/);
  assert.match(html,/nu-world\.css\?v=20261113-hp-pill-interaction-r1/);
});

test("HP capsule use still consumes one capsule and restores no more than missing HP",()=>{
  const result=wallet.useHpPill({hp:4,hpPills:2},{id:"hud-interaction-test"});
  assert.equal(result.ok,true);
  assert.equal(result.restored,6);
  assert.equal(result.state.hp,10);
  assert.equal(result.state.hpPills,1);
  const full=wallet.useHpPill({hp:10,hpPills:1},{id:"hud-full-test"});
  assert.equal(full.ok,false);
  assert.equal(full.reason,"HP_FULL");
  assert.equal(full.state.hpPills,1);
});
