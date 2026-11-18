"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const read=name=>fs.readFileSync(name,"utf8");
const pages=["index.html","launcher.html","casino.html","pixel-art-studio.html"].map(read);
const gateway=read("nu-hex-gateway.js");
const pointer=read("nu-controller-pointer.js");
const games=read("nu-games.js");

test("Every Gateway page exposes only Back/Home, Menu/List and Profile",()=>{
 for(const html of pages){
  const actions=[...html.matchAll(/data-action="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(actions,["back","menu","profile"]);
  assert.ok(html.indexOf("nu-controller-pointer.js")<html.indexOf("nu-hex-gateway.js"));
 }
});

test("Gateway entry dwell is 500ms for direct mouse/touch and 1000ms for simulated mouse",()=>{
 assert.match(gateway,/scheduleOpen\("mouse",500\)/);
 assert.match(gateway,/scheduleOpen\("touch",500\)/);
 assert.match(gateway,/scheduleOpen\("simulated",1000\)/);
 assert.match(gateway,/nu:simulated-pointer-move/);
});

test("Opening freezes before the option list becomes visible",()=>{
 const freeze=gateway.indexOf('window.dispatchEvent(new Event("nu:gateway-open"))');
 const visible=gateway.indexOf('root.classList.add("is-open")');
 assert.ok(freeze>=0&&visible>freeze);
});

test("Gateway options highlight on hover and require a separate confirmation",()=>{
 assert.match(gateway,/if\(event\.isTrusted!==false&&event\.pointerType==="mouse"&&open\)select\(item\)/);
 assert.match(gateway,/item\.addEventListener\("click",event=>\{[\s\S]*?activate\(item\)/);
 assert.match(gateway,/nu:gateway-confirm/);
 assert.doesNotMatch(gateway,/pointerenter",event=>\{\s*if\(event\.pointerType==="mouse"&&open\)activate/);
});

test("The extra downward move after the final option exits without selecting another action",()=>{
 assert.match(gateway,/function moveControllerSelection\(direction\)/);
 assert.match(gateway,/direction>0&&current===items\.length-1\)\{setOpen\(false\);return;\}/);
 assert.match(gateway,/requiresExit=wasInside/);
});

test("The simulated pointer moves by coordinates and clicks only the actual element under it",()=>{
 assert.match(pointer,/function move\(dx,dy,source\)/);
 assert.match(pointer,/const next=targetAt\(\)/);
 assert.match(pointer,/target\.dispatchEvent\(new win\.PointerEvent\("pointerdown"/);
 assert.match(pointer,/target\.dispatchEvent\(new win\.PointerEvent\("pointerup"/);
 assert.match(pointer,/new win\.MouseEvent\("click"/);
 assert.match(pointer,/nu:controller-direction/);
 assert.doesNotMatch(pointer,/aimBot|autoAim|autoTarget/i);
});

test("Gameplay gamepad input uses the shared simulated pointer, not target auto-selection",()=>{
 const start=games.indexOf("function pollGamepad");
 const end=games.indexOf("function startGamepad",start);
 const poll=games.slice(start,end);
 assert.match(poll,/NUControllerPointer\.move\(dx,dy,"gamepad"\)/);
 assert.match(poll,/NUControllerPointer\.click\("gamepad"\)/);
 assert.match(poll,/if\(window\.NUControllerPointer\)/);
});

test("Mouse, touch and simulated click all reach the existing gameplay interaction handler",()=>{
 assert.match(games,/e\.pointerType==="mouse"[^;]*interact\(e\)/);
 assert.match(games,/e\.pointerType!=="touch"[^;]*interact\(e\)/);
 assert.match(games,/nu:controller-direction/);
 assert.match(games,/nu:controller-confirm/);
});

test("Reload is not exposed as a Gateway action",()=>{
 for(const html of pages)assert.doesNotMatch(html,/data-action="reload"/);
 assert.doesNotMatch(gateway,/reload:/i);
});
