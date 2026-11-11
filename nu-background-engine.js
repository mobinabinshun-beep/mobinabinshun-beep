/* N.U Background Engine — image-first scene surface with safe fallback.
 * Place the approved artwork at assets/niroo-celestial-city.jpg.
 */
(function(g){
"use strict";
let node=null,loaded=false;
function mount(){
 if(node)return node;
 node=document.createElement("div");node.id="nu-background-image";node.setAttribute("aria-hidden","true");
 const img=document.createElement("img");img.alt="";img.decoding="async";img.fetchPriority="high";
 img.src="./assets/niroo-celestial-city.jpg";
 img.onload=()=>{loaded=true;node.classList.add("is-loaded");g.dispatchEvent(new Event("nu:background-ready"));};
 img.onerror=()=>{node.classList.add("asset-missing");g.dispatchEvent(new Event("nu:background-missing"));};
 node.appendChild(img);
 const world=document.querySelector(".world");
 if(world)world.insertBefore(node,world.firstChild);
 return node;
}
function setQuality(b){mount();if(!node)return;node.style.setProperty("--nu-bg-opacity",b.level<=2?".42":b.level<=5?".58":".72");node.dataset.quality=b.tier;}
function getStatus(){return {mounted:!!node,loaded,expectedAsset:"assets/niroo-celestial-city.jpg"};}
g.NUBackgroundEngine={mount,setQuality,getStatus};
document.addEventListener("DOMContentLoaded",mount,{once:true});
})(window);
