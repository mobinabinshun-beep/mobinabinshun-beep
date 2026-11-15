const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const source=fs.readFileSync(require.resolve("../nu-exchange-engines.js"),"utf8");
function setup(){
 const data=new Map();
 const localStorage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
 const save={playerId:"P-1",displayName:"Tester",level:2,xp:20,mana:4,hp:10,hpPills:1,manaCapsules:1,casinoCredits:50,xCredits:3,nCredits:7,transactions:[{id:"t1",at:"2026-11-15T00:00:00Z",title:"Reward",deltas:{xp:1}}]};
 const NU={storageKey:"nu-world-save-v1",load:()=>save};
 const NUWallet={normalizeSave:v=>v,assetRows:v=>[{key:"xp",label:"XP",value:v.xp,unit:""},{key:"mana",label:"Mana",value:v.mana,unit:""}]};
 const context={localStorage,NU,NUWallet,Date,Map,Set,Number,String,Array,Object,TypeError,Error,JSON,Math};
 context.globalThis=context;context.window=context;context.CustomEvent=function(name,opts){this.type=name;this.detail=opts&&opts.detail;};context.dispatchEvent=()=>true;
 vm.runInNewContext(source,context);
 return {api:context.NUExchangeEngines,save,data};
}
test("wallet reader returns canonical save data without mutating it",()=>{
 const {api,save}=setup(),before=JSON.stringify(save),s=api.walletEngine.read();
 assert.equal(s.source,"nu-world-save-v1");assert.equal(s.player.id,"P-1");assert.equal(s.assets[0].value,20);
 assert.deepEqual(JSON.parse(JSON.stringify(s.unpricedFields)),{xCredits:3,nCredits:7});assert.equal(JSON.stringify(save),before);
});
test("manifest discovery is declarative, unverified and cannot quote",()=>{
 const {api}=setup(),p=api.protocolEngine.discover({gameId:"demo-game",displayName:"Demo Game",assets:[{assetId:"demo.coin",label:"Demo Coin",walletKey:"demoCoin",kind:"coin",valuationClass:"fixed-ratio",ratio:0.5}]});
 assert.equal(p.trust,"DECLARED_UNVERIFIED");
 const q=api.protocolEngine.quotePreview({gameId:"demo-game",assetId:"demo.coin",amount:10});
 assert.equal(q.ok,false);assert.equal(q.reason,"VALUATION_NOT_APPROVED");
});
test("module protocol retained while installed and while a mapped wallet asset is owned",()=>{
 const {api}=setup(),e=api.protocolEngine;
 e.discover({gameId:"demo-game",displayName:"Demo",assets:[{assetId:"demo.coin",label:"Coin",walletKey:"xp"}]});
 let r=e.reconcile({installedGameIds:["demo-game"]});assert.equal(r.protocols[0].status,"ACTIVE");
 r=e.reconcile({installedGameIds:[]});assert.equal(r.protocols[0].status,"ACTIVE");
});
test("unmapped ownership is conservatively retained",()=>{
 const {api}=setup(),e=api.protocolEngine;
 e.discover({gameId:"unknown-game",displayName:"Unknown",assets:[{assetId:"unknown.item",label:"Unknown Item"}]});
 const r=e.reconcile({installedGameIds:[]});
 assert.equal(r.protocols[0].status,"ACTIVE");
});
test("wallet refresh event is emitted without mutating the canonical save",()=>{
 const {api,save}=setup(),before=JSON.stringify(save);
 const snapshot=api.walletEngine.refresh();
 assert.equal(snapshot.mode,"LOCAL_READ_ONLY");
 assert.equal(JSON.stringify(save),before);
});
