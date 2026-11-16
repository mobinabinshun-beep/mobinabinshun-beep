/* N.U ICO Export — multi-resolution 32-bit DIB icon writer, including Windows XP-compatible entries. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUIcoExport=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const DEFAULT_SIZES=[16,24,32,48,64,128,256];
 function validColor(value){
  if(typeof value!=="string"||!/^#[0-9a-f]{6}$/i.test(value))throw new TypeError("ICO pixels must be transparent or six-digit hexadecimal colors.");
  return value;
 }
 function fitSquare(pixels,width,height,size){
  const scale=Math.min(size/width,size/height),drawWidth=Math.max(1,Math.min(size,Math.round(width*scale))),drawHeight=Math.max(1,Math.min(size,Math.round(height*scale)));
  const left=Math.floor((size-drawWidth)/2),top=Math.floor((size-drawHeight)/2),out=Array(size*size).fill(null);
  for(let y=0;y<drawHeight;y++)for(let x=0;x<drawWidth;x++){
   const sx=Math.min(width-1,Math.floor(x*width/drawWidth)),sy=Math.min(height-1,Math.floor(y*height/drawHeight)),value=pixels[sy*width+sx];
   out[(top+y)*size+left+x]=value==null?null:validColor(value);
  }
  return out;
 }
 function dibImage(pixels,size){
  const xorBytes=size*size*4,maskStride=Math.ceil(size/32)*4,maskBytes=maskStride*size,bytes=new Uint8Array(40+xorBytes+maskBytes),view=new DataView(bytes.buffer);
  view.setUint32(0,40,true);view.setInt32(4,size,true);view.setInt32(8,size*2,true);view.setUint16(12,1,true);view.setUint16(14,32,true);view.setUint32(16,0,true);view.setUint32(20,xorBytes+maskBytes,true);
  const maskOffset=40+xorBytes;
  for(let row=0;row<size;row++){
   const y=size-1-row;
   for(let x=0;x<size;x++){
    const color=pixels[y*size+x],at=40+(row*size+x)*4;
    if(color==null){bytes[at]=bytes[at+1]=bytes[at+2]=bytes[at+3]=0;bytes[maskOffset+row*maskStride+(x>>3)]|=0x80>>(x&7);}
    else{const c=validColor(color);bytes[at]=parseInt(c.slice(5,7),16);bytes[at+1]=parseInt(c.slice(3,5),16);bytes[at+2]=parseInt(c.slice(1,3),16);bytes[at+3]=255;}
   }
  }
  return bytes;
 }
 function buildIco(pixels,width,height,options){
  if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||width*height>16777216)throw new RangeError("ICO source dimensions must be positive and within the safe export limit.");
  if(!pixels||pixels.length!==width*height)throw new TypeError("ICO pixel buffer does not match its dimensions.");
  if(!pixels.some(Boolean))throw new Error("The artwork is empty. Draw or import an image before exporting an icon.");
  const sizes=Array.from(new Set((options&&options.sizes)||DEFAULT_SIZES));
  if(!sizes.length||sizes.some(s=>!Number.isInteger(s)||s<1||s>256))throw new RangeError("ICO sizes must be unique integer dimensions from 1 to 256 pixels.");
  const images=sizes.map(size=>dibImage(fitSquare(pixels,width,height,size),size)),total=6+16*images.length+images.reduce((n,b)=>n+b.length,0);
  const out=new Uint8Array(total),view=new DataView(out.buffer);
  view.setUint16(0,0,true);view.setUint16(2,1,true);view.setUint16(4,images.length,true);
  let offset=6+16*images.length;
  images.forEach((bytes,i)=>{
   const size=sizes[i],entry=6+i*16;out[entry]=size===256?0:size;out[entry+1]=size===256?0:size;out[entry+2]=0;out[entry+3]=0;
   view.setUint16(entry+4,1,true);view.setUint16(entry+6,32,true);view.setUint32(entry+8,bytes.length,true);view.setUint32(entry+12,offset,true);
   out.set(bytes,offset);offset+=bytes.length;
  });
  return out;
 }
 return {buildIco,DEFAULT_SIZES:DEFAULT_SIZES.slice()};
});