/* N.U Background Engine v0.4 — exact-reference-first scene.
 * Material/Background.svg is the canonical visual base on every tier.
 * Optional depth/motion is rendered separately; failure restores the Gen1 renderer.
 */
(function(g){
"use strict";
const ASSET="https://raw.githubusercontent.com/mobinabinshun-beep/Repository/main/Material/Background.svg";
let node=null,img=null,loaded=false,mode="ambient",frozen=false;
function mount(){
 if(node)return node;
 const world=document.querySelector(".world");if(!world)return null;
 node=document.createElement("div");node.id="nu-background-image";node.dataset.mode=mode;node.setAttribute("aria-hidden","true");
 img=document.createElement("img");img.alt="";img.decoding="async";img.loading="eager";img.fetchPriority="high";img.draggable=false;
 img.onload=()=>{loaded=true;world.classList.add("nu-image-scene-active");node.classList.add("is-loaded");if(g.NUPixelWorld&&g.NUPixelWorld.setEnabled)g.NUPixelWorld.setEnabled(false);g.dispatchEvent(new Event("nu:background-ready"));};
 img.onerror=()=>{loaded=false;world.classList.remove("nu-image-scene-active");node.classList.add("asset-missing");if(g.NUPixelWorld&&g.NUPixelWorld.setEnabled)g.NUPixelWorld.setEnabled(true);g.dispatchEvent(new Event("nu:background-missing"));};
 img.src=ASSET;node.appendChild(img);world.insertBefore(node,world.firstChild);
 return node;
}
function setQuality(b){
 mount();if(!node||!b)return;
 node.dataset.quality=b.tier||"balanced";
 node.dataset.parallax=b.parallax?"on":"off";
 // Never downsample, blur, or replace the source artwork on low-end devices.
 node.style.setProperty("--nu-image-opacity","1");
}
function setMode(next){mode=["ambient","sleep","focus","game"].includes(next)?next:"ambient";if(node)node.dataset.mode=mode;if(g.NUDynamicLayers)g.NUDynamicLayers.setMode(mode);}
function setFrozen(value){frozen=!!value;if(node)node.dataset.frozen=frozen?"true":"false";if(g.NUDynamicLayers)g.NUDynamicLayers.setFrozen(frozen);}
function setCamera(x,y){if(!node)return;node.style.setProperty("--nu-scene-x",Math.max(-32,Math.min(32,Number(x)||0))+"px");node.style.setProperty("--nu-scene-y",Math.max(-24,Math.min(24,Number(y)||0))+"px");}
function getStatus(){return {mounted:!!node,loaded,mode,frozen,asset:ASSET,source:"Repository/Material/Background.svg"};}
g.NUBackgroundEngine={mount,setQuality,setMode,setFrozen,setCamera,getStatus};
document.addEventListener("DOMContentLoaded",mount,{once:true});
})(window);
