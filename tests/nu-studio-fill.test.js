"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const P=require("../nu-studio-pro-tools.js");
const runtime=fs.readFileSync(require.resolve("../nu-pixel-art-studio.js"),"utf8");

test("transparent blank canvas fills every connected transparent pixel",()=>{
 const source=Array(16).fill(null);
 const result=P.bucketFill(source,4,4,0,0,"#ff0000");
 assert.equal(result.changed,16);
 assert.ok(result.pixels.every(c=>c==="#ff0000"));
 assert.ok(source.every(c=>c===null));
});

test("contiguous fill stops at closed boundaries and leaves other regions untouched",()=>{
 const source=[
  "#000000","#000000","#000000","#000000",
  "#000000",null,null,"#000000",
  "#000000",null,null,"#000000",
  "#000000","#000000","#000000","#000000"
 ];
 const result=P.bucketFill(source,4,4,1,1,"#00ff00");
 assert.equal(result.changed,4);
 assert.deepEqual(result.pixels.slice(5,7),["#00ff00","#00ff00"]);
 assert.deepEqual(result.pixels.slice(9,11),["#00ff00","#00ff00"]);
 assert.equal(result.pixels[0],"#000000");
});

test("similar mode uses tolerance while exact contiguous mode does not",()=>{
 const source=["#ff0000","#f00000","#0000ff"];
 const exact=P.bucketFill(source,3,1,0,0,"#00ff00","contiguous",30);
 const similar=P.bucketFill(source,3,1,0,0,"#00ff00","similar",30);
 assert.equal(exact.changed,1);
 assert.equal(similar.changed,2);
 assert.equal(similar.pixels[2],"#0000ff");
});

test("global mode replaces disconnected exact matches but not merely similar colors",()=>{
 const source=["#ff0000","#0000ff","#ff0000","#f00000"];
 const result=P.bucketFill(source,4,1,0,0,"#00ff00","global");
 assert.equal(result.changed,2);
 assert.deepEqual(result.pixels,["#00ff00","#0000ff","#00ff00","#f00000"]);
});

test("selection and layer mask jointly clip fill writes",()=>{
 const source=Array(6).fill(null),selection=Uint8Array.from([1,1,0,1,1,1]),mask=Uint8Array.from([1,0,1,1,1,1]);
 const result=P.bucketFill(source,3,2,0,0,"#123456","contiguous",0,selection,mask);
 assert.equal(result.changed,1);
 assert.equal(result.pixels[0],"#123456");
 assert.ok(result.pixels.slice(1).every(c=>c===null));
});

test("fill outside selection or mask is a safe no-op",()=>{
 const source=[null,null,null,null],selection=Uint8Array.from([0,1,1,1]),mask=Uint8Array.from([0,1,1,1]);
 assert.equal(P.bucketFill(source,2,2,0,0,"#abcdef","contiguous",0,selection).reason,"outside-selection");
 assert.equal(P.bucketFill(source,2,2,0,0,"#abcdef","contiguous",0,null,mask).reason,"outside-mask");
});

test("same-color fill is a no-op and preserves the source array",()=>{
 const source=["#abcdef",null],result=P.bucketFill(source,2,1,0,0,"#abcdef");
 assert.equal(result.changed,0);
 assert.equal(result.reason,"same-color");
 assert.deepEqual(source,["#abcdef",null]);
});

test("transparent fill can erase a connected region without touching other colors",()=>{
 const source=["#ff0000","#ff0000","#0000ff"];
 const result=P.bucketFill(source,3,1,0,0,null);
 assert.equal(result.changed,2);
 assert.deepEqual(result.pixels,[null,null,"#0000ff"]);
});

test("invalid dimensions, coordinates, colors, modes, tolerances and masks are rejected",()=>{
 const source=[null,null];
 assert.throws(()=>P.bucketFill(source,0,1,0,0,"#ffffff"),/dimensions/);
 assert.throws(()=>P.bucketFill(source,2,1,2,0,"#ffffff"),/coordinates/);
 assert.throws(()=>P.bucketFill(source,2,1,0,0,"red"),/hexadecimal/);
 assert.throws(()=>P.bucketFill(source,2,1,0,0,"#ffffff","other"),/mode/);
 assert.throws(()=>P.bucketFill(source,2,1,0,0,"#ffffff","similar",500),/tolerance/);
 assert.throws(()=>P.bucketFill(source,2,1,0,0,"#ffffff","contiguous",0,new Uint8Array(1)),/selection/);
 assert.throws(()=>P.bucketFill(source,2,1,0,0,"#ffffff","contiguous",0,null,new Uint8Array(1)),/mask/);
});

test("Studio Fill reports no-op states and refuses locked layers or mask-edit mode",()=>{
 assert.match(runtime,/This area already uses the selected color/);
 assert.match(runtime,/Layer is locked\. Unlock it to use Fill/);
 assert.match(runtime,/Turn off mask editing before using Fill/);
 assert.match(runtime,/bucketFill\(pixels,width,height,x,y,next,adv\.bucket,adv\.tol,adv\.selection,layer\.mask\)/);
 assert.match(runtime,/tool==="fill"&&changed>0\)commitHistory/);
});
