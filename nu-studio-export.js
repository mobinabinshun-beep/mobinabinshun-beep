/* N.U Studio Export — bounded PNG dimensions and transparent composite pixels. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUStudioExport=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 function pngDimensions(width,height,scale,limits){
  const opts=limits||{},maxSide=Number(opts.maxSide)||16384,maxPixels=Number(opts.maxPixels)||16777216;
  if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1)throw new RangeError("Artwork dimensions must be positive safe integers.");
  if(!Number.isInteger(scale)||scale<1||scale>16)throw new RangeError("PNG scale must be an integer from 1× to 16×.");
  const outWidth=width*scale,outHeight=height*scale,pixels=outWidth*outHeight;
  if(!Number.isSafeInteger(outWidth)||!Number.isSafeInteger(outHeight)||!Number.isSafeInteger(pixels)||outWidth>maxSide||outHeight>maxSide||pixels>maxPixels){
   throw new RangeError("This PNG size exceeds the safe browser export limit. Choose a smaller output scale.");
  }
  return {width:outWidth,height:outHeight,pixels,scale};
 }
 function toRgba(pixels,width,height){
  if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||pixels==null||pixels.length!==width*height)throw new TypeError("Composite pixel buffer does not match its dimensions.");
  const rgba=new Uint8ClampedArray(width*height*4);
  for(let i=0;i<pixels.length;i++){
   const color=pixels[i];if(color==null)continue;
   if(typeof color!=="string"||!/^#[0-9a-f]{6}$/i.test(color))throw new TypeError("Composite pixels must be transparent or six-digit hexadecimal colors.");
   const at=i*4;rgba[at]=parseInt(color.slice(1,3),16);rgba[at+1]=parseInt(color.slice(3,5),16);rgba[at+2]=parseInt(color.slice(5,7),16);rgba[at+3]=255;
  }
  return rgba;
 }
 return {pngDimensions,toRgba};
});
