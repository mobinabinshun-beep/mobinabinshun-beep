/* N.U Graphics Runtime v0.4 — canonical image base; legacy overlays quarantined. */
(function(g){
"use strict";
let running=false,observer=null;
function activeClass(el){return !!(el&&el.classList.contains("active"));}
function modeFromPage(){
 const active=id=>{const el=document.getElementById(id);return !!(el&&el.classList.contains("active"));};
 if(active("article-view"))return "focus";
 if(active("game-view"))return "game";
 return "ambient";
}
function syncPageState(){
 const intro=document.getElementById("intro"),menu=document.getElementById("menu"),profile=document.getElementById("profile-view"),shop=document.getElementById("shop-view");
 const frozen=!!((intro&&!intro.classList.contains("hidden"))||(menu&&menu.classList.contains("open"))||activeClass(profile)||activeClass(shop));
 g.NUBackgroundEngine&&g.NUBackgroundEngine.setFrozen(frozen);
 g.NUBackgroundEngine&&g.NUBackgroundEngine.setMode(modeFromPage());
}
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
  g.NUBackgroundEngine.mount();
  g.NUBackgroundEngine.setQuality(p.budget);
  g.NUGameRenderAdapter.apply(p);
  watchPage();
  // Keep the established world renderer alive unless the canonical image has
  // actually loaded. A failed/empty asset must never blank the playable world.
  function applyVisualPolicy(){
   const status=g.NUBackgroundEngine.getStatus();
   if(status.loaded){
    g.NUDynamicLayers&&g.NUDynamicLayers.stop&&g.NUDynamicLayers.stop();
    g.NUPixelWorld&&g.NUPixelWorld.setEnabled&&g.NUPixelWorld.setEnabled(false);
   }else{
    g.NUPixelWorld&&g.NUPixelWorld.setQuality&&g.NUPixelWorld.setQuality(p.quality||5);
    g.NUPixelWorld&&g.NUPixelWorld.setEnabled&&g.NUPixelWorld.setEnabled(true);
    g.NUDynamicLayers&&g.NUDynamicLayers.apply&&g.NUDynamicLayers.apply(p);
   }
   g.dispatchEvent(new CustomEvent("nu:graphics-ready",{detail:{profile:p,background:status,visualOverlays:status.loaded?"image-first":"procedural-fallback"}}));
  }
  g.addEventListener("nu:background-ready",applyVisualPolicy,{once:true});
  g.addEventListener("nu:background-missing",applyVisualPolicy,{once:true});
  applyVisualPolicy();
 }catch(error){running=false;console.warn("N.U graphics runtime fallback",error);}
}
g.NUGraphicsRuntime={start,setGameActive(active){const mode=active?"game":"ambient";g.NUBackgroundEngine&&g.NUBackgroundEngine.setMode(mode);},setMode(mode){g.NUBackgroundEngine&&g.NUBackgroundEngine.setMode(mode);}};
g.addEventListener("nu:calibrated",event=>start(event&&event.detail&&event.detail.performance),{once:true});
document.addEventListener("DOMContentLoaded",()=>{g.NUBackgroundEngine&&g.NUBackgroundEngine.mount();watchPage();},{once:true});
})(window);
