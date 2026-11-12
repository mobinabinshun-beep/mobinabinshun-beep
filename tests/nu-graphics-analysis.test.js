"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {analyze}=require("../nu-graphics-analysis.js");

test("produces a machine-readable palette-indexed graphic representation",()=>{
  const result=analyze(["#ff0000","#ff0000",null,"#00ff00"],2,2,{tileSize:4});
  assert.equal(result.format,"NU-GFX-IR/1");
  assert.deepEqual(result.palette,["#ff0000","#00ff00"]);
  assert.deepEqual(result.indexMap,[1,1,0,2]);
  assert.equal(result.metrics.paintedPixels,3);
  assert.equal(result.metrics.colorCount,2);
  assert.equal(result.instructions[0].op,"set-palette");
});
test("extracts run-length spans, tiles and connected regions",()=>{
  const result=analyze(["#000000","#000000",null,null,null,"#000000"],3,2);
  assert.equal(result.rowRuns.length,2);
  assert.equal(result.tiles.length,1);
  assert.equal(result.regions.length,2);
  assert.deepEqual(result.regions[0].bounds,{x:0,y:0,width:2,height:1});
});
test("marks edge pixels and rejects invalid input",()=>{
  const result=analyze(["#ffffff"],1,1);
  assert.equal(result.metrics.edgePixels,1);
  assert.throws(()=>analyze(["red"],1,1),/hexadecimal/);
  assert.throws(()=>analyze([],2,2),/length/);
});
