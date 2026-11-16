/* N.U Gateway pause ownership — only releases a pause created by Gateway. */
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
      close(state){
        if(!ownsPause)return false;
        ownsPause=false;
        if(!state||!state.paused||state.turn>=10)return false;
        state.paused=false;
        state.active=true;
        return true;
      },
      reset(){ownsPause=false;},
      ownsPause(){return ownsPause;}
    };
  }
  return {create};
});
