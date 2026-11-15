"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

test("Exchange registers its scoped offline service worker and exposes cache status",()=>{
 const html=fs.readFileSync(path.join(__dirname,"../exchange.html"),"utf8");
 assert.match(html,/serviceWorker\.register\("\.\/nu-exchange-sw\.js"\)/);
 assert.match(html,/id="exchange-offline-status"/);
 assert.match(html,/OFFLINE CACHE READY/);
});

test("offline shell cache includes the Exchange page, wallet runtime, chart and audit modules",()=>{
 const sw=fs.readFileSync(path.join(__dirname,"../nu-exchange-sw.js"),"utf8");
 for(const asset of ["exchange.html","nu-engine.js","nu-wallet.js","nu-exchange-engines.js","nu-exchange-analytics.js","nu-exchange.js","nu-exchange.css"]){
  assert.ok(sw.includes(asset),asset+" must be precached");
 }
 assert.match(sw,/cache\.addAll\(APP_ASSETS\)/);
 assert.match(sw,/caches\.match\(request\)/);
 assert.match(sw,/request\.method!=="GET"/);
 assert.doesNotMatch(sw,/localStorage|transactions\s*=/);
});

test("Exchange offline cache does not replace or upload the canonical player save",()=>{
 const sw=fs.readFileSync(path.join(__dirname,"../nu-exchange-sw.js"),"utf8");
 assert.match(sw,/APP_PATHS\.includes\(url\.pathname\)/);
 assert.match(sw,/url\.origin!==self\.location\.origin/);
 assert.match(sw,/nu-exchange-offline-v1/);
});

test("precache URLs stay aligned with the exact runtime script and stylesheet references",()=>{
 const html=fs.readFileSync(path.join(__dirname,"../exchange.html"),"utf8");
 const sw=fs.readFileSync(path.join(__dirname,"../nu-exchange-sw.js"),"utf8");
 const start=sw.indexOf("const APP_ASSETS=[");
 const end=sw.indexOf("];",start);
 assert.ok(start>=0&&end>start,"offline asset manifest must exist");
 const block=sw.slice(start,end);
 const cached=Array.from(block.matchAll(/"([^"]+)"/g),match=>match[1]);
 const scripts=Array.from(html.matchAll(/<script src="([^"]+)"/g),match=>match[1]);
 const stylesheet=(html.match(/<link rel="stylesheet" href="([^"]*nu-exchange\.css[^"]*)"/)||[])[1];
 for(const asset of [...scripts,stylesheet].filter(Boolean))assert.ok(cached.includes(asset),asset+" must be in the offline precache");
});
