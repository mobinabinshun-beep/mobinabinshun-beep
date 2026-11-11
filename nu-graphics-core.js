/* N.U Modular Graphics Runtime — Core Capability & Budget Engine
 * Platform-neutral browser adapter. It samples once, allocates budgets, then locks
 * the profile. It does not alter game rules, XP, Mana, HP, or network-test logic.
 */
(function(g){
"use strict";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let profile=null,started=false;
function detectPlatform(){
 const ua=navigator.userAgent||"";
 return /Android/i.test(ua)?"android":/iPhone|iPad|iPod/i.test(ua)?"ios":/Windows/i.test(ua)?"windows":/Macintosh/i.test(ua)?"macos":/Linux/i.test(ua)?"linux":"web";
}
function budget(level){
 const low=level<=2,mid=level<=5,high=level<=8;
 return Object.freeze({
  level, tier:low?"economy":mid?"balanced":high?"enhanced":"ultra",
  dpr:low?0.75:mid?1:high?1.25:1.5,
  backgroundFps:low?8:mid?12:high?18:24,
  overlayFps:low?8:mid?12:high?18:24,
  gameFps:low?24:mid?30:high?45:60,
  particles:low?0:mid?8:high?18:36,
  parallax:!low, glow:!low, textureReconstruction:level>=7,
  maxCanvasPixels:low?520000:mid?1100000:high?1900000:3000000
 });
}
async function start(existing){
 if(started)return profile;started=true;
 let sample=existing;
 if(!sample&&g.NU&&g.NU.samplePerformance)try{sample=await g.NU.samplePerformance();}catch(_){}
 let level=clamp(Number(sample&&sample.level)||3,1,10);
 const mem=Number(navigator.deviceMemory)||0,cores=Number(navigator.hardwareConcurrency)||0;
 const saveData=!!(navigator.connection&&navigator.connection.saveData);
 if(mem&&mem<=2)level=Math.min(level,2);
 else if(mem&&mem<=4)level=Math.min(level,5);
 if(cores&&cores<=4)level=Math.min(level,5);
 if(saveData)level=Math.min(level,2);
 const b=budget(level);
 profile=Object.freeze({platform:detectPlatform(),level,budget:b,locked:true,
  memoryGb:mem||null,logicalCores:cores||null,saveData,
  reducedMotion:!!(matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches),
  sampledAt:new Date().toISOString()});
 g.NUGraphicsProfile=profile;
 g.dispatchEvent(new CustomEvent("nu:graphics-profile",{detail:profile}));
 return profile;
}
g.NUGraphicsCore={start,getProfile:()=>profile,budget,platform:detectPlatform};
})(window);
