/* N.U — Niroo Universe | Generation 1 virtual item rules */
(function(root){
"use strict";
const HP_CAPSULE_COST_XP=10, MAX_HP=10;
function buyHpCapsule(wallet,inventory){
 if(!wallet||!inventory||Number(wallet.xp)<HP_CAPSULE_COST_XP)return false;
 wallet.xp=Number(wallet.xp)-HP_CAPSULE_COST_XP;
 inventory.hpPills=Math.max(0,Number(inventory.hpPills)||0)+1;
 return true;
}
function useHpCapsule(wallet,inventory){
 if(!wallet||!inventory)return 0;
 const hp=Math.max(0,Math.min(MAX_HP,Number(wallet.hp)||0));
 const count=Math.max(0,Number(inventory.hpPills)||0);
 if(count<1||hp>=MAX_HP)return 0;
 const restored=Math.min(10,MAX_HP-hp);
 wallet.hp=hp+restored;
 inventory.hpPills=count-1;
 return restored;
}
root.NUEconomy={HP_CAPSULE_COST_XP,MAX_HP,buyHpCapsule,useHpCapsule};
})(typeof window!=="undefined"?window:globalThis);
