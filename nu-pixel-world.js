/* N.U World Renderer v0.2 — layered pixel horizon, procedural and source-neutral. */
(function(){
"use strict";
const canvas=document.getElementById("pixel-world");if(!canvas)return;
const ctx=canvas.getContext("2d",{alpha:true});if(!ctx)return;
const W=480,H=270;
let quality=4,raf=0,last=0,visible=true,started=false;
const reduce=typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
let phase="night",hour=0,camX=0,camY=0,weatherMode="sleep",particles=[],clouds=[],buildings=[],stars=[],traffic=[];
let seed=0x4e553031;
const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function makeWorld(){
 buildings=[];stars=[];clouds=[];particles=[];traffic=[];
 let x=-8;while(x<W+12){const w=13+rand()*29|0,h=16+rand()*66|0;buildings.push({x,w,h,d:rand(),windows:Array.from({length:Math.floor(w*h/95)},()=>({x:2+rand()*(w-4),y:3+rand()*(h-5),on:rand()>.68,phase:rand()*8}))});x+=w+3+rand()*9;}
 for(let i=0;i<100;i++)stars.push({x:rand()*W,y:rand()*155,r:rand()>.92?2:1,a:.25+rand()*.65,p:rand()*6});
 for(let i=0;i<7;i++)clouds.push({x:rand()*W,y:15+rand()*82,s:.6+rand()*.8,v:.04+rand()*.12});
 for(let i=0;i<34;i++)particles.push({a:rand()*Math.PI*2,r:rand()*160+18,z:.3+rand()*.7,s:.15+rand()*.6,seed:rand()*10});
 for(let i=0;i<8;i++)traffic.push({x:rand()*W,y:188+rand()*45,v:.25+rand()*.55,air:i%4===0});
}
function clock(){
 const d=new Date();hour=d.getHours()+d.getMinutes()/60;
 phase=hour<5.5||hour>=20.5?"night":hour<7.5?"dawn":hour<17.5?"day":"dusk";
 document.documentElement.dataset.worldTime=phase;
}
function sunPosition(){
 const angle=(hour-6)/12*Math.PI;return {x:W*(.5+.43*Math.cos(angle)),y:116-76*Math.sin(Math.max(0,angle))};
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
function poly(points,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill();}
function sky(){
 const pal=phase==="day"?["#426c85","#8ba5a0","#c6b49a"]:phase==="dawn"?["#202c49","#73566b","#d0937b"]:phase==="dusk"?["#18243c","#60465a","#b87970"]:["#050d20","#14243a","#263b4a"];
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,pal[0]);g.addColorStop(.62,pal[1]);g.addColorStop(1,pal[2]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 const sun=sunPosition();if(phase!=="night"){rect(sun.x-5,sun.y-5,10,10,phase==="dawn"||phase==="dusk"?"#ffd0a0":"#f5e1a6");rect(sun.x-9,sun.y-2,18,4,"#f5d6a0");}
 else{rect(386,42,13,13,"#d9e9f0");rect(390,39,8,3,"#d9e9f0");rect(393,52,4,3,"#a8c2d2");}
 if(phase==="night"){for(const s of stars){const a=reduce?s.a:s.a*(.7+.3*Math.sin(last*.001+s.p));rect(s.x,s.y,s.r,s.r,"rgba(220,239,255,"+a+")");}}
 // Thin, slow cloud banks; muted in study and almost still in sleep.
 for(const c of clouds){const x=(c.x+t*.002*c.v+camX*.05+W*4)%W;const alpha=phase==="day"?.12:.08;rect(x,c.y,24*c.s,2,"rgba(206,224,232,"+alpha+")");rect(x+5,c.y-2,12*c.s,2,"rgba(206,224,232,"+(alpha*.7)+")");}
}
function land(){
 // Far desert ridge and low mountains: no neon, low detail at distance.
 poly([[0,164],[0,142],[40,127],[83,143],[130,119],[179,145],[224,125],[273,148],[328,128],[376,144],[425,123],[480,145],[480,270],[0,270]],"#344653");
 poly([[0,175],[0,157],[54,147],[102,163],[151,144],[203,165],[252,149],[303,169],[351,146],[409,166],[452,151],[480,160],[480,270],[0,270]],"#263f46");
 // A quiet tropical coast at one edge, with dark forest belt at the other.
 rect(0,180,78,90,"#263e37");for(let i=0;i<16;i++){const x=i*6+(i*17%3);const top=161-(i*11%9);rect(x,top,3,14+(i*7%9),"#1c332f");rect(x-2,top-2,7,4,"#365342");}
 poly([[385,190],[480,181],[480,270],[395,270]],"#254b5a");poly([[390,192],[480,184],[480,190],[395,199]],"#9a9a7c");
 // River bends from the distant valley toward the foreground.
 poly([[210,173],[225,170],[251,190],[273,208],[306,230],[323,270],[284,270],[278,237],[248,214],[229,191]],"#356a78");
 poly([[218,176],[225,174],[252,196],[273,216],[301,239],[312,270],[301,270],[293,244],[266,221],[244,202]],"#6a9a9b");
 // Terraced fields / cultivated rows.
 for(let i=0;i<8;i++){const y=212+i*7;rect(0,y,105,2,i%2?"#405a3e":"#4b6242");for(let x=5;x<100;x+=12)rect(x,y-2,2,3,"#72825a");}
}
function city(t){
 // Far city silhouettes, progressively denser and larger toward the foreground.
 buildings.forEach((b,i)=>{const y=196-b.h*(.42+b.d*.58)+camY*.1;const x=b.x+camX*(.08+b.d*.2);const color=b.d<.35?"#253b4b":b.d<.7?"#1b3446":"#142b3e";rect(x,y,b.w,b.h,color);rect(x+1,y-2,b.w-2,2,"#3a5360");if(b.d>.75){for(const win of b.windows){if(!win.on)continue;const glow=phase==="night"?.75:phase==="dusk"?.34:phase==="dawn"?.2:.07;const flick=reduce?1:.85+.15*Math.sin(t*.001+win.phase);rect(x+win.x,y+win.y,2,2,"rgba(255,205,137,"+(glow*flick)+")");}}});
 // Sparse road lanes and distant traffic, only readable on nearer depth.
 rect(0,239,W,1,"rgba(155,184,173,.22)");
 if(!reduce){traffic.forEach((v,i)=>{v.x=(v.x+v.v*(weatherMode==="game"?1.8:weatherMode==="study"?.5:.18))%W;const y=v.y;rect(v.x,y,v.air?4:6,1,v.air?"#9ac5cf":"#d4b88a");if(v.air)rect(v.x+1,y-1,2,1,"#9ac5cf");});}
}
function weather(t){
 if(reduce)return;
 const count=quality<=2?7:quality<=5?15:26;
 for(let i=0;i<count;i++){const p=particles[i];let speed=p.s*(weatherMode==="game"?(0.8+p.r/150*2.2):weatherMode==="study"?.22:.07);p.r+=speed;if(p.r>230)p.r=12;const a=p.a+(weatherMode==="sleep"?t*.00003:weatherMode==="study"?t*.00008:0);const x=W/2+Math.cos(a)*p.r,y=H/2+Math.sin(a)*p.r*.56;const size=1+p.r/90*p.z;const alpha=clamp((p.r/230)*.55,0,.45);rect(x,y,size,size,"rgba(173,220,229,"+alpha+")");}
}
function draw(t){
 if(!visible||!started)return;const fps=quality<=2?12:quality<=4?16:quality<=7?20:24,interval=1000/fps;if(t-last<interval){raf=requestAnimationFrame(draw);return;}last=t;
 ctx.clearRect(0,0,W,H);sky();land();city(t);weather(t);
 // soft atmospheric haze between the city and the viewer
 const haze=ctx.createLinearGradient(0,150,0,H);haze.addColorStop(0,"rgba(175,204,199,.03)");haze.addColorStop(1,"rgba(4,13,24,.26)");ctx.fillStyle=haze;ctx.fillRect(0,150,W,120);
 raf=requestAnimationFrame(draw);
}
function resize(){canvas.width=W;canvas.height=H;if(reduce&&started)draw(performance.now());}
function setCamera(x,y){camX=clamp(x,-28,28);camY=clamp(y,-20,20);document.documentElement.style.setProperty("--camera-x",camX+"px");document.documentElement.style.setProperty("--camera-y",camY+"px");}
function start(){if(started)return;started=true;makeWorld();clock();resize();if(!reduce)raf=requestAnimationFrame(draw);else draw(performance.now());document.addEventListener("visibilitychange",()=>{visible=!document.hidden;if(visible){last=0;if(!reduce)raf=requestAnimationFrame(draw);else draw(performance.now());}else cancelAnimationFrame(raf);});window.addEventListener("resize",resize,{passive:true});setInterval(()=>{const old=phase;clock();if(reduce&&old!==phase)draw(performance.now());},30000);}
window.NUPixelWorld={setQuality(n){quality=clamp(Number(n)||4,1,10);},setCamera, lastTouchWasDrag:false, setWeatherMode(mode){if(["sleep","study","game"].includes(mode))weatherMode=mode;},getPhase(){return phase;}};
window.addEventListener("nu:calibrated",start,{once:true});
})();