/* N.U Background Engine v0.4 — exact-reference-first scene.
 * Material/Background.svg is the canonical visual base on every tier.
 * Legacy procedural depth/motion is quarantined; failure keeps a neutral fallback.
 */
(function(g){
"use strict";
const ASSET="./assets/backgrounds/niroo-universe-background.svg";
let node=null,img=null,loaded=false,mode="ambient",frozen=false,cameraZoom=1;
function mount(){
 if(node)return node;
 const world=document.querySelector(".world");if(!world||!document.body)return null;
 node=document.createElement("div");node.id="nu-background-image";node.dataset.mode=mode;node.style.cssText="position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none";node.setAttribute("aria-hidden","true");
 img=document.createElement("img");img.alt="";img.style.cssText="display:block;width:100%;height:100%;object-fit:contain;object-position:center;user-select:none";img.decoding="async";img.loading="eager";img.fetchPriority="high";img.draggable=false;
 img.onload=()=>{loaded=true;world.classList.add("nu-image-scene-active");node.classList.add("is-loaded");if(g.NUPixelWorld&&g.NUPixelWorld.setEnabled)g.NUPixelWorld.setEnabled(false);g.dispatchEvent(new Event("nu:background-ready"));};
 img.onerror=()=>{loaded=false;world.classList.remove("nu-image-scene-active");node.classList.add("asset-missing");g.dispatchEvent(new Event("nu:background-missing"));};
 img.src=new URL(ASSET,document.baseURI).href;node.appendChild(img);document.body.insertBefore(node,document.body.firstChild);
 // Reveal the scene immediately; CSS otherwise leaves .world at opacity:0.
 // No other loaded script applies the calibrated class.
 world.classList.add("calibrated");
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
function setCamera(x,y,zoom=cameraZoom){
 if(!node||!img)return;
 cameraZoom=Math.max(1,Math.min(3,Number(zoom)||1));
 const width=node.clientWidth||g.innerWidth,height=node.clientHeight||g.innerHeight;
 const fit=Math.min(width/(img.naturalWidth||width),height/(img.naturalHeight||height));
 const artworkWidth=(img.naturalWidth||width)*fit,artworkHeight=(img.naturalHeight||height)*fit;
 const maxX=Math.max(0,(artworkWidth*(cameraZoom-1))/2),maxY=Math.max(0,(artworkHeight*(cameraZoom-1))/2);
 const px=Math.max(-maxX,Math.min(maxX,Number(x)||0)),py=Math.max(-maxY,Math.min(maxY,Number(y)||0));
 node.style.setProperty("--camera-x",px+"px");node.style.setProperty("--camera-y",py+"px");
 node.style.setProperty("--nu-camera-zoom",String(cameraZoom));
}
function getStatus(){return {mounted:!!node,loaded,mode,frozen,cameraZoom,fit:"contain",asset:ASSET,source:"assets/backgrounds/niroo-universe-background.svg"};}
g.NUBackgroundEngine={mount,setQuality,setMode,setFrozen,setCamera,getStatus};
document.addEventListener("DOMContentLoaded",mount,{once:true});
})(window);
