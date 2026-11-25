/* N.U Pixel Art Studio v1.0 — local-only pixel editor and SVG exporter. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const canvas=$("pixel-canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true});
const defaults=["#111827","#243447","#3e596b","#78909c","#d8e2e8","#ffffff","#a63c50","#e45b63","#f29c67","#e8b94f","#f8dc86","#76a86c","#3f795e","#4b9cba","#5577b8","#8a6bb5"];
let width=32,height=32,pixels=Array(width*height).fill(null),palette=defaults.slice(),color="#e8b94f",tool="pencil",drawing=false,strokeSnapshot=null,undoStack=[],redoStack=[],imageImported=false,qualityProfile=null,workspace={zoom:100},resizeLock=true,lastDimension="width",brushSize=1,strokeStart=null,sourcePreviewUrl=null,originalImportFile=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let fadeIntensity=50,mixBrushStrength=60,mixBrushState=null,viewRotation=0,guideState={blueprint:false,ruler:false,divisions:false,axes:false,depth:false},guideHighContrast=true,compassState=null,magnifierFactor=4,magnifierSize=160,lastMagnifierPoint=null,toolContextRefresh=()=>{},activeToolCategory="draw",toolCategoryRefresh=()=>{};
function announce(msg){$("studio-status").textContent=msg;}
function snapshot(){return {width,height,pixels:pixels.slice()};}
function historyLimitFor(state){return Math.max(1,Math.min(60,Math.floor(2000000/Math.max(1,state.pixels.length))));}
function trimHistory(stack,state){const limit=historyLimitFor(state);while(stack.length>limit)stack.shift();}
function commitHistory(before){if(!before)return;undoStack.push(before);trimHistory(undoStack,before);redoStack=[];historyButtons();}
function restore(s){width=s.width;height=s.height;pixels=s.pixels.slice();$("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();render();}
function historyButtons(){$("undo").disabled=!undoStack.length;$("redo").disabled=!redoStack.length;}
function cellLimit(){const b=qualityProfile&&qualityProfile.budget;return b?Math.min(3000000,Math.max(4096,Math.floor(b.maxCanvasPixels||520000))):520000;}
function updateCounters(){const count=pixels.reduce((n,p)=>n+(p?1:0),0);$("canvas-size").textContent=width+" × "+height+" px";$("pixel-count").textContent=count+" painted pixels";$("zoom-note").textContent=workspace.zoom+"% view · "+(qualityProfile?qualityProfile.tier:"balanced");}
function updateCanvasDisplay(){
 if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
 const frame=$("workspace-frame");
 if(!window.NUStudioLayout){announce("Workspace geometry module is unavailable. Refresh the Studio.");return;}
 const fitted=window.NUStudioLayout.fit(width,height,frame.clientWidth,frame.clientHeight,workspace.zoom,28);
 canvas.style.width=fitted.width+"px";canvas.style.height=fitted.height+"px";
 frame.style.alignItems=fitted.overflowY?"flex-start":"center";
 frame.style.justifyContent=fitted.overflowX?"flex-start":"center";
 $("workspace-zoom").value=workspace.zoom;$("workspace-zoom-value").textContent=workspace.zoom+"%";
}
const renderColorCache=new Map();
function rgbaFor(hexColor){let value=renderColorCache.get(hexColor);if(!value){value=[parseInt(hexColor.slice(1,3),16),parseInt(hexColor.slice(3,5),16),parseInt(hexColor.slice(5,7),16),255];renderColorCache.set(hexColor,value);}return value;}
function render(){
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 const frame=ctx.createImageData(width,height),data=frame.data,clearA=rgbaFor("#142538"),clearB=rgbaFor("#0b1724");
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x,rgba=pixels[i]?rgbaFor(pixels[i]):(((x+y)&1)?clearA:clearB),o=i*4;data[o]=rgba[0];data[o+1]=rgba[1];data[o+2]=rgba[2];data[o+3]=rgba[3];}
 ctx.putImageData(frame,0,0);
 if($("show-grid")?.checked!==false&&Math.max(width,height)<=512){
  ctx.strokeStyle="rgba(150,180,205,.48)";
  ctx.lineWidth=Math.min(.24,Math.max(.06,Math.min(width,height)*.001));
  ctx.beginPath();
  for(let n=1;n<width;n++){ctx.moveTo(n,0);ctx.lineTo(n,height);}
  for(let n=1;n<height;n++){ctx.moveTo(0,n);ctx.lineTo(width,n);}
  ctx.stroke();
 }
 updateCounters();
}
function resizeArtwork(nextW,nextH,method="nearest"){nextW=clamp(Math.round(nextW),1,16384);nextH=clamp(Math.round(nextH),1,16384);if(nextW*nextH>cellLimit()){announce("This device profile allows up to "+cellLimit().toLocaleString()+" editable pixels. Reduce the dimensions or choose a lighter workspace.");return false;}const before=snapshot(),next=Array(nextW*nextH).fill(null);for(let y=0;y<nextH;y++)for(let x=0;x<nextW;x++){const sx=Math.min(width-1,Math.floor((x+.5)*width/nextW)),sy=Math.min(height-1,Math.floor((y+.5)*height/nextH));next[y*nextW+x]=pixels[sy*width+sx];}width=nextW;height=nextH;pixels=next;commitHistory(before);$("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();render();announce("Artwork resized to "+width+" × "+height+" px using "+method+" sampling. Original import remains unchanged outside the working copy.");return true;}
function initAdaptive(){const fallback=()=>{qualityProfile={tier:"balanced",level:3,budget:{maxCanvasPixels:520000,dpr:1},reducedMotion:false};$("quality-profile").textContent="Balanced · fallback";};if(!window.NUGraphicsCore){fallback();return;}window.NUGraphicsCore.start().then(p=>{qualityProfile=p;$("quality-profile").textContent=p.tier+" · level "+p.level;$("quality-detail").textContent="Editable pixel budget: "+cellLimit().toLocaleString()+" cells";updateCounters();}).catch(fallback);}
function setZoom(next,anchor,behavior="auto"){
 const frame=$("workspace-frame"),before=canvas.getBoundingClientRect(),frameRect=frame.getBoundingClientRect();
 const anchorX=anchor&&Number.isFinite(anchor.x)?anchor.x:frameRect.left+frame.clientWidth/2;
 const anchorY=anchor&&Number.isFinite(anchor.y)?anchor.y:frameRect.top+frame.clientHeight/2;
 workspace.zoom=clamp(Math.round(Number(next)||100),25,800);
 $("workspace-zoom").value=workspace.zoom;
 updateCanvasDisplay();
 const targetPixel=anchor&&!viewRotation?window.NUStudioLayout.pixelAt(anchorX,anchorY,before,width,height):null;
 const after=canvas.getBoundingClientRect(),delta=targetPixel?window.NUStudioLayout.pixelAnchorScrollDelta(before,after,anchorX,anchorY,width,height):window.NUStudioLayout.anchorScrollDelta(before,after,anchorX,anchorY);
 const maxLeft=Math.max(0,frame.scrollWidth-frame.clientWidth),maxTop=Math.max(0,frame.scrollHeight-frame.clientHeight);
 const left=clamp(frame.scrollLeft+delta.x,0,maxLeft),top=clamp(frame.scrollTop+delta.y,0,maxTop);
 scrollFrame(frame,left,top,behavior);
 if(targetPixel){
  for(let attempt=0;attempt<2;attempt++){
   const rect=canvas.getBoundingClientRect(),actualPixel=window.NUStudioLayout.pixelAt(anchorX,anchorY,rect,width,height);
   if(actualPixel.x===targetPixel.x&&actualPixel.y===targetPixel.y)break;
   const correction=window.NUStudioLayout.pixelAnchorCorrection(targetPixel,actualPixel,rect,width,height);
   const correctedLeft=clamp(frame.scrollLeft+correction.x,0,maxLeft),correctedTop=clamp(frame.scrollTop+correction.y,0,maxTop);
   if(correctedLeft===frame.scrollLeft&&correctedTop===frame.scrollTop)break;
   scrollFrame(frame,correctedLeft,correctedTop,"auto");
  }
 }
 updateCounters();
}
function scrollFrame(frame,left,top,behavior="auto"){
 const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(behavior==="smooth"&&!reduced){frame.scrollTo({left,top,behavior:"smooth"});return;}
 const previous=frame.style.scrollBehavior;frame.style.scrollBehavior="auto";frame.scrollTo({left,top,behavior:"auto"});requestAnimationFrame(()=>{frame.style.scrollBehavior=previous;});
}
function applyZoom(){setZoom(Number($("workspace-zoom").value)||100,null,"auto");}
$("workspace-zoom").addEventListener("input",applyZoom);
$("zoom-in")?.addEventListener("click",()=>setZoom(workspace.zoom+25,null,"smooth"));
$("zoom-out")?.addEventListener("click",()=>setZoom(workspace.zoom-25,null,"smooth"));
$("fit-canvas").addEventListener("click",()=>{workspace.zoom=100;$("workspace-zoom").value=100;updateCanvasDisplay();scrollFrame($("workspace-frame"),0,0,"auto");updateCounters();});
canvas.addEventListener("wheel",e=>{if(!e.ctrlKey)return;e.preventDefault();setZoom(workspace.zoom+(e.deltaY<0?10:-10),{x:e.clientX,y:e.clientY},"auto");},{passive:false});
let workspaceObserver=null;
function observeWorkspace(){
 const stage=document.querySelector(".stage"),frame=$("workspace-frame");
 if(typeof ResizeObserver!=="undefined"&&stage&&frame){
  workspaceObserver=new ResizeObserver(()=>{updateCanvasDisplay();});
  workspaceObserver.observe(stage);workspaceObserver.observe(frame);
 }
 window.addEventListener("resize",updateCanvasDisplay,{passive:true});
}
observeWorkspace();
$("image-lock").addEventListener("change",e=>{resizeLock=e.target.checked;});
$("image-width").addEventListener("input",()=>{lastDimension="width";});$("image-height").addEventListener("input",()=>{lastDimension="height";});$("apply-image-size").addEventListener("click",()=>{let w=clamp(Number($("image-width").value)||width,1,2048),h=clamp(Number($("image-height").value)||height,1,2048);if(resizeLock){const ratio=width/height;if(lastDimension==="width")h=Math.max(1,Math.round(w/ratio));else w=Math.max(1,Math.round(h*ratio));}$("image-width").value=w;$("image-height").value=h;resizeArtwork(w,h,"nearest-neighbor");});
function renderPalette(){const root=$("palette");root.innerHTML="";palette.forEach((c,i)=>{const b=document.createElement("button");b.type="button";b.className="swatch";b.style.background=c;b.title=c;b.setAttribute("aria-label","Palette color "+c);b.setAttribute("aria-pressed",String(c.toLowerCase()===color.toLowerCase()));b.addEventListener("click",()=>{color=c;$("custom-color").value=c;renderPalette();});root.appendChild(b);});const transparent=document.createElement("button");transparent.type="button";transparent.className="swatch";transparent.setAttribute("aria-label","Transparent");transparent.title="Transparent / eraser";transparent.addEventListener("click",()=>setTool("eraser"));root.appendChild(transparent);}
function setTool(next){if(next!=="magnifier")hideMagnifier();tool=next;mixBrushState=null;compassState=null;const selectedToolButton=document.querySelector('[data-tool="'+tool+'"]');if(selectedToolButton?.dataset.category)toolCategoryRefresh(selectedToolButton.dataset.category);document.querySelectorAll("[data-tool]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tool===tool)));canvas.style.cursor=tool==="magnifier"?"zoom-in":tool==="picker"?"copy":tool==="eraser"?"cell":tool==="fill"?"copy":"crosshair";toolContextRefresh();}
function coords(e){
 const r=canvas.getBoundingClientRect();
 if(!viewRotation)return window.NUStudioLayout.pixelAt(e.clientX,e.clientY,r,width,height);
 const cx=r.left+r.width/2,cy=r.top+r.height/2,a=-viewRotation*Math.PI/180,dx=e.clientX-cx,dy=e.clientY-cy;
 const ux=dx*Math.cos(a)-dy*Math.sin(a)+cx,uy=dx*Math.sin(a)+dy*Math.cos(a)+cy,w=canvas.offsetWidth,h=canvas.offsetHeight;
 return {x:clamp(Math.floor((ux-(cx-w/2))/w*width),0,width-1),y:clamp(Math.floor((uy-(cy-h/2))/h*height),0,height-1)};
}
function hideMagnifier(){const lens=$("studio-magnifier");if(!lens)return;lens.hidden=true;lens.setAttribute("aria-hidden","true");lastMagnifierPoint=null;}
function updateMagnifier(e){
 const lens=$("studio-magnifier"),lensCanvas=$("studio-magnifier-canvas"),stage=document.querySelector(".stage");
 if(tool!=="magnifier"||!e||!lens||!lensCanvas||!stage){hideMagnifier();return;}
 const p=coords(e),lensCtx=lensCanvas.getContext("2d"),sourceWidth=Math.max(1,Math.min(width,Math.floor(lensCanvas.width/magnifierFactor))),sourceHeight=Math.max(1,Math.min(height,Math.floor(lensCanvas.height/magnifierFactor)));
 const sx=clamp(p.x-Math.floor(sourceWidth/2),0,Math.max(0,width-sourceWidth)),sy=clamp(p.y-Math.floor(sourceHeight/2),0,Math.max(0,height-sourceHeight));
 lensCtx.clearRect(0,0,lensCanvas.width,lensCanvas.height);lensCtx.imageSmoothingEnabled=false;lensCtx.drawImage(canvas,sx,sy,sourceWidth,sourceHeight,0,0,lensCanvas.width,lensCanvas.height);
 const crossX=(p.x-sx+.5)/sourceWidth*lensCanvas.width,crossY=(p.y-sy+.5)/sourceHeight*lensCanvas.height;
 lensCtx.strokeStyle="rgba(255,255,255,.9)";lensCtx.lineWidth=1.5;lensCtx.beginPath();lensCtx.moveTo(crossX-10,crossY);lensCtx.lineTo(crossX+10,crossY);lensCtx.moveTo(crossX,crossY-10);lensCtx.lineTo(crossX,crossY+10);lensCtx.stroke();
 $("studio-magnifier-label").textContent=magnifierFactor+"× · "+(p.x+1)+", "+(p.y+1);
 const size=magnifierSize,stageRect=stage.getBoundingClientRect();let left=e.clientX-stageRect.left+18,top=e.clientY-stageRect.top+18;
 if(left+size>stage.clientWidth-8)left=e.clientX-stageRect.left-size-18;
 if(top+size>stage.clientHeight-8)top=e.clientY-stageRect.top-size-18;
 left=clamp(left,8,Math.max(8,stage.clientWidth-size-8));top=clamp(top,8,Math.max(8,stage.clientHeight-size-8));
 lens.style.width=size+"px";lens.style.height=size+"px";lens.style.left=left+"px";lens.style.top=top+"px";lens.hidden=false;lens.setAttribute("aria-hidden","false");lastMagnifierPoint={clientX:e.clientX,clientY:e.clientY};
}
function put(x,y,value){pixels[y*width+x]=value;}
function flood(x,y,next){const start=pixels[y*width+x];if(start===next)return;const stack=[[x,y]],seen=new Uint8Array(width*height);while(stack.length){const [cx,cy]=stack.pop(),i=cy*width+cx;if(cx<0||cy<0||cx>=width||cy>=height||seen[i]||pixels[i]!==start)continue;seen[i]=1;pixels[i]=next;stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);}}
function paintBrush(x,y,value){
 const radius=Math.floor((brushSize-1)/2);
 for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
  const px=x+dx,py=y+dy;if(px>=0&&py>=0&&px<width&&py<height)put(px,py,value);
 }
}
function drawShape(start,end){
 const value=tool==="eraser"?null:color,x0=start.x,y0=start.y,x1=end.x,y1=end.y;
 if(tool==="line"){
  let x=x0,y=y0,dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,err=dx+dy;
  while(true){paintBrush(x,y,value);if(x===x1&&y===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x+=sx;}if(e2<=dx){err+=dx;y+=sy;}}
 }else if(tool==="rect"||tool==="rect-fill"){
  const left=Math.min(x0,x1),right=Math.max(x0,x1),top=Math.min(y0,y1),bottom=Math.max(y0,y1);
  if(tool==="rect-fill"){for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++)paintBrush(x,y,value);}
  else{for(let x=left;x<=right;x++){paintBrush(x,top,value);paintBrush(x,bottom,value);}for(let y=top;y<=bottom;y++){paintBrush(left,y,value);paintBrush(right,y,value);}}
 }else if(tool==="ellipse"||tool==="ellipse-fill"||tool==="compass"){
  const compassRadius=Math.max(.5,Math.round(Math.hypot(x1-x0,y1-y0))),rx=tool==="compass"?compassRadius:Math.max(.5,Math.abs(x1-x0)/2),ry=tool==="compass"?compassRadius:Math.max(.5,Math.abs(y1-y0)/2),cx=tool==="compass"?x0:(x0+x1)/2,cy=tool==="compass"?y0:(y0+y1)/2;
  const left=Math.floor(cx-rx-1),right=Math.ceil(cx+rx+1),top=Math.floor(cy-ry-1),bottom=Math.ceil(cy+ry+1),tolerance=Math.max(1/rx,1/ry)*1.4;
  for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const d=((x-cx)*(x-cx))/(rx*rx)+((y-cy)*(y-cy))/(ry*ry);if(tool==="ellipse-fill"?d<=1:Math.abs(d-1)<=tolerance)paintBrush(x,y,value);}
 }
}
function paintAt(e){const p=coords(e),i=p.y*width+p.x;if(tool==="picker"){if(pixels[i]){color=pixels[i];$("custom-color").value=color;renderPalette();}return 0;}if(tool==="fill"){const changed=flood(p.x,p.y,color);render();return changed;}paintBrush(p.x,p.y,tool==="eraser"?null:color);render();return 1;}
canvas.addEventListener("pointerdown",e=>{
 e.preventDefault();if(tool==="magnifier"){if(e.pointerType==="touch"){try{canvas.setPointerCapture(e.pointerId)}catch(_){}}updateMagnifier(e);return;}if(tool==="color-mix-brush"&&adv.layers[adv.active].locked){announce("Layer locked. The color-mixing brush cannot paint on a locked layer.");return;}if(tool==="color-mix-brush"&&adv.maskEdit){announce("Turn off mask editing to use the color-mixing brush.");return;}mixBrushState=null;canvas.setPointerCapture(e.pointerId);drawing=true;strokeSnapshot=snapshot();strokeStart=coords(e);
 if(tool==="fill"||tool==="picker"){const changed=paintAt(e);if(tool==="fill"&&changed>0)commitHistory(strokeSnapshot);drawing=false;strokeSnapshot=null;strokeStart=null;return;}
 if(tool==="line"||tool==="rect"||tool==="ellipse"||tool==="rect-fill"||tool==="ellipse-fill"||tool==="compass"){if(tool==="compass")compassState={center:{...strokeStart},edge:{...strokeStart},active:true};drawShape(strokeStart,strokeStart);render();}else paintAt(e);
});
document.addEventListener("pointermove",e=>{
 if(tool!=="magnifier")return;
 const r=canvas.getBoundingClientRect();
 if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)updateMagnifier(e);else hideMagnifier();
},true);
canvas.addEventListener("pointermove",e=>{
 if(!drawing||!(e.buttons||e.pointerType==="touch"))return;
 if(tool==="line"||tool==="rect"||tool==="ellipse"||tool==="rect-fill"||tool==="ellipse-fill"||tool==="compass"){pixels=strokeSnapshot.pixels.slice();const edge=coords(e);if(tool==="compass"&&compassState)compassState.edge={...edge};drawShape(strokeStart,edge);render();}
 else paintAt(e);
});
function endStroke(){if(!drawing)return;drawing=false;commitHistory(strokeSnapshot);strokeSnapshot=null;strokeStart=null;mixBrushState=null;if(tool==="compass"){compassState=null;render();}}
function cancelStroke(){if(!drawing)return;if(tool==="color-mix-brush"&&strokeSnapshot&&strokeSnapshot.layers)restore(strokeSnapshot);else pixels=strokeSnapshot.pixels.slice();drawing=false;strokeSnapshot=null;strokeStart=null;mixBrushState=null;compassState=null;render();}
canvas.addEventListener("pointerup",e=>{endStroke();if(tool==="magnifier"&&e.pointerType==="touch")hideMagnifier();});canvas.addEventListener("pointercancel",e=>{cancelStroke();hideMagnifier();});canvas.addEventListener("lostpointercapture",cancelStroke);canvas.addEventListener("pointerleave",()=>{if(tool==="magnifier")hideMagnifier();});
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(tool==="magnifier")hideMagnifier();if(drawing&&tool==="compass"){e.preventDefault();cancelStroke();}});
document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
$("custom-color").addEventListener("input",e=>{color=e.target.value.toLowerCase();renderPalette();setTool("pencil");});
$("brush-size").addEventListener("input",e=>{brushSize=clamp(Number(e.target.value)||1,1,16);$("brush-size-value").textContent=brushSize+" px";});
function resetGrid(next){width=next;height=next;pixels=Array(width*height).fill(null);undoStack=[];redoStack=[];imageImported=false;historyButtons();$("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();render();announce("New "+width+" × "+height+" transparent canvas.");}
$("grid-size").addEventListener("change",e=>resetGrid(Number(e.target.value)));
$("new-canvas").addEventListener("click",()=>resetGrid(width));
$("clear-canvas").addEventListener("click",()=>{const before=snapshot();pixels.fill(null);commitHistory(before);render();announce("Canvas cleared.");});
$("undo").addEventListener("click",()=>{if(!undoStack.length)return;const current=snapshot();redoStack.push(current);trimHistory(redoStack,current);restore(undoStack.pop());historyButtons();});
$("redo").addEventListener("click",()=>{if(!redoStack.length)return;const current=snapshot();undoStack.push(current);trimHistory(undoStack,current);restore(redoStack.pop());historyButtons();});
function quantize(v){return Math.round(v/17)*17;}
function hex(r,g,b){return "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");}
function nearest(rgb,colors){let best=colors[0],dist=Infinity;for(const c of colors){const n=[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)],d=(rgb[0]-n[0])**2+(rgb[1]-n[1])**2+(rgb[2]-n[2])**2;if(d<dist){dist=d;best=c;}}return best;}
async function decodeImage(file){if(typeof createImageBitmap==="function"){try{const bitmap=await createImageBitmap(file);if(bitmap&&bitmap.width>0&&bitmap.height>0)return bitmap;if(bitmap&&typeof bitmap.close==="function")bitmap.close();}catch(_){}}const url=URL.createObjectURL(file),img=new Image();try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error("The selected file is not a supported or readable image."));img.src=url;});if(!(img.naturalWidth||img.width)||!(img.naturalHeight||img.height))throw new Error("The image decoder returned invalid dimensions.");img.__nuRelease=()=>URL.revokeObjectURL(url);return img;}catch(error){URL.revokeObjectURL(url);throw error;}}
function imagePalette(data,limit,alphaCutoff){
 const hist=new Map();
 for(let i=0;i<data.length;i+=4){if(data[i+3]<=alphaCutoff)continue;const r=Math.min(255,Math.round(data[i]/8)*8),g=Math.min(255,Math.round(data[i+1]/8)*8),b=Math.min(255,Math.round(data[i+2]/8)*8),c=hex(r,g,b),entry=hist.get(c)||{r,g,b,count:0};entry.count++;hist.set(c,entry);}
 let boxes=hist.size?[ [...hist.values()] ]:[];
 while(boxes.length<limit){let pick=-1,best=-1,channel=0;
  boxes.forEach((box,i)=>{if(box.length<2)return;const ranges=[0,1,2].map(k=>{let lo=255,hi=0;for(const p of box){const v=k===0?p.r:k===1?p.g:p.b;if(v<lo)lo=v;if(v>hi)hi=v;}return hi-lo;}),k=ranges.indexOf(Math.max(...ranges)),score=ranges[k]*box.reduce((n,p)=>n+p.count,0);if(score>best){best=score;pick=i;channel=k;}});
  if(pick<0||best<=0)break;const box=boxes.splice(pick,1)[0],field=channel===0?"r":channel===1?"g":"b";box.sort((a,b)=>a[field]-b[field]);const total=box.reduce((n,p)=>n+p.count,0);let sum=0,split=1;for(;split<box.length;split++){sum+=box[split-1].count;if(sum>=total/2)break;}boxes.push(box.slice(0,split),box.slice(split));
 }
 return boxes.map(box=>{const total=box.reduce((n,p)=>n+p.count,0);return hex(...["r","g","b"].map(k=>Math.round(box.reduce((n,p)=>n+p[k]*p.count,0)/total)));}).slice(0,limit);
}
$("palette-limit").addEventListener("input",e=>$("palette-limit-value").textContent=e.target.value);
$("alpha-cutoff").addEventListener("input",e=>$("alpha-cutoff-value").textContent=e.target.value);
$("import-image").addEventListener("click",()=>$("image-file").click());
$("image-file").addEventListener("change",async e=>{
 const file=e.target.files&&e.target.files[0];if(!file)return;
 const importButton=$("import-image");
 if(!window.NURasterImport||!window.NURasterImport.isSupportedImageFile(file)){
  announce("Choose a readable image file. File type is validated by the browser image decoder; MIME and filename metadata do not block selection.");
  e.target.value="";return;
 }
 let bitmap=null;
 importButton.disabled=true;
 try{
  announce("Reading image dimensions and preparing the original-size working canvas…");
  bitmap=await decodeImage(file);
  const sourceWidth=bitmap.naturalWidth||bitmap.width,sourceHeight=bitmap.naturalHeight||bitmap.height;
  if(!sourceWidth||!sourceHeight)throw new Error("The image decoder returned invalid dimensions.");
  const requested=String($("import-resolution").value||"original");
  const maxSide=requested==="original"?Math.max(sourceWidth,sourceHeight):Math.max(1,Number(requested)||256);
  const scale=Math.min(1,maxSide/Math.max(sourceWidth,sourceHeight));
  const nextW=Math.max(1,Math.round(sourceWidth*scale)),nextH=Math.max(1,Math.round(sourceHeight*scale));
  const requestedCells=nextW*nextH;
  if(!Number.isSafeInteger(requestedCells))throw new Error("Image dimensions exceed the numeric range supported by this browser.");
  const temp=document.createElement("canvas");temp.width=nextW;temp.height=nextH;
  const t=temp.getContext("2d",{willReadFrequently:true});if(!t)throw new Error("This browser could not create an image processing canvas.");
  t.imageSmoothingEnabled=$("import-resampling").value!=="nearest";if(t.imageSmoothingEnabled)t.imageSmoothingQuality="high";
  t.drawImage(bitmap,0,0,nextW,nextH);
  const data=t.getImageData(0,0,nextW,nextH).data,alphaCutoff=Number($("alpha-cutoff").value)||0;
  const extracted=imagePalette(data,Number($("palette-limit").value)||32,alphaCutoff);
  if(!extracted.length)throw new Error("No visible pixels remain above the transparency cutoff.");
  const mapped=window.NURasterImport.mapPixels(data,nextW,nextH,extracted,alphaCutoff,$("dither-image").checked);
  if(projectHasContent()&&!(await confirmProjectReplacement("Replace current artwork?","Importing this image will replace the active layer and may resize the current canvas. Download the project first if you want to keep the current work."))){announce("Image import cancelled. Your current project is unchanged.");return;}
  const before=snapshot(),previous={width,height,pixels,palette,imageImported,zoom:workspace.zoom,originalImportFile,sourceInfo:$("source-info").textContent,sourcePreviewHidden:$("source-preview-panel").hidden,sourcePreviewSrc:$("source-preview").src};
  let nextPreviewUrl=null;
  try{
   nextPreviewUrl=URL.createObjectURL(file);
   width=nextW;height=nextH;pixels=mapped;palette=extracted;imageImported=true;workspace.zoom=100;
   updateCanvasDisplay();render();
   $("image-width").value=width;$("image-height").value=height;
   $("source-preview").src=nextPreviewUrl;$("source-preview-panel").hidden=false;
   const sizing=requested==="original"?"original dimensions preserved":"working copy resized by your selected detail";
   $("source-info").textContent=sourceWidth+" × "+sourceHeight+" source → "+width+" × "+height+" editable pixels · "+palette.length+" colors · "+sizing;
   renderPalette();
   requestAnimationFrame(()=>{updateCanvasDisplay();$("workspace-frame").scrollTo(0,0);});
   announce("Imported · "+file.name+" · "+sourceWidth+" × "+sourceHeight+" source → "+width+" × "+height+" editable pixels. "+(requested==="original"?"Original dimensions preserved.":"Explicit reduced-detail working copy created.")+" Original source preserved.");
   commitHistory(before);originalImportFile=file;
   const previousPreviewUrl=sourcePreviewUrl;sourcePreviewUrl=nextPreviewUrl;nextPreviewUrl=null;
   if(previousPreviewUrl)URL.revokeObjectURL(previousPreviewUrl);
  }catch(importError){
   if(nextPreviewUrl)URL.revokeObjectURL(nextPreviewUrl);
   width=previous.width;height=previous.height;pixels=previous.pixels;palette=previous.palette;imageImported=previous.imageImported;workspace.zoom=previous.zoom;originalImportFile=previous.originalImportFile;
   $("source-info").textContent=previous.sourceInfo;$("source-preview-panel").hidden=previous.sourcePreviewHidden;
   if(previous.sourcePreviewSrc)$("source-preview").src=previous.sourcePreviewSrc;
   try{restore(before);renderPalette();}catch(_){}
   throw new Error("Image import failed without replacing your previous artwork. "+(importError&&importError.message?importError.message:""));
  }
 }catch(err){announce("Image import failed: "+(err&&err.message?err.message:"unsupported image"));}
 finally{if(bitmap&&typeof bitmap.close==="function")bitmap.close();else if(bitmap&&typeof bitmap.__nuRelease==="function")bitmap.__nuRelease();e.target.value="";importButton.disabled=false;}
});
window.addEventListener("pagehide",()=>{if(sourcePreviewUrl)URL.revokeObjectURL(sourcePreviewUrl);if(workspaceObserver)workspaceObserver.disconnect();},{once:true});
$("extract-palette").addEventListener("click",()=>{if(!imageImported){announce("Import an image first to extract its palette.");return;}const counts=new Map();pixels.filter(Boolean).forEach(c=>counts.set(c,(counts.get(c)||0)+1));palette=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,16).map(x=>x[0]);if(!palette.length)palette=defaults.slice();renderPalette();announce("Palette extracted from current artwork.");});
function analyzeArtwork(){
 if(!window.NUGraphicsAnalysis)throw new Error("Graphics analysis engine did not load.");
 adv.layers[adv.active].pixels=pixels.slice();
 return window.NUGraphicsAnalysis.analyze(composite(),width,height,{tileSize:8});
}
function artworkFingerprint(){
 const source=width+"x"+height+"|"+pixels.map(p=>p||"_").join(",");
 let a=2166136261,b=2246822519;
 for(let i=0;i<source.length;i++){const c=source.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,3266489917);}
 return (a>>>0).toString(16).padStart(8,"0")+(b>>>0).toString(16).padStart(8,"0");
}
function calculateStudioXP(metrics,pathCount){
 if(metrics.paintedPixels<16)return 0;
 const score=Math.floor(metrics.paintedPixels/256)+Math.floor(metrics.regionCount/8)+Math.floor(pathCount/24)+Math.floor(metrics.colorCount/8);
 return Math.max(1,Math.min(25,score));
}
function grantStudioXP(metrics,pathCount){
 const amount=calculateStudioXP(metrics,pathCount);
 if(!amount)return {ok:false,reason:"ARTWORK_TOO_SMALL",amount:0};
 if(!window.NU||!window.NUWallet)return {ok:false,reason:"SHARED_WALLET_UNAVAILABLE",amount};
 const save=NUWallet.normalizeSave(NU.load()),result=NUWallet.grantXP(save,amount,{id:"studio-export-"+artworkFingerprint(),title:"Creative Studio export"});
 if(!result.ok)return {ok:false,reason:result.reason,amount};
 if(!NU.save(result.state))return {ok:false,reason:"SAVE_FAILED",amount};
 window.dispatchEvent(new CustomEvent("nu:save-updated"));
 return {ok:true,amount};
}
function showAnalysisSummary(analysis,pathCount){
 const m=analysis.metrics;
 $("analysis-summary").textContent="ANALYSIS · "+m.paintedPixels.toLocaleString()+" pixels · "+m.colorCount+" colors · "+m.regionCount+" regions · "+m.edgePixels.toLocaleString()+" edge pixels · "+m.tileCount+" tiles · "+m.runCount+" runs · "+pathCount+" geometry units";
}
function reportDownloadedOutput(analysis,pathCount){
 showAnalysisSummary(analysis,pathCount);
 let message="File ready · if automatic download did not start, tap the download link below.";
 try{
  const reward=grantStudioXP(analysis.metrics,pathCount);
  if(reward.ok)message="File ready · +"+reward.amount+" shared XP added to all three Generation 1 games. This artwork earns XP once. If needed, tap the download link below.";
  else if(reward.reason==="DUPLICATE_REWARD")message="File ready · this artwork has already claimed its Studio XP reward. If needed, tap the download link below.";
  else if(reward.reason==="ARTWORK_TOO_SMALL")message="File ready · artwork is too small for an XP reward. If needed, tap the download link below.";
  else message="File ready · XP reward not saved: "+reward.reason+". If needed, tap the download link below.";
 }catch(error){message="File ready · reward tracking was unavailable. Use the download link below if automatic download did not start.";}
 announce(message);
}
function svgSource(){
 if(!window.NUSVGVectorizer)throw new Error("SVG engine did not load.");
 if(!pixels.some(Boolean))throw new Error("The artwork is empty. Draw or import an image before exporting SVG.");
 try{
  const result=window.NUSVGVectorizer.vectorize(pixels,width,height,{mode:$("vector-mode").value});
  if(result.pathCount>0&&/<path\b/.test(result.source))return result;
  return {source:rasterSvgSource(),pathCount:0,colorCount:palette.length,mode:"embedded-raster-fallback",fallback:true};
 }catch(error){
  if(!(error instanceof RangeError))throw error;
  return {source:rasterSvgSource(),pathCount:0,colorCount:palette.length,mode:"embedded-raster-fallback",fallback:true};
 }
}
function filename(ext){let n=$("export-name").value.trim().replace(/[^a-z0-9-_]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,48)||"nu-pixel-art";return n+"."+ext;}
let pendingDownloadUrl=null;
function download(blob,name){
 if(!(blob instanceof Blob)||!blob.size)throw new Error("The export produced an empty file.");
 if(typeof URL.createObjectURL!=="function")throw new Error("This browser cannot create a downloadable file link.");
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 const fallback=$("adv-export-downloads")||$("export-download-fallback");
 a.href=url;a.download=name;a.textContent="⬇ Download "+name;a.setAttribute("aria-label","Download "+name);
 a.className="download-fallback-link";a.style.display="block";a.style.width="fit-content";a.style.maxWidth="100%";a.style.overflowWrap="anywhere";a.style.margin="8px 0";a.style.padding="12px 14px";
 a.style.border="2px solid #65dcff";a.style.borderRadius="8px";a.style.background="#102a3b";a.style.color="#ffffff";a.style.fontWeight="700";
 if(fallback){fallback.replaceChildren(a);fallback.hidden=false;}
 else{a.style.position="fixed";a.style.left="12px";a.style.bottom="12px";a.style.zIndex="9999";document.body.appendChild(a);}
 if(pendingDownloadUrl)URL.revokeObjectURL(pendingDownloadUrl);
 pendingDownloadUrl=url;
 try{a.click();}catch(error){announce("The file is ready. Use the download link on the page.");}
 setTimeout(()=>{if(pendingDownloadUrl===url){URL.revokeObjectURL(url);pendingDownloadUrl=null;}},1800000);
 return true;
}
function graphicIRSource(){
 adv.layers[adv.active].pixels=pixels.slice();
 const visible=composite(),palette=[],lookup=new Map(),runs=[];
 for(let y=0;y<height;y++){
  let x=0;
  while(x<width){
   const c=visible[y*width+x];
   if(!c){x++;continue;}
   if(!lookup.has(c)){lookup.set(c,palette.length+1);palette.push(c);}
   const index=lookup.get(c),start=x;
   while(x<width&&visible[y*width+x]===c)x++;
   runs.push([y,start,x-start,index]);
  }
 }
 return {format:"NU-GFX-IR/2",encoding:"row-major-rle",dimensions:{width,height},transparentIndex:0,palette,runs,instructions:[{op:"set-palette",colors:palette},{op:"draw-runs",encoding:"y,x,length,paletteIndex",runs}]};
}
function rasterSvgSource(){
 const rgba=window.NUStudioExport.toRgba(pixels,width,height),c=document.createElement("canvas");
 c.width=width;c.height=height;const x=c.getContext("2d");if(!x)throw new Error("SVG fallback canvas is unavailable.");
 const frame=x.createImageData(width,height);frame.data.set(rgba);x.putImageData(frame,0,0);
 const uri=c.toDataURL("image/png");
 if(!uri||!uri.startsWith("data:image/png;base64,"))throw new Error("SVG fallback could not embed the rendered PNG.");
 return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'"><title>N.U artwork — embedded raster fallback</title><image width="'+width+'" height="'+height+'" href="'+uri+'" xlink:href="'+uri+'"/></svg>\n';
}
$("export-svg").addEventListener("click",()=>{
 try{
  const result=svgSource(),name=filename("svg");
  download(new Blob([result.source],{type:"image/svg+xml;charset=utf-8"}),name);
  announce("SVG file prepared · "+result.pathCount+" paths. If it did not download, tap the "+name+" link below.");
  try{reportDownloadedOutput(analyzeArtwork(),result.pathCount);}catch(_){announce("SVG file is ready. Tap the download link below if automatic download did not start.");}
 }catch(err){announce("SVG export failed: "+err.message);}
});
$("export-ir").addEventListener("click",()=>{
 try{const source=JSON.stringify(graphicIRSource(),null,2),name=filename("nu-gfx.json");download(new Blob([source],{type:"application/vnd.nu-gfx+json;charset=utf-8"}),name);announce("Machine-readable Graphic IR/2 ready · row-run encoding · no heavy analysis required.");}
 catch(err){announce("Graphic IR export failed: "+err.message);}
});
$("export-svg-copy").addEventListener("click",async()=>{try{const result=svgSource();await navigator.clipboard.writeText(result.source);announce("SVG source copied · "+result.pathCount+" paths · "+result.colorCount+" colors.");}catch(err){announce("Clipboard unavailable: "+err.message+" · use Download SVG.");}});
$("export-png").addEventListener("click",()=>{
 const button=$("export-png");let source=null,out=null;
 try{
  if(!window.NUStudioExport)throw new Error("PNG export engine did not load. Refresh the Studio and try again.");
  const scale=Number($("export-scale").value)||1,size=window.NUStudioExport.pngDimensions(width,height,scale);
  adv.layers[adv.active].pixels=pixels.slice();
  const visible=composite(),rgba=window.NUStudioExport.toRgba(visible,width,height);
  source=document.createElement("canvas");source.width=width;source.height=height;
  const sourceContext=source.getContext("2d");if(!sourceContext)throw new Error("This browser could not create the source export canvas.");
  const frame=sourceContext.createImageData(width,height);frame.data.set(rgba);sourceContext.putImageData(frame,0,0);
  out=document.createElement("canvas");out.width=size.width;out.height=size.height;
  const outputContext=out.getContext("2d");if(!outputContext)throw new Error("This browser could not create the requested PNG canvas.");
  outputContext.imageSmoothingEnabled=false;outputContext.drawImage(source,0,0,size.width,size.height);
  button.disabled=true;announce("Preparing transparent PNG · "+size.width+" × "+size.height+" px…");
  const finish=blob=>{
   try{
    if(!blob)throw new Error("PNG encoding returned an empty file.");
    const name=filename("png");download(blob,name);announce("PNG ready · "+size.width+" × "+size.height+" · The download link is available on the page.");
   }catch(err){announce("PNG export failed: "+err.message);}
   finally{button.disabled=false;source.width=source.height=out.width=out.height=1;}
  };
  if(typeof out.toBlob==="function")out.toBlob(finish,"image/png");
  else{try{const data=out.toDataURL("image/png"),raw=atob(data.split(",")[1]),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);finish(new Blob([bytes],{type:"image/png"}));}catch(error){finish(null);}}
 }catch(err){button.disabled=false;announce("PNG export failed: "+err.message);if(source)source.width=source.height=1;if(out)out.width=out.height=1;}
});
$("show-grid")?.addEventListener("change",render);
renderPalette();updateCanvasDisplay();render();setTool("pencil");historyButtons();initAdaptive();
document.addEventListener("keydown",e=>{
 const tag=(e.target&&e.target.tagName||"").toLowerCase();
 if(["input","textarea","select"].includes(tag)||e.target.isContentEditable)return;
 const key=e.key.toLowerCase(),mod=e.ctrlKey||e.metaKey;
 if(mod&&key==="z"){e.preventDefault();$(e.shiftKey?"redo":"undo").click();return;}
 if(mod&&key==="y"){e.preventDefault();$("redo").click();return;}
 if(!mod&&!e.altKey){
  const tools={b:"pencil",e:"eraser",g:"fill",i:"picker",l:"line",r:"rect",o:"ellipse"};
  if(tools[key]){e.preventDefault();setTool(tools[key]);}
  else if(key==="f"){e.preventDefault();$("fit-canvas").click();}
 }
});


/* Advanced Studio foundation: four-layer compositor and core local editing operations. */
const adv={layers:Array.from({length:4},(_,i)=>({name:"Layer "+(i+1),pixels:Array(width*height).fill(null),opacity:100,visible:true,locked:false,mask:null,blend:"normal",group:"Ungrouped"})),active:0,bucket:"contiguous",tol:0,symmetry:"none",selection:null,brushShape:"square",texture:"none",textureDensity:60,maskEdit:false,groups:{}};adv.layers[0].pixels=pixels.slice();
let layerWidth=width,layerHeight=height;
const renderBase=render,svgSourceBase=svgSource,rgb=c=>c?[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)):null,hexRGB=a=>"#"+a.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,"0")).join("");
function mix(a,b,t){if(!a)return b;if(!b)return a;return hexRGB(rgb(a).map((v,i)=>v*(1-t)+rgb(b)[i]*t));}
function dist(a,b){const x=rgb(a),y=rgb(b);return !x||!y?(a===b?0:999):Math.sqrt(x.reduce((n,v,i)=>n+(v-y[i])**2,0));}
function composite(){const out=Array(width*height).fill(null);for(const l of adv.layers){const g=adv.groups[l.group||"Ungrouped"]||{visible:true,opacity:100};if(l.visible&&g.visible!==false)for(let i=0;i<out.length;i++)if(l.pixels[i]&&(!l.mask||l.mask[i]))out[i]=window.NUStudioProTools.blendPixel(out[i],l.pixels[i],l.blend||"normal",l.opacity*(g.opacity==null?100:g.opacity)/100);}return out;}
render=function(){
 if(width!==layerWidth||height!==layerHeight){const oldW=layerWidth,oldH=layerHeight;adv.layers.forEach((l,i)=>{if(i===adv.active)return;const next=Array(width*height).fill(null);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const sx=Math.min(oldW-1,Math.floor((x+.5)*oldW/width)),sy=Math.min(oldH-1,Math.floor((y+.5)*oldH/height));next[y*width+x]=l.pixels[sy*oldW+sx]||null;}l.pixels=next;if(l.mask){const m=Array(width*height).fill(0);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const sx=Math.min(oldW-1,Math.floor((x+.5)*oldW/width)),sy=Math.min(oldH-1,Math.floor((y+.5)*oldH/height));m[y*width+x]=l.mask[sy*oldW+sx]?1:0;}l.mask=m;}});layerWidth=width;layerHeight=height;}
 adv.layers[adv.active].pixels=pixels.slice();const active=pixels;pixels=composite();renderBase();
 if(adv.selection){ctx.save();ctx.strokeStyle="#ffffff";ctx.lineWidth=Math.max(.12,Math.min(width,height)*.001);ctx.setLineDash([1,1]);ctx.beginPath();for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x;if(!adv.selection[i])continue;if(y===0||!adv.selection[i-width]){ctx.moveTo(x,y);ctx.lineTo(x+1,y);}if(y===height-1||!adv.selection[i+width]){ctx.moveTo(x,y+1);ctx.lineTo(x+1,y+1);}if(x===0||!adv.selection[i-1]){ctx.moveTo(x,y);ctx.lineTo(x,y+1);}if(x===width-1||!adv.selection[i+1]){ctx.moveTo(x+1,y);ctx.lineTo(x+1,y+1);}}ctx.stroke();ctx.restore();}
 pixels=active;
 if(Object.values(guideState).some(Boolean)||compassState?.active){
  let luminance=0,samples=0;const stride=Math.max(1,Math.floor(pixels.length/256));
  for(let i=0;i<pixels.length;i+=stride){const c=pixels[i];if(!c){luminance+=22;samples++;continue;}const r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16);luminance+=.2126*r+.7152*g+.0722*b;samples++;}
  const lightBackground=luminance/Math.max(1,samples)>145,haloColor=guideHighContrast?(lightBackground?"rgba(0,0,0,.98)":"rgba(255,255,255,.98)"):"rgba(0,0,0,.22)";
  const accents=lightBackground?{blue:"rgba(0,82,165,.98)",gold:"rgba(155,82,0,.98)",red:"rgba(165,24,42,.98)",green:"rgba(0,112,68,.98)",ruler:"rgba(92,62,0,.98)",compass:"rgba(165,72,0,.99)"}:{blue:"rgba(90,220,255,.99)",gold:"rgba(255,194,64,.99)",red:"rgba(255,112,132,.99)",green:"rgba(90,255,190,.99)",ruler:"rgba(255,236,165,.99)",compass:"rgba(255,224,112,.99)"};
  const screenScale=Math.max(.01,canvas.getBoundingClientRect().width/Math.max(1,width)),guideWidth=clamp(1.7/screenScale,.05,2.5);
  const strokeGuide=(path,accent,dash=[])=>{ctx.save();ctx.lineCap="round";ctx.lineJoin="round";ctx.setLineDash(dash.map(v=>v/screenScale));ctx.beginPath();path();ctx.strokeStyle=haloColor;ctx.lineWidth=guideHighContrast?guideWidth*2.7:guideWidth*1.15;ctx.stroke();ctx.beginPath();path();ctx.strokeStyle=accent;ctx.lineWidth=guideWidth;ctx.stroke();ctx.restore();};
  if(guideState.blueprint)strokeGuide(()=>ctx.rect(1,1,width-2,height-2),accents.blue,[2,2]);
  if(guideState.divisions)strokeGuide(()=>{for(let x=width/4;x<width;x+=width/4){ctx.moveTo(x,0);ctx.lineTo(x,height);}for(let y=height/4;y<height;y+=height/4){ctx.moveTo(0,y);ctx.lineTo(width,y);}},accents.gold,[1,2]);
  if(guideState.axes)strokeGuide(()=>{ctx.moveTo(0,height/2);ctx.lineTo(width,height/2);ctx.moveTo(width/2,0);ctx.lineTo(width/2,height);ctx.moveTo(0,0);ctx.lineTo(width,height);ctx.moveTo(width,0);ctx.lineTo(0,height);},accents.red);
  if(guideState.depth)strokeGuide(()=>{ctx.moveTo(0,height);ctx.lineTo(width,0);},accents.green);
  if(guideState.ruler){
   const step=Math.max(1,Math.floor(Math.max(width,height)/8));
   strokeGuide(()=>{for(let x=0;x<width;x+=step){ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,Math.min(2,height));}for(let y=0;y<height;y+=step){ctx.moveTo(0,y+.5);ctx.lineTo(Math.min(2,width),y+.5);}},accents.ruler);
   ctx.save();ctx.font=Math.max(.35,9/screenScale)+"px monospace";ctx.fillStyle=accents.ruler;ctx.shadowColor=haloColor;ctx.shadowBlur=guideHighContrast?2/screenScale:0;
   for(let x=0;x<width;x+=step)ctx.fillText(String(x),x+.5,Math.min(3,height-.2));
   for(let y=0;y<height;y+=step)ctx.fillText(String(y),Math.min(2,width-1),y+.5);
   ctx.restore();
  }
  if(compassState?.active){
   const cx=compassState.center.x+.5,cy=compassState.center.y+.5,ex=compassState.edge.x+.5,ey=compassState.edge.y+.5,dotRadius=Math.max(.3,2.6/screenScale);
   strokeGuide(()=>{ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);},accents.compass,[2,1]);
   ctx.save();ctx.beginPath();ctx.arc(cx,cy,dotRadius,0,Math.PI*2);ctx.fillStyle=haloColor;ctx.fill();ctx.beginPath();ctx.arc(cx,cy,dotRadius*.55,0,Math.PI*2);ctx.fillStyle=accents.compass;ctx.fill();ctx.restore();
  }
 }
};
svgSource=function(){const active=pixels;adv.layers[adv.active].pixels=active.slice();const visible=composite();try{pixels=visible;return svgSourceBase();}finally{pixels=active;}};
const snapshotBase=snapshot,restoreBase=restore;
snapshot=function(){adv.layers[adv.active].pixels=pixels.slice();return {...snapshotBase(),layers:adv.layers.map(l=>({...l,pixels:l.pixels.slice(),mask:l.mask?l.mask.slice():null})),active:adv.active,selection:adv.selection?adv.selection.slice():null,groups:JSON.parse(JSON.stringify(adv.groups))};};
restore=function(state){if(state.layers){adv.layers=state.layers.map(l=>({...l,pixels:l.pixels.slice(),mask:l.mask?l.mask.slice():null,blend:l.blend||"normal",group:l.group||"Ungrouped"}));adv.active=clamp(state.active||0,0,adv.layers.length-1);adv.selection=state.selection?Uint8Array.from(state.selection):null;adv.groups=state.groups?JSON.parse(JSON.stringify(state.groups)):{};layerWidth=state.width;layerHeight=state.height;state={...state,pixels:adv.layers[adv.active].pixels.slice()};}restoreBase(state);layerUI();};
function histAdv(){return snapshot();}
function layerUI(){
 const root=$("adv-layers");if(!root)return;root.innerHTML="";
 adv.layers.forEach((l,i)=>{const row=document.createElement("div");row.className="adv-layer";
 const pick=document.createElement("button");pick.type="button";pick.textContent=(i===adv.active?"● ":"")+"Layer "+(i+1);pick.setAttribute("aria-label","Select Layer "+(i+1));pick.title="Select Layer "+(i+1);pick.setAttribute("aria-pressed",String(i===adv.active));pick.onclick=()=>{adv.layers[adv.active].pixels=pixels.slice();adv.active=i;pixels=l.pixels.slice();$("pro-mask-edit").checked=false;adv.maskEdit=false;render();layerUI();};
 const visLabel=document.createElement("label");visLabel.className="layer-toggle";const vis=document.createElement("input");vis.type="checkbox";vis.checked=l.visible;vis.setAttribute("aria-label","Show "+l.name);vis.onchange=()=>{l.visible=vis.checked;render();};visLabel.append(vis,document.createTextNode(" Visible"));
 const lockLabel=document.createElement("label");lockLabel.className="layer-toggle";const lock=document.createElement("input");lock.type="checkbox";lock.checked=l.locked;lock.setAttribute("aria-label","Lock "+l.name);lock.onchange=()=>{l.locked=lock.checked;};lockLabel.append(lock,document.createTextNode(" Locked"));
 const opacity=document.createElement("label");opacity.className="layer-opacity";opacity.textContent="Opacity · "+l.opacity+"%";const range=document.createElement("input");range.type="range";range.min=0;range.max=100;range.value=l.opacity;range.setAttribute("aria-label",l.name+" opacity");range.oninput=()=>{l.opacity=+range.value;opacity.firstChild.textContent="Opacity · "+l.opacity+"%";render();};opacity.append(range);
 const blend=document.createElement("label");blend.className="layer-opacity";blend.textContent="Blend";const blendSelect=document.createElement("select");blendSelect.setAttribute("aria-label",l.name+" blend mode");for(const [v,n] of [["normal","Normal"],["multiply","Multiply"],["screen","Screen"],["add","Add"],["darken","Darken"],["lighten","Lighten"]]){const o=document.createElement("option");o.value=v;o.textContent=n;blendSelect.append(o);}blendSelect.value=l.blend||"normal";blendSelect.onchange=()=>{l.blend=blendSelect.value;render();};blend.append(blendSelect);
 const group=document.createElement("label");group.className="layer-opacity";group.textContent="Group";const groupSelect=document.createElement("select");groupSelect.setAttribute("aria-label",l.name+" group");for(const v of ["Ungrouped","Group A","Group B","UI","Background","Foreground"]){const o=document.createElement("option");o.value=v;o.textContent=v;groupSelect.append(o);}groupSelect.value=l.group||"Ungrouped";groupSelect.onchange=()=>{l.group=groupSelect.value;};group.append(groupSelect);
 const maskNote=document.createElement("span");maskNote.className="layer-toggle";maskNote.textContent=l.mask?"◩ Mask active":"No mask";row.append(pick,visLabel,lockLabel,opacity,blend,group,maskNote);root.append(row);});
}
function advPanel(){
 const existingColorField=$("custom-color").closest(".field"),existingPaletteField=$("palette").closest(".field"),existingExtract=$("extract-palette"),existingBrushField=$("brush-size").closest(".field");
 const st=document.createElement("style");
 st.textContent="#studio-dock{margin-top:12px;width:100%;min-width:0;max-width:100%;box-sizing:border-box;border:1px solid #65dcff55;border-radius:13px;background:#081522;overflow:hidden}#studio-dock .dock-head{display:flex;justify-content:space-between;gap:8px;padding:9px 12px;border-bottom:1px solid #ffffff18}#studio-dock .dock-head strong{font-size:12px;color:#ffc86b}#studio-tool-categories{display:flex;flex-wrap:wrap;gap:6px;padding:8px 9px 0}#studio-tool-categories [role=tab]{border:1px solid #65dcff55;background:#102a3b;color:#eaf6ff;border-radius:8px;padding:7px 10px;min-height:34px;font-size:11px}#studio-tool-categories [role=tab][aria-selected=true]{border-color:#ffc86b;background:#3a2a16;color:#ffe6a5}#studio-quick-tools{display:grid;grid-template-columns:repeat(auto-fit,minmax(74px,1fr));width:100%;min-width:0;max-width:100%;box-sizing:border-box;gap:6px;padding:9px;overflow-x:hidden;overflow-y:auto;max-height:180px;scrollbar-width:thin}#studio-quick-tools .tool{min-width:0;min-height:54px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:7px 5px;font-size:11px}#studio-quick-tools .tool .tool-icon{font-size:18px}#studio-quick-tools [hidden]{display:none!important}#studio-quick-tools .tool[aria-pressed=true]{border-color:#ffc86b;background:#3a2a16;color:#ffe6a5}#studio-brush{display:grid;gap:8px;padding:10px 12px;border-block:1px solid #ffffff18;background:#0b1b2a}#studio-brush .tool-context-head{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#ffc86b;font-size:12px}#studio-brush .tool-context-head span{color:#8fa8bb;font-size:10px;letter-spacing:.06em;text-transform:uppercase}#studio-brush .tool-context-hint{margin:0;color:#9bb1c3;font-size:11px;line-height:1.45}#studio-brush .dock-field{display:grid;gap:5px;min-width:0;margin:2px 0;color:#b8c9d6;font-size:11px}#studio-brush input,#studio-brush select{max-width:100%;min-width:0;background:#071018;color:#eaf6ff;border:1px solid #65dcff44;border-radius:7px;padding:7px}#studio-brush input[type=range]{width:100%;accent-color:#65dcff}#studio-brush button{border:1px solid #65dcff55;background:#102a3b;color:#eaf6ff;border-radius:8px;padding:9px;font-size:12px;min-height:38px}#studio-brush .adv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:2px 0}#studio-brush [data-context-owner][hidden]{display:none!important}#studio-brush label{font-size:11px;color:#b8c9d6}#studio-brush input{width:100%;accent-color:#65dcff}#studio-brush .dock-field{display:grid;gap:5px;flex:1 1 180px;min-width:130px;margin:9px 0;color:#b8c9d6;font-size:11px}#studio-brush .dock-note{font-size:10px;color:#9bb1c3;line-height:1.45}#studio-tabs{display:flex;gap:5px;padding:8px;overflow-x:auto;border-block:1px solid #ffffff18}#studio-tabs button{flex:1 0 auto;min-width:80px;border:1px solid #65dcff44;border-radius:8px;background:#102536;color:#d9eaf4;padding:9px 7px;font-size:11px}#studio-tabs button[aria-selected=true]{background:#23445a;border-color:#ffc86b;color:#fff0c8}#studio-tabpanels{padding:10px 12px}#studio-tabpanels [role=tabpanel][hidden]{display:none}#studio-tabpanels .adv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0}#studio-tabpanels button{border:1px solid #65dcff55;background:#102a3b;color:#eaf6ff;border-radius:8px;padding:9px;font-size:12px;min-height:38px}#studio-tabpanels input,#studio-tabpanels select{max-width:100%;min-width:0;background:#071018;color:#eaf6ff;border:1px solid #65dcff44;border-radius:7px;padding:7px}#studio-tabpanels input[type=range]{width:100%;accent-color:#65dcff}#studio-tabpanels .adv-layer{display:grid;grid-template-columns:minmax(90px,1fr) auto auto;gap:8px;align-items:center;margin:8px 0}#studio-tabpanels .adv-layer .layer-toggle{font-size:10px;color:#c8d7e2;white-space:nowrap}#studio-tabpanels .adv-layer .layer-opacity{grid-column:1/-1;display:grid;gap:4px;font-size:10px;color:#9bb1c3}#studio-tabpanels .adv-layer .layer-opacity input{width:100%}#studio-tabpanels .adv-layer .layer-opacity select{width:100%}#studio-tabpanels .dock-field{display:grid;gap:5px;margin:9px 0;color:#b8c9d6;font-size:11px}#studio-tabpanels .dock-note{font-size:11px;color:#9bb1c3;line-height:1.6}#studio-tabpanels .dock-palette{display:grid;grid-template-columns:140px 1fr;gap:12px}#studio-tabpanels #palette{grid-template-columns:repeat(auto-fill,minmax(28px,1fr))}#studio-tabpanels .swatch{height:30px}#studio-tabpanels .dock-actions{display:flex;gap:7px;flex-wrap:wrap}#studio-tabpanels .dock-actions button{flex:1 1 130px}@media(max-width:600px){#studio-tabpanels .dock-palette{grid-template-columns:1fr}#studio-quick-tools .tool{min-width:74px}}@media(max-width:600px){.shell{width:calc(100% - 12px);padding-top:8px}.layout{grid-template-columns:minmax(0,1fr);min-width:0}.layout>main{min-width:0}.stage{width:100%;height:68vh;min-height:320px;max-height:calc(100dvh - 220px);padding:6px;box-sizing:border-box}.workspace-wrap{width:100%;height:100%;min-width:0;overflow:hidden}.workspace-frame{width:100%;height:100%;min-width:0;max-width:100%;box-sizing:border-box;padding:6px;overflow:auto}#pixel-canvas{max-width:100%!important;max-height:100%!important;height:auto!important}}";
 document.head.append(st);
 const d=document.createElement("section");d.id="studio-dock";d.setAttribute("aria-label","Creative tools dock");
 d.innerHTML='<div class="dock-head"><strong>Tools</strong><span>Choose a category, then a tool</span></div><div id="studio-tool-categories" role="tablist" aria-label="Tool categories"><button type="button" role="tab" aria-controls="studio-quick-tools" aria-label="Draw tools" data-tool-category="draw" aria-selected="true" tabindex="0">✏️ Draw</button><button type="button" role="tab" aria-controls="studio-quick-tools" aria-label="Shape tools" data-tool-category="shapes" aria-selected="false" tabindex="-1">▭ Shapes</button><button type="button" role="tab" aria-controls="studio-quick-tools" aria-label="Selection tools" data-tool-category="selection" aria-selected="false" tabindex="-1">▣ Selection</button><button type="button" role="tab" aria-controls="studio-quick-tools" aria-label="Effects tools" data-tool-category="effects" aria-selected="false" tabindex="-1">◩ Effects</button><button type="button" role="tab" aria-controls="studio-quick-tools" aria-label="View tools" data-tool-category="view" aria-selected="false" tabindex="-1">🔍 View</button></div><nav id="studio-quick-tools" aria-label="Tools in selected category"></nav><div id="studio-brush"></div><div id="studio-tabs" role="tablist" aria-label="Advanced tool categories"><button type="button" role="tab" id="tab-palette" aria-controls="panel-palette" aria-selected="true" data-tab="palette">🎨 Color</button><button type="button" role="tab" id="tab-layers" aria-controls="panel-layers" aria-selected="false" data-tab="layers">🧱 Layers</button><button type="button" role="tab" id="tab-fill" aria-controls="panel-fill" aria-selected="false" data-tab="fill">🪣 Fill</button><button type="button" role="tab" id="tab-transform" aria-controls="panel-transform" aria-selected="false" data-tab="transform">↔ Transform</button><button type="button" role="tab" id="tab-adjust" aria-controls="panel-adjust" aria-selected="false" data-tab="adjust">☀ Adjust</button><button type="button" role="tab" id="tab-compose" aria-controls="panel-compose" aria-selected="false" data-tab="compose">🧩 Compose</button><button type="button" role="tab" id="tab-pro" aria-controls="panel-pro" aria-selected="false" data-tab="pro">✦ Advanced</button><button type="button" role="tab" id="tab-export" aria-controls="panel-export" aria-selected="false" data-tab="export">⇩ Export</button></div><div id="studio-tabpanels"><section id="panel-palette" role="tabpanel" aria-labelledby="tab-palette"><div class="dock-palette"><div><div id="dock-color-slot"></div><button id="adv-add">＋ Add color</button><button id="adv-replace">Replace selected</button></div><div><p class="dock-note">Choose a swatch, sample a pixel, or create a new color.</p><div id="dock-palette-slot"></div><button id="adv-extract">Extract active layer colors</button></div></div></section><section id="panel-layers" role="tabpanel" aria-labelledby="tab-layers" hidden><p class="dock-note">Select a layer. Eye = show/hide, lock = protect, slider = opacity.</p><div id="adv-layers"></div><button id="adv-clear" type="button">Clear active layer</button></section><section id="panel-fill" role="tabpanel" aria-labelledby="tab-fill" hidden><label class="dock-field">Fill area <select id="adv-bucket"><option value="contiguous">Connected area only</option><option value="similar">Connected similar colors</option><option value="global">Every exact match in layer</option></select></label><label class="dock-field">Color tolerance <input id="adv-tol" type="range" min="0" max="180" value="0"></label><p class="dock-note">Fill mode and tolerance appear in Tool options when Fill is selected.</p></section><section id="panel-transform" role="tabpanel" aria-labelledby="tab-transform" hidden><label class="dock-field">Paint symmetry <select id="adv-symmetry"><option value="none">Off</option><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option><option value="both">Horizontal + vertical</option></select></label><div class="adv-grid"><button data-x="h">↔ Mirror horizontal</button><button data-x="v">↕ Mirror vertical</button><button data-x="90">⤾ Rotate 90°</button><button data-x="180">↻ Rotate 180°</button><button data-x="neg">◐ Negative</button><button data-x="crop">▣ Crop</button></div><div class="adv-grid"><label class="dock-field">X <input id="crop-x" type="number" value="0" min="0"></label><label class="dock-field">Y <input id="crop-y" type="number" value="0" min="0"></label><label class="dock-field">Width <input id="crop-w" type="number" value="16" min="1"></label><label class="dock-field">Height <input id="crop-h" type="number" value="16" min="1"></label></div></section><section id="panel-adjust" role="tabpanel" aria-labelledby="tab-adjust" hidden><label class="dock-field">Brightness <input id="adj-b" type="range" min="-100" max="100" value="0"></label><label class="dock-field">Contrast <input id="adj-c" type="range" min="-100" max="100" value="0"></label><label class="dock-field">Saturation <input id="adj-s" type="range" min="-100" max="100" value="0"></label><label class="dock-field">Warm ↔ Cool <input id="adj-w" type="range" min="-100" max="100" value="0"></label><div class="dock-actions"><button id="adj-apply">Apply color settings</button><button id="adj-shine">✨ Shine</button><button id="adj-fade">Fade / soften</button><button id="adj-sharpen">Sharpen edges</button></div><p class="dock-note">RGB channel offsets</p><div class="adv-grid"><label class="dock-field">Red ± <input id="rgb-r" type="number" value="0"></label><label class="dock-field">Green ± <input id="rgb-g" type="number" value="0"></label><label class="dock-field">Blue ± <input id="rgb-b" type="number" value="0"></label><button id="rgb-apply">Apply RGB</button></div></section><section id="panel-compose" role="tabpanel" aria-labelledby="tab-compose" hidden><label class="dock-field">Add image over artwork <input id="adv-overlay" type="file" accept="image/*"></label><label class="dock-field">Key color <input id="adv-key" type="color" value="#00ff00"></label><label class="dock-field">Key tolerance <input id="adv-keytol" type="range" min="0" max="220" value="60"></label><button id="adv-chroma">Remove key color</button><div class="adv-grid"><label class="dock-field">Text <input id="adv-text" value="N.U" maxlength="32"></label><label class="dock-field">Text size <input id="adv-textsize" type="number" min="6" max="96" value="16"></label></div><button id="adv-textadd">Add text to active layer</button><label class="dock-field">Blend over painted pixels <input id="adv-alpha" type="range" min="10" max="100" value="100"></label><p class="dock-note">Text is rasterized at current pixel resolution.</p></section><section id="panel-pro" role="tabpanel" aria-labelledby="tab-pro" hidden><div class="dock-note">Layer-mask and group operations remain in Advanced. Options for the active drawing tool appear above.</div><div class="adv-grid"><button id="pro-select-all" type="button">Select all</button><button id="pro-deselect" type="button">Deselect</button><button id="pro-invert-selection" type="button">Invert selection</button><button id="pro-scale-selection" type="button">Scale selection</button></div><div class="adv-grid"><label class="dock-field">Horizontal scale × <input id="pro-scale-x" type="number" min="0.1" max="16" step="0.1" value="2"></label><label class="dock-field">Vertical scale × <input id="pro-scale-y" type="number" min="0.1" max="16" step="0.1" value="2"></label></div><div class="adv-grid"><label class="dock-field">Gradient end color <input id="pro-gradient-color" type="color" value="#65dcff"></label><label class="dock-field">Gradient type <select id="pro-gradient-mode"><option value="linear">Linear</option><option value="radial">Radial</option></select></label></div><div class="adv-grid"><label class="dock-field">Brush shape <select id="pro-brush-shape"><option value="square">Square</option><option value="circle">Round</option><option value="diamond">Diamond</option></select></label><label class="dock-field">Brush texture <select id="pro-texture"><option value="none">None</option><option value="dots">Dots</option><option value="diagonal">Diagonal</option><option value="grain">Grain</option></select></label></div><label class="dock-field">Texture density <input id="pro-texture-density" type="range" min="5" max="100" value="60"></label><label class="dock-field">Bezier curve tension <input id="pro-curve" type="range" min="-64" max="64" value="24"></label><div class="dock-note">Non-destructive layer mask</div><div class="adv-grid"><button id="pro-mask-add" type="button">Add mask</button><button id="pro-mask-invert" type="button">Invert mask</button><button id="pro-mask-apply" type="button">Apply mask</button><button id="pro-mask-remove" type="button">Remove mask</button></div><label class="dock-field"><input id="pro-mask-edit" type="checkbox"> Edit mask with brush (eraser hides)</label><div class="dock-note">Layer group management</div><div class="adv-grid"><label class="dock-field">Active group <select id="pro-group-target"><option>Ungrouped</option><option>Group A</option><option>Group B</option><option>UI</option><option>Background</option><option>Foreground</option></select></label><label class="dock-field">Group opacity <input id="pro-group-opacity" type="range" min="0" max="100" value="100"></label></div><div class="adv-grid"><button id="pro-group-toggle" type="button">Show / hide group</button><button id="pro-group-assign" type="button">Assign layer to group</button></div><p class="dock-note">To move content, create a selection with Select or Lasso, then choose Move. Selection scaling uses nearest-neighbor sampling.</p></section><section id="panel-export" role="tabpanel" aria-labelledby="tab-export" hidden><div class="dock-actions"><button id="adv-original">⇩ Original source</button><button id="adv-png">⇩ PNG image</button><button id="adv-svg">⇩ SVG artwork</button><button id="adv-ico">⇩ Windows ICO</button><button id="adv-svg-code">⇩ SVG machine code</button><button id="adv-ir">⇩ Graphic IR / machine data</button></div><div id="adv-export-downloads" class="dock-note" aria-live="polite" style="margin-top:12px"></div><p class="dock-note">Each export is generated independently. Graphic IR uses compact row-run encoding and does not require heavy analysis. For very large artwork, SVG may embed a raster image to preserve the artwork.</p></section></div>';
 const drawer=$("studio-tools-drawer");
 const legacyPanels=[...drawer.querySelectorAll(":scope > details.panel")];
 const toolsPanel=legacyPanels[0],vectorPanel=legacyPanels[1],exportPanel=legacyPanels[2];
 const propertiesPanel=document.createElement("details");
 propertiesPanel.id="studio-properties-panel";
 propertiesPanel.className="panel side";
 const propertiesSummary=document.createElement("summary");
 propertiesSummary.className="panel-summary";
 propertiesSummary.innerHTML="<strong>PROPERTIES / SETTINGS</strong><span>CANVAS · IMPORT · VECTOR</span>";
 propertiesPanel.append(propertiesSummary);
 const propertiesContent=document.createElement("div");
 propertiesContent.id="studio-properties-content";
 const canvasSettingsTitle=document.createElement("p");
 canvasSettingsTitle.className="dock-note";
 canvasSettingsTitle.textContent="CANVAS & IMPORT SETTINGS";
 propertiesContent.append(canvasSettingsTitle);
 [...toolsPanel.children].forEach(node=>{
  if(node.matches(".field,.row")&&node!==existingColorField&&node!==existingPaletteField&&node!==existingBrushField)propertiesContent.append(node);
 });
 const vectorSettingsTitle=document.createElement("p");
 vectorSettingsTitle.className="dock-note";
 vectorSettingsTitle.textContent="VECTOR ENGINE SETTINGS";
 propertiesContent.append(vectorSettingsTitle);
 [...vectorPanel.children].forEach(node=>{if(node.tagName!=="SUMMARY")propertiesContent.append(node);});
 propertiesPanel.append(propertiesContent);
 vectorPanel.remove();
 drawer.insertBefore(propertiesPanel,exportPanel);
 drawer.prepend(d);
 const quick=$("studio-quick-tools"),names={pencil:{icon:"✏️",label:"Pencil",shortcut:"B",category:"draw"},eraser:{icon:"🧽",label:"Eraser",shortcut:"E",category:"draw"},fill:{icon:"🪣",label:"Fill",shortcut:"G",category:"draw"},picker:{icon:"🎯",label:"Eyedropper",shortcut:"I",category:"draw"},line:{icon:"／",label:"Line",shortcut:"L",category:"shapes"},rect:{icon:"▭",label:"Rectangle",shortcut:"R",category:"shapes"},ellipse:{icon:"◯",label:"Ellipse",shortcut:"O",category:"shapes"},"rect-fill":{icon:"▰",label:"Filled rectangle",category:"shapes"},"ellipse-fill":{icon:"●",label:"Filled ellipse",category:"shapes"},"select-rect":{icon:"▣",label:"Rectangular selection",category:"selection"},"select-lasso":{icon:"〰",label:"Lasso selection",category:"selection"},"move-selection":{icon:"✥",label:"Move selection",category:"selection"},gradient:{icon:"◩",label:"Gradient",category:"effects"},texture:{icon:"▦",label:"Texture brush",category:"effects"},bezier:{icon:"⌁",label:"Bezier curve",category:"shapes"},"fading-brush":{icon:"🌫️",label:"Fading brush",category:"effects"},"color-mix-brush":{icon:"🖌️",label:"Color-mixing brush",category:"effects"},compass:{icon:"🧭",label:"Compass",category:"shapes"},magnifier:{icon:"🔍",label:"Magnifier",category:"view"}};
 document.querySelectorAll("[data-tool]").forEach(b=>{const n=names[b.dataset.tool];if(!n)return;b.dataset.category=n.category;b.innerHTML='<span class="tool-icon" aria-hidden="true">'+n.icon+'</span><span>'+n.label+'</span>';b.title=n.shortcut?n.label+' ('+n.shortcut+')':n.label;b.setAttribute("aria-label",n.label+(n.shortcut?", "+n.shortcut+" shortcut":""));quick.append(b);});
 const categoryButtons=[...document.querySelectorAll("#studio-tool-categories [data-tool-category]")];
 toolCategoryRefresh=(next)=>{if(next)activeToolCategory=next;categoryButtons.forEach(b=>{const on=b.dataset.toolCategory===activeToolCategory;b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;});quick.querySelectorAll("[data-tool]").forEach(b=>{b.hidden=b.dataset.category!==activeToolCategory;});};
 categoryButtons.forEach((b,i)=>{b.addEventListener("click",()=>toolCategoryRefresh(b.dataset.toolCategory));b.addEventListener("keydown",e=>{if(e.key!=="ArrowRight"&&e.key!=="ArrowLeft")return;e.preventDefault();const nextIndex=(i+(e.key==="ArrowRight"?1:categoryButtons.length-1))%categoryButtons.length,next=categoryButtons[nextIndex];toolCategoryRefresh(next.dataset.toolCategory);next.focus();});});
 toolCategoryRefresh();
 const contextPanel=$("studio-brush");contextPanel.setAttribute("role","region");contextPanel.setAttribute("aria-label","Active tool options");
 const contextHead=document.createElement("div");contextHead.className="tool-context-head";const contextTitle=document.createElement("strong");contextTitle.id="studio-context-title";const contextTag=document.createElement("span");contextTag.textContent="Tool options";contextHead.append(contextTitle,contextTag);
 const contextHint=document.createElement("p");contextHint.id="studio-context-hint";contextHint.className="tool-context-hint";contextHint.setAttribute("aria-live","polite");contextPanel.append(contextHead,contextHint);
 existingBrushField.dataset.contextOwner="paint";contextPanel.append(existingBrushField);
 const moveContextField=(id,owner)=>{const control=$(id);if(!control)return null;const field=control.closest(".dock-field")||control.closest("label")||control;field.dataset.contextOwner=owner;contextPanel.append(field);return field;};
 moveContextField("adv-symmetry","paint");moveContextField("pro-brush-shape","paint");moveContextField("pro-mask-edit","paint");
 moveContextField("pro-texture","texture");moveContextField("pro-texture-density","texture");moveContextField("pro-curve","bezier");
 moveContextField("adv-bucket","fill");moveContextField("adv-tol","fill");
 moveContextField("pro-gradient-color","gradient");moveContextField("pro-gradient-mode","gradient");
 const selectionActions=$("pro-select-all").parentElement;selectionActions.dataset.contextOwner="selection";contextPanel.append(selectionActions);
 const selectionScale=$("pro-scale-x").closest(".adv-grid");selectionScale.dataset.contextOwner="selection";contextPanel.append(selectionScale);
 document.querySelectorAll("#studio-tabpanels .adv-grid").forEach(group=>{if(!group.children.length)group.remove();});
 const contextLabels={pencil:"Pencil",eraser:"Eraser",fill:"Fill",picker:"Eyedropper",line:"Line",rect:"Rectangle",ellipse:"Ellipse","rect-fill":"Filled rectangle","ellipse-fill":"Filled ellipse","select-rect":"Rectangular selection","select-lasso":"Lasso selection","move-selection":"Move selection",gradient:"Gradient",texture:"Texture brush",bezier:"Bezier curve",compass:"Compass","fading-brush":"Fading brush","color-mix-brush":"Color-mixing brush",magnifier:"Magnifier"};
 const contextHints={pencil:"Draw with the selected color on the active layer.",eraser:"Erase pixels on the active layer.",fill:"Choose a fill mode and tolerance, then select a canvas area.",picker:"Sample a color from the canvas.",line:"Draw a straight line with the current brush settings.",rect:"Draw a rectangle with the current brush settings.",ellipse:"Draw an ellipse with the current brush settings.","rect-fill":"Draw a filled rectangle.","ellipse-fill":"Draw a filled ellipse.","select-rect":"Create a rectangular selection, then refine or scale it.","select-lasso":"Draw a freehand selection, then refine or scale it.","move-selection":"Move or scale the active selection.",gradient:"Choose a gradient mode and end color before drawing.",texture:"Choose a brush shape and texture density for textured strokes.","fading-brush":"Adjust how quickly pigment fades along a stroke.","color-mix-brush":"Adjust how strongly existing canvas colors blend.","bezier":"Adjust the curve tension before placing control points.",compass:"Choose a center point, drag to set the radius, then release to commit the circle.",magnifier:"Move over the canvas to inspect pixels in a live, view-only loupe."};
 const contextOwners={pencil:["paint"],eraser:["paint"],line:["paint"],rect:["paint"],ellipse:["paint"],"rect-fill":["paint"],"ellipse-fill":["paint"],"fading-brush":["paint","fading"],"color-mix-brush":["paint","mix"],texture:["paint","texture"],fill:["fill"],gradient:["gradient"],"select-rect":["selection"],"select-lasso":["selection"],"move-selection":["selection"],bezier:["bezier"],magnifier:["magnifier"]};
 toolContextRefresh=()=>{const owners=contextOwners[tool]||[];contextTitle.textContent=contextLabels[tool]||"Tool options";contextHint.textContent=contextHints[tool]||"No additional settings for this tool.";contextPanel.dataset.activeTool=tool;contextPanel.querySelectorAll("[data-context-owner]").forEach(node=>{node.hidden=!owners.includes(node.dataset.contextOwner);});};
 const magnifierField=document.createElement("div");magnifierField.className="dock-field";magnifierField.dataset.contextOwner="magnifier";
 const magnifierStrengthLabel=document.createElement("label");magnifierStrengthLabel.htmlFor="magnifier-strength";magnifierStrengthLabel.textContent="Magnification";
 const magnifierStrength=document.createElement("select");magnifierStrength.id="magnifier-strength";magnifierStrength.setAttribute("aria-label","Magnifier strength");
 for(const factor of [2,3,4,6,8]){const option=document.createElement("option");option.value=String(factor);option.textContent=factor+"×";magnifierStrength.append(option);}
 magnifierStrength.value=String(magnifierFactor);magnifierStrength.addEventListener("change",()=>{magnifierFactor=Number(magnifierStrength.value)||4;if(lastMagnifierPoint)updateMagnifier(lastMagnifierPoint);});
 const magnifierSizeLabel=document.createElement("label");magnifierSizeLabel.htmlFor="magnifier-size";magnifierSizeLabel.textContent="Lens size";
 const magnifierSizeControl=document.createElement("input");magnifierSizeControl.type="range";magnifierSizeControl.id="magnifier-size";magnifierSizeControl.min="120";magnifierSizeControl.max="220";magnifierSizeControl.step="10";magnifierSizeControl.value=String(magnifierSize);magnifierSizeControl.setAttribute("aria-label","Magnifier lens size");
 magnifierSizeControl.addEventListener("input",()=>{magnifierSize=Number(magnifierSizeControl.value)||160;const lens=$("studio-magnifier");lens.style.width=magnifierSize+"px";lens.style.height=magnifierSize+"px";if(lastMagnifierPoint)updateMagnifier(lastMagnifierPoint);});
 magnifierField.append(magnifierStrengthLabel,magnifierStrength,magnifierSizeLabel,magnifierSizeControl);contextPanel.append(magnifierField);
 toolContextRefresh();
 const fadeField=document.createElement("label");fadeField.className="dock-field";fadeField.dataset.contextOwner="fading";fadeField.textContent="Fading brush intensity";const fadeRange=document.createElement("input");fadeRange.type="range";fadeRange.min="1";fadeRange.max="100";fadeRange.value=String(fadeIntensity);fadeRange.setAttribute("aria-label","Fading brush intensity");fadeRange.oninput=()=>{fadeIntensity=+fadeRange.value;};fadeField.append(fadeRange);$("studio-brush").append(fadeField);
 const fadeButton=document.createElement("button");fadeButton.type="button";fadeButton.className="tool";fadeButton.dataset.tool="fading-brush";fadeButton.dataset.category="effects";fadeButton.setAttribute("aria-pressed","false");fadeButton.innerHTML='<span class="tool-icon" aria-hidden="true">🌫️</span><span>Fading brush</span>';fadeButton.title="Fading brush";fadeButton.setAttribute("aria-label","Fading brush");fadeButton.addEventListener("click",()=>setTool("fading-brush"));quick.append(fadeButton);
 const mixField=document.createElement("label");mixField.className="dock-field";mixField.dataset.contextOwner="mix";mixField.textContent="Color mixing strength";const mixRange=document.createElement("input");mixRange.type="range";mixRange.min="1";mixRange.max="100";mixRange.step="1";mixRange.value=String(mixBrushStrength);mixRange.id="mix-brush-strength";mixRange.setAttribute("aria-label","Color mixing strength");mixRange.oninput=()=>{mixBrushStrength=+mixRange.value;};mixField.append(mixRange);const mixHint=document.createElement("small");mixHint.className="dock-note";mixHint.textContent="Samples existing canvas pigment and blends nearby colors along the stroke. Transparent areas are not painted.";mixField.append(mixHint);$("studio-brush").append(mixField);
 const mixButton=document.createElement("button");mixButton.type="button";mixButton.className="tool";mixButton.dataset.tool="color-mix-brush";mixButton.dataset.category="effects";mixButton.setAttribute("aria-pressed","false");mixButton.innerHTML="<span class=\"tool-icon\" aria-hidden=\"true\">🖌️</span><span>Color-mixing brush</span>";mixButton.title="Color-mixing brush";mixButton.setAttribute("aria-label","Color-mixing brush");mixButton.addEventListener("click",()=>setTool("color-mix-brush"));quick.append(mixButton);toolCategoryRefresh();toolContextRefresh();
 $("dock-color-slot").append(existingColorField);
 $("dock-palette-slot").append(existingPaletteField);
 $("panel-palette").querySelector(".dock-palette>div:last-child").append(existingExtract);
 const legacy=document.querySelector("aside details.panel");if(legacy)legacy.open=false;document.querySelectorAll("aside details.panel").forEach(x=>x.open=false);
 function selectTab(key){document.querySelectorAll("#studio-tabs [role=tab]").forEach(b=>{const on=b.dataset.tab===key;b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;});document.querySelectorAll("#studio-tabpanels [role=tabpanel]").forEach(p=>p.hidden=p.id!=="panel-"+key);}
 const tabs=[...document.querySelectorAll("#studio-tabs [role=tab]")];tabs.forEach((b,i)=>{b.tabIndex=i===0?0:-1;b.onclick=()=>selectTab(b.dataset.tab);b.onkeydown=e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();const n=(i+(e.key==="ArrowRight"?1:tabs.length-1))%tabs.length;tabs[n].focus();selectTab(tabs[n].dataset.tab);}};});
 $("adv-extract").onclick=()=>{const m=new Map();pixels.filter(Boolean).forEach(c=>m.set(c,(m.get(c)||0)+1));palette=[...m].sort((a,b)=>b[1]-a[1]).slice(0,32).map(x=>x[0]);renderPalette();announce("Extracted colors from active layer.");};
 $("adv-add").onclick=()=>{const c=$("custom-color").value.toLowerCase();if(!palette.includes(c))palette.push(c);color=c;renderPalette();announce("Color added to palette.");};
 $("adv-replace").onclick=()=>{const old=color,n=$("custom-color").value.toLowerCase();if(old===n)return;const before=histAdv();pixels=pixels.map((c,i)=>c===old&&(!adv.selection||adv.selection[i])?n:c);adv.layers[adv.active].pixels=pixels.slice();palette=palette.map(c=>c===old?n:c);color=n;commitHistory(before);renderPalette();render();announce("Color replaced on active layer.");};
 $("adv-bucket").onchange=e=>adv.bucket=e.target.value;$("adv-tol").oninput=e=>adv.tol=+e.target.value;$("adv-symmetry").onchange=e=>adv.symmetry=e.target.value;
 $("adv-clear").onclick=()=>{if(adv.layers[adv.active].locked)return announce("Layer locked");const before=histAdv();pixels=pixels.map((c,i)=>!adv.selection||adv.selection[i]?null:c);adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();};
 document.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>transformAdv(b.dataset.x));
 $("adj-apply").onclick=()=>mapAdv(c=>{const avg=c.reduce((a,b)=>a+b,0)/3,br=+$("adj-b").value*1.8,co=1+(+$("adj-c").value)/100,sa=1+(+$("adj-s").value)/100,w=+$("adj-w").value*.7;return c.map((v,i)=>avg+((v-128)*co+128+br-avg)*sa+(i===0?w:i===2?-w:0));});
 $("rgb-apply").onclick=()=>mapAdv(c=>c.map((v,i)=>v+[+$("rgb-r").value,+$("rgb-g").value,+$("rgb-b").value][i]));
 $("adj-shine").onclick=()=>mapAdv(c=>c.map(v=>v+28));$("adj-fade").onclick=()=>mapAdv(c=>c.map(v=>v*.8+128*.2));$("adj-sharpen").onclick=sharpenAdv;
 $("adv-overlay").onchange=overlayAdv;$("adv-chroma").onclick=chromaAdv;$("adv-textadd").onclick=textAdv;
 $("adv-original").onclick=()=>{if(!originalImportFile)return announce("No original imported file.");download(new Blob([originalImportFile],{type:originalImportFile.type}),"original-"+originalImportFile.name);};
 $("adv-svg").onclick=()=>{try{const r=svgSource(),name=filename("edited.svg");download(new Blob([r.source],{type:"image/svg+xml;charset=utf-8"}),name);announce("SVG ready · "+(r.fallback?"embedded-image fallback":"editable vector")+" · The download link is available on the page.");}catch(e){announce("SVG export failed: "+e.message);}};
 $("adv-ico").onclick=()=>{try{if(!window.NUIcoExport)throw new Error("ICO export engine did not load.");adv.layers[adv.active].pixels=pixels.slice();const visible=composite();const bytes=window.NUIcoExport.buildIco(visible,width,height);const name=filename("ico");download(new Blob([bytes],{type:"image/x-icon"}),name);announce("Windows ICO ready · multi-size · transparency preserved.");}catch(e){announce("ICO export failed: "+e.message);}};
 $("export-ico").onclick=()=>$("adv-ico").click();
 $("adv-png").onclick=()=>$("export-png").click();
 $("adv-ir").onclick=()=>$("export-ir").click();
 $("adv-svg-code").onclick=()=>{try{const r=svgSource(),name=filename("svg-source.txt");download(new Blob([r.source],{type:"text/plain;charset=utf-8"}),name);announce("SVG source code is ready to download.");}catch(e){announce("SVG code export failed: "+e.message);}};
 layerUI();
}
function mapAdv(fn){if(adv.layers[adv.active].locked)return announce("Layer locked");const before=histAdv();pixels=pixels.map((c,i)=>c&&(!adv.selection||adv.selection[i])?hexRGB(fn(rgb(c))):c);adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();}
function sharpenAdv(){if(adv.layers[adv.active].locked)return announce("Layer locked");const before=histAdv(),src=pixels.slice(),out=src.slice();for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){const i=y*width+x;if(!src[i]||(adv.selection&&!adv.selection[i]))continue;const center=rgb(src[i]),neighbors=[src[i-1],src[i+1],src[i-width],src[i+width]].map(rgb);out[i]=hexRGB(center.map((v,z)=>5*v-neighbors.reduce((n,q)=>n+(q?q[z]:0),0)));}pixels=out;adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();announce("Sharpen filter applied.");}
function transformAdv(k){
 if(adv.layers[adv.active].locked)return announce("Layer locked");
 const before=histAdv(),oldW=width,oldH=height;
 if(k==="neg"){
  pixels=pixels.map(c=>c?hexRGB(rgb(c).map(v=>255-v)):null);
  adv.layers[adv.active].pixels=pixels.slice();
 }else{
  let nw=oldW,nh=oldH,cropX=0,cropY=0;
  if(k==="90"){nw=oldH;nh=oldW;}
  if(k==="crop"){cropX=clamp(+$("crop-x").value,0,oldW-1);cropY=clamp(+$("crop-y").value,0,oldH-1);nw=clamp(+$("crop-w").value,1,oldW-cropX);nh=clamp(+$("crop-h").value,1,oldH-cropY);}
  const remap=src=>{const out=Array(nw*nh).fill(null);for(let y=0;y<nh;y++)for(let x=0;x<nw;x++){let sx=x,sy=y;if(k==="h")sx=oldW-1-x;if(k==="v")sy=oldH-1-y;if(k==="180"){sx=oldW-1-x;sy=oldH-1-y;}if(k==="90"){sx=y;sy=oldH-1-x;}if(k==="crop"){sx+=cropX;sy+=cropY;}out[y*nw+x]=src[sy*oldW+sx]||null;}return out;};
  adv.layers.forEach(l=>{l.pixels=remap(l.pixels);if(l.mask)l.mask=remap(l.mask.map(v=>v?"#ffffff":null)).map(Boolean);});adv.selection=null;
  width=nw;height=nh;layerWidth=nw;layerHeight=nh;pixels=adv.layers[adv.active].pixels.slice();
  $("image-width").value=width;$("image-height").value=height;
 }
 commitHistory(before);updateCanvasDisplay();render();announce("Transform applied to "+(k==="neg"?"active layer":"all layers")+".");
}
async function overlayAdv(e){const f=e.target.files&&e.target.files[0];if(!f)return;let b;try{b=await decodeImage(f);if(adv.layers[adv.active].locked)throw Error("Layer locked");const before=histAdv(),c=document.createElement("canvas");c.width=width;c.height=height;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(b,0,0,width,height);const d=x.getImageData(0,0,width,height).data;for(let i=0;i<pixels.length;i++)if(d[i*4+3]>20&&(!adv.selection||adv.selection[i]))pixels[i]=hex(d[i*4],d[i*4+1],d[i*4+2]);adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();}catch(err){announce(err.message);}finally{if(b&&b.close)b.close();e.target.value="";}}
function chromaAdv(){if(adv.layers[adv.active].locked)return announce("Layer locked");const before=histAdv(),key=$("adv-key").value,t=+$("adv-keytol").value;pixels=pixels.map((c,i)=>(!adv.selection||adv.selection[i])&&dist(c,key)<=t?null:c);adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();}
function textAdv(){if(adv.layers[adv.active].locked)return announce("Layer locked");const before=histAdv(),c=document.createElement("canvas");c.width=width;c.height=height;const x=c.getContext("2d");x.fillStyle=color;x.font="bold "+clamp(+$("adv-textsize").value,6,96)+"px monospace";x.textBaseline="top";x.fillText($("adv-text").value,0,0,width);const d=x.getImageData(0,0,width,height).data;for(let i=0;i<pixels.length;i++)if(d[i*4+3]>128&&(!adv.selection||adv.selection[i]))pixels[i]=color;adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();}
const paintAdv=paintBrush;paintBrush=function(x,y,v){
 if(adv.layers[adv.active].locked)return;
 if(tool==="color-mix-brush"){const result=window.NUStudioProTools.smudgeBrush(pixels,width,height,x,y,brushSize,mixBrushStrength,adv.selection,mixBrushState,adv.brushShape);mixBrushState=result.state;pixels=result.pixels;adv.layers[adv.active].pixels=pixels;return;}
 const alpha=+$("adv-alpha")?.value||100,points=[[x,y]];
 if(adv.symmetry==="horizontal"||adv.symmetry==="both")points.push([width-1-x,y]);if(adv.symmetry==="vertical"||adv.symmetry==="both")points.push([x,height-1-y]);if(adv.symmetry==="both")points.push([width-1-x,height-1-y]);
 const seen=new Set(),texture=adv.texture==="none"&&tool==="texture"?"grain":adv.texture;
 for(const [px,py] of points)for(const [cx,cy] of window.NUStudioProTools.brushCells(px,py,brushSize,adv.brushShape,texture,adv.textureDensity)){
  if(cx<0||cy<0||cx>=width||cy>=height)continue;const key=cy*width+cx;if(seen.has(key))continue;seen.add(key);if(adv.selection&&!adv.selection[key])continue;
  if(adv.maskEdit){const l=adv.layers[adv.active];if(!l.mask)l.mask=new Uint8Array(width*height).fill(1);l.mask[key]=v?1:0;continue;}
  let value=v;if(tool==="fading-brush"&&v)value=window.NUStudioProTools.fadePixel(pixels[key],v,fadeIntensity);if(v&&alpha<100)value=mix(pixels[key],value,alpha/100);paintAdv(cx,cy,value);
 }
};
const floodAdv=flood;flood=function(x,y,next){
 const layer=adv.layers[adv.active];
 if(layer.locked){announce("Layer is locked. Unlock it to use Fill.");return 0;}
 if(adv.maskEdit){announce("Turn off mask editing before using Fill.");return 0;}
 const result=window.NUStudioProTools.bucketFill(pixels,width,height,x,y,next,adv.bucket,adv.tol,adv.selection,layer.mask);
 if(result.changed===0){
  const messages={"same-color":"This area already uses the selected color.","outside-selection":"The Fill point is outside the active selection.","outside-mask":"The Fill point is hidden by the active layer mask.","no-match":"No matching pixels were found to fill."};
  announce(messages[result.reason]||"Nothing changed. Check the active layer and selection.");
  return 0;
 }
 pixels=result.pixels;
 layer.pixels=pixels.slice();
 announce("Filled "+result.changed.toLocaleString()+" pixels on "+layer.name+".");
 return result.changed;
};

