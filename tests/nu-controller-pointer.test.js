"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const launcher=fs.readFileSync("launcher.html","utf8");
const casino=fs.readFileSync("casino.html","utf8");
const studio=fs.readFileSync("pixel-art-studio.html","utf8");
const gatewayCss=fs.readFileSync("nu-hex-gateway.css","utf8");

test("Launcher core exposes one reusable simulated-mouse controller adapter",()=>{
 assert.match(pointer,/root\.NUControllerPointer=Object\.assign\(create\(\),\{create,mode:"simulated-mouse"/);
 assert.match(pointer,/capabilities:\{directionalPointer:true,separateConfirm:true/);
 assert.match(index,/nu-controller-pointer\.js/);
 assert.match(launcher,/nu-controller-pointer\.js/);
 assert.ok(casino.includes("nu-controller-pointer.js"));
 assert.ok(studio.includes("nu-controller-pointer.js"));
 assert.ok(casino.indexOf("nu-controller-pointer.js")<casino.indexOf("nu-hex-gateway.js"));
 assert.ok(studio.indexOf("nu-controller-pointer.js")<studio.indexOf("nu-hex-gateway.js"));
 for(const page of [index,casino,launcher,studio])assert.ok(page.includes("nu-controller-pointer.js?v=20261118-directional-r6"));
 assert.match(launcher,/<body class="nu-launcher-page">/);
 assert.match(gatewayCss,/body\.nu-launcher-page #nu-hex-gateway/);
 assert.doesNotMatch(gateway,/if\(!root\|\|!scrim\|\|!gameView\)return/);
});

test("D-pad and stick directions move the virtual pointer without activating targets",()=>{
 assert.match(pointer,/b\[12\]/);
 assert.match(pointer,/b\[13\]/);
 assert.match(pointer,/b\[14\]/);
 assert.match(pointer,/b\[15\]/);
 assert.match(pointer,/x\+dx\*step/);
 assert.match(pointer,/y\+dy\*step/);
 assert.match(pointer,/updateTarget\(\)/);
 assert.match(pointer,/lastMove=time/);
 assert.match(pointer,/gatewayNavigation\)emit\("nu:gateway-direction"/);
 assert.match(pointer,/if\(\(input\.dx\|\|input\.dy\)&&time-lastMove>=repeat\)/);
 assert.doesNotMatch(pointer,/if\(\(input\.dx\|\|input\.dy\)[^}]*clickTarget/);
});

test("Keyboard-emulated click-controller arrows are captured by the shared pointer adapter outside Gateway",()=>{
 assert.match(pointer,/function onKeyboardInput\(event\)/);
 assert.match(pointer,/keyboard-click-controller/);
 assert.match(pointer,/addEventListener\("keydown",onKeyboardInput,true\)/);
 assert.match(pointer,/if\(event\.key==="Enter"\|\|event\.key===" "\|\|event\.key==="NumpadEnter"\)/);
 assert.match(pointer,/gatewayNavigation\)return/);
});
test("Click-controller directions have an explicit path to move the simulated pointer",()=>{
 assert.match(pointer,/function movePointer\(dx,dy,source\)/);
 assert.match(pointer,/nu:simulated-pointer-direction/);
 assert.match(pointer,/nu:controller-direction/);
 assert.match(pointer,/nu:gateway-direction/);
 assert.match(pointer,/startClickController\(\)/);
 assert.match(pointer,/move\(dx,dy\)\{return movePointer/);
 assert.match(pointer,/emit\("nu:simulated-pointer-move"/);
});
test("A held Down used to exit Gateway cannot move the virtual pointer away from the trigger",()=>{
 assert.match(pointer,/if\(gatewayBlockedUntilNeutral\)\{if\(!input\.dx&&!input\.dy\)/);
 assert.match(pointer,/gatewayBlockedUntilNeutral=!!\(current\.dx\|\|current\.dy\)/);
 assert.match(pointer,/gatewayNavigation=true;const current=direction\(event\.gamepad\)/);
 assert.ok(gateway.includes("setGatewayNavigation(false)"));
});
test("Confirm is a separate click; B remains Gateway cancel",()=>{
 assert.match(pointer,/if\(!primed\)/);
 assert.match(pointer,/if\(input\.confirm&&!confirmDown\)\{if\(gatewayNavigation\)emit\("nu:gateway-confirm",\{\}\);else clickTarget\(\);\}/);
 assert.match(pointer,/if\(input\.cancel&&!cancelDown\).*key:"Escape"/);
 assert.match(pointer,/new win\.MouseEvent\("click"/);
});

test("Gateway delegates simulated pointer ownership to the shared adapter",()=>{
 assert.match(gateway,/NUControllerPointer\?\.setEnabled\(true\)/);
 assert.match(gateway,/NUControllerPointer\?\.setGatewayNavigation\(true\)/);
 assert.ok(gateway.includes("setGatewayNavigation(false)"));
 assert.doesNotMatch(gateway,/window\.addEventListener\("gamepadconnected",startController\)/);
});

test("Gateway Exit from utility views resolves to the main page, not nested history",()=>{
 assert.match(gateway,/else window\.location\.href="\.\/index\.html"/);
 assert.doesNotMatch(gateway,/activeUtility\.id==="inventory-view"\?"inventory-back"/);
});
