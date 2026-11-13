"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {mapPixels,isSupportedImageFile}=require("../nu-raster-import.js");
test("maps each opaque raster pixel to its nearest palette color",()=>{
 const rgba=new Uint8ClampedArray([250,5,5,255,5,5,250,255]);
 assert.deepEqual(mapPixels(rgba,2,1,["#ff0000","#0000ff"]),["#ff0000","#0000ff"]);
});
test("keeps pixels transparent when their alpha is below the cutoff",()=>{
 const rgba=new Uint8ClampedArray([255,0,0,20,0,255,0,200]);
 assert.deepEqual(mapPixels(rgba,2,1,["#ff0000","#00ff00"],24),[null,"#00ff00"]);
});
test("optional dithering distributes quantization error across a gradient",()=>{
 const rgba=new Uint8ClampedArray([90,90,90,255,110,110,110,255,130,130,130,255,150,150,150,255]);
 const palette=["#000000","#ffffff"];
 const plain=mapPixels(rgba,4,1,palette,0,false),dithered=mapPixels(rgba,4,1,palette,0,true);
 assert.equal(plain.length,4);assert.equal(dithered.length,4);
 assert.ok(dithered.every(c=>palette.includes(c)));
});
test("rejects malformed buffers and unsafe palette colors",()=>{
 assert.throws(()=>mapPixels([],1,1,["#ffffff"]),/RGBA buffer/);
 assert.throws(()=>mapPixels([0,0,0,255],1,1,["white"]),/hexadecimal palette/);
});
test("does not impose the former 262144-pixel mapper ceiling",()=>{
 const width=262145,rgba=new Uint8ClampedArray(width*4);
 for(let i=0;i<width;i++)rgba[i*4+3]=255;
 const mapped=mapPixels(rgba,width,1,["#000000"]);
 assert.equal(mapped.length,width);
 assert.equal(mapped[width-1],"#000000");
});
test("file MIME and extension metadata do not block candidate image selection",()=>{
 assert.equal(isSupportedImageFile({type:"",name:"mystery.bin"}),true);
 assert.equal(isSupportedImageFile({type:"application/octet-stream",name:"unknown"}),true);
 assert.equal(isSupportedImageFile(null),false);
});
