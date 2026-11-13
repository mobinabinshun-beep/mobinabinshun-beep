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

test("maps a larger raster against a full 32-color palette deterministically",()=>{
 const palette=Array.from({length:32},(_,i)=>"#"+[i*8,(31-i)*8,(i*37)%256].map(v=>Math.min(255,v).toString(16).padStart(2,"0")).join(""));
 const width=64,height=64,rgba=new Uint8ClampedArray(width*height*4);
 for(let i=0;i<width*height;i++){const p=i*4,c=palette[i%palette.length];rgba[p]=parseInt(c.slice(1,3),16);rgba[p+1]=parseInt(c.slice(3,5),16);rgba[p+2]=parseInt(c.slice(5,7),16);rgba[p+3]=255;}
 const mapped=mapPixels(rgba,width,height,palette);
 assert.equal(mapped.length,width*height);
 assert.deepEqual(mapped.slice(0,palette.length),palette);
});
