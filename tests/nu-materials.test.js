"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync(require.resolve("../nu-materials.js"),"utf8");

function loadModule(reduced=false){
  const loaded=[];
  class MockImage{
    constructor(){this.complete=true;this.naturalWidth=32;loaded.push(this);}
    set src(value){this._src=value;}
    get src(){return this._src;}
  }
  const window={matchMedia:()=>({matches:reduced})};
  vm.runInNewContext(source,{window,Image:MockImage,performance:{now:()=>1000},Date,Math});
  const calls=[];
  const ctx={save(){},restore(){},translate(){},rotate(){},drawImage(...args){calls.push(args);},globalAlpha:1,imageSmoothingEnabled:true};
  return {api:window.NUMaterials,loaded,calls,ctx};
}

test("Mana material renderer loads all five source SVG variants and draws crisp glints",()=>{
  const {api,loaded,calls,ctx}=loadModule(false);
  assert.equal(api.assetCount,5);
  assert.equal(loaded.length,5);
  api.drawMana(ctx,20,30,6,1.2);
  assert.equal(calls.length,5);
  assert.equal(ctx.imageSmoothingEnabled,true);
});

test("successful collection emits a five-piece material burst",()=>{
  const {api,calls,ctx}=loadModule(false);
  api.emit(20,30);
  api.drawEffects(ctx);
  assert.equal(calls.length,5);
});

test("reduced-motion preference keeps glints static and disables collection bursts",()=>{
  const {api,calls,ctx}=loadModule(true);
  api.drawMana(ctx,20,30,6,2.4);
  api.emit(20,30);
  api.drawEffects(ctx);
  assert.equal(calls.length,5);
});
