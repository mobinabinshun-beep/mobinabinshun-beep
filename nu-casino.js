/* N.U Generation 1 — wallet-backed virtual casino. No real-money flows. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const symbols=["🍒","⭐","🔔","💎","7️⃣"];
const ladder=[1,2,4,8];
let save=NUWallet.normalizeSave(NU.load()),coinCall="heads",busy=false,selectedAsset=null,baseStake=1,ladderStep=0;
function spendable(){return NUWallet.casinoSpendableAssets(save);}
function selected(){return spendable().find(row=>row.key===selectedAsset)||null;}
function multiplier(){return ladder[ladderStep]||1;}
function balance(){const row=selected();return row?Math.max(0,Math.floor(Number(row.value)||0)):0;}
function effectiveStake(){return baseStake*multiplier();}
function maximumBase(){return Math.floor(balance()/multiplier());}
function persist(next){
 if(!NU.save(next)){$("casino-status").textContent="Save unavailable · no wallet balance changed.";return false;}
 save=next;window.dispatchEvent(new CustomEvent("nu:save-updated"));render();return true;
}
function render(){
 const rows=spendable(),select=$("casino-currency"),previous=selectedAsset;
 if(!rows.some(row=>row.key===selectedAsset))selectedAsset=rows.length?rows[0].key:null;
 if(select){
  select.replaceChildren();
  if(!rows.length){const option=document.createElement("option");option.value="";option.textContent="No spendable wallet assets";select.appendChild(option);}
  rows.forEach(row=>{const option=document.createElement("option");option.value=row.key;option.textContent=row.label+" · "+Number(row.value).toLocaleString();select.appendChild(option);});
  select.value=selectedAsset||"";
 }
 const row=selected(),available=balance(),max=maximumBase();
 $("casino-balance-label").textContent=row?(row.label.toUpperCase()+" · WALLET BALANCE"):"NO SPENDABLE WALLET ASSETS";
 $("casino-balance").textContent=row?available.toLocaleString():"—";
 $("casino-balance-unit").textContent=row?"LOCAL WALLET · "+row.label+" · NO MONETARY VALUE":"Earn or acquire a supported wallet asset in the N.U demo first.";
 $("casino-stake").max=String(Math.max(1,max));$("casino-stake-number").max=String(Math.max(1,max));
 if(max>0)baseStake=Math.max(1,Math.min(baseStake,max));else baseStake=1;
 $("casino-stake").value=String(baseStake);$("casino-stake-number").value=String(baseStake);$("casino-stake").disabled=max<1;$("casino-stake-number").disabled=max<1;
 $("casino-stake-label").textContent=String(baseStake);
 $("casino-effective-stake").textContent=String(effectiveStake());
 $("casino-effective-unit").textContent=row?row.label:"units";
 document.querySelectorAll("[data-ladder-step]").forEach(el=>{const active=Number(el.dataset.ladderStep)===ladderStep;el.classList.toggle("is-current",active);el.classList.toggle("is-complete",Number(el.dataset.ladderStep)<ladderStep);});
 document.querySelectorAll(".play-button").forEach(button=>{button.disabled=busy||!row||max<1||effectiveStake()>available;});
}
function setBaseStake(value){
 const max=maximumBase();if(max<1){baseStake=1;render();return;}
 const parsed=Math.floor(Number(value));baseStake=Math.max(1,Math.min(max,Number.isFinite(parsed)?parsed:1));render();
}
function wager(){return effectiveStake();}
function settle(game,payout,detail){
 const stake=wager(),asset=selectedAsset,roundId="nu-casino-round-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);
 const result=NUWallet.settleWalletBet(save,asset,stake,payout,{roundId,gameId:game,game,detail});
 if(!result.ok){$("casino-status").textContent="Round not settled · "+result.reason+". No wallet balance changed.";return false;}
 if(!persist(result.state))return false;
 if(result.net>0||result.net===0)ladderStep=0;
 else if(ladderStep===ladder.length-1)ladderStep=0;
 else ladderStep+=1;
 const net=result.net,sign=net>0?"+":net<0?"−":"";
 let message=game+" · "+detail+" · "+sign+Math.abs(net)+" "+asset+" net.";
 if(result.payoutCapped)message+=" Payout was capped by the selected asset's storage limit.";
 if(net<0&&ladderStep===0)message+=" 8× ladder completed · sequence reset to 1×.";
 else if(net<0)message+=" Next ladder step: "+multiplier()+"×.";
 else message+=" Ladder reset to 1×.";
 $("casino-status").textContent=message+" Saved locally in N.U Wallet.";
 render();return true;
}
function runRound(button,resultNode,game,resolve){
 if(busy)return;
 if(!selected()||wager()<1||wager()>balance()){$("casino-status").textContent="Choose a valid base wager within the selected wallet balance.";render();return;}
 busy=true;const card=button.closest(".game-card");card.classList.remove("is-result","is-running");card.classList.add("is-starting");resultNode.textContent="ROUND STARTING…";render();
 window.setTimeout(()=>{
  card.classList.remove("is-starting");card.classList.add("is-running");resultNode.textContent="BET IN PLAY…";
  window.setTimeout(()=>{
   const outcome=resolve();resultNode.textContent=outcome.message;
   settle(game,outcome.payout,outcome.detail);
   card.classList.remove("is-running");card.classList.add("is-result");
   window.setTimeout(()=>card.classList.remove("is-result"),420);
   busy=false;render();
  },360);
 },170);
}
document.querySelectorAll("[data-coin]").forEach(button=>button.addEventListener("click",()=>{
 coinCall=button.dataset.coin;document.querySelectorAll("[data-coin]").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});
}));
$("casino-currency").addEventListener("change",event=>{selectedAsset=event.target.value||null;ladderStep=0;baseStake=1;render();});
$("casino-stake").addEventListener("input",event=>setBaseStake(event.target.value));
$("casino-stake-number").addEventListener("change",event=>setBaseStake(event.target.value));
$("coin-play").addEventListener("click",event=>runRound(event.currentTarget,$("coin-result"),"Coin Flip",()=>{
 const outcome=Math.random()<.5?"heads":"tails",won=outcome===coinCall;
 return {payout:won?wager()*2:0,detail:"Landed "+outcome.toUpperCase(),message:"🪙 "+outcome.toUpperCase()+" · "+(won?"YOU WIN":"NOT THIS TIME")};
}));
$("dice-play").addEventListener("click",event=>runRound(event.currentTarget,$("dice-result"),"Lucky Dice",()=>{
 const roll=1+Math.floor(Math.random()*6),guess=Number($("dice-guess").value),won=roll===guess;
 return {payout:won?wager()*5:0,detail:"Rolled "+roll+" · guessed "+guess,message:"🎲 ROLLED "+roll+" · "+(won?"EXACT MATCH":"NO MATCH")};
}));
$("slot-play").addEventListener("click",event=>runRound(event.currentTarget,$("slot-result"),"Mini Slots",()=>{
 const reels=Array.from({length:3},()=>symbols[Math.floor(Math.random()*symbols.length)]);
 $("slot-reels").replaceChildren(...reels.map(symbol=>{const span=document.createElement("span");span.textContent=symbol;return span;}));
 const counts=reels.reduce((acc,symbol)=>(acc[symbol]=(acc[symbol]||0)+1,acc),{}),max=Math.max(...Object.values(counts)),mult=max===3?8:max===2?2:0;
 return {payout:wager()*mult,detail:reels.join(" "),message:mult===8?"THREE OF A KIND · 8×":mult===2?"A PAIR · 2×":"NO MATCH"};
}));
function resetLadder(){ladderStep=0;baseStake=1;}
window.addEventListener("pagehide",resetLadder);
window.addEventListener("beforeunload",resetLadder);
window.addEventListener("pageshow",()=>{save=NUWallet.normalizeSave(NU.load());resetLadder();render();});
window.addEventListener("storage",event=>{if(event.key===NU.storageKey){save=NUWallet.normalizeSave(NU.load());render();}});
window.addEventListener("nu:save-updated",()=>{save=NUWallet.normalizeSave(NU.load());render();});
render();
})();