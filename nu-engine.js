/* N.U Adaptive Runtime v0.1 — conservative browser capability sampler. No stress testing. */
(function(global){
"use strict";
const STORAGE_KEY="nu-world-save-v1";
const defaults={xp:0,level:1,mana:0,xCredits:0,nCredits:0,upgrade:0};
function safeLoad(){try{return Object.assign({},defaults,JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"));}catch(_){return {...defaults};}}
function safeSave(data){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return true;}catch(_){return false;}}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function reducedMotion(){return !!(matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);}
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
function create(canvas){
 const ctx=canvas.getContext("2d",{alpha:true});
 let quality=5,raf=0,active=true,last=0,particles=[];
 function resize(){const dpr=Math.min(devicePixelRatio||1,quality>=8?1.5:1);canvas.width=Math.floor(canvas.clientWidth*dpr);canvas.height=Math.floor(canvas.clientHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:Math.max(12,quality*5)},()=>({x:Math.random()*canvas.clientWidth,y:Math.random()*canvas.clientHeight,r:.4+Math.random()*1.1,a:.12+Math.random()*.5,s:.04+Math.random()*.16,p:Math.random()*6.28}));}
 function draw(t){if(!active)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h){raf=requestAnimationFrame(draw);return;}const interval=quality<=3?1000/24:quality<=6?1000/30:1000/45;if(t-last<interval){raf=requestAnimationFrame(draw);return;}last=t;ctx.clearRect(0,0,w,h);for(const p of particles){p.p+=p.s*.02;const glow=.45+Math.sin(p.p)*.35;ctx.beginPath();ctx.fillStyle="rgba(157,220,255,"+(p.a*glow)+")";ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();if(quality>=7&&glow>.72){ctx.beginPath();ctx.strokeStyle="rgba(130,220,255,.15)";ctx.moveTo(p.x-3,p.y);ctx.lineTo(p.x+3,p.y);ctx.moveTo(p.x,p.y-3);ctx.lineTo(p.x,p.y+3);ctx.stroke();}}raf=requestAnimationFrame(draw);}
 resize();const observer=new ResizeObserver(resize);observer.observe(canvas);raf=requestAnimationFrame(draw);
 return {setQuality(n){quality=clamp(n,1,10);resize();},pause(){active=false;cancelAnimationFrame(raf);},resume(){if(!active){active=true;raf=requestAnimationFrame(draw);}},destroy(){active=false;cancelAnimationFrame(raf);observer.disconnect();}};
}
global.NU={defaults,load:safeLoad,save:safeSave,clamp,samplePerformance,create,storageKey:STORAGE_KEY};
})(window);