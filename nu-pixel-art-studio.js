/* N.U Pixel Art Studio v1.0 — local-only pixel editor and SVG exporter. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const canvas=$("pixel-canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true});
const defaults=["#111827","#243447","#3e596b","#78909c","#d8e2e8","#ffffff","#a63c50","#e45b63","#f29c67","#e8b94f","#f8dc86","#76a86c","#3f795e","#4b9cba","#5577b8","#8a6bb5"];
let size=32,pixels=Array(size*size).fill(null),palette=defaults.slice(),color="#e8b94f",tool="pencil",drawing=false,strokeSnapshot=null,undoStack=[],redoStack=[],imageImported=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function announce(msg){$("studio-status").textContent=msg;}
function snapshot(){return pixels.slice();}
function commitHistory(before){if(!before)return;undoStack.push(before);if(undoStack.length>80)undoStack.shift();redoStack=[];historyButtons();}
function historyButtons(){$("undo").disabled=!undoStack.length;$("redo").disabled=!redoStack.length;}
function updateCounters(){const count=pixels.reduce((n,p)=>n+(p?1:0),0);$("canvas-size").textContent=size+" × "+size+" px grid";$("pixel-count").textContent=count+" painted pixels";}
function render(){
 canvas.width=size;canvas.height=size;ctx.clearRect(0,0,size,size);
 for(let i=0;i<pixels.length;i++){if(!pixels[i])continue;ctx.fillStyle=pixels[i];ctx.fillRect(i%size,Math.floor(i/size),1,1);}
 if($("show-grid")?.checked!==false&&size<=48){ctx.strokeStyle="rgba(120,150,180,.24)";ctx.lineWidth=.035;ctx.beginPath();for(let n=1;n<size;n++){ctx.moveTo(n,0);ctx.lineTo(n,size);ctx.moveTo(0,n);ctx.lineTo(size,n);}ctx.stroke();}
 updateCounters();
}
function renderPalette(){const root=$("palette");root.innerHTML="";palette.forEach((c,i)=>{const b=document.createElement("button");b.type="button";b.className="swatch";b.style.background=c;b.title=c;b.setAttribute("aria-label","Palette color "+c);b.setAttribute("aria-pressed",String(c.toLowerCase()===color.toLowerCase()));b.addEventListener("click",()=>{color=c;$("custom-color").value=c;renderPalette();});root.appendChild(b);});const transparent=document.createElement("button");transparent.type="button";transparent.className="swatch";transparent.setAttribute("aria-label","Transparent");transparent.title="Transparent / eraser";transparent.addEventListener("click",()=>setTool("eraser"));root.appendChild(transparent);}
function setTool(next){tool=next;document.querySelectorAll("[data-tool]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tool===tool)));canvas.style.cursor=tool==="picker"?"copy":tool==="eraser"?"cell":"crosshair";}
function coords(e){const r=canvas.getBoundingClientRect();return {x:clamp(Math.floor((e.clientX-r.left)/r.width*size),0,size-1),y:clamp(Math.floor((e.clientY-r.top)/r.height*size),0,size-1)};}
function put(x,y,value){pixels[y*size+x]=value;}
function flood(x,y,next){const start=pixels[y*size+x];if(start===next)return;const stack=[[x,y]],seen=new Uint8Array(size*size);while(stack.length){const [cx,cy]=stack.pop(),i=cy*size+cx;if(cx<0||cy<0||cx>=size||cy>=size||seen[i]||pixels[i]!==start)continue;seen[i]=1;pixels[i]=next;stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);}}
function paintAt(e){const p=coords(e),i=p.y*size+p.x;if(tool==="picker"){if(pixels[i]){color=pixels[i];$("custom-color").value=color;renderPalette();}return;}if(tool==="fill"){flood(p.x,p.y,color);render();return;}put(p.x,p.y,tool==="eraser"?null:color);render();}
canvas.addEventListener("pointerdown",e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;strokeSnapshot=snapshot();if(tool==="fill"||tool==="picker"){paintAt(e);if(tool==="fill")commitHistory(strokeSnapshot);drawing=false;strokeSnapshot=null;return;}paintAt(e);});
canvas.addEventListener("pointermove",e=>{if(drawing&&(e.buttons||e.pointerType==="touch"))paintAt(e);});
function endStroke(){if(!drawing)return;drawing=false;commitHistory(strokeSnapshot);strokeSnapshot=null;}
canvas.addEventListener("pointerup",endStroke);canvas.addEventListener("pointercancel",endStroke);canvas.addEventListener("lostpointercapture",endStroke);
document.querySelectorAll("[data-tool]").forEach(b=>b.addEventListener("click",()=>setTool(b.dataset.tool)));
$("custom-color").addEventListener("input",e=>{color=e.target.value.toLowerCase();renderPalette();setTool("pencil");});
function resetGrid(next){size=next;pixels=Array(size*size).fill(null);undoStack=[];redoStack=[];imageImported=false;historyButtons();render();announce("New "+size+" × "+size+" transparent canvas.");}
$("grid-size").addEventListener("change",e=>resetGrid(Number(e.target.value)));
$("new-canvas").addEventListener("click",()=>resetGrid(size));
$("clear-canvas").addEventListener("click",()=>{const before=snapshot();pixels.fill(null);commitHistory(before);render();announce("Canvas cleared.");});
$("undo").addEventListener("click",()=>{if(!undoStack.length)return;redoStack.push(snapshot());pixels=undoStack.pop();historyButtons();render();});
$("redo").addEventListener("click",()=>{if(!redoStack.length)return;undoStack.push(snapshot());pixels=redoStack.pop();historyButtons();render();});
function quantize(v){return Math.round(v/17)*17;}
function hex(r,g,b){return "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");}
function nearest(rgb,colors){let best=colors[0],dist=Infinity;for(const c of colors){const n=[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)],d=(rgb[0]-n[0])**2+(rgb[1]-n[1])**2+(rgb[2]-n[2])**2;if(d<dist){dist=d;best=c;}}return best;}
function imagePalette(data){const hist=new Map();for(let i=0;i<data.length;i+=4){if(data[i+3]<32)continue;const c=hex(quantize(data[i]),quantize(data[i+1]),quantize(data[i+2]));hist.set(c,(hist.get(c)||0)+1);}return [...hist.entries()].sort((a,b)=>b[1]-a[1]).slice(0,16).map(x=>x[0]);}
$("image-file").addEventListener("change",async e=>{const file=e.target.files&&e.target.files[0];if(!file)return;if(!file.type.startsWith("image/")){announce("Please choose an image file.");return;}try{const bitmap=await createImageBitmap(file);const temp=document.createElement("canvas");temp.width=size;temp.height=size;const t=temp.getContext("2d",{willReadFrequently:true});const scale=Math.min(size/bitmap.width,size/bitmap.height),w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale)),x=Math.floor((size-w)/2),y=Math.floor((size-h)/2);t.clearRect(0,0,size,size);t.imageSmoothingEnabled=false;t.drawImage(bitmap,x,y,w,h);bitmap.close&&bitmap.close();const data=t.getImageData(0,0,size,size).data;const extracted=imagePalette(data);if(extracted.length)palette=extracted;const before=snapshot();pixels=Array(size*size).fill(null);for(let i=0;i<size*size;i++){const a=data[i*4+3];if(a<32)continue;pixels[i]=nearest([data[i*4],data[i*4+1],data[i*4+2]],palette);}commitHistory(before);imageImported=true;renderPalette();render();announce("Imported locally · "+file.name+" · "+palette.length+" palette colors.");}catch(err){announce("Image import failed: "+(err&&err.message?err.message:"unsupported image"));}finally{e.target.value="";}});
$("extract-palette").addEventListener("click",()=>{if(!imageImported){announce("Import an image first to extract its palette.");return;}const counts=new Map();pixels.filter(Boolean).forEach(c=>counts.set(c,(counts.get(c)||0)+1));palette=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,16).map(x=>x[0]);if(!palette.length)palette=defaults.slice();renderPalette();announce("Palette extracted from current artwork.");});
function svgSource(){const groups=new Map();pixels.forEach((c,i)=>{if(!c)return;if(!groups.has(c))groups.set(c,[]);groups.get(c).push("M"+(i%size)+" "+Math.floor(i/size)+"h1v1h-1z");});const body=[...groups.entries()].map(([c,paths])=>'<path fill="'+c+'" d="'+paths.join("")+'"/>').join("\n");return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" shape-rendering="crispEdges" role="img" aria-labelledby="title desc">\n<title id="title">N.U Pixel Art</title>\n<desc id="desc">Pixel artwork exported from N.U Pixel Art Studio.</desc>\n<g>'+body+'</g>\n</svg>\n';}
function filename(ext){let n=$("export-name").value.trim().replace(/[^a-z0-9-_]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,48)||"nu-pixel-art";return n+"."+ext;}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$("export-svg").addEventListener("click",()=>{const src=svgSource();download(new Blob([src],{type:"image/svg+xml;charset=utf-8"}),filename("svg"));announce("SVG exported · vector pixels · transparent background.");});
$("export-svg-copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(svgSource());announce("SVG source copied to clipboard.");}catch(_){announce("Clipboard permission unavailable; use Download SVG.");}});
$("export-png").addEventListener("click",()=>{const out=document.createElement("canvas");out.width=size*16;out.height=size*16;const o=out.getContext("2d");o.imageSmoothingEnabled=false;o.drawImage(canvas,0,0,out.width,out.height);out.toBlob(blob=>{if(blob)download(blob,filename("png"));},"image/png");});
$("show-grid")?.addEventListener("change",render);
renderPalette();render();setTool("pencil");historyButtons();
})();