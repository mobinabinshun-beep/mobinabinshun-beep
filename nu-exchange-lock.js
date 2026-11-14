/* N.U Exchange maintenance latch. UX safeguard only; not authentication or anti-cheat. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUExchangeLock=api;
})(typeof window!=="undefined"?window:globalThis,function(){
 "use strict";
 const KEY="nu_exchange_transfer_locked_v1",PHRASE="UNLOCK N.U EXCHANGE";
 function create(storage){
  let armedAt=0;
  function isLocked(){try{return !storage||storage.getItem(KEY)!=="unlocked";}catch(_){return true;}}
  function begin(phrase,now){if(String(phrase||"").trim()!==PHRASE)return {ok:false,reason:"PHRASE_MISMATCH"};armedAt=Number(now)||Date.now();return {ok:true,reason:"SECOND_CONFIRMATION_REQUIRED"};}
  function confirm(phrase,now){
   const time=Number(now)||Date.now();
   if(!armedAt||time-armedAt<500||time-armedAt>30000)return {ok:false,reason:"RESTART_TWO_STEP"};
   if(String(phrase||"").trim()!==PHRASE)return {ok:false,reason:"PHRASE_MISMATCH"};
   try{storage.setItem(KEY,"unlocked");}catch(_){return {ok:false,reason:"STORAGE_UNAVAILABLE"};}
   armedAt=0;return {ok:true,locked:false};
  }
  function relock(){try{storage&&storage.setItem(KEY,"locked");}catch(_){}armedAt=0;}
  return {isLocked,begin,confirm,relock};
 }
 return {KEY,PHRASE,create};
});
