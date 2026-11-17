/* N.U Controller Input Core — normalized, adapter-ready input without click-through. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.NUControllerInputCore=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const MODES=new Set(["physical-mouse","touch","gamepad","simulated-mouse","keyboard"]);
  function create(options){
    options=options||{};
    const bounds=options.bounds||{left:0,top:0,right:1,bottom:1};
    const step=Math.max(1,Number(options.step)||24);
    const onMove=typeof options.onMove==="function"?options.onMove:()=>{};
    const onConfirm=typeof options.onConfirm==="function"?options.onConfirm:()=>{};
    const onCancel=typeof options.onCancel==="function"?options.onCancel:()=>{};
    let mode=MODES.has(options.mode)?options.mode:"physical-mouse";
    let x=Number.isFinite(options.x)?options.x:((bounds.left+bounds.right)/2);
    let y=Number.isFinite(options.y)?options.y:((bounds.top+bounds.bottom)/2);
    let confirmHeld=false,cancelHeld=false;
    const state=()=>({mode,x,y});
    function setMode(next){
      if(!MODES.has(next))return false;
      mode=next;confirmHeld=false;cancelHeld=false;
      return true;
    }
    function move(dx,dy){
      const nx=Math.max(bounds.left,Math.min(bounds.right,x+dx*step));
      const ny=Math.max(bounds.top,Math.min(bounds.bottom,y+dy*step));
      if(nx===x&&ny===y)return false;
      x=nx;y=ny;onMove(state());return true;
    }
    function keyDown(event){
      if(!event||mode!=="simulated-mouse")return false;
      const directions={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
      if(directions[event.key]){
        event.preventDefault?.();
        const [dx,dy]=directions[event.key];
        move(dx,dy);
        return true;
      }
      if(event.key==="Enter"&&!confirmHeld){
        event.preventDefault?.();confirmHeld=true;onConfirm(state());return true;
      }
      if((event.key==="Escape"||event.key==="Backspace")&&!cancelHeld){
        event.preventDefault?.();cancelHeld=true;onCancel(state());return true;
      }
      return false;
    }
    function keyUp(event){
      if(!event)return false;
      if(event.key==="Enter"){confirmHeld=false;return true;}
      if(event.key==="Escape"||event.key==="Backspace"){cancelHeld=false;return true;}
      return false;
    }
    function gamepadInput(input){
      if(mode!=="gamepad"||!input)return false;
      const dx=(input.left?-1:0)+(input.right?1:0);
      const dy=(input.up?-1:0)+(input.down?1:0);
      if(dx||dy)move(dx,dy);
      if(input.confirm&&!confirmHeld){confirmHeld=true;onConfirm(state());}
      if(!input.confirm)confirmHeld=false;
      if(input.cancel&&!cancelHeld){cancelHeld=true;onCancel(state());}
      if(!input.cancel)cancelHeld=false;
      return !!(dx||dy||input.confirm||input.cancel);
    }
    function setPosition(nextX,nextY){
      if(!Number.isFinite(nextX)||!Number.isFinite(nextY))return false;
      x=Math.max(bounds.left,Math.min(bounds.right,nextX));
      y=Math.max(bounds.top,Math.min(bounds.bottom,nextY));
      onMove(state());return true;
    }
    function resetHeld(){confirmHeld=false;cancelHeld=false;}
    return {getState:state,setMode,move,keyDown,keyUp,gamepadInput,setPosition,resetHeld};
  }
  return {create,MODES:[...MODES]};
});
