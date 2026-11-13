"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {pngDimensions,toRgba}=require("../nu-studio-export.js");

test("computes exact PNG dimensions for the selectable output scales",()=>{
 assert.deepEqual(pngDimensions(32,24,4),{width:128,height:96,pixels:12288,scale:4});
 assert.deepEqual(pngDimensions(513,512,1),{width:513,height:512,pixels:262656,scale:1});
});

test("rejects unsafe PNG sizes with a recoverable scale instruction",()=>{
 assert.throws(()=>pngDimensions(513,512,16),/safe browser export limit/);
 assert.throws(()=>pngDimensions(1,1,0),/1× to 16×/);
 assert.throws(()=>pngDimensions(0,1,1),/positive safe integers/);
});

test("converts visible composite colors to RGBA and preserves transparency",()=>{
 const rgba=toRgba(["#ff0000",null,"#123456"],3,1);
 assert.deepEqual(Array.from(rgba),[255,0,0,255,0,0,0,0,18,52,86,255]);
});

test("rejects malformed composite data before canvas allocation",()=>{
 assert.throws(()=>toRgba(["red"],1,1),/six-digit hexadecimal/);
 assert.throws(()=>toRgba([],2,1),/does not match/);
});
