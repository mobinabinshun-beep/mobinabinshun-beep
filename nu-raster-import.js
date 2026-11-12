/* N.U Raster Import — deterministic palette mapping with optional Floyd–Steinberg dithering. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NURasterImport=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 function nearest(rgb,colors){
  let best=colors[0],dist=Infinity;
  for(const color of colors){
   const c=[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16)];
   const d=(rgb[0]-c[0])**2+(rgb[1]-c[1])**2+(rgb[2]-c[2])**2;
   if(d<dist){dist=d;best=color;}
  }
  return best;
 }
 function mapPixels(data,width,height,colors,alphaCutoff=0,dither=false){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>262144)throw new RangeError("Raster dimensions exceed the import mapping budget.");
  if(!data||data.length!==width*height*4)throw new TypeError("RGBA buffer length does not match raster dimensions.");
  if(!Array.isArray(colors)||!colors.length||colors.some(c=>typeof c!=="string"||!/^#[0-9a-f]{6}$/i.test(c)))throw new TypeError("A non-empty six-digit hexadecimal palette is required.");
  const cutoff=Math.max(0,Math.min(255,Number(alphaCutoff)||0)),output=Array(width*height).fill(null),errors=dither?new Float32Array(width*height*3):null;
  const add=(index,error,factor)=>{if(index<0||index>=width*height||data[index*4+3]<=cutoff)return;for(let k=0;k<3;k++)errors[index*3+k]+=error[k]*factor;};
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const i=y*width+x,at=i*4;if(data[at+3]<=cutoff)continue;
   const rgb=[0,1,2].map(k=>Math.max(0,Math.min(255,data[at+k]+(errors?errors[i*3+k]:0))));
   const color=nearest(rgb,colors);output[i]=color;if(!errors)continue;
   const quantized=[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16)],error=rgb.map((v,k)=>v-quantized[k]);
   if(x+1<width)add(i+1,error,7/16);
   if(y+1<height){if(x>0)add(i+width-1,error,3/16);add(i+width,error,5/16);if(x+1<width)add(i+width+1,error,1/16);}
  }
  return output;
 }
 return {mapPixels};
});
