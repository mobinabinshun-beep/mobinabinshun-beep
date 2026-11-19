"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");

test("Mouse entering the Gateway trigger opens it without requiring a click",()=>{
  assert.match(gateway,/trigger\.addEventListener\("pointerenter",event=>\{/);
  assert.match(gateway,/event\.pointerType==="mouse"&&!open\)scheduleOpen\(500,"physical-mouse"\)/);
});

test("Touch must dwell for 500 ms and release/cancel before the threshold must not open Gateway",()=>{
  assert.match(gateway,/trigger\\.addEventListener\\("pointerdown",event=>\\{/);
  assert.match(gateway,/scheduleOpen\\(500,"touch"\\)/);
  assert.match(gateway,/trigger\\.addEventListener\\("pointerup",event=>\\{[\\s\\S]*?if\\(!open\\)cancelScheduledOpen\\(\\)/);
  assert.match(gateway,/trigger\\.addEventListener\\("pointercancel",event=>\\{[\\s\\S]*?cancelScheduledOpen\\(\\)/);
  assert.match(gateway,/suppressClickUntil=Date\\.now\\(\\)\\+1000/);
  assert.doesNotMatch(gateway,/setOpen\\(!open,true,"touch"\\)/);
});

test("Mouse hover activates a Gateway option directly and leaving cancels pending activation",()=>{
  assert.match(gateway,/item\.addEventListener\("pointerenter",event=>\{\s*if\(event\.pointerType==="mouse"&&open\)select\(item\)/);
  assert.match(gateway,/item\.addEventListener\("pointerleave",event=>\{/);
  assert.match(gateway,/pendingItem===item/);
  assert.doesNotMatch(gateway,/pointerenter",event=>\{if\(event\.pointerType==="mouse"&&open\)activate\(item\)/);
});

test("Gamepad simulated mouse is delegated to the shared launcher-core adapter",()=>{
  const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
  assert.match(gateway,/NUControllerPointer\?\.setEnabled\(true\)/);
  assert.match(pointer,/b\[12\]/);
  assert.match(pointer,/b\[15\]/);
  assert.match(pointer,/if\(input\.confirm&&!confirmDown\)\{if\(gatewayNavigation\)emit\("nu:gateway-confirm",\{\}\);else clickTarget\(\);\}/);
  assert.doesNotMatch(gateway,/function pollController\(/);
});
