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
 function fadePixel(base,top,intensity,underlay="#142538"){
  if(!Number.isFinite(intensity)||intensity<0||intensity>100)throw new RangeError("Brush intensity must be between 0 and 100.");
  const a=rgb(base||underlay),b=rgb(top);if(!b)throw new TypeError("Brush color must be hexadecimal.");
  return hex(a.map((v,i)=>v+(b[i]-v)*intensity/100));
 }

 function smudgeBrush(pixels,w,h,x,y,size=1,strength=50,selection=null,state=null,shape="square"){
  if(!validSize(w,h)||!pixels||pixels.length!==w*h)throw new TypeError("Mixing brush pixels do not match the canvas.");
  if(selection&&selection.length!==w*h)throw new TypeError("Mixing brush selection does not match the canvas.");
  if(!Number.isFinite(x)||!Number.isFinite(y))throw new TypeError("Mixing brush coordinates must be finite.");
  if(!Number.isSafeInteger(size)||size<1||size>64)throw new RangeError("Mixing brush size must be between 1 and 64.");
  if(!Number.isFinite(strength)||strength<0||strength>100)throw new RangeError("Mixing strength must be between 0 and 100.");
  const out=pixels,targetX=Math.round(x),targetY=Math.round(y);
  let pickup=state&&typeof state.pickup==="string"&&/^#[0-9a-f]{6}$/i.test(state.pickup)?state.pickup.toLowerCase():null;
  const hasLast=state&&Number.isFinite(state.lastX)&&Number.isFinite(state.lastY);
  const dx=hasLast?targetX-state.lastX:0,dy=hasLast?targetY-state.lastY:0,steps=hasLast?Math.max(Math.abs(dx),Math.abs(dy)):0;
  const points=[];
  if(steps===0)points.push([targetX,targetY]);
  else for(let n=1;n<=steps;n++)points.push([Math.round(state.lastX+dx*n/steps),Math.round(state.lastY+dy*n/steps)]);
  const rate=strength/100,pickupRate=rate*.35;
  for(const [cx,cy] of points){
   const cells=brushCells(cx,cy,size,shape,"none",100).filter(([px,py])=>px>=0&&py>=0&&px<w&&py<h&&(!selection||selection[idx(px,py,w)]));
   if(!cells.length)continue;
   let count=0,red=0,green=0,blue=0;
   for(const [px,py] of cells){const c=out[idx(px,py,w)],v=rgb(c);if(!v)continue;red+=v[0];green+=v[1];blue+=v[2];count++;}
   if(count){const sample=hex([red/count,green/count,blue/count]);pickup=pickup?hex(rgb(pickup).map((v,k)=>v+(rgb(sample)[k]-v)*pickupRate)):sample;}
   if(!pickup||rate===0)continue;
   const carried=rgb(pickup);
   for(const [px,py] of cells){const i=idx(px,py,w),current=rgb(out[i]);
    // Transparent cells stay transparent; they neither inject a false background color nor receive opaque paint.
    if(!current)continue;
    out[i]=hex(current.map((v,k)=>v+(carried[k]-v)*rate));
   }
  }
  return {pixels:out,state:{lastX:targetX,lastY:targetY,pickup}};
 }

 function bucketFill(pixels,w,h,x,y,next,mode="contiguous",tolerance=0,selection=null,mask=null){
  if(!validSize(w,h)||!pixels||pixels.length!==w*h)throw new TypeError("Fill pixels do not match the canvas.");
  if(!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||x<0||y<0||x>=w||y>=h)throw new RangeError("Fill coordinates are outside the canvas.");
  if(next!==null&&(typeof next!=="string"||!/^#[0-9a-f]{6}$/i.test(next)))throw new TypeError("Fill color must be a hexadecimal color or transparent.");
  if(!["contiguous","similar","global"].includes(mode))throw new RangeError("Unknown fill mode.");
  if(!Number.isFinite(tolerance)||tolerance<0||tolerance>441.673)throw new RangeError("Fill tolerance must be between 0 and 441.673.");
  if(selection&&selection.length!==w*h)throw new TypeError("Fill selection does not match the canvas.");
  if(mask&&mask.length!==w*h)throw new TypeError("Fill layer mask does not match the canvas.");
  const startIndex=idx(x,y,w),start=pixels[startIndex],out=pixels.slice();
  if(selection&&!selection[startIndex])return {pixels:out,changed:0,reason:"outside-selection",source:start};
  if(mask&&!mask[startIndex])return {pixels:out,changed:0,reason:"outside-mask",source:start};
  if(start===next)return {pixels:out,changed:0,reason:"same-color",source:start};
  const distance=(a,b)=>{
   if(a===b)return 0;
   if(a===null||b===null)return Infinity;
   const ca=rgb(a),cb=rgb(b);if(!ca||!cb)return Infinity;
   return Math.sqrt(ca.reduce((sum,v,k)=>sum+(v-cb[k])**2,0));
  };
  const matches=c=>mode==="similar"?distance(c,start)<=tolerance:c===start;
  let changed=0;
  const allowed=i=>(!selection||!!selection[i])&&(!mask||!!mask[i]);
  if(mode==="global"){
   for(let i=0;i<out.length;i++)if(allowed(i)&&matches(out[i])){out[i]=next;changed++;}
   return {pixels:out,changed,reason:changed?"filled":"no-match",source:start};
  }
  const seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
  const push=i=>{
   if(i<0||i>=out.length||seen[i]||!allowed(i)||!matches(out[i]))return;
   seen[i]=1;queue[tail++]=i;
  };
  push(startIndex);
  while(head<tail){
   const i=queue[head++];if(out[i]!==next){out[i]=next;changed++;}
   const px=i%w,py=Math.floor(i/w);
   if(px>0)push(i-1);if(px<w-1)push(i+1);if(py>0)push(i-w);if(py<h-1)push(i+w);
  }
  return {pixels:out,changed,reason:changed?"filled":"no-match",source:start};
 }

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
 return {rectSelection,lassoSelection,gradient,moveSelection,scaleSelection,bezier,brushCells,blendPixel,applyMask,fadePixel,smudgeBrush,bucketFill,invertSelection,rotatePixels,rotatePoint};
});
