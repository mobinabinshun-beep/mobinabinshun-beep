/* N.U Game Render Adapter — constrains the existing game presentation only.
 * No game mechanics, pointer handling, collision, XP, Mana, HP, or save code is changed.
 */
(function(g){
"use strict";
let profile=null;
function apply(p){
 profile=p;const b=p.budget,root=document.documentElement;
 root.style.setProperty("--nu-game-dpr",String(b.dpr));
 root.style.setProperty("--nu-game-glow",b.glow?"1":".35");
 root.style.setProperty("--nu-game-motion",p.reducedMotion?"0":"1");
 document.body.dataset.nuGraphicsTier=b.tier;
 const stage=document.getElementById("game-stage");
 if(stage){stage.dataset.graphicsTier=b.tier;stage.style.setProperty("--nu-game-target-fps",String(b.gameFps));}
}
function setMode(mode){document.body.dataset.nuGraphicsMode=mode==="game"?"game":"world";}
g.NUGameRenderAdapter={apply,setMode,getProfile:()=>profile};
})(window);
