/* N.U classic profile preview controls. Presentation only; no authentication or private-data storage. */
(function(){
  "use strict";
  const root=document.getElementById("profile-view");
  if(!root)return;
  const palette=document.getElementById("player-rank-hue");
  const paletteValue=document.getElementById("profile-palette-value");
  const note=document.getElementById("profile-mode-note");
  const privateFields=root.querySelector("[data-profile-private]");
  const publicFields=root.querySelector("[data-profile-public]");
  const STORAGE_KEY="nu-profile-rank-palette-v1";
  const DEFAULT_HUE=195;
  function safeHue(value){
    const n=Number(value);
    return Number.isFinite(n)?Math.max(0,Math.min(359,Math.round(n))):DEFAULT_HUE;
  }
  function applyHue(value,save){
    const hue=safeHue(value);
    root.style.setProperty("--profile-hue",String(hue));
    if(palette)palette.value=String(hue);
    if(paletteValue)paletteValue.textContent="HUE "+hue+"°";
    if(save){try{localStorage.setItem(STORAGE_KEY,String(hue));}catch(_){}}
  }
  function setMode(mode){
    const owner=mode==="owner";
    root.dataset.profileMode=owner?"owner":"public";
    if(privateFields)privateFields.hidden=!owner;
    if(publicFields)publicFields.hidden=owner;
    root.querySelectorAll("[data-profile-mode-choice]").forEach(button=>{
      const active=button.dataset.profileModeChoice===(owner?"owner":"public");
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",String(active));
    });
    if(note)note.textContent=owner
      ?"PLAYER · FULL PREVIEW · Shows all currently available local Player fields. This public demo does not authenticate or secure this view."
      :"PUBLIC · LIMITED PREVIEW · Shows display name, callsign and rank label only. Private fields are hidden.";
  }
  let initial=DEFAULT_HUE;
  try{initial=safeHue(localStorage.getItem(STORAGE_KEY));}catch(_){}
  applyHue(initial,false);
  setMode("public");
  root.querySelectorAll("[data-profile-mode-choice]").forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.profileModeChoice)));
  if(palette)palette.addEventListener("input",()=>applyHue(palette.value,true));
  const reset=document.getElementById("profile-palette-reset");
  if(reset)reset.addEventListener("click",()=>applyHue(DEFAULT_HUE,true));
  const back=document.getElementById("profile-back");
  if(back)back.addEventListener("click",()=>setMode("public"));
  window.addEventListener("nu:player-overlay-close",()=>setMode("public"));
  window.addEventListener("nu:player-overlay-open",()=>setMode("public"));
})();