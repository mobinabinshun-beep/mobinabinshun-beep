/* N.U Gateway pause ownership — close never resumes gameplay. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.NUGatewayPause=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function create(){
    let ownsPause=false;
    return {
      open(state){
        if(!state||!state.active||state.paused)return false;
        ownsPause=true;
        state.active=false;
        state.paused=true;
        return true;
      },
      close(){
        if(!ownsPause)return false;
        ownsPause=false;
        return true;
      },
      ownsPause(){return ownsPause;},
      reset(){ownsPause=false;}
    };
  }
  return {create};
});