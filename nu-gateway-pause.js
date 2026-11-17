/* N.U Gateway pause ownership — Gateway is the only gameplay pause authority. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.NUGatewayPause=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function create(){
    let ownsPause=false,awaitingInteraction=false;
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
        // Gateway has closed, but gameplay stays frozen until a real gameplay input.
        awaitingInteraction=true;
        state.active=false;
        state.paused=true;
        return true;
      },
      resumeOnInteraction(state){
        if(!awaitingInteraction)return false;
        awaitingInteraction=false;
        if(!state||!state.paused||state.turn>=10)return false;
        state.paused=false;
        state.active=true;
        return true;
      },
      isAwaitingInteraction(){return awaitingInteraction;},
      reset(){ownsPause=false;awaitingInteraction=false;},
      ownsPause(){return ownsPause;}
    };
  }
  return {create};
});