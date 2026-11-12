/* N.U Pixel Art Studio v1.0 — local-only pixel editor and SVG exporter. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const canvas=$("pixel-canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true});
const defaults=["#111827","#243447","#3e596b","#78909c","#d8e2e8","#ffffff","#a63c50","#e45b63","#f29c67","#e8b94f","#f8dc86","#76a86c","#3f795e","#4b9cba","#5577b8","#8a6bb5"];
let width=32,height=32,pixels=Array(width*height).fill(null),palette=defaults.slice(),color="#e8b94f",tool="pencil",drawing=false,strokeSnapshot=null,undoStack=[],redoStack=[],imageImported=false,qualityProfile=null,workspace={zoom:100},resizeLock=true,lastDimension="width",brushSize=1,strokeStart=null,sourcePreviewUrl=null,originalImportFile=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function announce(msg){$("studio-status").textContent=msg;}
function snapshot(){return {width,height,pixels:pixels.slice()};}
function commitHistory(before){if(!before)return;undoStack.push(before);if(undoStack.length>60)undoStack.shift();redoStack=[];historyButtons();}
function restore(s){width=s.width;height=s.height;pixels=s.pixels.slice();$("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();render();}
function historyButtons(){$("undo").disabled=!undoStack.length;$("redo").disabled=!redoStack.length;}
function cellLimit(){const b=qualityProfile&&qualityProfile.budget;return b?Math.min(262144,Math.max(4096,Math.floor(b.maxCanvasPixels||65536))):262144;}
function updateCounters(){const count=pixels.reduce((n,p)=>n+(p?1:0),0);$("canvas-size").textContent=width+" × "+height+" px";$("pixel-count").textContent=count+" painted pixels";$("zoom-note").textContent=workspace.zoom+"% view · "+(qualityProfile?qualityProfile.tier:"balanced");}
function updateCanvasDisplay(){
 if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
 const frame=$("workspace-frame");
 if(!window.NUStudioLayout){announce("Workspace geometry module is unavailable. Refresh the Studio.");return;}
 const fitted=window.NUStudioLayout.fit(width,height,frame.clientWidth,frame.clientHeight,workspace.zoom,28);
 canvas.style.width=fitted.width+"px";canvas.style.height=fitted.height+"px";
 frame.style.alignItems=workspace.zoom>100?"flex-start":"center";
 frame.style.justifyContent=workspace.zoom>100?"flex-start":"center";
 $("workspace-zoom").value=workspace.zoom;$("workspace-zoom-value").textContent=workspace.zoom+"%";
}
function render(){
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 ctx.clearRect(0,0,width,height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=y*width+x;
  if(pixels[i])ctx.fillStyle=pixels[i];
  else ctx.fillStyle=((x+y)&1)?"#142538":"#0b1724";
  ctx.fillRect(x,y,1,1);
 }
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
function resizeArtwork(nextW,nextH,method="nearest"){nextW=clamp(Math.round(nextW),1,2048);nextH=clamp(Math.round(nextH),1,2048);if(nextW*nextH>cellLimit()){announce("This device profile allows up to "+cellLimit().toLocaleString()+" editable pixels. Reduce the dimensions or choose a lighter workspace.");return false;}const before=snapshot(),next=Array(nextW*nextH).fill(null);for(let y=0;y<nextH;y++)for(let x=0;x<nextW;x++){const sx=Math.min(width-1,Math.floor((x+.5)*width/nextW)),sy=Math.min(height-1,Math.floor((y+.5)*height/nextH));next[y*nextW+x]=pixels[sy*width+sx];}width=nextW;height=nextH;pixels=next;commitHistory(before);$("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();render();announce("Artwork resized to "+width+" × "+height+" px using "+method+" sampling. Original import remains unchanged outside the working copy.");return true;}
function initAdaptive(){const fallback=()=>{qualityProfile={tier:"balanced",level:3,budget:{maxCanvasPixels:262144,dpr:1},reducedMotion:false};$("quality-profile").textContent="Balanced · fallback";};if(!window.NUGraphicsCore){fallback();return;}window.NUGraphicsCore.start().then(p=>{qualityProfile=p;$("quality-profile").textContent=p.tier+" · level "+p.level;$("quality-detail").textContent="Editable pixel budget: "+cellLimit().toLocaleString()+" cells";updateCounters();}).catch(fallback);}
function applyZoom(){workspace.zoom=clamp(Number($("workspace-zoom").value)||100,25,800);updateCanvasDisplay();updateCounters();}
$("workspace-zoom").addEventListener("input",applyZoom);
$("fit-canvas").addEventListener("click",()=>{workspace.zoom=100;applyZoom();$("workspace-frame").scrollTo(0,0);});
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
function setTool(next){tool=next;document.querySelectorAll("[data-tool]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tool===tool)));canvas.style.cursor=tool==="picker"?"copy":tool==="eraser"?"cell":tool==="fill"?"copy":"crosshair";}
function coords(e){const r=canvas.getBoundingClientRect();return window.NUStudioLayout.pixelAt(e.clientX,e.clientY,r,width,height);}
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
 }else if(tool==="rect"){
  const left=Math.min(x0,x1),right=Math.max(x0,x1),top=Math.min(y0,y1),bottom=Math.max(y0,y1);
  for(let x=left;x<=right;x++){paintBrush(x,top,value);paintBrush(x,bottom,value);}
  for(let y=top;y<=bottom;y++){paintBrush(left,y,value);paintBrush(right,y,value);}
 }else if(tool==="ellipse"){
  const rx=Math.max(.5,Math.abs(x1-x0)/2),ry=Math.max(.5,Math.abs(y1-y0)/2),cx=(x0+x1)/2,cy=(y0+y1)/2;
  const left=Math.floor(cx-rx-1),right=Math.ceil(cx+rx+1),top=Math.floor(cy-ry-1),bottom=Math.ceil(cy+ry+1),tolerance=Math.max(1/rx,1/ry)*1.4;
  for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const d=((x-cx)*(x-cx))/(rx*rx)+((y-cy)*(y-cy))/(ry*ry);if(Math.abs(d-1)<=tolerance)paintBrush(x,y,value);}
 }
}
function paintAt(e){const p=coords(e),i=p.y*width+p.x;if(tool==="picker"){if(pixels[i]){color=pixels[i];$("custom-color").value=color;renderPalette();}return;}if(tool==="fill"){flood(p.x,p.y,color);render();return;}paintBrush(p.x,p.y,tool==="eraser"?null:color);render();}
canvas.addEventListener("pointerdown",e=>{
 e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;strokeSnapshot=snapshot();strokeStart=coords(e);
 if(tool==="fill"||tool==="picker"){paintAt(e);if(tool==="fill")commitHistory(strokeSnapshot);drawing=false;strokeSnapshot=null;strokeStart=null;return;}
 if(tool==="line"||tool==="rect"||tool==="ellipse"){drawShape(strokeStart,strokeStart);render();}else paintAt(e);
});
canvas.addEventListener("pointermove",e=>{
 if(!drawing||!(e.buttons||e.pointerType==="touch"))return;
 if(tool==="line"||tool==="rect"||tool==="ellipse"){pixels=strokeSnapshot.pixels.slice();drawShape(strokeStart,coords(e));render();}
 else paintAt(e);
});
function endStroke(){if(!drawing)return;drawing=false;commitHistory(strokeSnapshot);strokeSnapshot=null;strokeStart=null;}
function cancelStroke(){if(!drawing)return;pixels=strokeSnapshot.pixels.slice();drawing=false;strokeSnapshot=null;strokeStart=null;render();}
canvas.addEventListener("pointerup",endStroke);canvas.addEventListener("pointercancel",cancelStroke);canvas.addEventListener("lostpointercapture",cancelStroke);
document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
$("custom-color").addEventListener("input",e=>{color=e.target.value.toLowerCase();renderPalette();setTool("pencil");});
$("brush-size").addEventListener("input",e=>{brushSize=clamp(Number(e.target.value)||1,1,16);$("brush-size-value").textContent=brushSize+" px";});
function resetGrid(next){width=next;height=next;pixels=Array(width*height).fill(null);undoStack=[];redoStack=[];imageImported=false;historyButtons();$("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();render();announce("New "+width+" × "+height+" transparent canvas.");}
$("grid-size").addEventListener("change",e=>resetGrid(Number(e.target.value)));
$("new-canvas").addEventListener("click",()=>resetGrid(width));
$("clear-canvas").addEventListener("click",()=>{const before=snapshot();pixels.fill(null);commitHistory(before);render();announce("Canvas cleared.");});
$("undo").addEventListener("click",()=>{if(!undoStack.length)return;redoStack.push(snapshot());restore(undoStack.pop());historyButtons();});
$("redo").addEventListener("click",()=>{if(!redoStack.length)return;undoStack.push(snapshot());restore(redoStack.pop());historyButtons();});
function quantize(v){return Math.round(v/17)*17;}
function hex(r,g,b){return "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");}
function nearest(rgb,colors){let best=colors[0],dist=Infinity;for(const c of colors){const n=[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)],d=(rgb[0]-n[0])**2+(rgb[1]-n[1])**2+(rgb[2]-n[2])**2;if(d<dist){dist=d;best=c;}}return best;}
async function decodeImage(file){if(typeof createImageBitmap==="function"){try{return await createImageBitmap(file);}catch(_){}}return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("This image format could not be decoded."));};img.src=url;});}
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
$("image-file").addEventListener("change",async e=>{
 const file=e.target.files&&e.target.files[0];if(!file)return;
 if(!file.type.startsWith("image/")){announce("Choose a PNG, JPEG, WebP or GIF image.");e.target.value="";return;}
 if(file.size>25*1024*1024){announce("Image is larger than the 25 MB browser import limit.");e.target.value="";return;}
 let bitmap=null;
 try{
  originalImportFile=file;
  announce("Reading source image and preparing the working copy…");
  bitmap=await decodeImage(file);
  const sourceWidth=bitmap.width,sourceHeight=bitmap.height,maxSide=Number($("import-resolution").value)||256;
  const scale=Math.min(1,maxSide/Math.max(sourceWidth,sourceHeight));
  let nextW=Math.max(1,Math.round(sourceWidth*scale)),nextH=Math.max(1,Math.round(sourceHeight*scale));
  const budgetScale=Math.min(1,Math.sqrt(cellLimit()/(nextW*nextH)));
  nextW=Math.max(1,Math.floor(nextW*budgetScale));nextH=Math.max(1,Math.floor(nextH*budgetScale));
  const temp=document.createElement("canvas");temp.width=nextW;temp.height=nextH;
  const t=temp.getContext("2d",{willReadFrequently:true});if(!t)throw new Error("This browser could not create an image processing canvas.");
  t.imageSmoothingEnabled=$("import-resampling").value!=="nearest";
  if(t.imageSmoothingEnabled)t.imageSmoothingQuality="high";
  t.drawImage(bitmap,0,0,nextW,nextH);
  const data=t.getImageData(0,0,nextW,nextH).data;
  const alphaCutoff=Number($("alpha-cutoff").value)||0;
  const extracted=imagePalette(data,Number($("palette-limit").value)||32,alphaCutoff);
  if(!extracted.length)throw new Error("No visible pixels remain above the transparency cutoff.");
  if(!window.NURasterImport)throw new Error("Raster import module did not load.");
  const mapped=window.NURasterImport.mapPixels(data,nextW,nextH,extracted,alphaCutoff,$("dither-image").checked);
  const before=snapshot();width=nextW;height=nextH;pixels=mapped;palette=extracted;
  commitHistory(before);imageImported=true;workspace.zoom=100;
  $("image-width").value=width;$("image-height").value=height;
  if(sourcePreviewUrl)URL.revokeObjectURL(sourcePreviewUrl);
  sourcePreviewUrl=URL.createObjectURL(file);$("source-preview").src=sourcePreviewUrl;
  $("source-preview-panel").hidden=false;
  $("source-info").textContent=sourceWidth+" × "+sourceHeight+" source → "+width+" × "+height+" working pixels · "+palette.length+" colors · "+( $("dither-image").checked?"dithered":"direct palette match");
  updateCanvasDisplay();requestAnimationFrame(()=>{updateCanvasDisplay();$("workspace-frame").scrollTo(0,0);});
  renderPalette();render();
  announce("Imported · "+file.name+" · "+sourceWidth+" × "+sourceHeight+" → "+width+" × "+height+" px · "+palette.length+" colors. Original source preserved.");
 }catch(err){announce("Image import failed: "+(err&&err.message?err.message:"unsupported image"));}
 finally{if(bitmap&&typeof bitmap.close==="function")bitmap.close();e.target.value="";}
});
window.addEventListener("pagehide",()=>{if(sourcePreviewUrl)URL.revokeObjectURL(sourcePreviewUrl);if(workspaceObserver)workspaceObserver.disconnect();},{once:true});
$("extract-palette").addEventListener("click",()=>{if(!imageImported){announce("Import an image first to extract its palette.");return;}const counts=new Map();pixels.filter(Boolean).forEach(c=>counts.set(c,(counts.get(c)||0)+1));palette=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,16).map(x=>x[0]);if(!palette.length)palette=defaults.slice();renderPalette();announce("Palette extracted from current artwork.");});
function analyzeArtwork(){
 if(!window.NUGraphicsAnalysis)throw new Error("Graphics analysis engine did not load.");
 return window.NUGraphicsAnalysis.analyze(pixels,width,height,{tileSize:8});
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
 const reward=grantStudioXP(analysis.metrics,pathCount);
 if(reward.ok)announce("Download started · +"+reward.amount+" shared XP added to all three Generation 1 games. This artwork earns XP once.");
 else if(reward.reason==="DUPLICATE_REWARD")announce("Download started · this artwork has already claimed its Studio XP reward.");
 else if(reward.reason==="ARTWORK_TOO_SMALL")announce("Download started · artwork is too small for an XP reward (minimum 16 painted pixels).");
 else announce("Download started · XP reward not saved: "+reward.reason+".");
}
function svgSource(){if(!window.NUSVGVectorizer)throw new Error("SVG vector engine did not load. Refresh the studio and try again.");return window.NUSVGVectorizer.vectorize(pixels,width,height,{mode:$("vector-mode").value});}
function filename(ext){let n=$("export-name").value.trim().replace(/[^a-z0-9-_]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,48)||"nu-pixel-art";return n+"."+ext;}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;}
$("export-svg").addEventListener("click",()=>{try{const result=svgSource(),analysis=analyzeArtwork();if(download(new Blob([result.source],{type:"image/svg+xml;charset=utf-8"}),filename("svg")))reportDownloadedOutput(analysis,result.pathCount);}catch(err){announce("SVG export failed: "+err.message);}});
$("export-ir").addEventListener("click",()=>{try{const analysis=analyzeArtwork(),source=JSON.stringify(analysis,null,2);if(download(new Blob([source],{type:"application/vnd.nu-gfx+json;charset=utf-8"}),filename("nu-gfx.json")))reportDownloadedOutput(analysis,analysis.metrics.regionCount);}catch(err){announce("Graphics IR export failed: "+err.message);}});
$("export-svg-copy").addEventListener("click",async()=>{try{const result=svgSource();await navigator.clipboard.writeText(result.source);announce("SVG source copied · "+result.pathCount+" paths · "+result.colorCount+" colors.");}catch(err){announce("Clipboard unavailable: "+err.message+" · use Download SVG.");}});
$("export-png").addEventListener("click",()=>{try{const out=document.createElement("canvas");out.width=width*16;out.height=height*16;const o=out.getContext("2d");o.imageSmoothingEnabled=false;pixels.forEach((c,i)=>{if(!c)return;o.fillStyle=c;o.fillRect((i%width)*16,Math.floor(i/width)*16,16,16);});const analysis=analyzeArtwork();out.toBlob(blob=>{if(blob&&download(blob,filename("png")))reportDownloadedOutput(analysis,analysis.metrics.regionCount);else announce("PNG export could not create a file.");},"image/png");}catch(err){announce("PNG export failed: "+err.message);}});
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
const adv={layers:Array.from({length:4},(_,i)=>({name:"Layer "+(i+1),pixels:Array(width*height).fill(null),opacity:100,visible:true,locked:false})),active:0,bucket:"contiguous",tol:0};adv.layers[0].pixels=pixels.slice();
const renderBase=render,rgb=c=>c?[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)):null,hexRGB=a=>"#"+a.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,"0")).join("");
function mix(a,b,t){if(!a)return b;if(!b)return a;return hexRGB(rgb(a).map((v,i)=>v*(1-t)+rgb(b)[i]*t));}
function dist(a,b){const x=rgb(a),y=rgb(b);return !x||!y?(a===b?0:999):Math.sqrt(x.reduce((n,v,i)=>n+(v-y[i])**2,0));}
function composite(){const out=Array(width*height).fill(null);for(const l of adv.layers)if(l.visible)for(let i=0;i<out.length;i++)if(l.pixels[i])out[i]=mix(out[i],l.pixels[i],l.opacity/100);return out;}
render=function(){adv.layers[adv.active].pixels=pixels.slice();const active=pixels;pixels=composite();renderBase();pixels=active;};
function histAdv(){return snapshot();}
function layerUI(){const root=$("adv-layers");if(!root)return;root.innerHTML="";adv.layers.forEach((l,i)=>{const row=document.createElement("div");row.className="adv-layer";const b=document.createElement("button");b.textContent=(i===adv.active?"● ":"")+l.name;b.onclick=()=>{adv.layers[adv.active].pixels=pixels.slice();adv.active=i;pixels=l.pixels.slice();render();layerUI();};const v=document.createElement("input");v.type="checkbox";v.checked=l.visible;v.title="Visible";v.onchange=()=>{l.visible=v.checked;render();};const k=document.createElement("input");k.type="checkbox";k.checked=l.locked;k.title="Lock";k.onchange=()=>l.locked=k.checked;const o=document.createElement("input");o.type="range";o.min=0;o.max=100;o.value=l.opacity;o.oninput=()=>{l.opacity=+o.value;render();};row.append(b,v,k,o);root.append(row);});}
function advPanel(){const st=document.createElement("style");st.textContent="#adv-studio{margin-top:12px;padding:10px;border:1px solid #65dcff44;border-radius:12px;background:#081522}#adv-studio>summary{cursor:pointer;color:#ffc86b;font-weight:800;padding:5px}#adv-studio details{border-top:1px solid #ffffff16;padding:8px 0}#adv-studio details>summary{cursor:pointer;color:#bcecff;font-size:12px}#adv-studio .adv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:8px 0}#adv-studio button{border:1px solid #65dcff55;background:#102a3b;color:#eaf6ff;border-radius:7px;padding:8px;font-size:11px}#adv-studio input,#adv-studio select{max-width:100%;min-width:0;background:#071018;color:#eaf6ff;border:1px solid #65dcff44;border-radius:7px;padding:6px}#adv-studio input[type=range]{width:100%}#adv-studio .adv-layer{display:grid;grid-template-columns:1fr auto auto;gap:6px;margin:7px 0}#adv-studio .adv-layer input[type=range]{grid-column:1/-1}";document.head.append(st);
 const d=document.createElement("details");d.id="adv-studio";d.innerHTML='<summary>ADVANCED TOOLKIT · EXPAND WHEN NEEDED</summary><p class="hint">Four independent layers; each has visibility, opacity and lock. Local operations are undoable.</p><details open><summary>PALETTE LAB</summary><button id="adv-extract">Extract colors from working image</button><input id="adv-color" type="color" value="#e8b94f"><button id="adv-add">Add color</button><button id="adv-replace">Replace selected color in active layer</button></details><details><summary>BUCKET MODES</summary><select id="adv-bucket"><option value="contiguous">Contiguous</option><option value="similar">Similar RGB colors</option><option value="global">All exact matches</option></select><label>Tolerance <input id="adv-tol" type="range" min="0" max="180" value="0"></label></details><details><summary>FOUR LAYERS</summary><div id="adv-layers"></div><button id="adv-clear">Clear active layer</button></details><details><summary>TRANSFORM / NEGATIVE</summary><div class="adv-grid"><button data-x="h">Mirror H</button><button data-x="v">Mirror V</button><button data-x="90">Rotate 90°</button><button data-x="180">Rotate 180°</button><button data-x="neg">Negative</button><button data-x="crop">Crop</button></div><div class="adv-grid"><input id="crop-x" type="number" value="0"><input id="crop-y" type="number" value="0"><input id="crop-w" type="number" value="16"><input id="crop-h" type="number" value="16"></div></details><details><summary>IMAGE ADJUSTMENTS</summary><label>Brightness <input id="adj-b" type="range" min="-100" max="100" value="0"></label><label>Contrast <input id="adj-c" type="range" min="-100" max="100" value="0"></label><label>Saturation <input id="adj-s" type="range" min="-100" max="100" value="0"></label><label>Warm / cool <input id="adj-w" type="range" min="-100" max="100" value="0"></label><div class="adv-grid"><button id="adj-apply">Apply adjustments</button><button id="adj-shine">Shine</button><button id="adj-fade">Fade</button><button id="adj-sharpen">Sharpen</button></div><div class="adv-grid"><input id="rgb-r" type="number" value="0" placeholder="R ±"><input id="rgb-g" type="number" value="0" placeholder="G ±"><input id="rgb-b" type="number" value="0" placeholder="B ±"><button id="rgb-apply">Apply RGB</button></div></details><details><summary>OVERLAY / CHROMA KEY / TEXT</summary><input id="adv-overlay" type="file" accept="image/*"><input id="adv-key" type="color" value="#00ff00"><input id="adv-keytol" type="range" min="0" max="220" value="60"><button id="adv-chroma">Remove key color</button><input id="adv-text" value="N.U"><input id="adv-textsize" type="number" value="16"><button id="adv-textadd">Rasterize text</button><label>Brush fade <input id="adv-alpha" type="range" min="10" max="100" value="100"></label></details><details><summary>ORIGINAL / GENERATED SVG</summary><button id="adv-original">Download original file unchanged</button><button id="adv-svg">Download generated edited SVG</button></details>';
 $("image-file").closest(".toolbar").insertAdjacentElement("afterend",d);
 $("adv-extract").onclick=()=>{const m=new Map();pixels.filter(Boolean).forEach(c=>m.set(c,(m.get(c)||0)+1));palette=[...m].sort((a,b)=>b[1]-a[1]).slice(0,32).map(x=>x[0]);renderPalette();};
 $("adv-add").onclick=()=>{const c=$("adv-color").value;palette.push(c);color=c;$("custom-color").value=c;renderPalette();};
 $("adv-replace").onclick=()=>{const old=color,n=$("adv-color").value;if(old===n)return;const before=histAdv();pixels=pixels.map(c=>c===old?n:c);adv.layers[adv.active].pixels=pixels.slice();palette=palette.map(c=>c===old?n:c);color=n;commitHistory(before);renderPalette();render();};
 $("adv-bucket").onchange=e=>adv.bucket=e.target.value;$("adv-tol").oninput=e=>adv.tol=+e.target.value;
 $("adv-clear").onclick=()=>{if(adv.layers[adv.active].locked)return announce("Layer locked");const before=histAdv();pixels.fill(null);adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();};
 document.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>transformAdv(b.dataset.x));
 $("adj-apply").onclick=()=>mapAdv(c=>{const avg=c.reduce((a,b)=>a+b,0)/3,br=+$("adj-b").value*1.8,co=1+(+$("adj-c").value)/100,sa=1+(+$("adj-s").value)/100,w=+$("adj-w").value*.7;return c.map((v,i)=>avg+((v-128)*co+128+br-avg)*sa+(i===0?w:i===2?-w:0));});
 $("rgb-apply").onclick=()=>mapAdv(c=>c.map((v,i)=>v+[+$("rgb-r").value,+$("rgb-g").value,+$("rgb-b").value][i]));
 $("adj-shine").onclick=()=>mapAdv(c=>c.map(v=>v+28));$("adj-fade").onclick=()=>mapAdv(c=>c.map(v=>v*.8+128*.2));$("adj-sharpen").onclick=()=>mapAdv(c=>c.map(v=>v));
 $("adv-overlay").onchange=overlayAdv;$("adv-chroma").onclick=chromaAdv;$("adv-textadd").onclick=textAdv;
 $("adv-original").onclick=()=>{if(!originalImportFile)return announce("No original imported file.");download(new Blob([originalImportFile],{type:originalImportFile.type}),"original-"+originalImportFile.name);};
 $("adv-svg").onclick=()=>{try{const active=pixels;pixels=composite();const r=svgSource();pixels=active;download(new Blob([r.source],{type:"image/svg+xml"}),filename("edited.svg"));}catch(e){announce(e.message);}};
 layerUI();
}
function mapAdv(fn){if(adv.layers[adv.active].locked)return announce("Layer locked");const before=histAdv();pixels=pixels.map(c=>c?hexRGB(fn(rgb(c))):null);adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();}
function transformAdv(k){if(adv.layers[adv.active].locked)return announce("Layer locked");const before=histAdv();let nw=width,nh=height,out;if(k==="neg")pixels=pixels.map(c=>c?hexRGB(rgb(c).map(v=>255-v)):null);else{if(k==="90"){nw=height;nh=width;}if(k==="crop"){const x=clamp(+$("crop-x").value,0,width-1),y=clamp(+$("crop-y").value,0,height-1);nw=clamp(+$("crop-w").value,1,width-x);nh=clamp(+$("crop-h").value,1,height-y);}out=Array(nw*nh).fill(null);for(let y=0;y<nh;y++)for(let x=0;x<nw;x++){let sx=x,sy=y;if(k==="h")sx=width-1-x;if(k==="v")sy=height-1-y;if(k==="180"){sx=width-1-x;sy=height-1-y;}if(k==="90"){sx=y;sy=height-1-x;}if(k==="crop"){sx+=+$("crop-x").value;sy+=+$("crop-y").value;}out[y*nw+x]=pixels[sy*width+sx];}width=nw;height=nh;pixels=out;$("image-width").value=width;$("image-height").value=height;}adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);updateCanvasDisplay();render();}
async function overlayAdv(e){const f=e.target.files&&e.target.files[0];if(!f)return;let b;try{b=await decodeImage(f);if(adv.layers[adv.active].locked)throw Error("Layer locked");const before=histAdv(),c=document.createElement("canvas");c.width=width;c.height=height;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(b,0,0,width,height);const d=x.getImageData(0,0,width,height).data;for(let i=0;i<pixels.length;i++)if(d[i*4+3]>20)pixels[i]=hex(d[i*4],d[i*4+1],d[i*4+2]);adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();}catch(err){announce(err.message);}finally{if(b&&b.close)b.close();e.target.value="";}}
function chromaAdv(){if(adv.layers[adv.active].locked)return announce("Layer locked");const before=histAdv(),key=$("adv-key").value,t=+$("adv-keytol").value;pixels=pixels.map(c=>dist(c,key)<=t?null:c);adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();}
function textAdv(){if(adv.layers[adv.active].locked)return announce("Layer locked");const before=histAdv(),c=document.createElement("canvas");c.width=width;c.height=height;const x=c.getContext("2d");x.fillStyle=color;x.font="bold "+clamp(+$("adv-textsize").value,6,96)+"px monospace";x.textBaseline="top";x.fillText($("adv-text").value,0,0,width);const d=x.getImageData(0,0,width,height).data;for(let i=0;i<pixels.length;i++)if(d[i*4+3]>128)pixels[i]=color;adv.layers[adv.active].pixels=pixels.slice();commitHistory(before);render();}
const paintAdv=paintBrush;paintBrush=function(x,y,v){if(adv.layers[adv.active].locked)return;const a=+$("adv-alpha")?.value||100;if(v&&a<100)v=mix(pixels[y*width+x],v,a/100);paintAdv(x,y,v);};
const floodAdv=flood;flood=function(x,y,next){if(adv.layers[adv.active].locked)return;const start=pixels[y*width+x];if(adv.bucket==="global"){pixels=pixels.map(c=>c===start?next:c);return;}if(adv.bucket==="similar"){const q=[y*width+x],seen=new Uint8Array(width*height);while(q.length){const i=q.pop();if(i<0||i>=pixels.length||seen[i]||dist(pixels[i],start)>adv.tol)continue;seen[i]=1;pixels[i]=next;const xx=i%width,yy=Math.floor(i/width);if(xx)q.push(i-1);if(xx<width-1)q.push(i+1);if(yy)q.push(i-width);if(yy<height-1)q.push(i+width);}return;}floodAdv(x,y,next);};
advPanel();render();layerUI();

})();