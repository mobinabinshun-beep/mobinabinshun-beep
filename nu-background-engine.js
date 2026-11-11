/* N.U Background Engine — image-first scene surface with safe fallback.
 * Loads the approved N.U archive reference artwork directly; no duplicate binary is required.
 */
(function(g){
"use strict";
let node=null,loaded=false;
function mount(){
 if(node)return node;
 node=document.createElement("div");node.id="nu-background-image";node.setAttribute("aria-hidden","true");
 const img=document.createElement("img");img.alt="";img.decoding="async";img.fetchPriority="high";
 img.src="https://raw.githubusercontent.com/niroouniverse-creator/NU-INGEST-ARCHIVE/main/ASSETS/NU-Celestial-City/Original%20reference%20image%20file%20for%20Niroo%20Universe%20(N.U).png";
 img.onload=()=>{loaded=true;node.classList.add("is-loaded");g.dispatchEvent(new Event("nu:background-ready"));};
 img.onerror=()=>{node.classList.add("asset-missing");g.dispatchEvent(new Event("nu:background-missing"));};
 node.appendChild(img);
 const world=document.querySelector(".world");
 if(world)world.insertBefore(node,world.firstChild);
 return node;
}
function setQuality(b){mount();if(!node)return;node.style.setProperty("--nu-bg-opacity",b.level<=2?".42":b.level<=5?".58":".72");node.dataset.quality=b.tier;}
function getStatus(){return {mounted:!!node,loaded,expectedAsset:"NU-INGEST-ARCHIVE/ASSETS/NU-Celestial-City/Original reference image file for Niroo Universe (N.U).png"};}
g.NUBackgroundEngine={mount,setQuality,getStatus};
document.addEventListener("DOMContentLoaded",mount,{once:true});
})(window);
