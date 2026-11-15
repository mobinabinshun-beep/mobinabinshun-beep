"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const read=name=>fs.readFileSync(name,"utf8");
const html=read("index.html"),js=read("nu-hex-gateway.js"),css=read("nu-hex-gateway.css"),games=read("nu-games.js"),dynamic=read("nu-dynamic-layers.js");

test("Gateway is enabled only while the main game view is active",()=>{
 assert.match(js,/if\(!root\|\|!scrim\|\|!gameView\)return/);
 assert.match(js,/classList\.toggle\("nu-game-active",active\)/);
 assert.doesNotMatch(js,/walletView|nu-wallet-active/);
 assert.match(css,/body\.nu-game-active #nu-hex-gateway/);
 assert.doesNotMatch(css,/nu-wallet-active/);
});

test("Gateway exposes exactly Back, Menu and Profile actions",()=>{
 for(const action of ["back","menu","profile"])assert.match(html,new RegExp('data-action="'+action+'"'));
 assert.equal((html.match(/data-action="/g)||[]).length,3);
 assert.doesNotMatch(html,/data-action="(settings|store|wallet|exchange)"/);
 assert.match(js,/menu:.*menu-open/);
 assert.match(js,/profile:.*menu-profile/);
 assert.doesNotMatch(js,/settings:/);
});

test("Gateway activation is one-click/tap/keyboard; hover only selects",()=>{
 assert.match(js,/activate\(item\)/);
 assert.match(js,/pointerType==="mouse"&&open\)select\(item\)/);
 assert.doesNotMatch(js,/hoverTimer|clickArmed|confirm\(item\)/);
 assert.match(js,/event\.key==="Escape"/);
});

test("Gateway freezes and restores game and ambient renderers",()=>{
 for(const token of ["nu:gateway-open","nu:gateway-close","NUBackgroundEngine.setFrozen","NUDynamicLayers.setFrozen","NUPixelWorld.setEnabled"])assert.ok(games.includes(token),token);
 assert.match(js,/nu:menu-dismissed/);
 assert.match(js,/nu:player-overlay-close/);
 assert.match(games,/function closeMenu\(resume=true\)/);
});

test("Only decorative world layers blur; legacy duplicate navigation is hidden in gameplay",()=>{
 assert.match(css,/world>\.nu-world-background/);
 assert.match(css,/world>\.sky/);
 assert.doesNotMatch(css,/body\.nu-gateway-open \.world,body\.nu-gateway-open/);
 assert.match(css,/body\.nu-game-active #menu-open/);
 assert.match(css,/body\.nu-game-active #back-home/);
});
