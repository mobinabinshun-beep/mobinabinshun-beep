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
const {create: createGatewayPause}=require("../nu-gateway-pause.js");

test("Gateway is mounted and remains available across Bag, Inventory, Wallet and Profile",()=>{
 assert.match(html,/id="nu-hex-gateway"/);
 assert.match(gateway,/\["bag-view","wallet-view","inventory-view","profile-view"\]/);
 assert.match(gateway,/function goHome\(\)[\s\S]*?document\.getElementById\("back-home"\)/);
 assert.match(gateway,/profile:.*menu-profile/);
});

test("Gateway is the only visible Back/Pause control in mounted views",()=>{
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #bag-back/);
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #inventory-back/);
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #wallet-back/);
 assert.match(gatewayCss,/body\.nu-gateway-utility-active #profile-back/);
 assert.doesNotMatch(html,/id="finish-round"|PAUSE ROUND|RESUME ROUND/);
});

test("Gateway pause ownership captures only an active round and close leaves it frozen for fresh input",()=>{
 assert.match(games,/gatewayPause\.open\(state\)/);
 assert.match(games,/gatewayPause\.close\(\)/);
 assert.match(games,/gatewayPause\.ownsPause\(\)/);
 assert.match(pause,/if\(!state\|\|!state\.active\|\|state\.paused\)return false/);
 assert.match(pause,/close\(\)[\s\S]*?ownsPause=false;[\s\S]*?return true/);
 assert.match(games,/gatewayAwaitingInteraction=true/);
 assert.match(games,/resumeAfterGatewayInteraction\(\)/);
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

test("Gateway keyboard controls move through options, extra-down exits, and confirm is separate",()=>{
 assert.match(gateway,/event\.key==="ArrowDown"\)\{event\.preventDefault\(\);moveSelection\(1,true\)/);
 assert.match(gateway,/event\.key==="ArrowRight"\)\{event\.preventDefault\(\);moveSelection\(1,false\)/);
 assert.match(gateway,/event\.key==="ArrowUp"\)\{event\.preventDefault\(\);moveSelection\(-1,false\)/);
 assert.match(gateway,/event\.key==="ArrowLeft"\)\{event\.preventDefault\(\);moveSelection\(-1,false\)/);
 assert.match(gateway,/event\.key==="Enter"\|\|event\.key===" "/);
 assert.match(gateway,/function moveSelection\(direction,exitAtEnd=false\)/);
 assert.match(gateway,/exitAtEnd&&direction>0&&current===items.length-1\)\{closeGateway\(\)/);
 assert.doesNotMatch(gateway,/\(current\+direction\+items\.length\)%items\.length/);
});

test("Gateway mouse hover visibly selects and a click activates one destination",()=>{
 assert.match(gateway,/pointerenter/);
 assert.match(gateway,/function select\(item\)/);
 assert.match(gateway,/item\.setAttribute\("aria-pressed","true"\)/);
 assert.match(gateway,/item\.addEventListener\("click"/);
 assert.match(gateway,/function activate\(item\)/);
});

test("Gamepad D-pad/stick navigates Gateway and A/B confirms or closes",()=>{
 assert.match(gateway,/navigator\.getGamepads/);
 assert.match(gateway,/buttons\[12\]/);
 assert.match(gateway,/buttons\[15\]/);
 assert.match(gateway,/buttons\[0\]/);
 assert.match(gateway,/buttons\[1\]/);
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
 assert.match(gateway,/function goHome\(\)[\s\S]*?home\.click\(\)/);
});

test("Hidden tabs do not restart a Gateway-paused round or gamepad polling",()=>{
 assert.match(games,/if\(document\.hidden\).*stopGamepad\(\)/);
 assert.match(games,/!gatewayOpen\)\{syncGatewayBackgrounds\(false\)/);
 assert.match(games,/const shouldFreeze=!!frozen\|\|document\.hidden\|\|!!state\.paused\|\|!!\(state\.game&&!state\.active\)/);
 assert.match(games,/if\(state\.active&&!state\.paused\)/);
 assert.match(gateway,/if\(!open\)return/);
});


test("Gateway entry delays physical mouse and touch by 500ms and simulated mouse by 1000ms",()=>{
 assert.match(gateway,/scheduleEntry\(500/);
 assert.match(gateway,/scheduleEntry\(1000/);
});

test("Simulated mouse is wired to the shared controller core and never activates on movement",()=>{
 assert.match(gateway,/NUControllerInputCore\.create/);
 assert.match(gateway,/nu:simulated-mouse-input/);
 assert.match(gateway,/onMove:updateVirtualPointer/);
 assert.match(gateway,/onConfirm:\(\)=>activate/);
});

test("Gateway close does not resume gameplay until fresh play-space input",()=>{
 assert.match(games,/function handleGatewayClose\(\)[\s\S]*?gatewayAwaitingInteraction=true/);
 assert.match(games,/function resumeAfterGatewayInteraction\(\)/);
 assert.match(games,/syncGatewayBackgrounds\(!!state\.paused\|\|!!gatewayAwaitingInteraction\)/);
 assert.doesNotMatch(games,/let gatewayOwnsPause=false/);
});


test("Closing Gateway keeps the owned pause frozen until a separate fresh interaction",()=>{
 const pause=createGatewayPause();
 const state={active:true,paused:false,turn:2};
 assert.equal(pause.open(state),true);
 assert.deepEqual({active:state.active,paused:state.paused},{active:false,paused:true});
 assert.equal(pause.close(),true);
 assert.deepEqual({active:state.active,paused:state.paused},{active:false,paused:true});
 assert.equal(pause.close(),false);
});

test("Gateway does not claim ownership of a pause that already exists",()=>{
 const pause=createGatewayPause();
 const state={active:false,paused:true,turn:2};
 assert.equal(pause.open(state),false);
 assert.equal(pause.close(),false);
 assert.equal(state.paused,true);
});
