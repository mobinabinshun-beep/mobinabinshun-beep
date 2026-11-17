"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {create}=require("../nu-controller-input-core.js");

test("Simulated mouse arrows move logical pointer in bounded discrete steps",()=>{
 const moved=[],input=create({mode:"simulated-mouse",step:10,bounds:{left:0,top:0,right:20,bottom:20},x:10,y:10,onMove:s=>moved.push(s)});
 input.keyDown({key:"ArrowRight",preventDefault(){}});
 input.keyDown({key:"ArrowDown",preventDefault(){}});
 assert.deepEqual(input.getState(),{mode:"simulated-mouse",x:20,y:20});
 input.keyDown({key:"ArrowRight",preventDefault(){}});
 assert.equal(moved.length,2);
});

test("Directional movement never confirms or activates a target",()=>{
 let confirms=0;
 const input=create({mode:"simulated-mouse",onConfirm:()=>confirms++});
 input.keyDown({key:"ArrowLeft",preventDefault(){}});
 input.keyDown({key:"ArrowUp",preventDefault(){}});
 assert.equal(confirms,0);
});

test("Enter confirms once per key press and requires key release before next confirm",()=>{
 let confirms=0;
 const input=create({mode:"simulated-mouse",onConfirm:()=>confirms++});
 input.keyDown({key:"Enter",preventDefault(){}});
 input.keyDown({key:"Enter",preventDefault(){}});
 assert.equal(confirms,1);
 input.keyUp({key:"Enter"});
 input.keyDown({key:"Enter",preventDefault(){}});
 assert.equal(confirms,2);
});

test("Cancel is a separate action and mode changes clear held input",()=>{
 let cancels=0,confirms=0;
 const input=create({mode:"simulated-mouse",onCancel:()=>cancels++,onConfirm:()=>confirms++});
 input.keyDown({key:"Escape",preventDefault(){}});
 input.keyDown({key:"Escape",preventDefault(){}});
 assert.equal(cancels,1);
 input.setMode("gamepad");
 input.setMode("simulated-mouse");
 input.keyDown({key:"Enter",preventDefault(){}});
 assert.equal(confirms,1);
});

test("Gamepad adapter uses the same logical pointer and explicit confirm",()=>{
 let confirms=0;
 const input=create({mode:"gamepad",step:5,onConfirm:()=>confirms++});
 input.gamepadInput({right:true,confirm:false});
 assert.equal(input.getState().x,0.5+5); // default normalized center is 0.5; default bounds are 0..1, so clamp at 1
 input.gamepadInput({right:false,confirm:true});
 input.gamepadInput({right:false,confirm:true});
 assert.equal(confirms,1);
});
