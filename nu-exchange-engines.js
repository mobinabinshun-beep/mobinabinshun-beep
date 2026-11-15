/* N.U Exchange engines: wallet reader + manifest protocol discovery. No settlement. */
(function(root){
 "use strict";
 const STORE="nu.exchange.protocols.v1",RETENTION_DAYS=30;
 const now=()=>Date.now(),safeId=v=>String(v||"").trim().toLowerCase().replace(/[^a-z0-9._:-]/g,"").slice(0,96);
 function readStore(){try{const v=JSON.parse(root.localStorage.getItem(STORE)||"{}");return v&&typeof v==="object"?v:{}}catch(_){return {}}}
 function writeStore(v){root.localStorage.setItem(STORE,JSON.stringify(v));}
 function walletReader(){
  if(!root.NU||!root.NUWallet)throw new Error("Canonical N.U wallet is not available");
  const raw=root.NU.load(),save=root.NUWallet.normalizeSave(raw);
  return {source:"nu-world-save-v1",player:{id:String(save.playerId||"LOCAL-PLAYER"),name:String(save.displayName||"N.U Explorer"),level:Number(save.level)||1},assets:root.NUWallet.assetRows(save),transactions:Array.isArray(save.transactions)?save.transactions.slice(-40):[],readAt:new Date().toISOString()};
 }
 function walletEngine(){return {read:walletReader,refresh(){const snapshot=walletReader();root.dispatchEvent(new root.CustomEvent("nu:exchange:wallet-refresh",{detail:snapshot}));return snapshot;}}}
 function cleanManifest(m){
  if(!m||typeof m!=="object")throw new TypeError("Manifest object required");
  const gameId=safeId(m.gameId||m.id),name=String(m.displayName||m.name||"").trim().slice(0,100);
  if(!gameId||!name)throw new TypeError("gameId and displayName required");
  const assets=(Array.isArray(m.assets)?m.assets:[]).slice(0,200).map(a=>{
   const id=safeId(a&&a.assetId||a&&a.id),label=String(a&&a.label||a&&a.name||"").trim().slice(0,80);
   if(!id||!label)throw new TypeError("Each asset requires stable assetId and label");
   return {assetId:id,label,walletKey:safeId(a.walletKey),unit:String(a.unit||"").slice(0,24),kind:String(a.kind||"asset").slice(0,24),tradability:["shared-unit","fixed-ratio","dynamic-quote","non-convertible"].includes(a.valuationClass)?a.valuationClass:"unverified",ratio:a.ratio&&Number.isFinite(Number(a.ratio))&&Number(a.ratio)>0?Number(a.ratio):null,source:String(a.source||"module-manifest").slice(0,80)};
  });
  return {schemaVersion:1,gameId,displayName:name,manifestVersion:String(m.manifestVersion||"1").slice(0,32),assets,coins:assets.filter(a=>a.kind==="coin"),trust:"DECLARED_UNVERIFIED",installedAt:now()};
 }
 function protocolEngine(){
  function discover(manifest,{installed=true}={}){
   const p=cleanManifest(manifest),store=readStore(),old=store[p.gameId]||{};
   store[p.gameId]={...p,installed:!!installed,firstSeen:old.firstSeen||now(),lastSeen:now(),status:installed?"ACTIVE":"DORMANT",dormantUntil:null};
   writeStore(store);return store[p.gameId];
  }
  function reconcile({installedGameIds=[]}={}){
   const installed=new Set(installedGameIds.map(safeId)),store=readStore(),wallet=walletReader(),balances=new Map(wallet.assets.map(a=>[a.key,Number(a.value)||0])),removed=[];
   Object.keys(store).forEach(id=>{const p=store[id],owns=p.assets.some(a=>a.walletKey&&((balances.get(a.walletKey)||0)>0));
    if(installed.has(id)||p.installed||owns){p.installed=installed.has(id)||p.installed;p.status="ACTIVE";p.dormantUntil=null;p.lastSeen=now();}
    else if(!p.dormantUntil){p.status="DORMANT";p.dormantUntil=now()+RETENTION_DAYS*86400000;}
    else if(now()>=p.dormantUntil){delete store[id];removed.push(id);}
   });writeStore(store);return {protocols:Object.values(store),removed,retentionDays:RETENTION_DAYS};
  }
  function list(){return Object.values(readStore());}
  function quotePreview({gameId,assetId,amount}){
   const p=readStore()[safeId(gameId)],a=p&&p.assets.find(x=>x.assetId===safeId(assetId)),n=Number(amount);
   if(!a)return {ok:false,reason:"ASSET_PROTOCOL_NOT_FOUND"};
   if(!Number.isFinite(n)||n<=0)return {ok:false,reason:"INVALID_AMOUNT"};
   if(a.tradability==="non-convertible"||a.tradability==="unverified"||!a.ratio)return {ok:false,reason:"VALUATION_NOT_APPROVED",trust:p.trust};
   return {ok:true,mode:"PREVIEW_ONLY",gameId:p.gameId,assetId:a.assetId,sourceAmount:n,benchmarkAmount:n*a.ratio,ratio:a.ratio,trust:p.trust,settlement:false};
  }
  return {discover,reconcile,list,quotePreview,retentionDays:RETENTION_DAYS};
 }
 const api={walletEngine:walletEngine(),protocolEngine:protocolEngine()};
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.NUExchangeEngines=api;
})(typeof window!=="undefined"?window:globalThis);
