/* N.U Studio Pro Tools — deterministic 2D selection, paint, gradient and layer math. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUStudioProTools=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const validSize=(w,h)=>Number.isSafeInteger(w)&&Number.isSafeInteger(h)&&w>0&&h>0&&Number.isSafeInteger(w*h);
 const idx=(x,y,w)=>y*w+x;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const rgb=c=>c?[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)):null;
 const hex=a=>"#"+a.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,"0")).join("");
 function rectSelection(w,h,x0,y0,x1,y1){
  if(!validSize(w,h))throw new RangeError("Invalid selection dimensions.");
  const out=new Uint8Array(w*h),l=clamp(Math.floor(Math.min(x0,x1)),0,w-1),r=clamp(Math.ceil(Math.max(x0,x1)),0,w-1),t=clamp(Math.floor(Math.min(y0,y1)),0,h-1),b=clamp(Math.ceil(Math.max(y0,y1)),0,h-1);
  for(let y=t;y<=b;y++)for(let x=l;x<=r;x++)out[idx(x,y,w)]=1;
  return out;
 }
 function lassoSelection(w,h,points){
  if(!validSize(w,h))throw new RangeError("Invalid selection dimensions.");
  const out=new Uint8Array(w*h);if(!Array.isArray(points)||points.length<3)return out;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
    const a=points[i],b=points[j];
    if(((a.y>y+.5)!==(b.y>y+.5))&&(x+.5<(b.x-a.x)*(y+.5-a.y)/(b.y-a.y)+a.x))inside=!inside;
   }
   if(inside)out[idx(x,y,w)]=1;
  }
  return out;
 }
 function gradient(pixels,w,h,start,end,a,b,mode="linear",selection=null){
  if(!validSize(w,h)||!pixels||pixels.length!==w*h)throw new TypeError("Gradient pixels do not match the canvas.");
  const ca=rgb(a),cb=rgb(b);if(!ca||!cb)throw new TypeError("Gradient colors must be hexadecimal.");
  const out=pixels.slice(),dx=end.x-start.x,dy=end.y-start.y,den=dx*dx+dy*dy||1;
  const radius=Math.sqrt(den);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=idx(x,y,w);if(selection&&!selection[i])continue;
   let t;if(mode==="radial")t=Math.min(1,Math.hypot(x-start.x,y-start.y)/radius);
   else t=clamp(((x-start.x)*dx+(y-start.y)*dy)/den,0,1);
   out[i]=hex(ca.map((v,k)=>v+(cb[k]-v)*t));
  }
  return out;
 }
 function moveSelection(pixels,w,h,selection,dx,dy){
  if(!validSize(w,h)||!pixels||pixels.length!==w*h||!selection||selection.length!==w*h)throw new TypeError("Selection does not match the canvas.");
  const sx=Math.round(dx),sy=Math.round(dy),out=pixels.slice(),mask=new Uint8Array(w*h);
  for(let i=0;i<out.length;i++)if(selection[i])out[i]=null;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=idx(x,y,w);if(!selection[i])continue;const nx=x+sx,ny=y+sy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const ni=idx(nx,ny,w);out[ni]=pixels[i];mask[ni]=1;}
  return {pixels:out,selection:mask};
 }
 function scaleSelection(pixels,w,h,selection,scaleX=1,scaleY=1){
  if(!validSize(w,h)||!pixels||pixels.length!==w*h||!selection||selection.length!==w*h)throw new TypeError("Selection does not match the canvas.");
  if(!Number.isFinite(scaleX)||!Number.isFinite(scaleY)||scaleX<=0||scaleY<=0||scaleX>16||scaleY>16)throw new RangeError("Selection scale must be between 0 and 16.");
  let l=w,t=h,r=-1,b=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(selection[idx(x,y,w)]){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  if(r<l)return {pixels:pixels.slice(),selection:selection.slice()};
  const cx=(l+r+1)/2,cy=(t+b+1)/2,nw=Math.max(1,Math.round((r-l+1)*scaleX)),nh=Math.max(1,Math.round((b-t+1)*scaleY));
  const out=pixels.slice(),mask=new Uint8Array(w*h),src=pixels.slice();
  for(let y=t;y<=b;y++)for(let x=l;x<=r;x++)if(selection[idx(x,y,w)])out[idx(x,y,w)]=null;
  const left=Math.round(cx-nw/2),top=Math.round(cy-nh/2);
  for(let y=0;y<nh;y++)for(let x=0;x<nw;x++){const dx=left+x,dy=top+y;if(dx<0||dy<0||dx>=w||dy>=h)continue;const sx=l+Math.min(r-l,Math.floor(x/scaleX)),sy=t+Math.min(b-t,Math.floor(y/scaleY));const si=idx(sx,sy,w),di=idx(dx,dy,w);if(!selection[si])continue;out[di]=src[si];mask[di]=1;}
  return {pixels:out,selection:mask};
 }
 function bezier(pixels,w,h,start,end,curvature,color,size=1){
  if(!validSize(w,h)||!pixels||pixels.length!==w*h)throw new TypeError("Curve pixels do not match the canvas.");
  const out=pixels.slice(),dx=end.x-start.x,dy=end.y-start.y,len=Math.hypot(dx,dy)||1,offset=Number(curvature)||0,cx=(start.x+end.x)/2-(dy/len)*offset,cy=(start.y+end.y)/2+(dx/len)*offset;
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)*3)),radius=Math.max(0,Math.floor((size-1)/2));
  for(let n=0;n<=steps;n++){const t=n/steps,u=1-t,x=Math.round(u*u*start.x+2*u*t*cx+t*t*end.x),y=Math.round(u*u*start.y+2*u*t*cy+t*t*end.y);
   for(let yy=-radius;yy<=radius;yy++)for(let xx=-radius;xx<=radius;xx++){const px=x+xx,py=y+yy;if(px>=0&&py>=0&&px<w&&py<h)out[idx(px,py,w)]=color;}
  }
  return out;
 }
 function brushCells(x,y,size,shape="square",texture="none",density=100){
  const radius=Math.floor((size-1)/2),out=[],den=clamp(density,0,100);
  for(let yy=-radius;yy<=radius;yy++)for(let xx=-radius;xx<=radius;xx++){
   if(shape==="circle"&&xx*xx+yy*yy>radius*radius+radius)continue;
   if(shape==="diamond"&&Math.abs(xx)+Math.abs(yy)>radius)continue;
   let keep=true;if(texture==="dots")keep=((xx+radius)%2===0&&(yy+radius)%2===0);
   if(texture==="diagonal")keep=((xx-yy)%3===0);
   if(texture==="grain"){const n=Math.abs(Math.imul((x+xx+4099)|0,374761393)^Math.imul((y+yy+8191)|0,668265263))%100;keep=n<den;}
   if(keep)out.push([x+xx,y+yy]);
  }
  return out;
 }
 function blendPixel(base,top,mode="normal",opacity=100){
  const a=rgb(base),b=rgb(top);if(!b)return base;if(!a)return hex(b);
  const blend=b.map((v,i)=>mode==="multiply"?a[i]*v/255:mode==="screen"?255-(255-a[i])*(255-v)/255:mode==="add"?Math.min(255,a[i]+v):mode==="darken"?Math.min(a[i],v):mode==="lighten"?Math.max(a[i],v):v);
  const alpha=clamp(opacity,0,100)/100;return hex(a.map((v,i)=>v*(1-alpha)+blend[i]*alpha));
 }
 function applyMask(pixels,mask){if(!pixels||!mask||pixels.length!==mask.length)throw new TypeError("Layer mask size mismatch.");return pixels.map((c,i)=>c&&mask[i]>0?c:null);}

 function invertSelection(selection){
  if(!selection||typeof selection.length!=="number")throw new TypeError("Selection mask is required.");
  return Uint8Array.from(selection,v=>v?0:1);
 }
 function rotatePixels(pixels,w,h,angle,selection=null){
  if(!validSize(w,h)||!pixels||pixels.length!==w*h)throw new TypeError("Rotation pixels do not match the canvas.");
  if(selection&&selection.length!==w*h)throw new TypeError("Rotation selection does not match the canvas.");
  if(!Number.isFinite(angle))throw new TypeError("Rotation angle must be finite.");
  const out=pixels.slice(),mask=selection?new Uint8Array(w*h):null,src=pixels.slice();
  if(mask)mask.fill(0);
  const radians=angle*Math.PI/180,cos=Math.cos(radians),sin=Math.sin(radians),cx=(w-1)/2,cy=(h-1)/2;
  if(selection){for(let i=0;i<out.length;i++)if(selection[i])out[i]=null;}
  else out.fill(null);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const dx=x-cx,dy=y-cy,sx=Math.round(cx+dx*cos+dy*sin),sy=Math.round(cy-dx*sin+dy*cos);
   if(sx<0||sy<0||sx>=w||sy>=h)continue;
   const si=idx(sx,sy,w),di=idx(x,y,w);if(selection&&!selection[si])continue;
   out[di]=src[si];if(mask)mask[di]=1;
  }
  return {pixels:out,selection:mask};
 }
 function rotatePoint(point,center,angle){
  if(!point||!center||![point.x,point.y,center.x,center.y,angle].every(Number.isFinite))throw new TypeError("Rotation coordinates and angle must be finite.");
  const r=angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r),x=point.x-center.x,y=point.y-center.y;
  return {x:center.x+x*c-y*s,y:center.y+x*s+y*c};
 }
 return {rectSelection,lassoSelection,gradient,moveSelection,scaleSelection,bezier,brushCells,blendPixel,applyMask,invertSelection,rotatePixels,rotatePoint};
});
