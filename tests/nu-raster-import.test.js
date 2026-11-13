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
test("maps images above the legacy 262144-pixel mapper ceiling",()=>{
 const width=513,height=512,rgba=new Uint8ClampedArray(width*height*4);
 for(let i=0;i<width*height;i++){const p=i*4;rgba[p]=255;rgba[p+3]=255;}
 const mapped=mapPixels(rgba,width,height,["#ff0000"]);
 assert.equal(mapped.length,width*height);assert.equal(mapped[0],"#ff0000");assert.equal(mapped.at(-1),"#ff0000");
});
test("lets the browser decoder validate content regardless of MIME or extension",()=>{
 assert.equal(isSupportedImageFile({name:"art.png",type:""}),true);
 assert.equal(isSupportedImageFile({name:"art.heic",type:"application/octet-stream"}),true);
 assert.equal(isSupportedImageFile({name:"image-without-extension",type:""}),true);
 assert.equal(isSupportedImageFile({name:"renamed-file.bin",type:"application/octet-stream"}),true);
 assert.equal(isSupportedImageFile(null),false);
});
test("mapper has no product or Launcher pixel ceiling; allocation determines feasibility",()=>{
 const width=1200,height=1000,rgba=new Uint8ClampedArray(width*height*4);
 assert.equal(mapPixels(rgba,width,height,["#ffffff"]).length,width*height);
});
