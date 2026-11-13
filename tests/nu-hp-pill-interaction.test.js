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

test("HUD markup is a native button and uses fresh generation 1.25 assets",()=>{
  assert.match(html,/<button class="hp-pill-use" id="hp-pill-use" type="button"/);
  assert.match(html,/nu-games\.js\?v=20261113-hp-pill-dock-motion-r2/);
  assert.match(html,/nu-world\.css\?v=20261113-hp-pill-dock-motion-r2/);
});

test("HP capsule wallet rules consume exactly one capsule and cap healing at 10 HP",()=>{
  const result=wallet.useHpPill({hp:4,hpPills:2},{id:"hud-interaction-test"});
  assert.equal(result.ok,true);assert.equal(result.restored,6);
  assert.equal(result.state.hp,10);assert.equal(result.state.hpPills,1);
  const full=wallet.useHpPill({hp:10,hpPills:1},{id:"hud-full-test"});
  assert.equal(full.ok,false);assert.equal(full.reason,"HP_FULL");assert.equal(full.state.hpPills,1);
});


test("HP HUD capsule remains visible at zero inventory and reports unavailable state without losing clickability",()=>{
  assert.doesNotMatch(games,/pill\.hidden=false/);
  assert.match(games,/button\.hidden=next>=10/);
  assert.match(games,/pill\.classList\.toggle\("unavailable",state\.save\.hp>=10\|\|state\.save\.hpPills<1\)/);
  assert.match(css,/#game-view\.active \.hp-bar #hp-pill-use\.unavailable\{[^}]*pointer-events:auto!important/);
});


test("successful HP capsule use emits a radial interaction burst anchored to the HUD icon",()=>{
  assert.match(games,/function showHpPillInteraction\(anchor,amount\)\{[\s\S]*?hp-pill-interaction-burst/);
  assert.match(games,/hp-pill-burst-ring/);
  assert.match(games,/for\(let i=0;i<8;i\+\+\)/);
  assert.match(games,/hp-pill-burst-particle/);
  assert.match(games,/hp-pill-burst-label/);
  assert.match(games,/showHpPillInteraction\(anchor,result\.restored\)/);
  assert.match(css,/@keyframes nu-hp-burst-ring/);
  assert.match(css,/@keyframes nu-hp-burst-particle/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.hp-pill-interaction-burst/);
  assert.match(css,/\.hp-pill-interaction-burst\{position:fixed/);
});

test("HP capsule travel enters from the inside-right corner and returns along the same reversible path",()=>{
  assert.match(games,/function animateHpPillTravel\\(direction\\)/);
  assert.match(games,/function syncHpPillDock\\(hp\\)/);
  assert.match(games,/lastRenderedHp>=10&&next<10\\)\\{if\\(button\\)button\\.hidden=true;animateHpPillTravel\\("in"\\);\\}/);
  assert.match(games,/lastRenderedHp<10&&next>=10\\)\\{if\\(button\\)button\\.hidden=true;animateHpPillTravel\\("out"\\);\\}/);
  assert.match(games,/barRect\\.right-4/);
  assert.match(games,/barRect\\.right-30/);
  assert.match(games,/hpPillTravelAnimation\\.reverse\\(\\)/);
  assert.match(games,/ghost\\.animate\\(/);
  assert.match(css,/\\.hp-pill-travel-ghost\\{position:fixed/);
  assert.match(css,/@media\\(prefers-reduced-motion:reduce\\)\\{\\.hp-pill-travel-ghost/);
});

test("HP capsule is absent at full HP and remains hidden until its arrival animation finishes",()=>{
  assert.match(html,/<button class="hp-pill-use" id="hp-pill-use" type="button"[^>]*hidden/);
  assert.match(games,/lastRenderedHp=10;[\\s\\S]*?animateHpPillTravel\\("in"\\)/);
  assert.match(games,/const finishedDirection=hpPillTravelDirection;[\\s\\S]*?button\\.hidden=finishedDirection==="out"/);
  assert.match(games,/if\\(lastRenderedHp>=10&&next<10\\)\\{if\\(button\\)button\\.hidden=true;animateHpPillTravel\\("in"\\);\\}/);
  assert.match(css,/#game-view\\.active \\.hp-bar #hp-pill-use\\[hidden\\]\\{display:none!important\\}/);
});

test("Generation 1.26 widens the HP frame and keeps the pill dock inside its right edge",()=>{
  assert.match(css,/#game-view\\.active \\.hp-bar\\{[^}]*width:min\\(340px,calc\\(100vw - 20px\\)\\)/);
  assert.match(css,/#game-view\\.active \\.hp-bar #hp-pill-use\\{[^}]*position:absolute/);
  assert.match(css,/#game-view\\.active \\.hp-bar #hp-pill-use\\{[^}]*right:8px/);
  assert.match(css,/padding:9px 60px 9px 14px/);
  assert.match(games,/const corner=\\{x:barRect\\.right-4/);
  assert.match(games,/const dock=\\{x:barRect\\.right-30/);
  assert.match(html,/hp-pill-dock-motion-r2/);
});

test("HP pill stays hidden during repeated damage and reverses the same in-flight animation when HP recovers",()=>{
  assert.match(games,/hpPillTravelDirection=null/);
  assert.match(games,/hpPillTravelAnimation\\.reverse\\(\\)/);
  assert.match(games,/hpPillTravelAnimation\\.playState==="running"\\?true:next>=10/);
  assert.match(games,/button\\.hidden=finishedDirection==="out"/);
  assert.match(games,/if\\(direction!==hpPillTravelDirection\\)\\{hpPillTravelDirection=direction;hpPillTravelAnimation\\.reverse\\(\\);\\}/);
});

test("Generation 1.26 reserves a responsive HP frame and an internal 42px capsule dock",()=>{
  assert.match(css,/#game-view\\.active \\.hp-bar #hp-pill-use\\{[^}]*width:42px/);
  assert.match(css,/#game-view\\.active \\.hp-bar #hp-pill-use\\{[^}]*right:8px/);
  assert.match(css,/#game-view\\.active \\.hp-bar \\.hp-track\\{[^}]*min-width:72px/);
  assert.match(html,/hp-pill-dock-motion-r2/);
});
