"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");

test("Mouse entering the Gateway trigger opens it without requiring a click",()=>{
  assert.match(gateway,/trigger\.addEventListener\("pointerenter",event=>\{/);
  assert.match(gateway,/event\.pointerType==="mouse"&&!open\)setOpen\(true\)/);
});

test("Touching the Gateway trigger opens it and suppresses the synthetic click toggle",()=>{
  assert.match(gateway,/trigger\.addEventListener\("pointerdown",event=>\{/);
  assert.match(gateway,/event\.pointerType==="touch"/);
  assert.match(gateway,/suppressClickUntil=Date\.now\(\)\+900/);
});

test("Mouse hover activates a Gateway option directly and leaving cancels pending activation",()=>{
  assert.match(gateway,/item\.addEventListener\("pointerenter",event=>\{\s*if\(event\.pointerType==="mouse"&&open\)activate\(item\)/);
  assert.match(gateway,/item\.addEventListener\("pointerleave",event=>\{/);
  assert.match(gateway,/pendingItem===item/);
  assert.doesNotMatch(gateway,/pointerenter",event=>\{if\(event\.pointerType==="mouse"&&open\)select\(item\)/);
});

test("Gamepad simulated mouse is delegated to the shared launcher-core adapter",()=>{
  const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
  assert.match(gateway,/NUControllerPointer\?\.setEnabled\(true\)/);
  assert.match(pointer,/b\[12\]/);
  assert.match(pointer,/b\[15\]/);
  assert.match(pointer,/if\(input\.confirm&&!confirmDown\)clickTarget\(\)/);
  assert.doesNotMatch(gateway,/function pollController\(/);
});
