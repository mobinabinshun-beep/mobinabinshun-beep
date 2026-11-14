/* N.U Generation 1 — player wallet and identity-card views. */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const walletView=$("wallet-view"),profileView=$("profile-view");
  if(!window.NU||!window.NUWallet||!walletView||!profileView)return;
  function load(){return NUWallet.normalizeSave(NU.load());}
  function persist(save){return NU.save(save);}
  function safeText(value,fallback){return typeof value==="string"&&value.trim()?value.trim().slice(0,32):fallback;}
  function makePlayerId(){
    const bytes=new Uint8Array(6);
    if(window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(bytes);
    else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256);
    return "NU-"+Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();
  }
  function ensureIdentity(){
    const s=load();
    if(!s.playerId){s.playerId=makePlayerId();s.displayName="";s.callsign="";if(persist(s))window.dispatchEvent(new CustomEvent("nu:identity-updated",{detail:{playerId:s.playerId,displayName:s.displayName,callsign:s.callsign}}));}
    return s;
  }
  function renderWallet(){
    const s=load(),root=$("wallet-assets"),history=$("wallet-transactions");
    if(!root||!history)return;
    const rows=NUWallet.assetRows(s).filter(row=>Number(row.value)>0);
    root.replaceChildren();
    if(!rows.length){
      const empty=document.createElement("p");
      empty.className="wallet-muted";
      empty.textContent="No earned assets yet. Your first acquired asset will appear here.";
      root.appendChild(empty);
    }else{
      rows.forEach(row=>{
        const card=document.createElement("div"),label=document.createElement("span"),value=document.createElement("strong");
        card.className="wallet-asset";
        card.dataset.assetGroup=String(row.group||"game").replace(/[^a-z0-9_-]/gi,"");
        label.textContent=String(row.label||row.key);
        value.textContent=Number(row.value).toLocaleString(undefined,{maximumFractionDigits:8})+String(row.unit||"");
        card.append(label,value);
        root.appendChild(card);
      });
    }
    const summary=$("wallet-asset-summary");
    if(summary){const currencies=rows.filter(row=>row.group==="currency"||row.group==="games").length;summary.hidden=rows.length===0;summary.textContent=rows.length?[rows.length+" OWNED ASSET TYPES",...(currencies>0?[currencies+" GAME / CREDIT TYPES"]:[])].join(" · "):"";}
    history.replaceChildren();
    const tx=s.transactions.slice(-24).reverse();
    if(!tx.length){const empty=document.createElement("p");empty.className="wallet-muted";empty.textContent="No recorded wallet transactions yet.";history.appendChild(empty);return;}
    tx.forEach(item=>{
      const row=document.createElement("div"),title=document.createElement("span"),detail=document.createElement("small");
      row.className="wallet-transaction";title.textContent=String(item.title||"Wallet transaction");
      detail.textContent=Object.entries(item.deltas||{}).filter(([,value])=>Number(value)!==0).map(([key,value])=>{
        const label=key==="hpPills"?"HP Capsule":key==="hp"?"HP":key==="xp"?"XP":key;
        return (Number(value)>0?"+":"")+Number(value)+" "+label;
      }).join(" · ");
      row.append(title,detail);history.appendChild(row);
    });
  }
  function renderProfile(){
    if(!$("player-id"))return;
    const s=ensureIdentity(),name=safeText(s.displayName,"N.U Explorer"),callsign=safeText(s.callsign,"Unassigned");
    $("player-id").textContent=s.playerId;
    $("player-display-name").textContent=name;
    $("player-callsign").textContent=callsign;
    $("player-level").textContent=String(s.level);
    $("player-xp").parentElement.hidden=s.xp<1;
    $("player-xp").textContent=s.xp>0?s.xp+" XP":"";
    $("player-xp-progress").style.width=(s.xp%100)+"%";
    $("player-hp").textContent=s.hp+"/10";
    $("player-mana").parentElement.hidden=s.mana<1;
    $("player-mana").textContent=s.mana>0?String(s.mana):"";
    $("player-name-input").value=s.displayName||"";
    $("player-callsign-input").value=s.callsign||"";
  }
  let previousView=null;
  function setWalletTab(name){
    document.querySelectorAll("[data-wallet-tab]").forEach(button=>{const active=button.dataset.walletTab===name;button.classList.toggle("is-active",active);button.setAttribute("aria-selected",String(active));});
    document.querySelectorAll("[data-wallet-panel]").forEach(panel=>{panel.hidden=panel.dataset.walletPanel!==name;});
    if(name==="transactions")renderWallet();
  }
  function open(view){
    previousView=document.querySelector(".view.active");
    window.dispatchEvent(new Event("nu:player-overlay-open"));
    document.querySelectorAll(".view").forEach(el=>el.classList.remove("active"));
    view.classList.add("active");
    document.body.classList.remove("article-mode");
    if(view===walletView){setWalletTab("balances");renderWallet();}else renderProfile();
    const menu=$("menu");if(menu)menu.classList.remove("open");
  }
  function close(){if(profileView.classList.contains("active")){["demo-name","demo-call","demo-family","demo-age"].forEach(id=>{const field=$(id);if(field)field.value="";});const warning=$("demo-profile-warning");if(warning)warning.hidden=true;applyAppearance(true);}document.querySelectorAll(".view").forEach(el=>el.classList.remove("active"));(previousView&&previousView!==walletView&&previousView!==profileView?previousView:$("home-view")).classList.add("active");previousView=null;window.dispatchEvent(new Event("nu:player-overlay-close"));}
  $("wallet-back").addEventListener("click",close);
  $("profile-back").addEventListener("click",close);
  const demoFields=["demo-name","demo-call","demo-family","demo-age"];
  demoFields.forEach(id=>{const field=$(id);if(field)field.addEventListener("input",()=>{$("demo-profile-warning").hidden=false;});});
  const appearanceDefaults={hue:205,tone:0,lightness:48};
  const appearanceCard=$("profile-view").querySelector(".demo-profile-card");
  const appearancePanel=$("profile-view").querySelector(".demo-profile-appearance");
  const appearanceControls={hue:$("demo-card-hue"),tone:$("demo-card-tone"),lightness:$("demo-card-lightness")};
  function applyAppearance(reset){
    if(!appearanceCard)return;
    Object.entries(appearanceControls).forEach(([key,control])=>{
      if(!control)return;
      if(reset)control.value=String(appearanceDefaults[key]);
    });
    const hue=Number(appearanceControls.hue&&appearanceControls.hue.value||appearanceDefaults.hue);
    const tone=Number(appearanceControls.tone&&appearanceControls.tone.value||0);
    const lightness=Number(appearanceControls.lightness&&appearanceControls.lightness.value||appearanceDefaults.lightness);
    appearanceCard.style.setProperty("--demo-card-hue",String(hue));
    if(appearancePanel)appearancePanel.style.setProperty("--demo-card-hue",String(hue));
    appearanceCard.style.setProperty("--demo-card-lightness",lightness+"%");
    appearanceCard.style.setProperty("--demo-neutral-rgb",tone>=0?"255,255,255":"0,0,0");
    appearanceCard.style.setProperty("--demo-neutral-alpha",String(Math.abs(tone)/100*(tone>=0?.42:.52)));
    const hueValue=$("demo-card-hue-value"),toneValue=$("demo-card-tone-value"),lightValue=$("demo-card-lightness-value");
    if(hueValue)hueValue.textContent=hue+"°";
    if(toneValue)toneValue.textContent=tone===0?"NEUTRAL":tone>0?"WHITE "+tone+"%":"DARK "+Math.abs(tone)+"%";
    if(lightValue)lightValue.textContent=lightness+"%";
  }
  Object.values(appearanceControls).forEach(control=>{if(control)control.addEventListener("input",()=>applyAppearance(false));});
  applyAppearance(false);
  const demoClose=$("demo-profile-close"),demoClear=$("demo-profile-clear");
  if(demoClose)demoClose.addEventListener("click",close);
  if(demoClear)demoClear.addEventListener("click",close);
  profileView.addEventListener("click",event=>{if(event.target===profileView)close();});
  document.addEventListener("keydown",event=>{if(event.key==="Enter"&&profileView.classList.contains("active")){event.preventDefault();close();}});
  $("menu-wallet").addEventListener("click",()=>open(walletView));
  $("menu-profile").addEventListener("click",()=>open(profileView));
  document.querySelectorAll("[data-wallet-tab]").forEach(button=>button.addEventListener("click",()=>{
    const tab=button.dataset.walletTab;
    if(tab==="profile"){open(profileView);return;}
    setWalletTab(tab);
  }));
  const identitySave=$("player-identity-save");
  if(identitySave)identitySave.addEventListener("click",()=>{
    const s=ensureIdentity();
    s.displayName=safeText($("player-name-input").value,"");
    s.callsign=safeText($("player-callsign-input").value,"");
    if(!persist(s)){ $("player-save-status").textContent="Could not save this profile in local browser storage.";return; }
    window.dispatchEvent(new CustomEvent("nu:identity-updated",{detail:{playerId:s.playerId,displayName:s.displayName,callsign:s.callsign}}));
    $("player-save-status").textContent="Player identity saved on this device.";
    window.dispatchEvent(new CustomEvent("nu:save-updated"));
    renderProfile();
  });
  const identityReset=$("player-identity-reset");
  if(identityReset)identityReset.addEventListener("click",()=>{
    const s=ensureIdentity();s.displayName="";s.callsign="";
    if(!persist(s)){$("player-save-status").textContent="Could not save this change.";return;}
    window.dispatchEvent(new CustomEvent("nu:identity-updated",{detail:{playerId:s.playerId,displayName:s.displayName,callsign:s.callsign}}));
    $("player-save-status").textContent="Display name and callsign reset.";
    window.dispatchEvent(new CustomEvent("nu:save-updated"));
    renderProfile();
  });
  window.addEventListener("nu:save-updated",()=>{if(walletView.classList.contains("active"))renderWallet();if(profileView.classList.contains("active"))renderProfile();});
  window.addEventListener("storage",e=>{if(e.key==="nu-world-save-v1"){if(walletView.classList.contains("active"))renderWallet();if(profileView.classList.contains("active"))renderProfile();}});
  renderWallet();renderProfile();
})();