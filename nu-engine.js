/* N.U Adaptive Runtime v0.1 — conservative browser capability sampler. No stress testing. */
(function(global){
"use strict";
const STORAGE_KEY="nu-world-save-v1";
const defaults={xp:0,level:1,mana:0,xCredits:0,nCredits:0,upgrade:0};
function safeLoad(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"));}catch(_){return {...defaults};}}
function safeSave(data){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return true;}catch(_){return false;}}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function reducedMotion(){return !!(typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches);}
function samplePerformance(){
 const cores=navigator.hardwareConcurrency||2;
 const memory=navigator.deviceMemory||2;
 const saveData=!!(navigator.connection&&navigator.connection.saveData);
 const start=performance.now();let count=0;
 // Tiny fixed workload; stop after 3 frames or 24ms, whichever comes first.
 function frame(){count++;if(count<3&&performance.now()-start<24){requestAnimationFrame(frame);} }
 requestAnimationFrame(frame);
 return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const elapsed=performance.now()-start;
  let score=clamp(Math.round((cores/8)*3+(memory/8)*2+(elapsed<55?3:elapsed<85?2:1)-(saveData?2:0)),1,10);
  if(reducedMotion())score=Math.min(score,6);
  resolve({level:score,cores,memory,saveData,reducedMotion:reducedMotion(),sampleMs:Math.round(elapsed),frames:count});
 })));
}
async function sampleNetwork(){
 const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
 const probes=[];let failed=0;
 for(let i=0;i<4;i++){
  const started=performance.now();
  try{
   const response=await fetch("./README.md?nu_probe="+Date.now()+"_"+i,{cache:"no-store",credentials:"same-origin"});
   if(!response.ok)throw new Error("probe failed");
   await response.arrayBuffer();
   probes.push(Math.round(performance.now()-started));
  }catch(_){failed++;}
 }
 probes.sort((a,b)=>a-b);
 return {siteRttMs:probes.length?probes[Math.floor(probes.length/2)]:null,probeLossPercent:Math.round(failed/4*100),estimatedDownlinkMbps:conn&&typeof conn.downlink==="number"?conn.downlink:null,effectiveType:conn&&conn.effectiveType||"unknown",probes:probes.length};
}
function create(canvas){
 const ctx=canvas.getContext("2d",{alpha:true});
 let quality=5,raf=0,active=true,last=0,particles=[],pointerX=0,pointerY=0;
 function movePointer(e){if(reducedMotion())return;pointerX=((e.clientX/(global.innerWidth||1))-.5)*12;pointerY=((e.clientY/(global.innerHeight||1))-.5)*8;}
 global.addEventListener("pointermove",movePointer,{passive:true});
 function resize(){const dpr=Math.min(devicePixelRatio||1,quality>=8?1.5:1);canvas.width=Math.floor(canvas.clientWidth*dpr);canvas.height=Math.floor(canvas.clientHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:Math.max(12,quality*5)},()=>({x:Math.random()*canvas.clientWidth,y:Math.random()*canvas.clientHeight,r:.4+Math.random()*1.1,a:.12+Math.random()*.5,s:.04+Math.random()*.16,p:Math.random()*6.28}));}
 function draw(t){if(!active)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h){raf=requestAnimationFrame(draw);return;}const interval=quality<=3?1000/24:quality<=6?1000/30:1000/45;if(t-last<interval){raf=requestAnimationFrame(draw);return;}last=t;ctx.clearRect(0,0,w,h);for(const p of particles){p.p+=p.s*.02;const glow=.45+Math.sin(p.p)*.35;ctx.beginPath();ctx.fillStyle="rgba(157,220,255,"+(p.a*glow)+")";ctx.arc(p.x+pointerX*(p.r*.12),p.y+pointerY*(p.r*.12),p.r,0,Math.PI*2);ctx.fill();if(quality>=7&&glow>.72){ctx.beginPath();ctx.strokeStyle="rgba(130,220,255,.15)";ctx.moveTo(p.x-3,p.y);ctx.lineTo(p.x+3,p.y);ctx.moveTo(p.x,p.y-3);ctx.lineTo(p.x,p.y+3);ctx.stroke();}}raf=requestAnimationFrame(draw);}
 resize();const observer=typeof ResizeObserver!=="undefined"?new ResizeObserver(resize):null;if(observer)observer.observe(canvas);else global.addEventListener("resize",resize);raf=requestAnimationFrame(draw);
 return {setQuality(n){quality=clamp(n,1,10);resize();},pause(){active=false;cancelAnimationFrame(raf);},resume(){if(!active){active=true;raf=requestAnimationFrame(draw);}},destroy(){active=false;cancelAnimationFrame(raf);if(observer)observer.disconnect();else global.removeEventListener("resize",resize);global.removeEventListener("pointermove",movePointer);}};
}
global.NU={defaults,load:safeLoad,save:safeSave,clamp,samplePerformance,sampleNetwork,create,storageKey:STORAGE_KEY};
})(window);