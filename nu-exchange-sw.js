/* N.U Exchange offline shell cache. Player data remains in the canonical local save. */
"use strict";
const CACHE_NAME="nu-exchange-offline-v1";
const APP_ASSETS=[
 "./exchange.html",
 "./nu-exchange.css?v=20261115-ambient-drawing-r1",
 "./nu-engine.js",
 "./nu-wallet.js?v=20261115-exchange-purchase-exclusion-r2",
 "./nu-exchange-core.js?v=20261114-modular-r1",
 "./nu-exchange-engines.js?v=20261115-dual-engine-r2",
 "./nu-exchange-guard.js?v=20261114-modular-r1",
 "./nu-exchange-replay.js?v=20261115-number-free-periods-r1",
 "./nu-exchange-lock.js?v=20261114-modular-r1",
 "./nu-market-sim.js?v=20261115-purchase-exclusion-r2",
 "./nu-exchange-visuals.js?v=20261115-ambient-drawing-r2",
 "./nu-exchange-analytics.js?v=20261115-market-analytics-r1",
 "./nu-exchange.js?v=20261115-market-analytics-r1"
];
const APP_PATHS=APP_ASSETS.map(path=>new URL(path,self.registration.scope).pathname);
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("nu-exchange-offline-")&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET")return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||!APP_PATHS.includes(url.pathname))return;
 if(request.mode==="navigate"&&url.pathname.endsWith("/exchange.html")){
  event.respondWith(fetch(request).then(response=>{
   if(response&&response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
   return response;
  }).catch(()=>caches.match(request).then(cached=>cached||caches.match(new URL("./exchange.html",self.registration.scope).href))));
  return;
 }
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(response&&response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
  return response;
 })));
});
