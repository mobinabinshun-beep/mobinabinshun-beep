/* N.U Health Module — independent, game-fed health history. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.NUHealth=api;
})(typeof window!=="undefined"?window:globalThis,function(root){
  "use strict";
  const STORAGE_KEY="nu-health-records-v1";
  const MAX_EVENTS=5;
  const CATEGORIES=["medicationUses","damage","healing","deaths"];
  const empty=()=>({medicationUses:[],damage:[],healing:[],deaths:[]});
  const text=(value,max=120)=>typeof value==="string"?value.trim().slice(0,max):"";
  const positive=value=>{const n=Number(value);return Number.isFinite(n)&&n>0?Math.min(1000000,Math.abs(n)):0;};
  function createHealthStore(storage){
    function read(){
      try{
        const parsed=JSON.parse(storage.getItem(STORAGE_KEY)||"{}");
        const state=empty();
        CATEGORIES.forEach(key=>{state[key]=Array.isArray(parsed&&parsed[key])?parsed[key].filter(item=>item&&typeof item==="object").slice(-MAX_EVENTS):[];});
        return state;
      }catch(_){return empty();}
    }
    function write(state){
      try{storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch(_){return false;}
    }
    function append(category,payload){
      if(!CATEGORIES.includes(category)||!payload||typeof payload!=="object")return false;
      const state=read();
      const entry=Object.assign({
        id:"nu-health-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8),
        at:new Date().toISOString(),
        gameId:text(payload.gameId,64)||"unknown"
      },payload);
      state[category]=state[category].concat(entry).slice(-MAX_EVENTS);
      if(!write(state))return false;
      if(root&&typeof root.dispatchEvent==="function"&&typeof root.CustomEvent==="function"){
        root.dispatchEvent(new root.CustomEvent("nu:health-updated",{detail:{category}}));
      }
      return entry;
    }
    function recordMedicationUse(event){
      const itemName=text(event&&event.itemName,80);
      if(!itemName)return false;
      return append("medicationUses",{
        gameId:text(event.gameId,64)||"unknown",
        itemName,
        itemType:text(event.itemType,32)||"health_item",
        effect:text(event.effect,48)||"used",
        effectAmount:positive(event.effectAmount)
      });
    }
    function recordDamage(event){
      const amount=positive(event&&event.amount);
      if(!amount)return false;
      return append("damage",{
        gameId:text(event.gameId,64)||"unknown",
        amount,
        hpAfter:Number.isFinite(Number(event.hpAfter))?Math.max(0,Number(event.hpAfter)):null,
        reason:text(event.reason,100)||"damage"
      });
    }
    function recordHealing(event){
      const amount=positive(event&&event.amount);
      if(!amount)return false;
      return append("healing",{
        gameId:text(event.gameId,64)||"unknown",
        amount,
        hpAfter:Number.isFinite(Number(event.hpAfter))?Math.max(0,Number(event.hpAfter)):null,
        source:text(event.source,80)||"healing"
      });
    }
    function recordDeath(event){
      return append("deaths",{
        gameId:text(event&&event.gameId,64)||"unknown",
        reason:text(event&&event.reason,100)||"death",
        hpBefore:Number.isFinite(Number(event&&event.hpBefore))?Math.max(0,Number(event.hpBefore)):null
      });
    }
    function getHistory(category){
      if(!CATEGORIES.includes(category))return [];
      return read()[category].slice(-MAX_EVENTS);
    }
    function getAll(){return read();}
    return {STORAGE_KEY,MAX_EVENTS,createHealthStore,recordMedicationUse,recordDamage,recordHealing,recordDeath,getHistory,getAll};
  }
  let storage=null;
  try{storage=root&&root.localStorage?root.localStorage:null;}catch(_){storage=null;}
  if(!storage)return createHealthStore({getItem(){return null;},setItem(){return false;}});
  return createHealthStore(storage);
});
