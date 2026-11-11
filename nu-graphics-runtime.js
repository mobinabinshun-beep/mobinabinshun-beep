/* N.U Graphics Runtime v0.3 — shared budget and image-first scene orchestration. */
(function(g){
"use strict";
let running=false,observer=null;
function modeFromPage(){
 const active=id=>{const el=document.getElementById(id);return !!(el&&el.classList.contains("active"));};
 if(active("article-view"))return "focus";
 if(active("game-view"))return "game";
 return "ambient";
}
function syncPageState(){
 const intro=document.getElementById("intro"),menu=document.getElementById("menu"),profile= document.getElementById("profile-view"),shop=document.getElementById("shop-view");
 const frozen=!!((intro&&!intro.classList.contains("hidden"))||(menu&&menu.classList.contains("open"))||activeClass(profile)||activeClass(shop));
 g.NUBackgroundEngine&&g.NUBackgroundEngine.setFrozen(frozen);
 g.NUBackgroundEngine&&g.NUBackgroundEngine.setMode(modeFromPage());
}
function activeClass(el){return !!(el&&el.classList.contains("active"));}
function watchPage(){
 if(observer||!document.body)return;
 observer=new MutationObserver(syncPageState);
 observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"]});
 syncPageState();
}
async function start(sample){
 if(running)return;running=true;
 try{
  const p=await g.NUGraphicsCore.start(sample);
  if(g.NUPixelWorld&&g.NUPixelWorld.setQuality)g.NUPixelWorld.setQuality(p.level);
  g.NUBackgroundEngine.mount();g.NUBackgroundEngine.setQuality(p.budget);
  if(g.NUBackgroundEngine.getStatus().loaded&&g.NUPixelWorld&&g.NUPixelWorld.setEnabled)g.NUPixelWorld.setEnabled(false);
  g.NUDynamicLayers.apply(p);g.NUGameRenderAdapter.apply(p);
  watchPage();
  g.dispatchEvent(new CustomEvent("nu:graphics-ready",{detail:{profile:p,background:g.NUBackgroundEngine.getStatus()}}));
 }catch(error){running=false;console.warn("N.U graphics runtime fallback",error);if(g.NUPixelWorld&&g.NUPixelWorld.setEnabled)g.NUPixelWorld.setEnabled(true);}
}
g.NUGraphicsRuntime={start,setGameActive(active){const mode=active?"game":"ambient";g.NUBackgroundEngine&&g.NUBackgroundEngine.setMode(mode);g.NUDynamicLayers&&g.NUDynamicLayers.setMode(mode);},setMode(mode){g.NUBackgroundEngine&&g.NUBackgroundEngine.setMode(mode);g.NUDynamicLayers&&g.NUDynamicLayers.setMode(mode);}};
g.addEventListener("nu:calibrated",event=>start(event&&event.detail&&event.detail.performance),{once:true});
document.addEventListener("DOMContentLoaded",()=>{g.NUBackgroundEngine&&g.NUBackgroundEngine.mount();watchPage();},{once:true});
})(window);
