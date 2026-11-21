"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");
const gatewayCss=fs.readFileSync("nu-hex-gateway.css","utf8");

test("Mouse entering the Gateway trigger opens it without requiring a click",()=>{
  assert.match(gateway,/trigger\.addEventListener\("pointerenter",event=>\{/);
  assert.match(gateway,/event\.pointerType==="mouse"&&!open\)scheduleOpen\(500,"physical-mouse"\)/);
  assert.match(gateway,/if\(event\.pointerType==="mouse"&&open\)activate\(item\)/);
});

test("Touch must dwell for 500 ms and release/cancel before the threshold must not open Gateway",()=>{
  assert.ok(gateway.includes('trigger.addEventListener("pointerdown",event=>{'));
  assert.ok(gateway.includes('scheduleOpen(500,"touch")'));
  assert.ok(gateway.includes('trigger.addEventListener("pointerup",event=>{'));
  assert.ok(gateway.includes("if(!open)cancelScheduledOpen()"));
  assert.ok(gateway.includes('trigger.addEventListener("pointercancel",event=>{'));
  assert.ok(gateway.includes("suppressClickUntil=Date.now()+1000"));
  assert.ok(!gateway.includes('setOpen(!open,true,"touch")'));
});

test("Mouse hover activates a Gateway option directly and leaving cancels pending activation",()=>{
  assert.match(gateway,/item\.addEventListener\("pointerenter",event=>\{\s*if\(event\.pointerType==="mouse"&&open\)activate\(item\)/);
  assert.match(gateway,/item\.addEventListener\("pointerleave",event=>\{/);
  assert.match(gateway,/pendingItem===item/);
  assert.match(gateway,/select\(items\[current\+1\]\)/);
  assert.match(gateway,/pointerenter",event=>\{\s*if\(event\.pointerType==="mouse"&&open\)activate\(item\)/);
});

test("Gamepad simulated mouse is delegated to the shared launcher-core adapter",()=>{
  const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
  assert.doesNotMatch(gateway,/NUControllerPointer/);
  assert.match(pointer,/b\[12\]/);
  assert.match(pointer,/b\[15\]/);
  assert.match(pointer,/if\(input\.confirm&&!confirmDown\)emit\("nu:gateway-confirm",\{\}\)/);
  assert.doesNotMatch(gateway,/function pollController\(/);
});


test("Touch movement is tracked by pointer identity; taps activate on release and outside movement closes Gateway",()=>{
  assert.match(gateway,/touchPointerId=null/);
  assert.match(gateway,/touchPointerId=event\.pointerId/);
  assert.match(gateway,/Math\.hypot\(event\.clientX-touchStartX,event\.clientY-touchStartY\)>10/);
  assert.match(gateway,/touchMoved=true/);
  assert.match(gateway,/if\(!wasMoved\)activate\(item\)/);
  assert.match(gateway,/pointermove",event=>\{\s*if\(!\["mouse","touch","pen"\]\.includes\(event\.pointerType\)\)return/);
  assert.doesNotMatch(gateway,/elementFromPoint/);
  assert.doesNotMatch(gateway,/cancelDwellActivation|scheduleDwellActivation/);
});

test("Touch pointer cancellation clears stale pointer and open timers",()=>{
  assert.match(gateway,/pointercancel[\s\S]*?touchPointerId=null;touchMoved=false;cancelScheduledOpen\(\)/);
});

test("Gateway trigger and options own touch gestures while active",()=>{
  assert.match(gatewayCss,/nu-gateway-trigger[\s\S]*?touch-action:none/);
  assert.match(gatewayCss,/nu-gateway-item[\s\S]*?touch-action:none/);
});


test("Touch release outside an option and pointer cancellation clear stale gesture state",()=>{
  assert.match(gateway,/document\.addEventListener\("pointerup",event=>\{[\s\S]*?touchPointerId=null;touchMoved=false/);
  assert.match(gateway,/document\.addEventListener\("pointercancel",event=>\{[\s\S]*?cancelScheduledOpen\(\)/);
});
