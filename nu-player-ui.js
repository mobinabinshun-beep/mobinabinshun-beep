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
    root.innerHTML=NUWallet.assetRows(s).map(row=>'<div class="wallet-asset"><span>'+row.label+'</span><strong>'+row.value+row.unit+'</strong></div>').join("");
    history.replaceChildren();
    const tx=s.transactions.slice(-24).reverse();
    if(!tx.length){const empty=document.createElement("p");empty.className="wallet-muted";empty.textContent="No recorded wallet transactions yet.";history.appendChild(empty);return;}
    tx.forEach(item=>{
      const row=document.createElement("div"),title=document.createElement("span"),detail=document.createElement("small");
      row.className="wallet-transaction";title.textContent=String(item.title||"Wallet transaction");
      detail.textContent=Object.entries(item.deltas||{}).map(([key,value])=>{
        const label=key==="hpPills"?"HP Capsule":key==="hp"?"HP":key==="xp"?"XP":key;
        return (Number(value)>0?"+":"")+Number(value)+" "+label;
      }).join(" · ");
      row.append(title,detail);history.appendChild(row);
    });
  }
  function renderProfile(){
    const s=ensureIdentity(),name=safeText(s.displayName,"N.U Explorer"),callsign=safeText(s.callsign,"Unassigned");
    $("player-id").textContent=s.playerId;
    $("player-display-name").textContent=name;
    $("player-callsign").textContent=callsign;
    $("player-level").textContent=String(s.level);
    $("player-xp").textContent=s.xp+" XP";
    $("player-xp-progress").style.width=(s.xp%100)+"%";
    $("player-hp").textContent=s.hp+"/10";
    $("player-mana").textContent=s.mana+"";
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
  function close(){document.querySelectorAll(".view").forEach(el=>el.classList.remove("active"));(previousView&&previousView!==walletView&&previousView!==profileView?previousView:$("home-view")).classList.add("active");previousView=null;window.dispatchEvent(new Event("nu:player-overlay-close"));}
  $("wallet-back").addEventListener("click",close);
  $("profile-back").addEventListener("click",close);
  $("menu-wallet").addEventListener("click",()=>open(walletView));
  $("menu-profile").addEventListener("click",()=>open(profileView));
  document.querySelectorAll("[data-wallet-tab]").forEach(button=>button.addEventListener("click",()=>{
    const tab=button.dataset.walletTab;
    if(tab==="profile"){open(profileView);return;}
    setWalletTab(tab);
  }));
  $("player-identity-save").addEventListener("click",()=>{
    const s=ensureIdentity();
    s.displayName=safeText($("player-name-input").value,"");
    s.callsign=safeText($("player-callsign-input").value,"");
    if(!persist(s)){ $("player-save-status").textContent="Could not save this profile in local browser storage.";return; }
    window.dispatchEvent(new CustomEvent("nu:identity-updated",{detail:{playerId:s.playerId,displayName:s.displayName,callsign:s.callsign}}));
    $("player-save-status").textContent="Player identity saved on this device.";
    window.dispatchEvent(new CustomEvent("nu:save-updated"));
    renderProfile();
  });
  $("player-identity-reset").addEventListener("click",()=>{
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