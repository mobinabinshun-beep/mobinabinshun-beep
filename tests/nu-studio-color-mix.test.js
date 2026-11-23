"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const P=require("../nu-studio-pro-tools.js");
const studio=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");

test("color-mixing brush picks up the first pigment and blends a second color along the stroke",()=>{
 const source=["#ff0000","#0000ff"];
 const first=P.smudgeBrush(source,2,1,0,0,1,100);
 const second=P.smudgeBrush(first.pixels,2,1,1,0,1,100,null,first.state);
 assert.equal(second.pixels[0],"#ff0000");
 assert.equal(second.pixels[1],"#a60059");
 assert.notEqual(second.pixels[1],"#0000ff");
 assert.notEqual(second.pixels[1],"#ff0000");
 assert.deepEqual(source,["#ff0000","#0000ff"]);
});

test("color-mixing brush samples and blends multiple colors with deterministic stroke direction",()=>{
 const source=["#ff0000","#00ff00","#0000ff"];
 const run=order=>{let pixels=source.slice(),state=null;for(const x of order){const r=P.smudgeBrush(pixels,3,1,x,0,1,100,null,state);pixels=r.pixels;state=r.state;}return pixels;};
 const forward=run([0,1,2]),again=run([0,1,2]),reverse=run([2,1,0]);
 assert.deepEqual(forward,again);
 assert.notDeepEqual(forward,reverse);
 assert.ok(forward.some(c=>c!=="#ff0000"&&c!=="#00ff00"&&c!=="#0000ff"));
});

test("continuous pointer movement interpolates missed pixels without gaps",()=>{
 const source=["#ff0000","#00ff00","#0000ff","#ffffff"];
 const jumped=P.smudgeBrush(source,4,1,0,0,1,85);
 const across=P.smudgeBrush(jumped.pixels,4,1,3,0,1,85,null,jumped.state);
 let stepped=jumped;for(let x=1;x<=3;x++)stepped=P.smudgeBrush(stepped.pixels,4,1,x,0,1,85,null,stepped.state);
 assert.deepEqual(across.pixels,stepped.pixels);
});

test("transparent pixels remain transparent and do not contaminate the carried pigment",()=>{
 const source=["#ff0000",null,"#0000ff"];
 let r=P.smudgeBrush(source,3,1,0,0,1,100);
 r=P.smudgeBrush(r.pixels,3,1,1,0,1,100,null,r.state);
 assert.equal(r.pixels[1],null);
 r=P.smudgeBrush(r.pixels,3,1,2,0,1,100,null,r.state);
 assert.equal(r.pixels[1],null);
 assert.notEqual(r.pixels[2],"#0000ff");
});

test("selection clipping prevents pickup and painting outside the selected mask",()=>{
 const source=["#ff0000","#00ff00","#0000ff"],mask=Uint8Array.from([1,0,1]);
 let r=P.smudgeBrush(source,3,1,0,0,1,100,mask);
 r=P.smudgeBrush(r.pixels,3,1,2,0,1,100,mask,r.state);
 assert.equal(r.pixels[1],"#00ff00");
 assert.notEqual(r.pixels[2],"#0000ff");
});

test("larger brush samples neighboring colors and respects circular brush shape",()=>{
 const source=["#ff0000","#0000ff","#0000ff","#ff0000","#0000ff","#0000ff","#0000ff","#0000ff","#0000ff"];
 const r=P.smudgeBrush(source,3,3,1,1,3,100,null,null,"circle");
 assert.notEqual(r.pixels[4],"#0000ff");
 assert.deepEqual(source,["#ff0000","#0000ff","#0000ff","#ff0000","#0000ff","#0000ff","#0000ff","#0000ff","#0000ff"]);
});

test("zero strength is a no-op and invalid size, strength, selection or coordinates are rejected",()=>{
 const source=["#ff0000","#0000ff"];
 assert.deepEqual(P.smudgeBrush(source,2,1,1,0,1,0).pixels,source);
 assert.throws(()=>P.smudgeBrush(source,2,1,1,0,0,50),/size/);
 assert.throws(()=>P.smudgeBrush(source,2,1,1,0,1,101),/strength/);
 assert.throws(()=>P.smudgeBrush(source,2,1,1,0,1,50,new Uint8Array(1)),/selection/);
 assert.throws(()=>P.smudgeBrush(source,2,1,NaN,0,1,50),/coordinates/);
});

test("Studio exposes Color-Mixing and Fading as separate tools with independent controls",()=>{
 assert.match(studio,/dataset\.tool="color-mix-brush"/);
 assert.match(studio,/Color mixing strength/);
 assert.match(studio,/fadeIntensity/);
 assert.match(studio,/Fading brush intensity/);
 assert.match(studio,/smudgeBrush\(pixels,width,height/);
});

test("Color-Mixing refuses locked layers and does not silently edit layer masks",()=>{
 assert.match(studio,/tool==="color-mix-brush"&&adv\.layers\[adv\.active\]\.locked/);
 assert.match(studio,/tool==="color-mix-brush"&&adv\.maskEdit/);
 assert.match(studio,/adv\.selection,mixBrushState/);
});
