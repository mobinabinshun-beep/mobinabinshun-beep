"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");
const gatewayCss=fs.readFileSync("nu-hex-gateway.css","utf8");
const games=fs.readFileSync("nu-games.js","utf8");
const graphics=fs.readFileSync("nu-graphics-runtime.js","utf8");
const player=fs.readFileSync("nu-player-ui.js","utf8");
const pause=fs.readFileSync("nu-gateway-pause.js","utf8");
const manifest=fs.readFileSync("NU-GENERATION-1-MANIFEST.json","utf8");

test("Gateway is mounted and remains available across Bag, Inventory, Wallet and Profile",()=>{
 assert.match(html,/id="nu-hex-gateway"/);
 assert.match(gateway,/\["bag-view","wallet-view","inventory-view","profile-view"\]/);
 assert.match(gateway,/profile:.*menu-profile/);
});

test("Gateway is the only visible Back/Pause control in mounted views",()=>{
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #bag-back/);
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #inventory-back/);
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #wallet-back/);
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #profile-back/);
 assert.doesNotMatch(html,/id="finish-round"|PAUSE ROUND|RESUME ROUND/);
});

test("Gateway pause ownership preserves a pre-existing manual pause and resumes only its own pause",()=>{
 assert.match(games,/gatewayPause\.open\(state\)/);
 assert.match(games,/gatewayPause\.close\(state\)/);
 assert.match(games,/gatewayPause\.ownsPause\(\)/);
 assert.match(pause,/if\(!state\|\|!state\.active\|\|state\.paused\)return false/);
 assert.match(pause,/if\(!state\|\|!state\.paused\|\|state\.turn>=10\)return false/);
 assert.ok(html.indexOf("nu-gateway-pause.js")<html.indexOf("nu-games.js"));
 assert.match(manifest,/nu-gateway-pause.js/);
 assert.match(games,/window\.addEventListener\("nu:gateway-open",handleGatewayOpen\)/);
 assert.match(games,/window\.addEventListener\("nu:gateway-close",handleGatewayClose\)/);
});

test("Gateway freezes gameplay and ambient renderers while keeping foreground controls outside the scrim",()=>{
 assert.match(games,/cancelAnimationFrame\(state\.raf\)/);
 assert.match(games,/NUBackgroundEngine\.setFrozen/);
 assert.match(games,/NUDynamicLayers\.setFrozen/);
 assert.match(games,/NUPixelWorld\.setEnabled/);
 assert.match(graphics,/nu-gateway-open/);
 assert.match(gatewayCss,/body\.nu-gateway-open \.world>#world-canvas/);
 assert.match(gatewayCss,/backdrop-filter:none/);
 assert.match(gatewayCss,/body\.nu-gateway-open \.shell\{position:relative;z-index:115\}/);
 assert.match(games,/document\.body\.classList\.contains\("nu-gateway-open"\)/);
});

test("Gateway keyboard controls move through options and confirm the selected destination",()=>{
 assert.match(gateway,/event\.key==="ArrowDown"\|\|event\.key==="ArrowRight"/);
 assert.match(gateway,/event\.key==="ArrowUp"\|\|event\.key==="ArrowLeft"/);
 assert.match(gateway,/event\.key==="Enter"\|\|event\.key===" "/);
 assert.match(gateway,/function moveSelection\(direction\)/);
});

test("Gateway mouse hover visibly selects and a click activates one destination",()=>{
 assert.match(gateway,/pointerenter/);
 assert.match(gateway,/function select\(item\)/);
 assert.match(gateway,/item\.setAttribute\("aria-pressed","true"\)/);
 assert.match(gateway,/item\.addEventListener\("click"/);
 assert.match(gateway,/function activate\(item\)/);
});

test("Shared controller adapter maps D-pad/stick to virtual pointer and A/B to confirm/cancel",()=>{
 const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
 assert.match(gateway,/NUControllerPointer\?\.setEnabled\(true\)/);
 assert.match(pointer,/navigator&&win\.navigator\.getGamepads/);
 assert.match(pointer,/buttons\[12\]/);
 assert.match(pointer,/buttons\[15\]/);
 assert.match(pointer,/buttons\[0\]/);
 assert.match(pointer,/buttons\[1\]/);
 assert.match(pointer,/key:"Escape"/);
});

test("Keyboard and gamepad share game target selection and activation",()=>{
 assert.match(games,/function moveKeyboardTarget\(direction\)/);
 assert.match(games,/function activateKeyboardTarget\(\)/);
 assert.match(games,/event\.key==="ArrowRight"\|\|event\.key==="ArrowDown"/);
 assert.match(games,/navigator\.getGamepads/);
 assert.match(games,/buttons\[0\]/);
 assert.match(games,/function startGamepad\(\)/);
});

test("Nested player navigation preserves Wallet → Profile → Wallet → Bag history",()=>{
 assert.match(player,/const viewStack=\[\]/);
 assert.match(player,/viewStack\.push\(\{view:activeView,focus:document\.activeElement\}\)/);
 assert.match(player,/const previous=viewStack\.pop\(\)/);
 assert.match(player,/if\(tab==="profile"\)\{open\(profileView\);return;\}/);
 assert.match(gateway,/else window\.location\.href="\.\/index\.html"/);
});

test("Hidden tabs do not restart a Gateway-paused round or gamepad polling",()=>{
 assert.match(games,/if\(document\.hidden\).*stopGamepad\(\)/);
 assert.match(games,/!gatewayOpen\)\{syncGatewayBackgrounds\(false\)/);
 assert.match(games,/const shouldFreeze=!!frozen\|\|document\.hidden/);
 assert.match(games,/if\(state\.active&&!state\.paused\)/);
 assert.match(gateway,/window\.addEventListener\("blur",\(\)=>\{if\(open\)setOpen\(false\)\}\)/);
 assert.match(gateway,/NUControllerPointer\?\.setEnabled\(false\)/);
});
