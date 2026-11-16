"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {create}=require("../nu-gateway-pause.js");
const makeState=(overrides={})=>({active:true,paused:false,turn:3,...overrides});

test("Gateway pauses a running round and resumes exactly that pause",()=>{
 const pause=create(),state=makeState();
 assert.equal(pause.open(state),true);
 assert.deepEqual(state,{active:false,paused:true,turn:3});
 assert.equal(pause.ownsPause(),true);
 assert.equal(pause.close(state),true);
 assert.deepEqual(state,{active:true,paused:false,turn:3});
 assert.equal(pause.ownsPause(),false);
});

test("Gateway does not claim or release a pause that existed before opening",()=>{
 const pause=create(),state=makeState({active:false,paused:true});
 assert.equal(pause.open(state),false);
 assert.equal(pause.ownsPause(),false);
 assert.equal(pause.close(state),false);
 assert.deepEqual(state,{active:false,paused:true,turn:3});
});

test("Gateway does not create pause ownership when the game is inactive",()=>{
 const pause=create(),state=makeState({active:false,paused:false});
 assert.equal(pause.open(state),false);
 assert.equal(pause.close(state),false);
 assert.deepEqual(state,{active:false,paused:false,turn:3});
});

test("Gateway does not resume a round that completed while its pause was held",()=>{
 const pause=create(),state=makeState();
 assert.equal(pause.open(state),true);
 state.turn=10;
 assert.equal(pause.close(state),false);
 assert.deepEqual(state,{active:false,paused:true,turn:10});
 assert.equal(pause.ownsPause(),false);
});

test("Repeated close events cannot resume twice and reset discards stale ownership",()=>{
 const pause=create(),state=makeState();
 assert.equal(pause.open(state),true);
 assert.equal(pause.close(state),true);
 assert.equal(pause.close(state),false);
 assert.equal(pause.open(state),true);
 pause.reset();
 assert.equal(pause.close(state),false);
});
