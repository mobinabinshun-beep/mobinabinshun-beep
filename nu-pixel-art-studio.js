/* N.U Pixel Art Studio v1.0 — local-only pixel editor and SVG exporter. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const canvas=$("pixel-canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true});
const defaults=["#111827","#243447","#3e596b","#78909c","#d8e2e8","#ffffff","#a63c50","#e45b63","#f29c67","#e8b94f","#f8dc86","#76a86c","#3f795e","#4b9cba","#5577b8","#8a6bb5"];
let width=32,height=32,pixels=Array(width*height).fill(null),palette=defaults.slice(),color="#e8b94f",tool="pencil",drawing=false,strokeSnapshot=null,undoStack=[],redoStack=[],imageImported=false,qualityProfile=null,workspace={width:760,height:560,zoom:100},resizeLock=true,lastDimension="width";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function announce(msg){$("studio-status").textContent=msg;}
function snapshot(){return {width,height,pixels:pixels.slice()};}
function commitHistory(before){if(!before)return;undoStack.push(before);if(undoStack.length>60)undoStack.shift();redoStack=[];historyButtons();}
function restore(s){width=s.width;height=s.height;pixels=s.pixels.slice();$("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();render();}
function historyButtons(){$("undo").disabled=!undoStack.length;$("redo").disabled=!redoStack.length;}
function cellLimit(){const b=qualityProfile&&qualityProfile.budget;return b?Math.max(65536,Math.floor(b.maxCanvasPixels)):262144;}
function updateCounters(){const count=pixels.reduce((n,p)=>n+(p?1:0),0);$("canvas-size").textContent=width+" × "+height+" px";$("pixel-count").textContent=count+" painted pixels";$("zoom-note").textContent=workspace.zoom+"% view · "+(qualityProfile?qualityProfile.tier:"balanced");}
function updateCanvasDisplay(){canvas.width=width;canvas.height=height;canvas.style.width=Math.round(workspace.width*workspace.zoom/100)+"px";canvas.style.maxWidth="none";canvas.style.height="auto";canvas.style.aspectRatio=width+" / "+height;$("workspace-frame").style.width=workspace.width+"px";$("workspace-frame").style.maxWidth="none";$("workspace-frame").style.height=workspace.height+"px";$("workspace-frame").style.minHeight="180px";$("workspace-frame").style.maxHeight="70vh";$("workspace-frame").style.overflow="auto";$("workspace-frame").style.resize="both";$("workspace-width").value=workspace.width;$("workspace-height").value=workspace.height;$("workspace-zoom").value=workspace.zoom;$("workspace-width-value").textContent=workspace.width+" px";$("workspace-height-value").textContent=workspace.height+" px";$("workspace-zoom-value").textContent=workspace.zoom+"%";}
function render(){
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 ctx.clearRect(0,0,width,height);
 for(let i=0;i<pixels.length;i++){if(!pixels[i])continue;ctx.fillStyle=pixels[i];ctx.fillRect(i%width,Math.floor(i/width),1,1);}
 if($("show-grid")?.checked!==false&&Math.max(width,height)<=128){ctx.strokeStyle="rgba(120,150,180,.24)";ctx.lineWidth=Math.max(.025,.035* Math.min(width,height)/32);ctx.beginPath();for(let n=1;n<width;n++){ctx.moveTo(n,0);ctx.lineTo(n,height);}for(let n=1;n<height;n++){ctx.moveTo(0,n);ctx.lineTo(width,n);}ctx.stroke();}
 updateCounters();
}
function resizeArtwork(nextW,nextH,method="nearest"){nextW=clamp(Math.round(nextW),1,2048);nextH=clamp(Math.round(nextH),1,2048);if(nextW*nextH>cellLimit()){announce("This device profile allows up to "+cellLimit().toLocaleString()+" editable pixels. Reduce the dimensions or choose a lighter workspace.");return false;}const before=snapshot(),next=Array(nextW*nextH).fill(null);for(let y=0;y<nextH;y++)for(let x=0;x<nextW;x++){const sx=Math.min(width-1,Math.floor((x+.5)*width/nextW)),sy=Math.min(height-1,Math.floor((y+.5)*height/nextH));next[y*nextW+x]=pixels[sy*width+sx];}width=nextW;height=nextH;pixels=next;commitHistory(before);$("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();render();announce("Artwork resized to "+width+" × "+height+" px using "+method+" sampling. Original import remains unchanged outside the working copy.");return true;}
function initAdaptive(){const fallback=()=>{qualityProfile={tier:"balanced",level:3,budget:{maxCanvasPixels:262144,dpr:1},reducedMotion:false};$("quality-profile").textContent="Balanced · fallback";};if(!window.NUGraphicsCore){fallback();return;}window.NUGraphicsCore.start().then(p=>{qualityProfile=p;$("quality-profile").textContent=p.tier+" · level "+p.level;$("quality-detail").textContent="Editable pixel budget: "+cellLimit().toLocaleString()+" cells";updateCounters();}).catch(fallback);}
function applyWorkspace(){workspace.width=clamp(Number($("workspace-width").value)||760,240,1600);workspace.height=clamp(Number($("workspace-height").value)||560,180,1100);workspace.zoom=clamp(Number($("workspace-zoom").value)||100,25,400);updateCanvasDisplay();updateCounters();}
$("workspace-width").addEventListener("input",applyWorkspace);$("workspace-height").addEventListener("input",applyWorkspace);$("workspace-zoom").addEventListener("input",applyWorkspace);
$("workspace-frame").addEventListener("pointerup",()=>{const r=$("workspace-frame").getBoundingClientRect();workspace.width=Math.round(r.width);workspace.height=Math.round(r.height);updateCanvasDisplay();});
$("image-lock").addEventListener("change",e=>{resizeLock=e.target.checked;});
$("image-width").addEventListener("input",()=>{lastDimension="width";});$("image-height").addEventListener("input",()=>{lastDimension="height";});$("apply-image-size").addEventListener("click",()=>{let w=clamp(Number($("image-width").value)||width,1,2048),h=clamp(Number($("image-height").value)||height,1,2048);if(resizeLock){const ratio=width/height;if(lastDimension==="width")h=Math.max(1,Math.round(w/ratio));else w=Math.max(1,Math.round(h*ratio));}$("image-width").value=w;$("image-height").value=h;resizeArtwork(w,h,"nearest-neighbor");});
function renderPalette(){const root=$("palette");root.innerHTML="";palette.forEach((c,i)=>{const b=document.createElement("button");b.type="button";b.className="swatch";b.style.background=c;b.title=c;b.setAttribute("aria-label","Palette color "+c);b.setAttribute("aria-pressed",String(c.toLowerCase()===color.toLowerCase()));b.addEventListener("click",()=>{color=c;$("custom-color").value=c;renderPalette();});root.appendChild(b);});const transparent=document.createElement("button");transparent.type="button";transparent.className="swatch";transparent.setAttribute("aria-label","Transparent");transparent.title="Transparent / eraser";transparent.addEventListener("click",()=>setTool("eraser"));root.appendChild(transparent);}
function setTool(next){tool=next;document.querySelectorAll("[data-tool]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tool===tool)));canvas.style.cursor=tool==="picker"?"copy":tool==="eraser"?"cell":"crosshair";}
function coords(e){const r=canvas.getBoundingClientRect();return {x:clamp(Math.floor((e.clientX-r.left)/r.width*width),0,width-1),y:clamp(Math.floor((e.clientY-r.top)/r.height*height),0,height-1)};}
function put(x,y,value){pixels[y*width+x]=value;}
function flood(x,y,next){const start=pixels[y*width+x];if(start===next)return;const stack=[[x,y]],seen=new Uint8Array(width*height);while(stack.length){const [cx,cy]=stack.pop(),i=cy*width+cx;if(cx<0||cy<0||cx>=width||cy>=height||seen[i]||pixels[i]!==start)continue;seen[i]=1;pixels[i]=next;stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);}}
function paintAt(e){const p=coords(e),i=p.y*width+p.x;if(tool==="picker"){if(pixels[i]){color=pixels[i];$("custom-color").value=color;renderPalette();}return;}if(tool==="fill"){flood(p.x,p.y,color);render();return;}put(p.x,p.y,tool==="eraser"?null:color);render();}
canvas.addEventListener("pointerdown",e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;strokeSnapshot=snapshot();if(tool==="fill"||tool==="picker"){paintAt(e);if(tool==="fill")commitHistory(strokeSnapshot);drawing=false;strokeSnapshot=null;return;}paintAt(e);});
canvas.addEventListener("pointermove",e=>{if(drawing&&(e.buttons||e.pointerType==="touch"))paintAt(e);});
function endStroke(){if(!drawing)return;drawing=false;commitHistory(strokeSnapshot);strokeSnapshot=null;}
canvas.addEventListener("pointerup",endStroke);canvas.addEventListener("pointercancel",endStroke);canvas.addEventListener("lostpointercapture",endStroke);
document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
$("custom-color").addEventListener("input",e=>{color=e.target.value.toLowerCase();renderPalette();setTool("pencil");});
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
 if(!file.type.startsWith("image/")){announce("Please choose a supported image file.");return;}
 try{
  const bitmap=await decodeImage(file),maxSide=Number($("import-resolution").value)||128,scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  let nextW=Math.max(1,Math.round(bitmap.width*scale)),nextH=Math.max(1,Math.round(bitmap.height*scale));
  const budgetScale=Math.min(1,Math.sqrt(cellLimit()/(nextW*nextH)));nextW=Math.max(1,Math.floor(nextW*budgetScale));nextH=Math.max(1,Math.floor(nextH*budgetScale));
  const temp=document.createElement("canvas");temp.width=nextW;temp.height=nextH;const t=temp.getContext("2d",{willReadFrequently:true});
  t.imageSmoothingEnabled=true;t.imageSmoothingQuality="high";t.drawImage(bitmap,0,0,nextW,nextH);bitmap.close&&bitmap.close();
  const data=t.getImageData(0,0,nextW,nextH).data,alphaCutoff=Number($("alpha-cutoff").value)||0,extracted=imagePalette(data,Number($("palette-limit").value)||16,alphaCutoff);
  if(!extracted.length)throw new Error("The image contains no visible pixels above the transparency cutoff.");
  const before=snapshot();width=nextW;height=nextH;pixels=Array(width*height).fill(null);
  for(let i=0;i<width*height;i++){if(data[i*4+3]<=alphaCutoff)continue;pixels[i]=nearest([data[i*4],data[i*4+1],data[i*4+2]],extracted);}
  palette=extracted;commitHistory(before);imageImported=true;$("image-width").value=width;$("image-height").value=height;updateCanvasDisplay();renderPalette();render();
  announce("Imported locally · "+file.name+" · "+width+" × "+height+" px · "+palette.length+" optimized colors.");
 }catch(err){announce("Image import failed: "+(err&&err.message?err.message:"unsupported image"));}
 finally{e.target.value="";}
});
$("extract-palette").addEventListener("click",()=>{if(!imageImported){announce("Import an image first to extract its palette.");return;}const counts=new Map();pixels.filter(Boolean).forEach(c=>counts.set(c,(counts.get(c)||0)+1));palette=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,16).map(x=>x[0]);if(!palette.length)palette=defaults.slice();renderPalette();announce("Palette extracted from current artwork.");});
function svgSource(){if(!window.NUSVGVectorizer)throw new Error("SVG vector engine did not load. Refresh the studio and try again.");return window.NUSVGVectorizer.vectorize(pixels,width,height,{mode:$("vector-mode").value});}
function filename(ext){let n=$("export-name").value.trim().replace(/[^a-z0-9-_]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,48)||"nu-pixel-art";return n+"."+ext;}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$("export-svg").addEventListener("click",()=>{try{const result=svgSource();download(new Blob([result.source],{type:"image/svg+xml;charset=utf-8"}),filename("svg"));announce("SVG exported · "+result.pathCount+" vector paths · "+result.colorCount+" colors · transparent background.");}catch(err){announce("SVG export failed: "+err.message);}});
$("export-svg-copy").addEventListener("click",async()=>{try{const result=svgSource();await navigator.clipboard.writeText(result.source);announce("SVG source copied · "+result.pathCount+" paths · "+result.colorCount+" colors.");}catch(err){announce("Clipboard unavailable: "+err.message+" · use Download SVG.");}});
$("export-png").addEventListener("click",()=>{const out=document.createElement("canvas");out.width=width*16;out.height=height*16;const o=out.getContext("2d");o.imageSmoothingEnabled=false;pixels.forEach((c,i)=>{if(!c)return;o.fillStyle=c;o.fillRect((i%width)*16,Math.floor(i/width)*16,16,16);});out.toBlob(blob=>{if(blob)download(blob,filename("png"));},"image/png");});
$("show-grid")?.addEventListener("change",render);
renderPalette();updateCanvasDisplay();render();setTool("pencil");historyButtons();initAdaptive();
})();