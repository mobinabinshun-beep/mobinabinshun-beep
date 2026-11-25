"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {fit,pixelAt,anchorScrollDelta,pixelAnchorScrollDelta,pixelAnchorCorrection}=require("../nu-studio-layout.js");

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

test("zoom anchoring computes the scroll delta that preserves the pointer pixel",()=>{
 const before={left:100,top:80,width:200,height:100};
 const after={left:80,top:60,width:300,height:150};
 const delta=anchorScrollDelta(before,after,150,105);
 assert.ok(Math.abs(delta.x-5)<1e-9);
 assert.ok(Math.abs(delta.y+7.5)<1e-9);
});
test("zoom anchoring safely ignores collapsed or invalid bounds",()=>{
 assert.deepEqual(anchorScrollDelta({left:0,top:0,width:0,height:10},{left:0,top:0,width:20,height:20},1,1),{x:0,y:0});
 assert.deepEqual(anchorScrollDelta(null,null,1,1),{x:0,y:0});
});

test("pixel-aware zoom preserves the same source pixel and within-pixel focus",()=>{
 const before={left:100,top:80,width:200,height:100},after={left:80,top:60,width:300,height:150};
 const anchor={x:175,y:140},pixel=pixelAt(anchor.x,anchor.y,before,32,16);
 const delta=pixelAnchorScrollDelta(before,after,anchor.x,anchor.y,32,16);
 const adjusted={left:after.left-delta.x,top:after.top-delta.y,width:after.width,height:after.height};
 assert.deepEqual(pixelAt(anchor.x,anchor.y,adjusted,32,16),pixel);
});
test("pixel-aware zoom returns zero for invalid artwork dimensions",()=>{
 assert.deepEqual(pixelAnchorScrollDelta({left:0,top:0,width:10,height:10},{left:0,top:0,width:20,height:20},5,5,0,10),{x:0,y:0});
});

test("pixel-anchor correction compensates one-cell scroll quantization",()=>{
 assert.deepEqual(pixelAnchorCorrection({x:12,y:13},{x:12,y:14},{width:320,height:320},32,32),{x:0,y:-10});
});
