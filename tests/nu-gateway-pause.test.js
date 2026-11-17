"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {create}=require("../nu-gateway-pause.js");
const makeState=(overrides={})=>({active:true,paused:false,turn:3,...overrides});

test("Gateway freezes the round immediately and transfers pause to first gameplay interaction",()=>{
 const pause=create(),state=makeState();
 assert.equal(pause.open(state),true);
 assert.deepEqual(state,{active:false,paused:true,turn:3});
 assert.equal(pause.ownsPause(),true);
 assert.equal(pause.close(state),true);
 assert.deepEqual(state,{active:false,paused:true,turn:3});
 assert.equal(pause.ownsPause(),false);
 assert.equal(pause.isAwaitingInteraction(),true);
 assert.equal(pause.resumeOnInteraction(state),true);
 assert.deepEqual(state,{active:true,paused:false,turn:3});
 assert.equal(pause.isAwaitingInteraction(),false);
});

test("No pause can be created or released outside Gateway ownership",()=>{
 const pause=create(),state=makeState({active:false,paused:true});
 assert.equal(pause.open(state),false);
 assert.equal(pause.close(state),false);
 assert.equal(pause.resumeOnInteraction(state),false);
 assert.deepEqual(state,{active:false,paused:true,turn:3});
});

test("A new Gateway opening while awaiting gameplay input preserves the freeze",()=>{
 const pause=create(),state=makeState();
 pause.open(state);pause.close(state);
 assert.equal(pause.open(state),false);
 assert.equal(pause.isAwaitingInteraction(),true);
 assert.equal(pause.resumeOnInteraction(state),true);
});

test("Completed rounds cannot resume after Gateway closes",()=>{
 const pause=create(),state=makeState();
 pause.open(state);state.turn=10;
 assert.equal(pause.close(state),false);
 assert.equal(pause.resumeOnInteraction(state),false);
 assert.deepEqual(state,{active:false,paused:true,turn:10});
});

test("Repeated close events and reset cannot release stale pause ownership",()=>{
 const pause=create(),state=makeState();
 pause.open(state);assert.equal(pause.close(state),true);
 assert.equal(pause.close(state),false);
 assert.equal(pause.resumeOnInteraction(state),true);
 pause.open(state);pause.reset();
 assert.equal(pause.close(state),false);
 assert.equal(pause.isAwaitingInteraction(),false);
});