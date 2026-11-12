/* N.U Generation 1 — local wallet rules and transaction ledger. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.NUWallet=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  const MAX_HP=10,HP_PILL_COST=10,MAX_TRANSACTIONS=40;
  const number=(value,fallback,min=0,max=Number.MAX_SAFE_INTEGER)=>{
    const n=Number(value);
    return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
  };
  function normalizeSave(raw){
    const source=raw&&typeof raw==="object"?raw:{};
    const next=Object.assign({xp:0,level:1,mana:0,xCredits:0,nCredits:0,upgrade:0,hp:10,hpPills:0,manaCapsules:1,transactions:[]},source);
    next.xp=number(next.xp,0);
    next.level=number(next.level,1,1);
    next.manaCapsules=number(next.manaCapsules,1,1,10);
    next.mana=number(next.mana,0,0,next.manaCapsules*10);
    next.hp=number(next.hp,10,0,MAX_HP);
    next.hpPills=number(next.hpPills,0);
    next.xCredits=number(next.xCredits,0);
    next.nCredits=number(next.nCredits,0);
    next.upgrade=number(next.upgrade,0,0,9);
    next.transactions=Array.isArray(next.transactions)?next.transactions.slice(-MAX_TRANSACTIONS):[];
    return next;
  }
  function transaction(next,kind,title,deltas,meta){
    const details=meta||{};
    const entry={id:String(details.id||("nu-tx-"+Date.now()+"-"+Math.random().toString(36).slice(2,8))),at:String(details.at||new Date().toISOString()),kind,title,deltas};
    next.transactions=next.transactions.concat(entry).slice(-MAX_TRANSACTIONS);
    return entry;
  }
  function buyHpPill(raw,meta){
    const next=normalizeSave(raw);
    if(next.xp<HP_PILL_COST)return {ok:false,reason:"INSUFFICIENT_XP",state:next};
    next.xp-=HP_PILL_COST;
    next.hpPills+=1;
    const entry=transaction(next,"purchase","Golden HP Capsule",{xp:-HP_PILL_COST,hpPills:1},meta);
    return {ok:true,state:next,transaction:entry};
  }
  function useHpPill(raw,meta){
    const next=normalizeSave(raw);
    if(next.hp>=MAX_HP)return {ok:false,reason:"HP_FULL",state:next};
    if(next.hpPills<1)return {ok:false,reason:"NO_HP_CAPSULE",state:next};
    const restored=Math.min(HP_PILL_COST,MAX_HP-next.hp);
    next.hpPills-=1;
    next.hp+=restored;
    const entry=transaction(next,"consumption","HP Capsule used",{hp:restored,hpPills:-1},meta);
    return {ok:true,state:next,restored,transaction:entry};
  }
  function assetRows(raw){
    const s=normalizeSave(raw);
    return [
      {key:"xp",label:"XP",value:s.xp,unit:""},
      {key:"mana",label:"Mana",value:s.mana,unit:""},
      {key:"hp",label:"HP",value:s.hp,unit:"/ 10"},
      {key:"hpPills",label:"HP Capsules",value:s.hpPills,unit:""},
      {key:"manaCapsules",label:"Mana Capsules",value:s.manaCapsules,unit:""},
    ];
  }
  return {MAX_HP,HP_PILL_COST,MAX_TRANSACTIONS,normalizeSave,buyHpPill,useHpPill,assetRows};
});