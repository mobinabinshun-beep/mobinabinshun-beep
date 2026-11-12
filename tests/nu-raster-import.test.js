"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {mapPixels}=require("../nu-raster-import.js");
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

test("maps images above the legacy 262144-pixel ceiling within the Studio safety ceiling",()=>{
 const width=513,height=512,rgba=new Uint8ClampedArray(width*height*4);
 for(let i=0;i<width*height;i++){const p=i*4;rgba[p]=255;rgba[p+3]=255;}
 const mapped=mapPixels(rgba,width,height,["#ff0000"]);
 assert.equal(mapped.length,width*height);
 assert.equal(mapped[0],"#ff0000");
 assert.equal(mapped.at(-1),"#ff0000");
});
test("rejects rasters above the shared absolute safety ceiling",()=>{
 const width=1733,height=1732;
 assert.throws(()=>mapPixels(new Uint8ClampedArray(0),width,height,["#ffffff"]),/3,000,000-pixel safety ceiling/);
});
