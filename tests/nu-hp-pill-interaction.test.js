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

test("HUD markup is a native button and uses the current generation 1.29 assets",()=>{
  assert.match(html,/<button class="hp-pill-use" id="hp-pill-use" type="button"/);
  assert.match(html,/nu-games\.js\?v=20261113-hp-pill-store-inventory-refresh-r1/);
  assert.match(html,/nu-world\.css\?v=20261113-hp-pill-store-inventory-refresh-r1/);
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
  assert.ok(games.includes('button.hidden=hpPillTravelAnimation&&hpPillTravelAnimation.playState==="running"?true:next>=10'));
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
  assert.ok(games.includes("function animateHpPillTravel(direction)"));
  assert.ok(games.includes("function syncHpPillDock(hp)"));
  assert.ok(games.includes("const corner={x:barRect.width-4"));
  assert.ok(games.includes("const dock=mobileDock?"));
  assert.ok(games.includes("hpPillTravelAnimation.reverse()"));
  assert.ok(games.includes("ghost.animate("));
  assert.ok(css.includes(".hp-pill-travel-layer{position:absolute;inset:0"));
  assert.ok(css.includes("@media(prefers-reduced-motion:reduce){.hp-pill-travel-ghost"));
});

test("HP capsule is absent at full HP and remains hidden until its arrival animation finishes",()=>{
  assert.match(html,/<button class="hp-pill-use" id="hp-pill-use" type="button"[^>]*hidden/);
  assert.ok(games.includes("lastRenderedHp=10;"));
  assert.ok(games.includes("const finishedDirection=hpPillTravelDirection;"));
  assert.ok(games.includes('button.hidden=finishedDirection==="out"'));
  assert.ok(games.includes('if(lastRenderedHp>=10&&next<10){if(button)button.hidden=true;animateHpPillTravel("in");}'));
  assert.ok(css.includes("#game-view.active .hp-bar #hp-pill-use[hidden]{display:none!important}"));
});

test("Generation 1.26 widens the HP frame and keeps the pill dock inside its right edge",()=>{
  assert.ok(css.includes("#game-view.active .hp-bar{\n width:min(340px,calc(100vw - 20px));"));
  assert.ok(css.includes("#game-view.active .hp-bar #hp-pill-use{\n position:absolute;"));
  assert.ok(css.includes("right:8px;"));
  assert.ok(css.includes("padding:9px 60px 9px 14px"));
  assert.ok(games.includes("const corner={x:barRect.width-4"));
  assert.ok(games.includes("const dock=mobileDock?"));
  assert.ok(html.includes("20261113-hp-pill-store-inventory-refresh-r1"));
});

test("HP pill stays hidden during repeated damage and reverses the same in-flight animation when HP recovers",()=>{
  assert.ok(games.includes("hpPillTravelDirection=null"));
  assert.ok(games.includes("hpPillTravelAnimation.reverse()"));
  assert.ok(games.includes('hpPillTravelAnimation.playState==="running"?true:next>=10'));
  assert.ok(games.includes('button.hidden=finishedDirection==="out"'));
  assert.ok(games.includes("if(direction!==hpPillTravelDirection){hpPillTravelDirection=direction;hpPillTravelAnimation.reverse();}"));
});

test("Generation 1.26 reserves a responsive HP frame and an internal 42px capsule dock",()=>{
  assert.ok(css.includes("width:42px;"));
  assert.ok(css.includes("min-width:72px"));
  assert.ok(css.includes("width:calc(100vw - 16px)"));
  assert.ok(html.includes("20261113-hp-pill-store-inventory-refresh-r1"));
});


test("Generation 1.27 Store has one HP capsule row with isolated icon-use and Buy actions",()=>{
  assert.match(games,/shop-hp-pill-item/);
  assert.match(games,/<button class="shop-hp-pill-use" type="button" data-use-hp-pill/);
  assert.match(games,/<span class="shop-hp-pill-count" aria-live="polite">×'\+state\.save\.hpPills/);
  assert.match(games,/<button class="btn primary shop-hp-pill-buy" data-buy-hp-pill/);
  assert.doesNotMatch(games,/Use owned capsule<\/strong>|shop-use-item/);
  assert.match(games,/b\.addEventListener\("click",e=>\{\s*e\.preventDefault\(\);e\.stopPropagation\(\);\s*if\(b\.disabled\)return;\s*useHpPill\(e\);/);
  assert.match(css,/\.shop-hp-pill-use \.hp-pill-icon\.is-owned\{[^}]*filter:drop-shadow/);
  assert.match(css,/\.shop-hp-pill-buy\{min-width:112px/);
});


test("Generation 1.28 makes the HP HUD frame visibly more compact on phone screens",()=>{
  assert.match(css,/@media\(max-width:520px\)\{\s*#game-view\.active \.hp-bar\{\s*width:min\(286px,calc\(100vw - 28px\)\);\s*min-width:0;\s*min-height:44px;/);
  assert.match(css,/#game-view\.active \.hp-bar #hp-pill-use\{right:5px;width:34px;height:34px/);
  assert.match(css,/#game-view\.active \.hp-bar #hp-pill-use img\{width:24px;height:24px/);
  assert.ok(html.includes("20261113-hp-pill-store-inventory-refresh-r1"));
});


test("Generation 1.29 places the phone HP capsule below a compact HP rail",()=>{
  assert.match(css,/@media\(max-width:520px\)\{\s*#game-view\.active \.hp-bar\{\s*width:max-content;\s*max-width:calc\(100vw - 24px\);/);
  assert.match(css,/#game-view\.active \.hp-bar #hp-pill-use\{\s*left:50%;\s*right:auto;\s*top:auto;\s*bottom:3px;\s*transform:translateX\(-50%\)/);
  assert.match(css,/#game-view\.active \.hp-bar #hp-pill-use img\{width:27px;height:27px/);
  assert.ok(games.includes('const mobileDock=window.matchMedia&&window.matchMedia("(max-width:520px)").matches;'));
  assert.ok(games.includes("y:barRect.height-21"));
  assert.ok(html.includes("20261113-hp-pill-store-inventory-refresh-r1"));
});


test("Generation 1.30 refreshes the Store count immediately after Store-side capsule use",()=>{
  assert.match(games,/const isStoreUse=!!\(button&&button\.matches\("\[data-use-hp-pill\]"\)\)/);
  assert.match(games,/if\(!persistWalletState\(result\.state\)\)return;if\(isStoreUse\)renderShop\("−1 HP Capsule · \+"\+result\.restored\+" HP restored\."\)/);
  assert.match(games,/function renderShop\(feedback=""\)/);
  const result=wallet.useHpPill({hp:3,hpPills:3},{id:"store-refresh-test"});
  assert.equal(result.ok,true);
  assert.equal(result.state.hpPills,2);
  assert.equal(result.state.hp,10);
});

test("Generation 1.30 HUD-side capsule use keeps the shared wallet count in sync",()=>{
  assert.match(games,/const count=pill\.querySelector\("#hp-pill-count"\);if\(count\)count\.textContent="×"\+state\.save\.hpPills/);
  assert.match(games,/if\(anchor\)showHpPillInteraction\(anchor,result\.restored\)/);
});
