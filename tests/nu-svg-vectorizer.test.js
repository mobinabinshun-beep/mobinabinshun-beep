"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {vectorize}=require("../nu-svg-vectorizer.js");

test("traces a solid rectangle as one closed contour",()=>{
  const result=vectorize(["#ff0000","#ff0000","#ff0000","#ff0000"],2,2);
  assert.equal(result.pathCount,1);
  assert.match(result.source,/M0 0L2 0L2 2L0 2Z/);
  assert.doesNotMatch(result.source,/data:image\//);
});
test("keeps disconnected regions as separate paths",()=>{
  const result=vectorize(["#00ff00",null,null,"#00ff00"],2,2);
  assert.equal(result.pathCount,2);
});
test("preserves transparent holes in a ring",()=>{
  const pixels=["#000000","#000000","#000000","#000000",null,"#000000","#000000","#000000","#000000"];
  const result=vectorize(pixels,3,3);
  assert.equal(result.pathCount,2);
  assert.match(result.source,/fill-rule="evenodd"/);
});
test("supports compact horizontal-run export",()=>{
  const result=vectorize(["#112233","#112233","#112233"],3,1,{mode:"runs"});
  assert.equal(result.mode,"runs");
  assert.equal(result.pathCount,1);
});
test("rejects unsafe colors and malformed buffers",()=>{
  assert.throws(()=>vectorize(["red"],1,1),/hex color/);
  assert.throws(()=>vectorize([],2,2),/buffer length/);
});
