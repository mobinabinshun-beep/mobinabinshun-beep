"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const readJson=relative=>JSON.parse(fs.readFileSync(path.join(__dirname,"..",relative),"utf8"));
const registry=readJson("packages/registry.json");
const root=path.resolve(__dirname,"..");
const game=readJson("packages/nu-game-generation-1/manifest.json");
const studio=readJson("packages/nu-creative-studio/manifest.json");

test("registry declares separate game and Creative Studio packages",()=>{
 assert.deepEqual(registry.packages.map(p=>p.id),["nu.game.generation-1","nu.creative.studio"]);
 assert.equal(new Set(registry.packages.map(p=>p.id)).size,registry.packages.length);
});

test("Generation 1 package preserves frozen engine and excludes Generation 2",()=>{
 assert.equal(game.runtime.hostApi,"nu.launcher.host/v1");
 assert.equal(game.runtime.entry,"runtime/index.html");
 for(const file of game.payload.entryFiles) assert.ok(fs.statSync(path.join(root,"packages/nu-game-generation-1",file)).isFile(),`missing game payload: ${file}`);
 assert.equal(game.protectedComponents["nu-engine.js"].policy,"read-only-frozen-baseline");
 assert.equal(game.protectedComponents["nu-engine.js"].sha256GitBlob,"cda4f4157628aefaaac9ab95c047e4ca818c5f02");
 assert.equal(game.protectedComponents.generation2,"quarantined-and-excluded");
 assert.equal(game.resourcePolicy.gameMayRaiseHostBudget,false);
});

test("Studio image import has no product pixel ceiling and defers feasibility to the host system",()=>{
 const policy=studio.resourcePolicy.demoExecution;
 assert.equal(policy.resourceOwner,"user-device-and-browser");
 assert.match(policy.policy,/without-product-defined-pixel-or-file-size-ceilings/);
 assert.match(policy.failureBehavior,/preserve-original-source-and-previous-project/);
 assert.equal(policy.mayOverrideHostLimits,false);
 assert.equal(studio.hostServices.resourceBudget,"host-system-capability-best-effort-no-product-pixel-ceiling");
});

test("offline Studio has no mandatory network dependency and preserves source files",()=>{
 assert.equal(studio.hostServices.network,"disabled-by-default");
 assert.equal(studio.runtime.entry,"runtime/pixel-art-studio.html");
 for(const file of studio.payload.entryFiles) assert.ok(fs.statSync(path.join(root,"packages/nu-creative-studio",file)).isFile(),`missing Studio payload: ${file}`);
 assert.equal(studio.hostServices.originalSource,"immutable-reference-preserved");
 assert.equal(studio.resourcePolicy.offlineMode.requiresNetwork,false);
 assert.ok(studio.resourcePolicy.processing.preferred.includes("streaming"));
 assert.ok(studio.resourcePolicy.processing.preferred.includes("tiles"));
 assert.ok(studio.resourcePolicy.processing.never.includes("unbounded-full-image-duplication"));
});

test("all package manifests require integrity checks before activation",()=>{
 assert.equal(registry.security.verifyManifest,true);
 assert.equal(registry.security.verifyContentHashes,true);
 assert.equal(registry.security.verifyPublisherSignature,true);
 assert.equal(registry.security.atomicActivation,true);
 assert.equal(registry.security.rollbackToLastKnownGood,true);
 for(const manifest of [game,studio]){
  assert.equal(manifest.integrity.contentHashes,"SHA256SUMS.txt-generated-by-builder");
  assert.equal(manifest.integrity.publisherSignature,"not-signed-preview-bundle");
 }
});
