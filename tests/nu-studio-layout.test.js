"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {fit,pixelAt}=require("../nu-studio-layout.js");

test("fit keeps the complete landscape image inside the frame",()=>{
 const r=fit(1600,900,800,600,100);
 assert.ok(r.width<=772&&r.height<=572);
 assert.ok(Math.abs(r.width/r.height-16/9)<.01);
 assert.equal(r.overflowX,false);assert.equal(r.overflowY,false);
});
test("fit keeps the complete portrait image inside the frame",()=>{
 const r=fit(900,1600,800,600,100);
 assert.ok(r.width<=772&&r.height<=572);
 assert.ok(Math.abs(r.width/r.height-900/1600)<.01);
});
test("zoom creates overflow only inside the workspace frame",()=>{
 const r=fit(512,512,500,400,300);
 assert.ok(r.width>472&&r.height>372);
 assert.equal(r.overflowX,true);assert.equal(r.overflowY,true);
});
test("collapsed workspace waits safely for ResizeObserver instead of breaking the editor",()=>{
 const r=fit(256,128,0,0,100);assert.equal(r.width,1);assert.equal(r.height,1);assert.equal(r.scale,0);
});
test("pixel mapping maps all four canvas corners to valid pixels",()=>{
 const rect={left:10,top:20,width:200,height:100};
 assert.deepEqual(pixelAt(10,20,rect,32,16),{x:0,y:0});
 assert.deepEqual(pixelAt(210,120,rect,32,16),{x:31,y:15});
 assert.deepEqual(pixelAt(110,70,rect,32,16),{x:16,y:8});
});
test("pixel mapping rejects a collapsed canvas",()=>{
 assert.throws(()=>pixelAt(0,0,{left:0,top:0,width:0,height:10},2,2),/positive size/);
});
