/* N.U Exchange core — modular game/asset registry. No provider is assumed. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.NUExchangeCore=api;
})(typeof window!=="undefined"?window:globalThis,function(root){
 "use strict";
 const games=new Map();
 let walletProvider=null;
 function connectWallet(provider){
  if(!provider||typeof provider.load!=="function"||!provider.wallet||typeof provider.wallet.normalizeSave!=="function"||typeof provider.wallet.assetRows!=="function")throw new TypeError("Read-only wallet provider is incomplete");
  walletProvider=provider;return walletSnapshot();
 }
 function disconnectWallet(){walletProvider=null;}
 function walletSnapshot(){
  if(!walletProvider)return null;
  const raw=walletProvider.load(),save=walletProvider.wallet.normalizeSave(raw);
  const assets=walletProvider.wallet.assetRows(save);
  return {source:"nu-world-save-v1",mode:"LOCAL_READ_ONLY",profileFamily:"nu.g1.shared-economy",player:{id:String(save.playerId||"LOCAL-PLAYER"),displayName:String(save.displayName||"N.U Explorer"),callsign:String(save.callsign||""),level:Number(save.level)||1,xp:Number(save.xp)||0},assets,unpricedFields:{xCredits:Number(save.xCredits)||0,nCredits:Number(save.nCredits)||0},transactions:Array.isArray(save.transactions)?save.transactions.slice(-10).reverse():[],transactionCount:Array.isArray(save.transactions)?save.transactions.length:0};
 }
 function registerGame(adapter){
  if(!adapter||typeof adapter!=="object")throw new TypeError("Game adapter required");
  const id=String(adapter.id||"").trim(),name=String(adapter.name||"").trim();
  if(!id||!name)throw new TypeError("Adapter id and name are required");
  const normalizeItems=items=>Array.isArray(items)?items.filter(a=>a&&a.id&&a.label).map(a=>({id:String(a.id),label:String(a.label),unit:String(a.unit||"")})):[];
  const assets=normalizeItems(adapter.assets),coins=normalizeItems(adapter.coins);
  const record={id,name,assets,coins,transferEnabled:adapter.transferEnabled===true,adapter};
  games.set(id,record);
  try{if(root&&typeof root.dispatchEvent==="function"&&typeof root.CustomEvent==="function")root.dispatchEvent(new root.CustomEvent("nu:exchange:registry-change"));}catch(_){}
  return ()=>{const removed=games.delete(id);try{if(removed&&root&&typeof root.dispatchEvent==="function"&&typeof root.CustomEvent==="function")root.dispatchEvent(new root.CustomEvent("nu:exchange:registry-change"));}catch(_){}return removed;};
 }
 function listGames(){return Array.from(games.values()).map(g=>({id:g.id,name:g.name,assetCount:g.assets.length,coinCount:g.coins.length,transferEnabled:g.transferEnabled}));}
 function listAssets(gameId){
  const selected=gameId?games.get(String(gameId)):null;
  if(gameId&&!selected)return [];
  const records=selected?[selected]:Array.from(games.values()),byId=new Map();
  records.forEach(g=>g.assets.forEach(a=>{
   const item=byId.get(a.id)||{id:a.id,label:a.label,unit:a.unit,games:[]};
   item.games.push({id:g.id,name:g.name});byId.set(a.id,item);
  }));
  return Array.from(byId.values());
 }
 function listCoins(gameId){
  const selected=gameId?games.get(String(gameId)):null;if(gameId&&!selected)return [];
  const records=selected?[selected]:Array.from(games.values()),byId=new Map();
  records.forEach(g=>g.coins.forEach(a=>{const item=byId.get(a.id)||{id:a.id,label:a.label,unit:a.unit,games:[]};item.games.push({id:g.id,name:g.name});byId.set(a.id,item);}));return Array.from(byId.values());
 }
 function transferAvailability(fromId,toId,itemId,amount,itemType){
  const from=games.get(String(fromId||"")),to=games.get(String(toId||""));
  if(!from||!to)return {ok:false,reason:"GAME_ADAPTER_MISSING"};
  if(from.id===to.id)return {ok:false,reason:"CHOOSE_DIFFERENT_GAMES"};
  if(!from.transferEnabled||!to.transferEnabled)return {ok:false,reason:"TRANSFER_ADAPTER_NOT_APPROVED"};
  const fromItems=itemType==="coin"?from.coins:from.assets,toItems=itemType==="coin"?to.coins:to.assets;
  if(!fromItems.some(a=>a.id===itemId)||!toItems.some(a=>a.id===itemId))return {ok:false,reason:"ITEM_NOT_SHARED"};
  if(!Number.isFinite(Number(amount))||Number(amount)<=0)return {ok:false,reason:"INVALID_AMOUNT"};
  return {ok:false,reason:"SETTLEMENT_NOT_IMPLEMENTED"};
 }
 async function transfer(){return {ok:false,reason:"CROSS_GAME_SETTLEMENT_DISABLED"};}
 function clear(){games.clear();}
 return {registerGame,listGames,listAssets,listCoins,connectWallet,disconnectWallet,walletSnapshot,transferAvailability,transfer,clear};
});
