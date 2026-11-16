"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {buildIco,DEFAULT_SIZES}=require("../nu-ico-export.js");
test("builds a multi-resolution ICO with Windows-compatible DIB payloads",()=>{
 const bytes=buildIco(["#ff0000","#00ff00","#0000ff","#ffffff"],2,2),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 assert.deepEqual(Array.from(bytes.slice(0,6)),[0,0,1,0,7,0]);assert.deepEqual(DEFAULT_SIZES,[16,24,32,48,64,128,256]);
 for(let i=0;i<7;i++){
  const entry=6+i*16,size=DEFAULT_SIZES[i],offset=view.getUint32(entry+12,true),length=view.getUint32(entry+8,true);
  assert.equal(bytes[entry],size===256?0:size);assert.equal(bytes[entry+1],size===256?0:size);assert.equal(view.getUint16(entry+4,true),1);assert.equal(view.getUint16(entry+6,true),32);
  assert.equal(view.getUint32(offset,true),40);assert.equal(view.getInt32(offset+4,true),size);assert.equal(view.getInt32(offset+8,true),size*2);
  assert.equal(view.getUint16(offset+12,true),1);assert.equal(view.getUint16(offset+14,true),32);
  assert.equal(length,40+size*size*4+Math.ceil(size/32)*4*size);
 }
});
test("preserves transparent pixels in the DIB alpha channel and AND mask",()=>{
 const bytes=buildIco(["#ff0000",null],2,1,{sizes:[16]}),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),offset=view.getUint32(18,true);
 const size=16,maskOffset=offset+40+size*size*4,maskStride=Math.ceil(size/32)*4,rowForTop=15-4,maskByte=bytes[maskOffset+rowForTop*maskStride];
 assert.equal(maskByte&0x80,0);assert.notEqual(maskByte&0x40,0);
});
test("rejects empty, malformed or unsafe icon data",()=>{
 assert.throws(()=>buildIco([null],1,1),/artwork is empty/);assert.throws(()=>buildIco(["red"],1,1),/six-digit hexadecimal/);
 assert.throws(()=>buildIco([],2,1),/does not match/);assert.throws(()=>buildIco(["#000000"],0,1),/positive/);
 assert.throws(()=>buildIco(["#000000"],1,1,{sizes:[512]}),/from 1 to 256/);
});
