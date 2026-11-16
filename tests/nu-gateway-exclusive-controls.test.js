"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8");
const games=fs.readFileSync("nu-games.js","utf8");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");
const css=fs.readFileSync("nu-hex-gateway.css","utf8");
const pause=fs.readFileSync("nu-gateway-pause.js","utf8");
test("Gateway is the only visible gameplay pause control",()=>{
 assert.doesNotMatch(html,/id="finish-round"|PAUSE ROUND|RESUME ROUND/);
 assert.doesNotMatch(games,/finish-round|PAUSE ROUND|RESUME ROUND/);
 assert.match(gateway,/new Event\("nu:gateway-open"\)/);
 assert.match(gateway,/new Event\("nu:gateway-close"\)/);
 assert.match(games,/window\.addEventListener\("nu:gateway-open"/);
 assert.match(games,/window\.addEventListener\("nu:gateway-close"/);
});
test("Gateway closing resumes only a pause it created",()=>{
 assert.match(games,/gatewayPause\.open\(state\)/);
 assert.match(games,/gatewayPause\.close\(state\)/);
 assert.match(games,/playerOverlayPaused&&!gatewayPause\.ownsPause\(\)&&state\.paused/);
 assert.match(pause,/ownsPause=true/);
 assert.match(pause,/if\(!ownsPause\)return false/);
});
test("Gateway owns duplicate back navigation in mounted utility views",()=>{
 assert.match(css,/body\.nu-gateway-utility-active #bag-back/);
 assert.match(css,/body\.nu-gateway-utility-active #inventory-back/);
 assert.match(css,/body\.nu-gateway-utility-active #wallet-back/);
 assert.match(css,/body\.nu-gateway-utility-active #profile-back/);
 assert.match(gateway,/function goHome\(\)/);
});
test("Gateway navigation destinations remain distinct and game rules remain intact",()=>{
 assert.match(gateway,/back:goHome/);assert.match(gateway,/menu:.*menu-open/);assert.match(gateway,/profile:.*menu-profile/);
 assert.match(games,/function interact\(e\)\{if\(!state\.active\|\|state\.paused\|\|state\.turn>=10\)return/);
});
