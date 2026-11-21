"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const P=require("../nu-studio-pro-tools.js");
test("rectangular selection clamps and includes the selected endpoints",()=>{
 const s=P.rectSelection(4,3,-2,1,1,9);assert.equal(s.length,12);assert.deepEqual([...s],[0,0,0,0,1,1,0,0,1,1,0,0]);
});
test("lasso selection includes points inside a polygon only",()=>{
 const s=P.lassoSelection(4,4,[{x:0,y:0},{x:3,y:0},{x:3,y:3},{x:0,y:3}]);assert.equal(s.reduce((a,b)=>a+b,0),9);
});
test("linear and radial gradients produce deterministic endpoint colors",()=>{
 const px=Array(5).fill(null),linear=P.gradient(px,5,1,{x:0,y:0},{x:4,y:0},"#000000","#ffffff");
 assert.equal(linear[0],"#000000");assert.equal(linear[4],"#ffffff");
 const radial=P.gradient(Array(9).fill(null),3,3,{x:1,y:1},{x:2,y:1},"#000000","#ffffff","radial");assert.equal(radial[4],"#000000");
});
test("gradient respects a selection mask",()=>{
 const px=Array(4).fill(null),mask=Uint8Array.from([1,0,1,0]),out=P.gradient(px,4,1,{x:0,y:0},{x:3,y:0},"#000000","#ffffff","linear",mask);
 assert.equal(out[1],null);assert.equal(out[3],null);
});
test("move selection clears source and shifts both pixels and selection",()=>{
 const px=["#ff0000",null,null,null],mask=Uint8Array.from([1,0,0,0]),r=P.moveSelection(px,4,1,mask,2,0);
 assert.equal(r.pixels[0],null);assert.equal(r.pixels[2],"#ff0000");assert.equal(r.selection[2],1);
});
test("scale selection expands nearest-neighbour without mutating input",()=>{
 const px=["#ff0000",null,null,null],mask=Uint8Array.from([1,0,0,0]),r=P.scaleSelection(px,4,1,mask,2,1);
 assert.equal(r.pixels[0],"#ff0000");assert.equal(r.pixels[1],"#ff0000");assert.equal(px[0],"#ff0000");
});
test("Bezier curve paints a connected quadratic path",()=>{
 const out=P.bezier(Array(25).fill(null),5,5,{x:0,y:0},{x:4,y:4},0,"#00ff00");
 assert.ok(out.filter(Boolean).length>=5);assert.equal(out[0],"#00ff00");assert.equal(out[24],"#00ff00");
});
test("brush presets and textures produce distinct deterministic footprints",()=>{
 const square=P.brushCells(4,4,5,"square"),circle=P.brushCells(4,4,5,"circle"),dots=P.brushCells(4,4,5,"square","dots");
 assert.ok(square.length>circle.length);assert.ok(dots.length<square.length);
 assert.deepEqual(P.brushCells(4,4,5,"square","grain",50),P.brushCells(4,4,5,"square","grain",50));
});
test("layer blend modes and masks are applied without mutating source",()=>{
 assert.equal(P.blendPixel("#808080","#808080","multiply"),"#404040");
 assert.equal(P.blendPixel("#000000","#ffffff","screen"),"#ffffff");
 assert.deepEqual(P.applyMask(["#ff0000","#00ff00"],[1,0]),["#ff0000",null]);
});

test("selection inversion complements inside and outside masks without mutating input",()=>{
 const original=Uint8Array.from([1,0,1,0]),outside=P.invertSelection(original);
 assert.deepEqual([...outside],[0,1,0,1]);assert.deepEqual([...original],[1,0,1,0]);
});
test("free rotation preserves an unselected layer region and returns a tight rotated mask",()=>{
 const pixels=["#ff0000",null,null,null,null,null,null,null,null],mask=Uint8Array.from([1,0,0,0,0,0,0,0,0]);
 const rotated=P.rotatePixels(pixels,3,3,90,mask);
 assert.equal(rotated.pixels.length,9);assert.equal(rotated.pixels.filter(Boolean).length,1);
 assert.equal(rotated.selection.reduce((a,b)=>a+b,0),1);
 assert.equal(pixels[0],"#ff0000");
});
test("fading brush intensity deterministically blends over an existing or transparent pixel",()=>{
 assert.equal(P.fadePixel("#000000","#ffffff",50),"#808080");
 assert.equal(P.fadePixel(null,"#ffffff",50),"#8a929c");
 assert.throws(()=>P.fadePixel(null,"#ffffff",101),/intensity/);
});
test("selected rotation preserves pixels outside the selection",()=>{
 const source=["#ff0000","#00ff00",null,null],mask=Uint8Array.from([1,0,0,0]);
 const result=P.rotatePixels(source,2,2,90,mask);
 assert.equal(result.pixels[1],"#00ff00");
 assert.equal(source[0],"#ff0000");
 assert.equal(result.selection.reduce((n,v)=>n+v,0),1);
});
test("rotation geometry maps a point around its center independently of artwork storage",()=>{
 const p=P.rotatePoint({x:2,y:1},{x:1,y:1},90);
 assert.ok(Math.abs(p.x-1)<1e-9);assert.ok(Math.abs(p.y-2)<1e-9);
});
test("rotation rejects invalid angles and mismatched selection dimensions",()=>{
 assert.throws(()=>P.rotatePoint({x:0,y:0},{x:0,y:0},NaN),/finite/);
 assert.throws(()=>P.rotatePixels([null],1,1,45,new Uint8Array(2)),/selection/);
});
