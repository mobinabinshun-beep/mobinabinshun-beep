"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const pointer=fs.readFileSync("nu-controller-pointer.js","utf8");
const gateway=fs.readFileSync("nu-hex-gateway.js","utf8");
const index=fs.readFileSync("index.html","utf8");
const launcher=fs.readFileSync("launcher.html","utf8");

test("Launcher core exposes one reusable simulated-mouse controller adapter",()=>{
 assert.match(pointer,/root\.NUControllerPointer=\{create,mode:"simulated-mouse"/);
 assert.match(pointer,/capabilities:\{directionalPointer:true,separateConfirm:true/);
 assert.match(index,/nu-controller-pointer\.js/);
 assert.match(launcher,/nu-controller-pointer\.js/);
});

test("D-pad and stick directions move the virtual pointer without activating targets",()=>{
 assert.match(pointer,/buttons\[12\]/);
 assert.match(pointer,/buttons\[13\]/);
 assert.match(pointer,/buttons\[14\]/);
 assert.match(pointer,/buttons\[15\]/);
 assert.match(pointer,/x\+input\.dx\*step/);
 assert.match(pointer,/y\+input\.dy\*step/);
 assert.match(pointer,/updateTarget\(\);lastMove=time/);
 assert.doesNotMatch(pointer,/if\(input\.dx\|\|input\.dy\)[\s\S]{0,250}clickTarget\(\)/);
});

test("Confirm is a separate click; B remains Gateway cancel",()=>{
 assert.match(pointer,/if\(input\.confirm&&!confirmDown\)clickTarget\(\)/);
 assert.match(pointer,/if\(input\.cancel&&!cancelDown\).*key:"Escape"/);
 assert.match(pointer,/new win\.MouseEvent\("click"/);
});

test("Gateway delegates simulated pointer ownership to the shared adapter",()=>{
 assert.match(gateway,/NUControllerPointer\?\.setEnabled\(true\)/);
 assert.match(gateway,/NUControllerPointer\?\.setEnabled\(false\)/);
 assert.doesNotMatch(gateway,/window\.addEventListener\("gamepadconnected",startController\)/);
});

test("Gateway Exit from utility views resolves to the main page, not nested history",()=>{
 assert.match(gateway,/else window\.location\.href="\.\/index\.html"/);
 assert.doesNotMatch(gateway,/activeUtility\.id==="inventory-view"\?"inventory-back"/);
});
