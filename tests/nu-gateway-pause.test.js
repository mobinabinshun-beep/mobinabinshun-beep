"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {create}=require("../nu-gateway-pause.js");
const makeState=(overrides={})=>({active:true,paused:false,turn:3,...overrides});

test("Gateway pauses an active round and closing it does not resume the round",()=>{
 const pause=create(),state=makeState();
 assert.equal(pause.open(state),true);
 assert.deepEqual(state,{active:false,paused:true,turn:3});
 assert.equal(pause.ownsPause(),true);
 assert.equal(pause.close(),true);
 assert.deepEqual(state,{active:false,paused:true,turn:3});
 assert.equal(pause.ownsPause(),false);
});

test("Gateway does not claim ownership of a pause that existed before opening",()=>{
 const pause=create(),state=makeState({active:false,paused:true});
 assert.equal(pause.open(state),false);
 assert.equal(pause.ownsPause(),false);
 assert.equal(pause.close(),false);
 assert.deepEqual(state,{active:false,paused:true,turn:3});
});

test("Gateway does not create ownership when the game is inactive",()=>{
 const pause=create(),state=makeState({active:false,paused:false});
 assert.equal(pause.open(state),false);
 assert.equal(pause.close(),false);
 assert.deepEqual(state,{active:false,paused:false,turn:3});
});

test("Closing a completed round releases Gateway ownership but leaves it inactive",()=>{
 const pause=create(),state=makeState();
 assert.equal(pause.open(state),true);
 state.turn=10;
 assert.equal(pause.close(),true);
 assert.deepEqual(state,{active:false,paused:true,turn:10});
 assert.equal(pause.ownsPause(),false);
});

test("Repeated close events cannot resume and reset discards stale ownership",()=>{
 const pause=create(),state=makeState();
 assert.equal(pause.open(state),true);
 assert.equal(pause.close(),true);
 assert.equal(pause.close(),false);
 pause.reset();
 assert.equal(pause.close(),false);
});
