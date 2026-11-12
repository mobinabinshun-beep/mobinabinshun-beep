/* N.U Generation 1 — player wallet and identity-card views. */
(function(){
  "use strict";
  const $=id=>document.getElementById(id);
  const walletView=$("wallet-view"),profileView=$("profile-view");
  if(!window.NU||!window.NUWallet||!walletView||!profileView)return;
  const identityKey="nu-world-player-identity-v1";
  function load(){return NUWallet.normalizeSave(NU.load());}
  function persist(save){return NU.save(save);}
  function safeText(value,fallback){return typeof value==="string"&&value.trim()?value.trim().slice(0,32):fallback;}
  function makePlayerId(){
    const bytes=new Uint8Array(6);
    if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(bytes);
    else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256);
    return "NU-"+Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("").toUpperCase();
  }
  function ensureIdentity(){
    const s=load();
    if(!s.playerId){s.playerId=makePlayerId();s.displayName="";s.callsign="";persist(s);}
    return s;
  }
  function renderWallet(){
    const s=load(),root=$("wallet-assets"),history=$("wallet-transactions");
    if(!root||!history)return;
    root.innerHTML=NUWallet.assetRows(s).map(row=>'<div class="wallet-asset"><span>'+row.label+'</span><strong>'+row.value+row.unit+'</strong></div>').join("");
    const tx=s.transactions.slice().reverse();
    history.innerHTML=tx.length?tx.map(item=>{
      const deltas=Object.entries(item.deltas||{}).map(([key,value])=>{
        const label=key==="hpPills"?"HP Capsule":key==="hp"?"HP":key==="xp"?"XP":key;
        return (value>0?"+":"")+value+" "+label;
      }).join(" · ");
      return '<div class="wallet-transaction"><span>'+item.title+'</span><small>'+deltas+'</small></div>';
    }).join(""):'<p class="wallet-muted">No recorded wallet transactions yet.</p>';
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
    $("player-upgrade").textContent=s.upgrade+"/9";
    $("player-name-input").value=s.displayName||"";
    $("player-callsign-input").value=s.callsign||"";
  }
  function open(view){
    document.querySelectorAll(".view").forEach(el=>el.classList.remove("active"));
    view.classList.add("active");
    document.body.classList.remove("article-mode");
    if(view===walletView)renderWallet();else renderProfile();
    const menu=$("menu");if(menu)menu.classList.remove("open");
  }
  function close(){document.querySelectorAll(".view").forEach(el=>el.classList.remove("active"));$("home-view").classList.add("active");}
  $("wallet-back").addEventListener("click",close);
  $("profile-back").addEventListener("click",close);
  $("menu-wallet").addEventListener("click",()=>open(walletView));
  $("menu-profile").addEventListener("click",()=>open(profileView));
  $("player-identity-save").addEventListener("click",()=>{
    const s=ensureIdentity();
    s.displayName=safeText($("player-name-input").value,"");
    s.callsign=safeText($("player-callsign-input").value,"");
    if(!persist(s)){ $("player-save-status").textContent="Could not save this profile in local browser storage.";return; }
    $("player-save-status").textContent="Player identity saved on this device.";
    renderProfile();
  });
  $("player-identity-reset").addEventListener("click",()=>{
    const s=ensureIdentity();s.displayName="";s.callsign="";
    if(!persist(s)){$("player-save-status").textContent="Could not save this change.";return;}
    $("player-save-status").textContent="Display name and callsign reset.";
    renderProfile();
  });
  window.addEventListener("nu:save-updated",()=>{if(walletView.classList.contains("active"))renderWallet();if(profileView.classList.contains("active"))renderProfile();});
  window.addEventListener("storage",e=>{if(e.key==="nu-world-save-v1"){if(walletView.classList.contains("active"))renderWallet();if(profileView.classList.contains("active"))renderProfile();}});
  renderWallet();renderProfile();
})();