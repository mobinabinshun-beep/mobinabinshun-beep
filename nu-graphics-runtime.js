/* N.U Graphics Runtime Orchestrator — four independent engines, one locked budget. */
(function(g){
"use strict";
let running=false;
async function start(sample){
 if(running)return;running=true;
 try{
  const p=await g.NUGraphicsCore.start(sample);
  g.NUBackgroundEngine.mount();g.NUBackgroundEngine.setQuality(p.budget);
  g.NUDynamicLayers.apply(p);g.NUGameRenderAdapter.apply(p);
  g.dispatchEvent(new CustomEvent("nu:graphics-ready",{detail:{profile:p,background:g.NUBackgroundEngine.getStatus()}}));
 }catch(error){running=false;console.warn("N.U graphics runtime fallback",error);}
}
g.NUGraphicsRuntime={start,setGameActive(active){if(g.NUGameRenderAdapter)g.NUGameRenderAdapter.setMode(active?"game":"world");}};
g.addEventListener("nu:calibrated",()=>start(),{once:true});
document.addEventListener("DOMContentLoaded",()=>{g.NUBackgroundEngine&&g.NUBackgroundEngine.mount();},{once:true});
})(window);
