/* N.U Reduced Motion — shared, persistent 10-level preference */
(() => {
 "use strict";
 const KEY="nu-motion-level-v1";
 const clamp=n=>Math.max(1,Math.min(10,Math.round(Number(n)||1)));
 function read(){try{const n=Number(localStorage.getItem(KEY));return Number.isInteger(n)&&n>=1&&n<=10?n:1}catch(_){return 1}}
 function apply(level){
  const n=clamp(level),root=document.documentElement;
  root.dataset.nuMotionLevel=String(n);
  root.style.setProperty("--nu-motion-transition",n===1?"0.01ms":(20+(n-2)*20)+"ms");
  root.classList.toggle("nu-motion-minimal",n===1);
  window.dispatchEvent(new CustomEvent("nu:motion-level-change",{detail:{level:n}}));
  return n;
 }
 function setLevel(level){const n=apply(level);try{localStorage.setItem(KEY,String(n))}catch(_){}return n}
 const initial=apply(read());
 window.NUMotion=Object.freeze({get level(){return Number(document.documentElement.dataset.nuMotionLevel)||initial},setLevel,isReduced:()=>read()<=3});
 const style=document.createElement("style");
 style.id="nu-motion-runtime";
 style.textContent=`
 :root{scroll-behavior:auto}
 :root[data-nu-motion-level] *, :root[data-nu-motion-level] *::before, :root[data-nu-motion-level] *::after{transition-duration:var(--nu-motion-transition)!important;scroll-behavior:auto!important}
 :root.nu-motion-minimal *, :root.nu-motion-minimal *::before, :root.nu-motion-minimal *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
 `;
 (document.head||document.documentElement).appendChild(style);
})();
