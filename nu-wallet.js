/* N.U Generation 1 — local wallet rules and transaction ledger. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.NUWallet=api;
})(typeof window!=="undefined"?window:globalThis,function(){
  "use strict";
  const MAX_HP=10,HP_PILL_COST=10,MAX_TRANSACTIONS=24;
  const assetRegistry=new Map();
  const gameAssetRegistry=new Map();
  function registerAsset(definition){
    if(!definition||typeof definition.key!=="string"||!/^[a-zA-Z][a-zA-Z0-9_-]{0,47}$/.test(definition.key))return false;
    assetRegistry.set(definition.key,{key:definition.key,label:String(definition.label||definition.key).slice(0,48),unit:String(definition.unit||"").slice(0,16),group:String(definition.group||"game").slice(0,32),precision:Number.isInteger(definition.precision)?Math.max(0,Math.min(8,definition.precision)):0});return true;
  }
  function registerGameAssets(gameId,keys){if(typeof gameId!=="string"||!Array.isArray(keys))return false;gameAssetRegistry.set(gameId.toLowerCase(),new Set(keys.filter(k=>typeof k==="string")));return true;}
  const number=(value,fallback,min=0,max=Number.MAX_SAFE_INTEGER)=>{
    const n=Number(value);
    return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
  };
  function normalizeSave(raw){
    const source=raw&&typeof raw==="object"?raw:{};
    const next=Object.assign({xp:0,level:1,mana:0,xCredits:0,nCredits:0,upgrade:0,hp:10,hpPills:0,manaCapsules:1,casinoCredits:100,transactions:[],rewardIds:[],nonExchangeableAssets:[],activeWave:null,settledWaveIds:[]},source);
    next.xp=number(next.xp,0);
    next.level=number(next.level,1,1);
    next.manaCapsules=number(next.manaCapsules,1,1,10);
    next.mana=number(next.mana,0,0,next.manaCapsules*10);
    next.hp=number(next.hp,10,0,MAX_HP);
    next.hpPills=number(next.hpPills,0);
    next.casinoCredits=number(next.casinoCredits,100,0,1000000000);
    next.xCredits=number(next.xCredits,0);
    next.nCredits=number(next.nCredits,0);
    next.upgrade=number(next.upgrade,0,0,9);
    next.transactions=Array.isArray(next.transactions)?next.transactions.slice(-MAX_TRANSACTIONS):[];
    next.rewardIds=Array.isArray(next.rewardIds)?next.rewardIds.filter(v=>typeof v==="string").slice(-500):[];
    next.settledWaveIds=Array.isArray(next.settledWaveIds)?next.settledWaveIds.filter(v=>typeof v==="string").slice(-500):[];
    next.activeWave=next.activeWave&&typeof next.activeWave==="object"?next.activeWave:null;
    next.nonExchangeableAssets=Array.isArray(next.nonExchangeableAssets)?Array.from(new Set(next.nonExchangeableAssets.filter(v=>typeof v==="string"&&/^[a-zA-Z][a-zA-Z0-9_-]{0,47}$/.test(v)))):[];
    return next;
  }
  function transaction(next,kind,title,deltas,meta){
    const details=meta||{};
    if(kind==="purchase"){
      const purchasedKeys=Object.keys(deltas||{}).filter(key=>Number(deltas[key])>0);
      const explicit=Array.isArray(details.exchangeExcludedKeys)?details.exchangeExcludedKeys.filter(key=>typeof key==="string"):[];
      next.nonExchangeableAssets=Array.from(new Set([...(next.nonExchangeableAssets||[]),...purchasedKeys,...explicit]));
    }
    const entry={id:String(details.id||("nu-tx-"+Date.now()+"-"+Math.random().toString(36).slice(2,8))),at:String(details.at||new Date().toISOString()),kind,title,deltas};if(Array.isArray(details.exchangeExcludedKeys)&&details.exchangeExcludedKeys.length)entry.exchangeExcludedKeys=details.exchangeExcludedKeys.filter(k=>typeof k==="string");
    next.transactions=next.transactions.concat(entry).slice(-MAX_TRANSACTIONS);
    return entry;
  }
  function buyHpPill(raw,meta){
    const next=normalizeSave(raw),details=meta||{};
    if(next.xp<HP_PILL_COST)return {ok:false,reason:"INSUFFICIENT_XP",state:next};
    next.xp-=HP_PILL_COST;next.hpPills+=1;
    next.nonExchangeableAssets=Array.from(new Set([...(next.nonExchangeableAssets||[]),"hpPills"]));
    const at=String(details.at||new Date().toISOString()),baseId=String(details.id||("nu-store-"+Date.now()+"-"+Math.random().toString(36).slice(2,8)));
    const entries=[
      {id:baseId+"|xp",at,kind:"purchase",title:"Golden HP Capsule · XP spent",direction:"OUTGOING",asset:"xp",signedAmount:-HP_PILL_COST,category:"STORE_PURCHASE",resultingBalance:next.xp,settlementStatus:"SETTLED",idempotencyKey:baseId+"|xp",deltas:{xp:-HP_PILL_COST}},
      {id:baseId+"|capsule",at,kind:"purchase",title:"Golden HP Capsule · inventory received",direction:"INCOMING",asset:"hpPills",signedAmount:1,category:"STORE_PURCHASE",resultingBalance:next.hpPills,settlementStatus:"SETTLED",idempotencyKey:baseId+"|capsule",exchangeExcludedKeys:["hpPills"],deltas:{hpPills:1}}
    ];
    next.transactions=next.transactions.concat(entries).slice(-MAX_TRANSACTIONS);
    return {ok:true,state:next,transaction:entries[0],transactions:entries};
  }
  function useHpPill(raw,meta){
    const next=normalizeSave(raw),details=meta||{};
    if(next.hp>=MAX_HP)return {ok:false,reason:"HP_FULL",state:next};
    if(next.hpPills<1)return {ok:false,reason:"NO_HP_CAPSULE",state:next};
    const restored=Math.min(HP_PILL_COST,MAX_HP-next.hp);
    next.hpPills-=1;next.hp+=restored;
    const at=String(details.at||new Date().toISOString()),baseId=String(details.id||("nu-capsule-use-"+Date.now()+"-"+Math.random().toString(36).slice(2,8)));
    const entries=[
      {id:baseId+"|hp",at,kind:"consumption",title:"HP Capsule · HP restored",direction:"INCOMING",asset:"hp",signedAmount:restored,category:"CAPSULE_CONSUMPTION",resultingBalance:next.hp,settlementStatus:"SETTLED",idempotencyKey:baseId+"|hp",deltas:{hp:restored}},
      {id:baseId+"|capsule",at,kind:"consumption",title:"HP Capsule · inventory spent",direction:"OUTGOING",asset:"hpPills",signedAmount:-1,category:"CAPSULE_CONSUMPTION",resultingBalance:next.hpPills,settlementStatus:"SETTLED",idempotencyKey:baseId+"|capsule",deltas:{hpPills:-1}}
    ];
    next.transactions=next.transactions.concat(entries).slice(-MAX_TRANSACTIONS);
    return {ok:true,state:next,restored,transaction:entries[0],transactions:entries};
  }
  function grantXP(raw,amount,meta){
    const next=normalizeSave(raw),details=meta||{},rewardId=String(details.id||"");
    if(rewardId&&next.rewardIds.includes(rewardId))return {ok:false,reason:"DUPLICATE_REWARD",state:next};
    const qty=number(amount,0,0,1000000);
    if(qty<1)return {ok:false,reason:"INVALID_REWARD",state:next};
    const before=Math.floor(next.xp/100);
    next.xp+=qty;
    next.level+=Math.floor(next.xp/100)-before;
    if(rewardId)next.rewardIds=next.rewardIds.concat(rewardId).slice(-500);
    const entry=transaction(next,"reward",String(details.title||"XP earned"),{xp:qty},details);
    return {ok:true,state:next,amount:qty,transaction:entry};
  }
  function settleCasinoRound(raw,wager,payout,meta){
    const next=normalizeSave(raw),rawStake=Number(wager),returned=number(payout,0,0,1000000000);
    if(!Number.isSafeInteger(rawStake)||rawStake<1||rawStake>1000000)return {ok:false,reason:"INVALID_WAGER",state:next};
    const stake=rawStake;
    if(next.casinoCredits<stake)return {ok:false,reason:"INSUFFICIENT_CREDITS",state:next};
    next.casinoCredits=next.casinoCredits-stake+returned;
    const entry=transaction(next,"casino","N.U Casino round",{casinoCredits:returned-stake,wager:-stake,payout:returned},meta);
    return {ok:true,state:next,wager:stake,payout:returned,net:returned-stake,transaction:entry};
  }

  function beginWave(raw,gameId,meta){
    const next=normalizeSave(raw);
    if(next.activeWave){const closed=settleWave(next,"superseded");return beginWave(closed.state,gameId,meta);}
    const id="nu-wave-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,9);
    next.activeWave={id,gameId:String(gameId||"unknown"),startedAt:new Date().toISOString(),successfulInteractions:0,aggregates:{}};
    return {ok:true,state:next,waveId:id};
  }
  function recordWaveDelta(raw,asset,amount,category,meta){
    const next=normalizeSave(raw),wave=next.activeWave,qty=Number(amount),details=meta||{};
    if(!wave||!Number.isSafeInteger(qty)||qty===0||typeof asset!=="string")return {ok:false,reason:"NO_ACTIVE_WAVE_OR_INVALID_DELTA",state:next};
    const allowed=["xp","mana","hp","hpPills","manaCapsules","xCredits","nCredits","casinoCredits"];
    if(!allowed.includes(asset))return {ok:false,reason:"UNKNOWN_ASSET",state:next};
    const key=(qty>0?"INCOMING":"OUTGOING")+"|"+asset+"|"+String(category||"GAME_REWARD");
    const aggregate=wave.aggregates[key]||(wave.aggregates[key]={asset,category:String(category||"GAME_REWARD"),direction:qty>0?"INCOMING":"OUTGOING",amount:0,interactionCount:0,rate:details.rate??null});
    aggregate.amount+=qty;
    if(details.successfulInteraction) { aggregate.interactionCount+=1; wave.successfulInteractions+=1; }
    next[asset]=number(Number(next[asset]||0)+qty,0,0,Number.MAX_SAFE_INTEGER);
    if(asset==="mana")next.mana=Math.min(next.mana,next.manaCapsules*10);
    if(asset==="hp")next.hp=Math.min(next.hp,MAX_HP);
    if(asset==="xp"){const before=Math.floor((next.xp-qty)/100);next.level=Math.max(1,next.level+Math.floor(next.xp/100)-before);}
    return {ok:true,state:next};
  }
  function settleWave(raw,reason){
    const next=normalizeSave(raw),wave=next.activeWave;
    if(!wave||!wave.id)return {ok:false,reason:"NO_ACTIVE_WAVE",state:next};
    if(next.settledWaveIds.includes(wave.id)){next.activeWave=null;return {ok:false,reason:"ALREADY_SETTLED",state:next};}
    const entries=[];
    for(const aggregate of Object.values(wave.aggregates||{})){
      if(!aggregate||!Number.isSafeInteger(aggregate.amount)||aggregate.amount===0)continue;
      const asset=aggregate.asset,amount=aggregate.amount;
      const id=wave.id+"|"+aggregate.direction+"|"+asset+"|"+aggregate.category;
      if(next.transactions.some(tx=>tx&&tx.id===id))continue;
      const entry={id,at:new Date().toISOString(),kind:aggregate.direction==="INCOMING"?"wave-reward":"wave-cost",title:String(wave.gameId)+" · "+String(aggregate.category),source:String(wave.gameId),waveId:wave.id,asset,direction:aggregate.direction,signedAmount:amount,category:aggregate.category,successfulInteractionCount:aggregate.interactionCount||0,rewardOrCostRate:aggregate.rate,resultingBalance:Number(next[asset]||0),settlementStatus:"SETTLED",idempotencyKey:id,settlementReason:String(reason||"completed"),deltas:{[asset]:amount}};
      next.transactions=next.transactions.concat(entry).slice(-MAX_TRANSACTIONS);entries.push(entry);
    }
    next.settledWaveIds=next.settledWaveIds.concat(wave.id).slice(-500);
    next.lastSettledWave={id:wave.id,gameId:wave.gameId,reason:String(reason||"completed"),successfulInteractions:wave.successfulInteractions||0,settledAt:new Date().toISOString(),transactionCount:entries.length};
    next.activeWave=null;
    return {ok:true,state:next,wave:next.lastSettledWave,transactions:entries};
  }
  function gameAssetRows(raw,gameId){
    const id=String(gameId||"").toLowerCase(),rows=assetRows(raw);
    const defaults={bubble:["xp","hp","hpPills"],mana:["mana","manaCapsules","hp"],chaos:["hp","mana","xp","hpPills","manaCapsules"]};
    const keys=gameAssetRegistry.get(id)||new Set(defaults[id]||["hp"]);
    return rows.filter(row=>keys.has(row.key));
  }
  function assetRows(raw){
    const s=normalizeSave(raw),rows=[
      {key:"xp",label:"XP",value:s.xp,unit:"",group:"progression"},
      {key:"mana",label:"Mana",value:s.mana,unit:"",group:"resources"},
      {key:"hp",label:"HP",value:s.hp,unit:"/ 10",group:"vitals"},
      {key:"hpPills",label:"HP Capsules",value:s.hpPills,unit:"",group:"consumables"},
      {key:"manaCapsules",label:"Mana Capsules",value:s.manaCapsules,unit:"",group:"consumables"},
      {key:"casinoCredits",label:"Casino Credits",value:s.casinoCredits,unit:"",group:"games"},
      {key:"xCredits",label:"X Credits",value:s.xCredits,unit:"",group:"currency"},
      {key:"nCredits",label:"N Credits",value:s.nCredits,unit:"",group:"currency"}
    ];
    const dynamic=s.assets&&typeof s.assets==="object"&&!Array.isArray(s.assets)?s.assets:{};
    for(const [key,definition] of assetRegistry){
      if(Object.prototype.hasOwnProperty.call(dynamic,key)){
        const value=Number(dynamic[key]);if(Number.isFinite(value))rows.push({key,label:definition.label,value,unit:definition.unit,group:definition.group});
      }
    }
    for(const [key,value] of Object.entries(dynamic)){
      if(assetRegistry.has(key))continue;
      const amount=Number(value);if(Number.isFinite(amount))rows.push({key,label:key.replace(/[-_]/g," ").replace(/\b\w/g,c=>c.toUpperCase()),value:amount,unit:"",group:"game"});
    }
    return rows.filter(row=>Number.isFinite(Number(row.value))&&Number(row.value)>0&&(row.key!=="manaCapsules"||Number(row.value)>1||s.mana>0));
  }
  function isExchangeableAsset(raw,key){
    if(typeof key!=="string"||!key)return false;
    const s=normalizeSave(raw);
    if(s.nonExchangeableAssets.includes(key))return false;
    return !s.transactions.some(tx=>{
      if(!tx||!tx.deltas)return false;
      if(Array.isArray(tx.exchangeExcludedKeys)&&tx.exchangeExcludedKeys.includes(key))return true;
      return tx.kind==="purchase"&&Number(tx.deltas[key])>0;
    });
  }
  function exchangeAssetRows(raw){return assetRows(raw).filter(row=>isExchangeableAsset(raw,row.key));}
  function assetHistory(raw,key){
    const s=normalizeSave(raw),current=Number(s[key]);
    if(!Number.isFinite(current)||!["xp","mana","hp","hpPills","manaCapsules","casinoCredits"].includes(key))return [];
    const entries=s.transactions.filter(tx=>tx&&tx.deltas&&Number.isFinite(Number(tx.deltas[key]))).slice(-MAX_TRANSACTIONS);
    const net=entries.reduce((sum,tx)=>sum+Number(tx.deltas[key]),0);
    let balance=current-net;
    const points=[{id:"start",at:entries[0]?.at||"",title:"Start of recorded history",delta:0,balance}];
    for(const tx of entries){
      const delta=Number(tx.deltas[key]);
      balance+=delta;
      points.push({id:String(tx.id||""),at:String(tx.at||""),title:String(tx.title||tx.kind||"Asset change"),delta,balance});
    }
    if(!entries.length)points.push({id:"current",at:"",title:"Current balance · no recorded changes",delta:0,balance:current});
    return points;
  }
  return {MAX_HP,HP_PILL_COST,MAX_TRANSACTIONS,normalizeSave,buyHpPill,useHpPill,grantXP,settleCasinoRound,beginWave,recordWaveDelta,settleWave,registerAsset,registerGameAssets,assetRows,exchangeAssetRows,isExchangeableAsset,gameAssetRows,assetHistory};
});