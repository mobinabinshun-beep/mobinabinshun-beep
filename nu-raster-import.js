/* N.U Raster Import — deterministic palette mapping with optional Floyd–Steinberg dithering. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NURasterImport=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 function isSupportedImageFile(file){
  // Browser decoding validates actual content; MIME and extension metadata are advisory only.
  return !!file;
 }
 function nearest(r,g,b,palette){
  let best=0,dist=Infinity;
  for(let i=0;i<palette.length;i++){
   const color=palette[i],dr=r-color[0],dg=g-color[1],db=b-color[2],d=dr*dr+dg*dg+db*db;
   if(d<dist){dist=d;best=i;}
  }
  return best;
 }
 function mapPixels(data,width,height,colors,alphaCutoff=0,dither=false){
  const cells=width*height;
  if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||!Number.isSafeInteger(cells))throw new RangeError("Raster dimensions are outside the supported numeric range.");
  if(!data||data.length!==cells*4)throw new TypeError("RGBA buffer length does not match raster dimensions.");
  if(!Array.isArray(colors)||!colors.length||colors.some(c=>typeof c!=="string"||!/^#[0-9a-f]{6}$/i.test(c)))throw new TypeError("A non-empty six-digit hexadecimal palette is required.");
  // Decode palette colors once, not once per candidate color for every source pixel.
  const palette=colors.map(color=>[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16)]);
  const cutoff=Math.max(0,Math.min(255,Number(alphaCutoff)||0)),output=Array(cells).fill(null),errors=dither?new Float32Array(cells*3):null;
  const add=(index,er,eg,eb,factor)=>{
   if(index<0||index>=cells||data[index*4+3]<=cutoff)return;
   errors[index*3]+=er*factor;errors[index*3+1]+=eg*factor;errors[index*3+2]+=eb*factor;
  };
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const i=y*width+x,at=i*4;if(data[at+3]<=cutoff)continue;
   const r=Math.max(0,Math.min(255,data[at]+(errors?errors[i*3]:0)));
   const g=Math.max(0,Math.min(255,data[at+1]+(errors?errors[i*3+1]:0)));
   const b=Math.max(0,Math.min(255,data[at+2]+(errors?errors[i*3+2]:0)));
   const colorIndex=nearest(r,g,b,palette);output[i]=colors[colorIndex];if(!errors)continue;
   const quantized=palette[colorIndex],er=r-quantized[0],eg=g-quantized[1],eb=b-quantized[2];
   if(x+1<width)add(i+1,er,eg,eb,7/16);
   if(y+1<height){if(x>0)add(i+width-1,er,eg,eb,3/16);add(i+width,er,eg,eb,5/16);if(x+1<width)add(i+width+1,er,eg,eb,1/16);}
  }
  return output;
 }
 return {mapPixels,isSupportedImageFile};
});