const resizeArtworkBase=resizeArtwork;
resizeArtwork=function(nextW,nextH,method="nearest"){
 nextW=clamp(Math.round(nextW),1,2048);nextH=clamp(Math.round(nextH),1,2048);
 if(nextW*nextH>cellLimit()){announce("This device profile allows up to "+cellLimit().toLocaleString()+" editable pixels.");return false;}
 const before=snapshot(),oldW=width,oldH=height;
 adv.layers.forEach(l=>{const src=l.pixels,next=Array(nextW*nextH).fill(null),maskNext=l.mask?Array(nextW*nextH).fill(0):null;for(let y=0;y<nextH;y++)for(let x=0;x<nextW;x++){const sx=Math.min(oldW-1,Math.floor((x+.5)*oldW/nextW)),sy=Math.min(oldH-1,Math.floor((y+.5)*oldH/nextH));next[y*nextW+x]=src[sy*oldW+sx]||null;if(maskNext)maskNext[y*nextW+x]=l.mask[sy*oldW+sx]?1:0;}l.pixels=next;if(maskNext)l.mask=maskNext;});if(adv.selection){const oldSelection=adv.selection,nextSelection=new Uint8Array(nextW*nextH);for(let y=0;y<nextH;y++)for(let x=0;x<nextW;x++){const sx=Math.min(oldW-1,Math.floor((x+.5)*oldW/nextW)),sy=Math.min(oldH-1,Math.floor((y+.5)*oldH/nextH));nextSelection[y*nextW+x]=oldSelection[sy*oldW+sx];}adv.selection=nextSelection;}
 width=nextW;height=nextH;layerWidth=width;layerHeight=height;pixels=adv.layers[adv.active].pixels.slice();commitHistory(before);
 $("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();render();announce("All layers resized to "+width+" × "+height+" px using nearest-neighbor sampling.");return true;
};
const resetGridBase=resetGrid;
resetGrid=function(next){width=next;height=next;layerWidth=width;layerHeight=height;adv.layers.forEach(l=>{l.pixels=Array(width*height).fill(null);l.mask=null;});adv.selection=null;adv.maskEdit=false;$("pro-mask-edit").checked=false;adv.active=0;pixels=adv.layers[0].pixels.slice();undoStack=[];redoStack=[];imageImported=false;historyButtons();$("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();render();announce("New "+width+" × "+height+" transparent canvas.");};


advPanel();render();layerUI();
const proTools=window.NUStudioProTools;if(!proTools)throw new Error("N.U professional 2D tools failed to load.");
function allSelection(){return new Uint8Array(width*height).fill(1);}
function updateProSelection(mask){adv.selection=mask;render();announce(mask&&mask.some(Boolean)?"Selection updated.":"Selection cleared.");}
function applyFreeLayerRotation(angle){
 if(!Number.isFinite(angle)||Math.abs(angle)>360)return announce("Rotation angle must be between -360° and 360°.");
 const layer=adv.layers[adv.active];if(layer.locked)return announce("Layer locked.");
 const before=histAdv(),result=proTools.rotatePixels(layer.pixels,width,height,angle,adv.selection||null);
 layer.pixels=result.pixels;pixels=layer.pixels.slice();adv.selection=result.selection;commitHistory(before);render();announce("Active layer rotated "+angle+"° with nearest-neighbour sampling.");
}
function installStudio2DControls(){
 const panel=$("panel-transform");if(!panel)return;
 const rotation=document.createElement("div");rotation.className="dock-field";rotation.innerHTML='<strong>Free layer rotation</strong><label>Angle <input id="pro-free-rotation" type="range" min="-180" max="180" value="0"></label><output id="pro-free-rotation-value">0°</output><button id="pro-rotate-layer" type="button">Rotate active layer</button>';panel.append(rotation);
 $("pro-free-rotation").oninput=e=>$("pro-free-rotation-value").textContent=e.target.value+"°";
 $("pro-rotate-layer").onclick=()=>applyFreeLayerRotation(+$("pro-free-rotation").value);
 const guides=document.createElement("section");guides.className="adaptive-control";guides.style.marginTop="12px";guides.innerHTML='<strong>VIEW GUIDES</strong><div class="adv-grid"><label><input type="checkbox" data-guide="blueprint"> Blueprint</label><label><input type="checkbox" data-guide="ruler"> Ruler</label><label><input type="checkbox" data-guide="divisions"> Divisions</label><label><input type="checkbox" data-guide="axes"> Angular axes</label><label><input type="checkbox" data-guide="depth"> Depth axis</label><label><input type="checkbox" data-guide-contrast checked> High contrast</label></div><button id="view-rotate-reset" type="button">Reset viewport rotation</button>';
 document.querySelector(".view-tools")?.append(guides);
 guides.querySelectorAll("[data-guide]").forEach(input=>input.addEventListener("change",e=>{guideState[e.target.dataset.guide]=e.target.checked;render();}));guides.querySelector("[data-guide-contrast]")?.addEventListener("change",e=>{guideHighContrast=e.target.checked;render();});
 $("view-rotate-reset")?.addEventListener("click",()=>{viewRotation=0;canvas.style.transform="";announce("Viewport rotation reset; artwork unchanged.");});
}
installStudio2DControls();
const viewportPointers=new Map();let viewportGesture=null;
function pointerAngle(a,b){return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;}
function updateViewportRotation(){canvas.style.transform="rotate("+viewRotation+"deg)";canvas.style.transformOrigin="50% 50%";}
const stageSurface=document.querySelector(".stage");
if(stageSurface){
 stageSurface.addEventListener("pointerdown",e=>{
  if(e.pointerType!=="touch")return;
  viewportPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(viewportPointers.size===2){
   e.preventDefault();e.stopImmediatePropagation();if(drawing)cancelStroke();if(proGesture){restore(proGesture.before);proGesture=null;}
   const pts=[...viewportPointers.values()];viewportGesture={angle:pointerAngle(pts[0],pts[1]),base:viewRotation};
  }
 },true);
 stageSurface.addEventListener("pointermove",e=>{
  if(!viewportPointers.has(e.pointerId))return;
  viewportPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(viewportGesture&&viewportPointers.size>=2){
   e.preventDefault();e.stopImmediatePropagation();const pts=[...viewportPointers.values()],rawDelta=pointerAngle(pts[0],pts[1])-viewportGesture.angle,delta=((rawDelta+540)%360)-180;
   viewRotation=((viewportGesture.base+delta+540)%360)-180;updateViewportRotation();
  }
 },true);
 const finishViewportPointer=e=>{if(viewportGesture){e.preventDefault();e.stopImmediatePropagation();}viewportPointers.delete(e.pointerId);if(viewportPointers.size<2)viewportGesture=null;};
 stageSurface.addEventListener("pointerup",finishViewportPointer,true);
 stageSurface.addEventListener("pointercancel",finishViewportPointer,true);
}

let proGesture=null;
function proPointerStart(e){if(!["select-rect","select-lasso","move-selection","gradient","bezier"].includes(tool))return;e.preventDefault();e.stopImmediatePropagation();if(canvas.setPointerCapture)canvas.setPointerCapture(e.pointerId);const p=coords(e),before=snapshot();
 if(tool==="select-rect"||tool==="select-lasso")proGesture={kind:tool,before,start:p,points:[p]};
 else if(tool==="move-selection"){if(!adv.selection)adv.selection=allSelection();proGesture={kind:"move",before,start:p,basePixels:pixels.slice(),baseSelection:adv.selection.slice(),lastX:0,lastY:0};}
 else proGesture={kind:tool,before,start:p,basePixels:pixels.slice(),end:p};}
function proPointerMove(e){if(!proGesture)return;e.preventDefault();e.stopImmediatePropagation();const p=coords(e),g=proGesture;
 if(g.kind==="select-rect"){adv.selection=proTools.rectSelection(width,height,g.start.x,g.start.y,p.x,p.y);render();}
 else if(g.kind==="select-lasso"){g.points.push(p);adv.selection=proTools.lassoSelection(width,height,g.points);render();}
 else if(g.kind==="move"){const dx=p.x-g.start.x,dy=p.y-g.start.y,m=proTools.moveSelection(g.basePixels,width,height,g.baseSelection,dx,dy);pixels=m.pixels;adv.selection=m.selection;adv.layers[adv.active].pixels=pixels.slice();g.lastX=Math.round(dx);g.lastY=Math.round(dy);render();}
 else if(g.kind==="gradient"){pixels=proTools.gradient(g.basePixels,width,height,g.start,p,$("custom-color").value,$("pro-gradient-color").value,$("pro-gradient-mode").value,adv.selection);adv.layers[adv.active].pixels=pixels.slice();render();}
 else if(g.kind==="bezier"){const bend=(+$("pro-curve").value)*Math.min(width,height)/64;pixels=proTools.bezier(g.basePixels,width,height,g.start,p,bend,color,brushSize);adv.layers[adv.active].pixels=pixels.slice();render();}}
function proPointerEnd(e){if(!proGesture)return;e.preventDefault();e.stopImmediatePropagation();const g=proGesture;if(g.kind==="select-rect"||g.kind==="select-lasso"){commitHistory(g.before);announce(adv.selection.reduce((n,v)=>n+v,0)+" pixels selected.");}else if(g.kind==="move"){if(g.lastX||g.lastY)commitHistory(g.before);announce("Selection moved.");}else{commitHistory(g.before);announce(g.kind==="gradient"?"Gradient applied.":"Bezier curve applied.");}proGesture=null;}
canvas.addEventListener("pointerdown",proPointerStart,true);canvas.addEventListener("pointermove",proPointerMove,true);canvas.addEventListener("pointerup",proPointerEnd,true);canvas.addEventListener("pointercancel",()=>{if(proGesture){restore(proGesture.before);proGesture=null;}},true);
$("pro-select-all").onclick=()=>updateProSelection(allSelection());$("pro-deselect").onclick=()=>updateProSelection(null);$("pro-invert-selection").onclick=()=>{const s=adv.selection||new Uint8Array(width*height);updateProSelection(Uint8Array.from(s,v=>v?0:1));};
$("pro-scale-selection").onclick=()=>{if(!adv.selection)return announce("Select an area first.");if(adv.layers[adv.active].locked)return announce("Layer locked.");const before=histAdv(),r=proTools.scaleSelection(pixels,width,height,adv.selection,+$("pro-scale-x").value,+$("pro-scale-y").value);pixels=r.pixels;adv.selection=r.selection;adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();announce("Selection resized.");};
$("pro-brush-shape").onchange=e=>adv.brushShape=e.target.value;$("pro-texture").onchange=e=>adv.texture=e.target.value;$("pro-texture-density").oninput=e=>adv.textureDensity=+e.target.value;
$("pro-mask-edit").onchange=e=>{adv.maskEdit=e.target.checked;if(adv.maskEdit&&!adv.layers[adv.active].mask)adv.layers[adv.active].mask=new Uint8Array(width*height).fill(1);announce(adv.maskEdit?"Mask paint mode enabled.":"Mask paint mode disabled.");};
$("pro-mask-add").onclick=()=>{const l=adv.layers[adv.active];if(!l.mask){const before=histAdv();l.mask=new Uint8Array(width*height).fill(1);commitHistory(before);}layerUI();render();announce("Non-destructive layer mask added.");};
$("pro-mask-invert").onclick=()=>{const l=adv.layers[adv.active];if(!l.mask)return announce("Add a mask first.");const before=histAdv();l.mask=Uint8Array.from(l.mask,v=>v?0:1);commitHistory(before);layerUI();render();};
$("pro-mask-apply").onclick=()=>{const l=adv.layers[adv.active];if(!l.mask)return announce("Add a mask first.");const before=histAdv();l.pixels=proTools.applyMask(l.pixels,l.mask);l.mask=null;pixels=l.pixels.slice();commitHistory(before);layerUI();render();};
$("pro-mask-remove").onclick=()=>{const l=adv.layers[adv.active];if(l.mask){const before=histAdv();l.mask=null;commitHistory(before);}$("pro-mask-edit").checked=false;adv.maskEdit=false;layerUI();render();};
$("pro-group-target").onchange=e=>{const g=adv.groups[e.target.value]||{visible:true,opacity:100};$("pro-group-opacity").value=g.opacity;};
$("pro-group-opacity").oninput=e=>{const name=$("pro-group-target").value,g=adv.groups[name]||{visible:true,opacity:100};g.opacity=+e.target.value;adv.groups[name]=g;render();};
$("pro-group-toggle").onclick=()=>{const name=$("pro-group-target").value,g=adv.groups[name]||{visible:true,opacity:100};g.visible=g.visible===false?true:false;adv.groups[name]=g;render();announce(name+(g.visible?" visible":" hidden"));};
$("pro-group-assign").onclick=()=>{const before=histAdv();adv.layers[adv.active].group=$("pro-group-target").value;commitHistory(before);layerUI();render();announce("Active layer assigned to "+adv.layers[adv.active].group);};




/* Stage 2A mobile workspace controller. Does not alter artwork pixels or Gateway. */
const mobileWorkspaceQuery=window.matchMedia("(max-width: 700px)");
const mobileToolsDrawer=document.querySelector(".layout > aside");
const mobileToolsToggle=$("mobile-tools-toggle");
if(mobileToolsDrawer)mobileToolsDrawer.id="studio-tools-drawer";
function setMobileToolsOpen(open){
 document.body.classList.toggle("nu-mobile-tools-open",!!open);
 if(mobileToolsToggle)mobileToolsToggle.setAttribute("aria-expanded",String(!!open));
}
function syncMobileViewport(){
 const vv=window.visualViewport;
 const height=Math.max(240,Math.round(vv&&vv.height?vv.height:window.innerHeight));
 document.documentElement.style.setProperty("--nu-visual-height",height+"px");
 document.documentElement.style.setProperty("--nu-visual-top",Math.round(vv&&vv.offsetTop?vv.offsetTop:0)+"px");
 const angle=Number(window.screen&&window.screen.orientation&&Number.isFinite(window.screen.orientation.angle)?window.screen.orientation.angle:(window.orientation||0));
 let orientation="portrait";
 if(window.innerWidth>window.innerHeight)orientation=(angle===90||angle===-270)?"landscape-left":(angle===270||angle===-90)?"landscape-right":"landscape-left";
 document.documentElement.dataset.nuOrientation=orientation;
}
function syncMobileMode(){document.body.classList.toggle("nu-mobile-workspace",mobileWorkspaceQuery.matches);syncMobileViewport();}
mobileWorkspaceQuery.addEventListener?.("change",syncMobileMode);
window.addEventListener("resize",syncMobileViewport,{passive:true});
window.addEventListener("orientationchange",syncMobileViewport,{passive:true});
window.screen?.orientation?.addEventListener?.("change",syncMobileViewport);
window.visualViewport?.addEventListener("resize",syncMobileViewport,{passive:true});
window.visualViewport?.addEventListener("scroll",syncMobileViewport,{passive:true});
syncMobileMode();
mobileToolsToggle?.addEventListener("click",()=>setMobileToolsOpen(!document.body.classList.contains("nu-mobile-tools-open")));

/* Stage 2B desktop edge-rail controller; the drawer overlays the canvas without shrinking or blocking it when closed. */
const desktopToolsToggle=$("desktop-tools-toggle");
function setDesktopToolsOpen(open){
 const isOpen=!!open;
 const drawer=document.getElementById("studio-tools-drawer")||mobileToolsDrawer;
 document.body.classList.toggle("nu-desktop-tools-open",isOpen);
 if(desktopToolsToggle)desktopToolsToggle.setAttribute("aria-expanded",String(isOpen));
 if(drawer){
  drawer.style.setProperty("visibility",isOpen?"visible":"hidden","important");
  drawer.style.setProperty("transform",isOpen?"translateX(0)":"translateX(calc(100% + 28px))","important");
  drawer.style.setProperty("pointer-events",isOpen?"auto":"none","important");
  drawer.dataset.workspaceDrawerState=isOpen?"open":"closed";
 }
}
desktopToolsToggle?.addEventListener("click",()=>setDesktopToolsOpen(!document.body.classList.contains("nu-desktop-tools-open")));

document.addEventListener("keydown",e=>{
 if(e.key!=="Escape")return;
 if(mobileWorkspaceQuery.matches){
  if(document.body.classList.contains("nu-mobile-tools-open"))setMobileToolsOpen(false);
  return;
 }
 if(document.body.classList.contains("nu-desktop-tools-open"))setDesktopToolsOpen(false);
});
document.addEventListener("pointerdown",e=>{
 if(e.target?.closest?.("#studio-project-confirm"))return;
 if(document.body.classList.contains("nu-mobile-tools-open")&&!mobileToolsDrawer?.contains(e.target)&&!$("mobile-workspace-dock")?.contains(e.target))setMobileToolsOpen(false);
 if(document.body.classList.contains("nu-desktop-tools-open")&&!mobileToolsDrawer?.contains(e.target)&&!$("desktop-workspace-rail")?.contains(e.target))setDesktopToolsOpen(false);
});
function setMobileZoom(next){setZoom(next,null,"smooth");}
$("mobile-zoom-in")?.addEventListener("click",()=>setMobileZoom(workspace.zoom+25));
$("mobile-zoom-out")?.addEventListener("click",()=>setMobileZoom(workspace.zoom-25));
$("mobile-view-rotation")?.addEventListener("input",e=>{
 viewRotation=clamp(Number(e.target.value)||0,-180,180);
 updateViewportRotation();
 $("mobile-view-rotation-value").textContent=viewRotation+"°";
});
$("mobile-view-reset")?.addEventListener("click",()=>{
 viewRotation=0;
 $("mobile-view-rotation").value=0;
 $("mobile-view-rotation-value").textContent="0°";
 updateViewportRotation();
 $("fit-canvas").click();
 announce("Viewport reset; artwork pixels and undo history are unchanged.");
});

/* Stage 7 — versioned local project portability and explicit replacement safety. */
const STUDIO_PROJECT_FORMAT="N.U-Pixel-Art-Studio-Project";
const STUDIO_PROJECT_VERSION=1;
const STUDIO_PROJECT_MAX_BYTES=128*1024*1024;
function projectHasContent(){
 return width!==32||height!==32||adv.layers.some(layer=>
  layer.pixels.some(Boolean)||!!layer.mask||layer.opacity!==100||!layer.visible||layer.locked||layer.blend!=="normal"||layer.group!=="Ungrouped"
 )||!!(adv.selection&&adv.selection.some(Boolean))||Object.keys(adv.groups).length>0||
  palette.join("|")!==defaults.join("|")||color!=="#e8b94f"||tool!=="pencil"||imageImported||
  workspace.zoom!==100||brushSize!==1||fadeIntensity!==50||mixBrushStrength!==60||viewRotation!==0||
  Object.values(guideState).some(Boolean)||!guideHighContrast||$("show-grid")?.checked===false||magnifierFactor!==4||magnifierSize!==160||
  adv.bucket!=="contiguous"||adv.tol!==0||adv.symmetry!=="none"||adv.brushShape!=="square"||adv.texture!=="none"||adv.textureDensity!==60||
  $("pro-gradient-color")?.value!=="#65dcff"||$("pro-gradient-mode")?.value!=="linear"||Number($("pro-curve")?.value)!==24||
  Number($("adv-alpha")?.value)!==100||Number($("pro-scale-x")?.value)!==2||Number($("pro-scale-y")?.value)!==2;
}
async function confirmProjectReplacement(title,message){
 const dialog=$("studio-project-confirm");
 if(!dialog||typeof dialog.showModal!=="function")return window.confirm(title+"\n\n"+message);
 $("studio-project-confirm-title").textContent=title;
 $("studio-project-confirm-message").textContent=message;
 dialog.returnValue="";
 dialog.showModal();
 return await new Promise(resolve=>dialog.addEventListener("close",()=>resolve(dialog.returnValue==="confirm"),{once:true}));
}
function buildStudioProjectDocument(){
 adv.layers[adv.active].pixels=pixels.slice();
 const project={
  width,height,
  layers:adv.layers.map(layer=>({
   name:layer.name,pixels:layer.pixels.slice(),opacity:layer.opacity,visible:layer.visible,locked:layer.locked,
   mask:layer.mask?Array.from(layer.mask,v=>v?1:0):null,blend:layer.blend||"normal",group:layer.group||"Ungrouped"
  })),
  active:adv.active,selection:adv.selection?Array.from(adv.selection,v=>v?1:0):null,
  groups:JSON.parse(JSON.stringify(adv.groups||{})),
  palette:palette.slice(),color,tool,imageImported,
  sourceInfo:$("source-info")?.textContent||"",
  settings:{
   zoom:workspace.zoom,brushSize,fadeIntensity,mixBrushStrength,viewRotation,
   guideState:{...guideState},guideHighContrast,showGrid:$("show-grid")?.checked!==false,magnifierFactor,magnifierSize,
   bucket:adv.bucket,tolerance:adv.tol,symmetry:adv.symmetry,brushShape:adv.brushShape,
   texture:adv.texture,textureDensity:adv.textureDensity,
   gradientColor:$("pro-gradient-color")?.value||"#65dcff",gradientMode:$("pro-gradient-mode")?.value||"linear",
   curveTension:Number($("pro-curve")?.value??24),alpha:Number($("adv-alpha")?.value??100),
   selectionScaleX:Number($("pro-scale-x")?.value)||2,selectionScaleY:Number($("pro-scale-y")?.value)||2
  }
 };
 return window.NUStudioProTools.validateStudioProject({format:STUDIO_PROJECT_FORMAT,version:STUDIO_PROJECT_VERSION,createdAt:new Date().toISOString(),project},{maxPixels:cellLimit()});
}
function downloadStudioProject(){
 try{
  const documentData=buildStudioProjectDocument(),json=JSON.stringify(documentData),blob=new Blob([json],{type:"application/json;charset=utf-8"});
  if(blob.size>STUDIO_PROJECT_MAX_BYTES)throw new Error("This project is too large for the supported project-file limit.");
  const raw=($("export-name")?.value||"nu-pixel-art").trim().replace(/[^a-z0-9-_]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,48)||"nu-pixel-art";
  const url=URL.createObjectURL(blob),anchor=document.createElement("a");
  anchor.href=url;anchor.download=raw+".nuproj";anchor.hidden=true;document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  announce("Project downloaded. Keep the .nuproj file to continue editing later.");
 }catch(error){announce("Project download failed: "+(error&&error.message?error.message:"unsupported project state"));}
}
function syncStudioProjectControls(p){
 const s=p.settings;
 color=p.color;palette=p.palette.slice();imageImported=p.imageImported;
 workspace.zoom=s.zoom;brushSize=s.brushSize;fadeIntensity=s.fadeIntensity;mixBrushStrength=s.mixBrushStrength;
 viewRotation=s.viewRotation;guideState={...s.guideState};guideHighContrast=s.guideHighContrast;
 magnifierFactor=s.magnifierFactor;magnifierSize=s.magnifierSize;
 adv.bucket=s.bucket;adv.tol=s.tolerance;adv.symmetry=s.symmetry;adv.brushShape=s.brushShape;adv.texture=s.texture;adv.textureDensity=s.textureDensity;
 const setValue=(id,value)=>{const el=$(id);if(el)el.value=String(value);};
 setValue("custom-color",color);setValue("brush-size",brushSize);const brushValue=$("brush-size-value");if(brushValue)brushValue.textContent=brushSize+" px";
 setValue("adv-bucket",adv.bucket);setValue("adv-tol",adv.tol);setValue("adv-symmetry",adv.symmetry);
 setValue("pro-brush-shape",adv.brushShape);setValue("pro-texture",adv.texture);setValue("pro-texture-density",adv.textureDensity);
 setValue("mix-brush-strength",mixBrushStrength);setValue("magnifier-strength",magnifierFactor);setValue("magnifier-size",magnifierSize);
 const fade=document.querySelector('[aria-label="Fading brush intensity"]');if(fade)fade.value=String(fadeIntensity);
 document.querySelectorAll("[data-guide]").forEach(input=>{input.checked=!!guideState[input.dataset.guide];});
 const contrast=document.querySelector("[data-guide-contrast]");if(contrast)contrast.checked=guideHighContrast;
 const gridToggle=$("show-grid");if(gridToggle)gridToggle.checked=s.showGrid;
 setValue("pro-gradient-color",s.gradientColor);setValue("pro-gradient-mode",s.gradientMode);setValue("pro-curve",s.curveTension);
 setValue("adv-alpha",s.alpha);setValue("pro-scale-x",s.selectionScaleX);setValue("pro-scale-y",s.selectionScaleY);
 const maskEdit=$("pro-mask-edit");if(maskEdit)maskEdit.checked=false;adv.maskEdit=false;
 const groupTarget=$("pro-group-target");if(groupTarget)groupTarget.value=adv.layers[adv.active].group||"Ungrouped";
 const group=adv.groups[groupTarget?.value||"Ungrouped"]||{visible:true,opacity:100};setValue("pro-group-opacity",group.opacity);
 $("image-width").value=width;$("image-height").value=height;
 $("source-info").textContent="Project reopened. Editable pixels and layers were restored; the original imported source file is not embedded.";
 $("source-preview-panel").hidden=true;$("source-preview").removeAttribute("src");
 renderPalette();$("custom-color").value=color;
 setTool(p.tool);updateViewportRotation();updateCanvasDisplay();render();layerUI();
}
function applyStudioProjectDocument(documentData){
 const p=documentData.project;
 if(sourcePreviewUrl){URL.revokeObjectURL(sourcePreviewUrl);sourcePreviewUrl=null;}
 originalImportFile=null;hideMagnifier();compassState=null;drawing=false;strokeSnapshot=null;mixBrushState=null;
 undoStack=[];redoStack=[];
 restore({
  width:p.width,height:p.height,pixels:p.layers[p.active].pixels.slice(),
  layers:p.layers.map(layer=>({...layer,pixels:layer.pixels.slice(),mask:layer.mask?Uint8Array.from(layer.mask):null})),
  active:p.active,selection:p.selection?Uint8Array.from(p.selection):null,groups:JSON.parse(JSON.stringify(p.groups))
 });
 syncStudioProjectControls(p);
 historyButtons();$("workspace-frame").scrollTo(0,0);
 announce("Project opened. Your layers, artwork and saved editing settings are ready.");
}
async function openStudioProjectFile(file){
 if(!file)return;
 try{
  if(file.size>STUDIO_PROJECT_MAX_BYTES)throw new Error("The project file exceeds the supported size limit.");
  const parsed=JSON.parse(await file.text());
  const validated=window.NUStudioProTools.validateStudioProject(parsed,{maxPixels:cellLimit()});
  if(projectHasContent()&&!(await confirmProjectReplacement("Replace the current project?","The selected project is valid. Replacing the current project will discard its current work. Cancel to keep it unchanged."))){announce("Project opening cancelled. Your current project is unchanged.");return;}
  applyStudioProjectDocument(validated);
 }catch(error){announce("Project could not be opened: "+(error&&error.message?error.message:"invalid project file")+". Your current project is unchanged.");}
 finally{$("project-file").value="";}
}
async function startNewStudioProject(){
 if(projectHasContent()&&!(await confirmProjectReplacement("Start a new project?","The current project and its artwork will be cleared. Download the project first if you want to keep it."))){announce("New Project cancelled. Your current project is unchanged.");return;}
 const blankLayers=Array.from({length:4},(_,i)=>({name:"Layer "+(i+1),pixels:Array(32*32).fill(null),opacity:100,visible:true,locked:false,mask:null,blend:"normal",group:"Ungrouped"}));
 adv.groups={};adv.maskEdit=false;adv.active=0;adv.selection=null;
 adv.bucket="contiguous";adv.tol=0;adv.symmetry="none";adv.brushShape="square";adv.texture="none";adv.textureDensity=60;
 palette=defaults.slice();color="#e8b94f";tool="pencil";imageImported=false;
 workspace.zoom=100;brushSize=1;fadeIntensity=50;mixBrushStrength=60;viewRotation=0;
 guideState={blueprint:false,ruler:false,divisions:false,axes:false,depth:false};guideHighContrast=true;magnifierFactor=4;magnifierSize=160;
 applyStudioProjectDocument({project:{width:32,height:32,layers:blankLayers,active:0,selection:null,groups:{},palette,color,tool,imageImported,settings:{
  zoom:100,brushSize:1,fadeIntensity:50,mixBrushStrength:60,viewRotation:0,
  guideState,guideHighContrast:true,showGrid:true,magnifierFactor:4,magnifierSize:160,bucket:"contiguous",tolerance:0,
  symmetry:"none",brushShape:"square",texture:"none",textureDensity:60,
  gradientColor:"#65dcff",gradientMode:"linear",curveTension:24,alpha:100,selectionScaleX:2,selectionScaleY:2
 }}});
 $("source-info").textContent="New project. Import an image or start drawing on the transparent canvas.";
 announce("New project created. Your previous project was not changed until confirmation.");
}
const resetGridBeforeProjectGuard=resetGrid;
resetGrid=async function(next){
 if(projectHasContent()&&!(await confirmProjectReplacement("Clear the current project?","Changing the canvas size clears the current artwork and layer pixels. Download the project first if you want to keep it."))){
  $("image-width").value=width;$("image-height").value=height;const grid=$("grid-size");if(grid)grid.value=String(width);announce("Canvas change cancelled. Your current project is unchanged.");return false;
 }
 resetGridBeforeProjectGuard(next);return true;
};
$("download-project")?.addEventListener("click",downloadStudioProject);
$("open-project")?.addEventListener("click",()=>$("project-file").click());
$("project-file")?.addEventListener("change",e=>openStudioProjectFile(e.target.files&&e.target.files[0]));
$("new-project")?.addEventListener("click",startNewStudioProject);
$("clear-canvas")?.addEventListener("click",e=>{
 e.stopImmediatePropagation();
 (async()=>{
  if(adv.layers[adv.active].locked){announce("Layer is locked. Unlock it before clearing.");return;}
  if(projectHasContent()&&!(await confirmProjectReplacement("Clear the active layer?","The active layer's selected artwork will be cleared. Download the project first if you want to keep it."))){announce("Clear cancelled. Your current project is unchanged.");return;}
  const before=histAdv();pixels=pixels.map((value,index)=>!adv.selection||adv.selection[index]?null:value);
  adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();announce("Active layer cleared.");
 })();
},true);
$("adv-clear")?.addEventListener("click",e=>{
 e.stopImmediatePropagation();
 (async()=>{
  if(adv.layers[adv.active].locked){announce("Layer is locked.");return;}
  if(projectHasContent()&&!(await confirmProjectReplacement("Clear the active layer?","The active layer's selected artwork will be cleared. Download the project first if you want to keep it."))){announce("Clear cancelled. Your current project is unchanged.");return;}
  const before=histAdv();pixels=pixels.map((value,index)=>!adv.selection||adv.selection[index]?null:value);
  adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();announce("Active layer cleared.");
 })();
},true);

})();