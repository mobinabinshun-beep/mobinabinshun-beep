"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");

test("Physical mouse enters the Gateway trigger with a 500ms dwell, not an immediate open",()=>{
 assert.match(gateway,/trigger\.addEventListener\("pointerenter",event=>\{/);
 assert.match(gateway,/scheduleOpen\("mouse",500\)/);
 assert.match(gateway,/event\.isTrusted===false/);
 assert.doesNotMatch(gateway,/event\.pointerType==="mouse"&&!open\)setOpen\(true\)/);
});

test("Touch opens after a 500ms activation delay and suppresses the synthetic click",()=>{
 assert.match(gateway,/trigger\.addEventListener\("pointerdown",event=>\{/);
 assert.match(gateway,/event\.pointerType!=="touch"/);
 assert.match(gateway,/scheduleOpen\("touch",500\)/);
 assert.match(gateway,/suppressClickUntil=Date\.now\(\)\+900/);
});

test("Physical mouse hover highlights an option; only a click activates it",()=>{
 assert.match(gateway,/item\.addEventListener\("pointerenter",event=>\{\s*if\(event\.isTrusted!==false&&event\.pointerType==="mouse"&&open\)select\(item\)/);
 assert.match(gateway,/item\.addEventListener\("click",event=>\{[\s\S]*?activate\(item\)/);
 assert.doesNotMatch(gateway,/pointerenter",event=>\{\s*if\(event\.pointerType==="mouse"&&open\)activate\(item\)/);
 assert.doesNotMatch(gateway,/pendingItem|pendingActivation/);
});

test("Gamepad is delegated to the shared adapter and switches to hierarchical Gateway navigation",()=>{
 const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
 assert.match(gateway,/NUControllerPointer\?\.setGatewayNavigation\(true\)/);
 assert.match(pointer,/b\[12\]/);
 assert.match(pointer,/b\[15\]/);
 assert.match(pointer,/emit\("nu:gateway-direction"/);
 assert.match(pointer,/emit\("nu:gateway-confirm"/);
 assert.match(pointer,/emit\("nu:gateway-cancel"/);
 assert.doesNotMatch(gateway,/function pollController\(/);
});
