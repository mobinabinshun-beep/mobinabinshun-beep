/* N.U Exchange replay clock — visual replay of real local player history only. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUExchangeReplay=api;
})(typeof window!=="undefined"?window:globalThis,function(){
 "use strict";
 const MODES=[
  {id:"24s",label:"24 seconds",durationMs:24000},
  {id:"1m24s",label:"1 minute 24 seconds",durationMs:84000},
  {id:"24m",label:"24 minutes",durationMs:1440000},
  {id:"1h24m",label:"1 hour 24 minutes",durationMs:5040000},
  {id:"24d",label:"24 days",durationMs:2073600000},
  {id:"2m24d",label:"2 months 24 days",durationMs:7344000000}
 ];
 function getMode(id){return MODES.find(m=>m.id===id)||MODES[0];}
 function frameIndex(elapsedMs,count,durationMs){
  if(!count)return -1;
  if(count===1)return 0;
  const duration=Math.max(1,Number(durationMs)||1),phase=((Math.max(0,elapsedMs)%duration)/duration);
  return Math.min(count-1,Math.floor(phase*count));
 }
 function visibleSteps(steps,index){return Array.isArray(steps)?steps.slice(0,Math.max(0,index+1)):[];}
 return {MODES,getMode,frameIndex,visibleSteps};
});
