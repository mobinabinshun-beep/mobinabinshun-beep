"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const launcher=fs.readFileSync("launcher.html","utf8");
const gatewayCss=fs.readFileSync("nu-hex-gateway.css","utf8");

test("Launcher core exposes one reusable simulated-mouse controller adapter",()=>{
 assert.match(pointer,/root\.NUControllerPointer=Object\.assign\(create\(\),\{create,mode:"simulated-mouse"/);
 assert.match(pointer,/capabilities:\{directionalPointer:true,separateConfirm:true/);
 assert.match(index,/nu-controller-pointer\.js/);
 assert.match(launcher,/nu-controller-pointer\.js/);
 assert.match(launcher,/<body class="nu-launcher-page">/);
 assert.match(gatewayCss,/body\.nu-launcher-page #nu-hex-gateway/);
 assert.doesNotMatch(gateway,/if\(!root\|\|!scrim\|\|!gameView\)return/);
});

test("Directional click-controller input moves the virtual pointer without auto-selecting a game target",()=>{
 assert.match(pointer,/function move\(dx,dy,source\)/);
 assert.match(pointer,/win\.addEventListener&&win\.addEventListener\("nu:controller-direction"/);
 assert.match(pointer,/else move\(dx,dy,detail\.source/);
 assert.match(pointer,/x\+sx\*step/);
 assert.match(pointer,/y\+sy\*step/);
 assert.doesNotMatch(pointer,/aimBot|autoAim|autoTarget/i);
});

test("Gamepad D-pad and stick are translated into Gateway up/down navigation",()=>{
 for(const index of [12,13,14,15])assert.match(pointer,new RegExp("b\\\\["+index+"\\\\]"));
 assert.match(pointer,/emit\("nu:gateway-direction",\{dx:input\.dx,dy:input\.dy,source:"gamepad"\}\)/);
 assert.match(pointer,/if\(input\.confirm&&!confirmDown\)emit\("nu:gateway-confirm"/);
 assert.match(pointer,/if\(input\.cancel&&!cancelDown\)emit\("nu:gateway-cancel"/);
});

test("Confirmation is a separate click and Gateway cancel is not treated as a gameplay click",()=>{
 assert.match(pointer,/function clickTarget\(source\)/);
 assert.match(pointer,/target\.dispatchEvent\(new win\.PointerEvent\("pointerdown"/);
 assert.match(pointer,/target\.dispatchEvent\(new win\.PointerEvent\("pointerup"/);
 assert.match(pointer,/new win\.MouseEvent\("click"/);
 assert.match(pointer,/if\(gatewayNavigation\)\{emit\("nu:gateway-confirm"/);
 assert.match(pointer,/if\(gatewayNavigation\)emit\("nu:gateway-cancel"/);
});

test("Gateway delegates pointer ownership to the shared adapter without disabling it on return",()=>{
 assert.match(gateway,/NUControllerPointer\?\.setGatewayNavigation\(true\)/);
 assert.match(gateway,/NUControllerPointer\?\.setGatewayNavigation\(false\)/);
 assert.doesNotMatch(gateway,/NUControllerPointer\?\.setEnabled/);
 assert.doesNotMatch(gateway,/window\.addEventListener\("gamepadconnected",startController\)/);
});

test("Gateway Exit from utility views resolves to the main page, not nested history",()=>{
 assert.match(gateway,/else window\.location\.href="\.\/index\.html"/);
 assert.doesNotMatch(gateway,/activeUtility\.id==="inventory-view"\?"inventory-back"/);
});
