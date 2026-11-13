/* N.U Generation 1.31 — virtual-credit mini casino. No real-money flows. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const symbols=["🍒","⭐","🔔","💎","7️⃣"];
let save=NUWallet.normalizeSave(NU.load()),coinCall="heads",busy=false;
function persist(next){if(!NU.save(next)){ $("casino-status").textContent="Save unavailable · no credits changed.";return false;}save=next;window.dispatchEvent(new CustomEvent("nu:save-updated"));render();return true;}
function render(){ $("casino-balance").textContent=String(save.casinoCredits);document.querySelectorAll(".play-button").forEach(b=>{b.disabled=busy||save.casinoCredits<Number($("casino-wager").value);});}
function wager(){return Number($("casino-wager").value);}
function settle(game,payout,detail){const stake=wager();if(busy)return;if(save.casinoCredits<stake){$("casino-status").textContent="Not enough virtual credits for this wager.";render();return;}const result=NUWallet.settleCasinoRound(save,stake,payout,{title:"N.U Casino · "+game,detail});if(!result.ok){$("casino-status").textContent="Round blocked · "+result.reason;return;}if(!persist(result.state))return;const net=result.net;$("casino-status").textContent=game+" · "+detail+" · "+(net>0?"+"+net:net===0?"break-even":String(net))+" credits net. Balance saved locally.";render();}
document.querySelectorAll("[data-coin]").forEach(b=>b.addEventListener("click",()=>{coinCall=b.dataset.coin;document.querySelectorAll("[data-coin]").forEach(x=>{const on=x===b;x.classList.toggle("active",on);x.setAttribute("aria-pressed",String(on));});}));
$("casino-wager").addEventListener("change",render);
$("coin-play").addEventListener("click",()=>{const outcome=Math.random()<.5?"heads":"tails",won=outcome===coinCall,payout=won?wager()*2:0;$("coin-result").textContent="🪙 "+outcome.toUpperCase()+" · "+(won?"YOU WIN":"NOT THIS TIME");settle("Coin Flip",payout,"Landed "+outcome.toUpperCase());});
$("dice-play").addEventListener("click",()=>{const roll=1+Math.floor(Math.random()*6),guess=Number($("dice-guess").value),won=roll===guess;$("dice-result").textContent="🎲 ROLLED "+roll+" · "+(won?"EXACT MATCH":"NO MATCH");settle("Lucky Dice",won?wager()*5:0,"Rolled "+roll+" · guessed "+guess);});
$("slot-play").addEventListener("click",()=>{const reels=Array.from({length:3},()=>symbols[Math.floor(Math.random()*symbols.length)]);$("slot-reels").innerHTML=reels.map(s=>"<span>"+s+"</span>").join("");const counts=reels.reduce((a,s)=>(a[s]=(a[s]||0)+1,a),{}),max=Math.max(...Object.values(counts)),multiplier=max===3?8:max===2?2:0;$("slot-result").textContent=multiplier===8?"THREE OF A KIND · 8×":multiplier===2?"A PAIR · 2×":"NO MATCH";settle("Mini Slots",wager()*multiplier,reels.join(" "));});
window.addEventListener("pageshow",()=>{save=NUWallet.normalizeSave(NU.load());render();});
window.addEventListener("storage",e=>{if(e.key===NU.storageKey){save=NUWallet.normalizeSave(NU.load());render();}});
render();
})();