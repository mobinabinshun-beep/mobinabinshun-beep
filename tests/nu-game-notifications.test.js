"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");

const moduleSource=fs.readFileSync(require.resolve("../nu-game-notifications.js"),"utf8");
const gameSource=fs.readFileSync(require.resolve("../nu-games.js"),"utf8");
const css=fs.readFileSync(require.resolve("../nu-world.css"),"utf8");
const moduleCss=fs.readFileSync(require.resolve("../nu-game-notifications.css"),"utf8");
const html=fs.readFileSync(require.resolve("../index.html"),"utf8");
const spec=fs.readFileSync(require.resolve("../docs/game-development/GAME-NOTIFICATION-SYSTEM.md"),"utf8");

test("shared game notification module exposes all three default game notification families",()=>{
  assert.match(moduleSource,/showInteraction:showInteraction/);
  assert.match(moduleSource,/showBarDelta:showBarDelta/);
  assert.match(moduleSource,/showConsumption:showConsumption/);
  assert.match(moduleSource,/showFloating:showFloating/);
});

test("HP capsule consumption uses the original paired floating-change visual with exact labels",()=>{
  assert.match(gameSource,/showConsumption\(\{anchor:bar,anchorCenterX,itemDelta:"−1 CAPSULE HEAL",resourceDelta:"\+10 HP",duration:1750,offset:4\}\)/);
  assert.match(moduleSource,/item\.className="floating-change "\+toneClass\(options\.itemTone,"loss"\)/);
  assert.match(moduleSource,/resource\.className="floating-change "\+toneClass\(options\.resourceTone,"hp"\)/);
  assert.match(moduleCss,/\.nu-notification-pair/);
  assert.match(css,/\.floating-change\.loss/);
  assert.match(css,/\.floating-change\.hp/);
});

test("HP consumption is anchored below the live viewport HP rail and uses legacy rise/fade motion",()=>{
  assert.match(moduleSource,/anchor\.getBoundingClientRect\(\)/);
  assert.match(moduleSource,/if\(!\(rect\.width>0&&rect\.height>0\)\)return null/);
  assert.match(moduleSource,/options\.anchorCenterX!=null/);
  assert.match(moduleSource,/rect\.bottom\+/);
  assert.match(css,/@keyframes nu-floating-change/);
  assert.match(css,/0%\{opacity:0;transform:translateY\(18px\) scale\(\.82\)\}/);
  assert.match(css,/82%\{opacity:1\}/);
  assert.match(css,/100%\{opacity:0;transform:translateY\(-22px\) scale\(\.96\)\}/);
  assert.match(spec,/Default duration is \*\*1750ms\*\*/);
});

test("notification module loads before games and keeps overlays pointer-transparent and accessible",()=>{
  assert.match(html,/nu-game-notifications\.js[^<]+<\/script><script src="\.\/nu-games\.js/);
  assert.match(html,/nu-game-notifications\.css/);
  assert.match(moduleSource,/aria-live","polite"/);
  assert.match(moduleSource,/aria-atomic","true"/);
  assert.match(moduleCss,/\.nu-notification-layer\{[^}]*pointer-events:none/);
});

test("notification rendering is visual-only and preserves the existing object/bar animation classes",()=>{
  assert.match(moduleSource,/node\.className="nu-game-notification-interaction hit-progress"/);
  assert.match(moduleSource,/node\.className="nu-game-notification-bar-delta capsule-gain "\+tone/);
  assert.match(moduleCss,/\.nu-game-notification-bar-delta/);
  assert.match(moduleCss,/\.nu-game-notification-interaction/);
  assert.match(spec,/They never change game state, resource balances, wallet inventory/);
});

test("reduced-motion disables only movement, not the notification content",()=>{
  assert.match(moduleCss,/@media\(prefers-reduced-motion:reduce\)\{\.nu-notification-pair>\.floating-change\{animation:none;opacity:1\}/);
  assert.match(moduleSource,/removeAfter\(root,duration\+80\)/);
});

test("object-interaction coordinates are written in game-stage CSS pixels",()=>{
  assert.match(moduleSource,/node\.style\.left=\(Number\(options\.x\)\|\|0\)\+"px"/);
  assert.match(moduleSource,/node\.style\.top=\(Number\(options\.y\)\|\|0\)\+"px"/);
});

test("the reusable module stylesheet is loaded by the Casino game entry too",()=>{
  const casino=fs.readFileSync(require.resolve("../casino.html"),"utf8");
  assert.match(casino,/nu-game-notifications\.css/);
  assert.match(casino,/nu-game-notifications\.js[^<]+<\/script><script src="\.\/nu-casino\.js/);
});

test("single floating notifications use the same shared card preset and lifecycle",()=>{
  assert.match(moduleSource,/pair\.className="nu-notification-pair"/);
  assert.match(moduleSource,/node\.className="floating-change "\+\(options\.tone\|\|"gain"\)/);
  assert.match(moduleSource,/removeAfter\(pair,duration\+80\)/);
});

test("the existing XP and Mana +1 boundary feedback delegates to the shared bar-delta preset",()=>{
  assert.match(gameSource,/NUGameNotifications\.showBarDelta\(\{anchor:bar,fill,text,tone:type,duration:1100,boundaryOffset:1\.5\}\)/);
  assert.match(moduleCss,/\.nu-game-notification-bar-delta\{[^}]*top:-23px[^}]*z-index:12/);
});

test("bar and consumption presets accept sanitized per-game tone classes",()=>{
  assert.match(moduleSource,/function toneClass\(value,fallback\)/);
  assert.match(moduleSource,/const tone=toneClass\(options\.tone,"xp"\)/);
  assert.match(moduleSource,/toneClass\(options\.itemTone,"loss"\)/);
  assert.match(moduleSource,/toneClass\(options\.resourceTone,"hp"\)/);
});


test("HP consumption falls back instead of placing a toast at viewport origin when the HUD is hidden",()=>{
  assert.match(moduleSource,/if\(!\(rect\.width>0&&rect\.height>0\)\)return null/);
  assert.match(gameSource,/if\(rect\.width>0&&rect\.height>0\)[\s\S]*?if\(notice\)return;\}\}announceTransaction\("−1 CAPSULE HEAL · \+10 HP"/);
});

test("HP notification stays centred on the core while the right-side capsule drawer is expanded",()=>{
  assert.match(gameSource,/drawerWidth=bar\.classList\.contains\("hp-pill-drawer-open"\)[\s\S]*?anchorCenterX=rect\.left\+Math\.max\(0,rect\.width-drawerWidth\)\/2/);
  assert.match(moduleSource,/root\.style\.left=centerX\+"px"/);
});
