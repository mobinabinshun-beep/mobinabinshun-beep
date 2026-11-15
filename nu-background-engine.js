/* N.U Static Image Background v1.0 — one canonical image, no visual layers. */
(function(g){
"use strict";
const ASSET="./assets/backgrounds/niroo-universe-background.svg";
let node=null,img=null,loaded=false;
function mount(){
 if(node)return node;
 const world=document.querySelector(".world");
 if(!world)return null;
 node=document.createElement("div");
 node.id="nu-background-image";
 node.className="nu-world-background";
 node.setAttribute("aria-hidden","true");
 node.style.cssText="position:absolute;inset:0;z-index:var(--nu-layer-world-background,0);overflow:hidden;pointer-events:none;background:#080b12";
 img=document.createElement("img");
 img.alt="";
 img.draggable=false;
 img.decoding="async";
 img.style.cssText="display:block;width:100%;height:100%;object-fit:contain;object-position:center;user-select:none;pointer-events:none";
 img.onload=function(){
  loaded=true;
  node.dataset.state="loaded";
  world.classList.add("nu-image-scene-active");
  g.dispatchEvent(new Event("nu:background-ready"));
 };
 img.onerror=function(){
  loaded=false;
  node.dataset.state="error";
  img.style.display="none";
  node.classList.add("asset-missing");
  g.dispatchEvent(new Event("nu:background-missing"));
 };
 node.dataset.state="loading";
 img.src=ASSET;
 node.appendChild(img);
 world.insertBefore(node,world.firstChild);
 world.classList.add("calibrated");
 return node;
}
function setQuality(){mount();}
function setMode(){}
function setFrozen(){}
function setCamera(){}
function getStatus(){
 return {mounted:!!node,loaded:loaded,asset:ASSET,fit:"contain",state:node?node.dataset.state:"not-mounted",layers:0,animated:false};
}
g.NUBackgroundEngine={mount:mount,setQuality:setQuality,setMode:setMode,setFrozen:setFrozen,setCamera:setCamera,getStatus:getStatus};
document.addEventListener("DOMContentLoaded",mount,{once:true});
if(document.readyState!=="loading")mount();
})(window);
