/* N.U Pixel World v0.1 — independent, low-resolution parallax city layer. */
(function(){
"use strict";
const canvas=document.getElementById("pixel-world");
if(!canvas)return;
const ctx=canvas.getContext("2d",{alpha:true});
const W=320,H=180;
let quality=4,raf=0,last=0,visible=true,reduced=!!(matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
let px=0,py=0,phase="night",seed=20261109,buildings=[],stars=[];
function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function makeCity(){
 buildings=[];stars=[];
 let x=-5;
 while(x<W+8){const width=10+Math.floor(rand()*19),height=19+Math.floor(rand()*57);buildings.push({x,width,height,shade:Math.floor(rand()*3),windows:Array.from({length:Math.floor(width*height/34)},()=>({x:2+Math.floor(rand()*Math.max(3,width-4)),y:4+Math.floor(rand()*Math.max(5,height-6)),on:rand()>.48,t:rand()*6}))});x+=width+2+Math.floor(rand()*5);}
 for(let i=0;i<64;i++)stars.push({x:Math.floor(rand()*W),y:Math.floor(rand()*105),a:.2+rand()*.65,p:rand()*6});
}
function skyColors(){return phase==="day"?["#29495d","#496477","#b18b7c"]:phase==="dawn"?["#252a43","#594357","#b17b78"]:phase==="dusk"?["#1b2038","#44334b","#976878"]:["#070f20","#111d34","#26394a"];}
function updatePhase(){const h=new Date().getHours();phase=h>=6&&h<10?"dawn":h>=10&&h<17?"day":h>=17&&h<20?"dusk":"night";document.documentElement.dataset.worldTime=phase;}
function resize(){canvas.width=W;canvas.height=H;canvas.style.imageRendering="pixelated";}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
function draw(t){
 if(!visible)return;
 const fps=quality<=2?12:quality<=4?16:quality<=7?20:24,interval=1000/fps;
 if(t-last<interval){raf=requestAnimationFrame(draw);return;}last=t;
 const colors=skyColors();ctx.clearRect(0,0,W,H);
 const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,colors[0]);grad.addColorStop(.66,colors[1]);grad.addColorStop(1,colors[2]);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 // Pixel moon / sun, with restrained glow made from stepped translucent blocks.
 if(phase==="night"){rect(245+px*.08,25+py*.05,11,11,"#d7e8ed");rect(248+px*.08,22+py*.05,7,3,"#d7e8ed");rect(252+px*.08,29+py*.05,3,4,"#9cb9cc");}
 else{rect(236+px*.08,30+py*.05,12,12,phase==="dawn"?"#f2b18d":"#eacb91");rect(233+px*.08,33+py*.05,18,6,"#eacb91");}
 if(phase!=="day"){for(let i=0;i<(quality<=2?16:quality<=5?32:56);i++){const s=stars[i];const tw=reduced?.45:(.45+Math.sin(t*.001+s.p)*.25);rect(s.x,s.y,1,1,"rgba(220,239,255,"+(s.a*tw)+")");}}
 // Far skyline: sparse, low contrast, deliberately irregular.
 const drift=px*.35;
 buildings.forEach((b,i)=>{const y=H-b.height*.58-15+py*.12;const shade=["#14283a","#172d40","#1a3042"][b.shade];rect(b.x+drift,y,b.width,b.height,shade);rect(b.x+drift+2,y-2,Math.max(2,b.width-4),2,"#29475a");if(b.width>17&&i%4===0)rect(b.x+drift+b.width*.45,y-5,3,5,"#203b50");});
 // Near skyline and window lights.
 buildings.forEach((b,i)=>{const y=H-b.height-9+py*.24;const shade=["#0b1a2a","#0d2031","#102538"][b.shade];rect(b.x+px*.72,y,b.width,b.height,shade);rect(b.x+px*.72+1,y-2,Math.max(2,b.width-2),2,"#345064");b.windows.forEach((w,j)=>{if(!w.on)return;const flicker=reduced?1:(Math.sin(t*.001+w.t+i)*.16+.84);const color=phase==="day"?"rgba(127,178,184,.32)":phase==="dawn"?"rgba(255,190,139,"+(flicker*.72)+")":"rgba(119,220,255,"+(flicker*.85)+")";rect(b.x+px*.72+w.x,y+w.y,2,2,color);});});
 // Distant horizon glow and restrained pixel particles.
 rect(0,H-8,W,8,"rgba(5,13,23,.68)");rect(0,H-9,W,1,"rgba(110,191,219,.28)");
 if(!reduced){const count=quality<=2?3:quality<=5?6:10;for(let i=0;i<count;i++){const x=(i*47+Math.floor(t*.006*(i%2?1:-1))+W*4)%W,y=65+(i*29)%85;rect(x,y,1,1,"rgba(128,222,255,.55)");}}
 raf=requestAnimationFrame(draw);
}
function onPointer(e){if(reduced||e.pointerType==="touch")return;px=Math.max(-8,Math.min(8,(e.clientX/innerWidth-.5)*16));py=Math.max(-5,Math.min(5,(e.clientY/innerHeight-.5)*10));}
function onVisibility(){visible=!document.hidden;if(visible){last=0;raf=requestAnimationFrame(draw);}else cancelAnimationFrame(raf);}
function start(){resize();makeCity();updatePhase();window.addEventListener("pointermove",onPointer,{passive:true});document.addEventListener("visibilitychange",onVisibility);window.addEventListener("resize",resize,{passive:true});raf=requestAnimationFrame(draw);setInterval(updatePhase,60000);}
window.NUPixelWorld={setQuality(n){quality=Math.max(1,Math.min(10,Number(n)||4));},destroy(){cancelAnimationFrame(raf);window.removeEventListener("pointermove",onPointer);document.removeEventListener("visibilitychange",onVisibility);}};
start();
})();