/* N.U Exchange visit guard — cooldown begins only when the 11th action is attempted. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUExchangeGuard=api;
})(typeof window!=="undefined"?window:globalThis,function(){
 "use strict";
 const LIMIT=10,COOLDOWN_MS=120000,KEY="nu_exchange_cooldown_until_v1";
 function create(options){
  const storage=options&&options.storage||null,now=options&&options.now||(()=>Date.now());
  let successes=0;
  function read(){try{return Number(storage&&storage.getItem(KEY))||0;}catch(_){return 0;}}
  function write(value){try{if(storage)storage.setItem(KEY,String(value));}catch(_){}}
  function state(){
   const until=read(),remaining=Math.max(0,until-now());
   if(!remaining&&until)write(0);
   return {successes,limit:LIMIT,remainingMs:remaining,locked:remaining>0,until:remaining?until:0};
  }
  function beforeAttempt(){
   const s=state();
   if(s.locked)return {allowed:false,reason:"COOLDOWN",...s};
   if(successes>=LIMIT){
    const until=now()+COOLDOWN_MS;write(until);
    return {allowed:false,reason:"COOLDOWN",successes,limit:LIMIT,remainingMs:COOLDOWN_MS,locked:true,until};
   }
   return {allowed:true,successes,limit:LIMIT,remainingMs:0,locked:false,until:0};
  }
  function recordSuccess(){if(state().locked)return false;successes=Math.min(LIMIT,successes+1);return true;}
  function leaveVisit(){successes=0;}
  return {beforeAttempt,recordSuccess,state,leaveVisit};
 }
 return {LIMIT,COOLDOWN_MS,KEY,create};
});
