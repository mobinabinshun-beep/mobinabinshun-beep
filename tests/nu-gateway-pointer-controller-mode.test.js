"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");

test("Mouse entering the Gateway trigger schedules the 500ms entry delay",()=>{
  assert.match(gateway,/trigger\.addEventListener\("pointerenter",event=>\{/);
  assert.match(gateway,/event\.pointerType==="mouse"&&!open&&!requirePhysicalLeave\)scheduleEntry\(500,event\.pointerId\)/);
});

test("Touching the Gateway trigger opens it and suppresses the synthetic click toggle",()=>{
  assert.match(gateway,/trigger\.addEventListener\("pointerdown",event=>\{/);
  assert.match(gateway,/event\.pointerType==="touch"/);
  assert.match(gateway,/suppressClickUntil=Date\.now\(\)\+900/);
});

test("Mouse hover activates a Gateway option directly and leaving cancels pending activation",()=>{
  assert.match(gateway,/item\.addEventListener\("pointerenter",event=>\{\s*if\(event\.pointerType==="mouse"&&open\)activate\(item\)/);
  assert.match(gateway,/item\.addEventListener\("pointerleave",event=>\{/);
  assert.match(gateway,/item\.classList\.contains\("is-confirming"\)/);
  assert.doesNotMatch(gateway,/pointerenter",event=>\{if\(event\.pointerType==="mouse"&&open\)select\(item\)/);
});

test("Gamepad keeps explicit selection and confirm, then exits below the final option",()=>{
  assert.match(gateway,/function moveControllerSelection\(direction,exitAtEnd=false\)/);
  assert.match(gateway,/exitAtEnd&&direction>0&&current===items\.length-1/);
  assert.match(gateway,/moveControllerSelection\(direction,down&&!up\)/);
  assert.match(gateway,/if\(confirm&&!controllerConfirmDown\)activate\(selected\|\|items\[0\]\)/);
});
