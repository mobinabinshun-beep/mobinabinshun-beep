const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("nu-world.css", "utf8");
const playerUi = fs.readFileSync("nu-player-ui.js", "utf8");

test("restores the first Gen1 display-only profile placeholder", () => {
  assert.match(html, /<h2>N\.U PLAYER PROFILE<\/h2>/);
  assert.match(html, /class="demo-avatar"/);
  for (const id of ["demo-name","demo-call","demo-family","demo-age"]) assert.ok(html.includes('id="'+id+'"'));
  assert.match(html, /DEMO ONLY · NO UPLOAD/);
  assert.match(html, /Values are temporary and are not saved/);
});

test("the original profile uses the 150px image placeholder and two-column field grid", () => {
  assert.match(css, /\.demo-profile-card\{display:grid;grid-template-columns:150px 1fr/);
  assert.match(css, /\.demo-profile-fields\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media\(max-width:600px\)\{\.demo-profile-card\{grid-template-columns:1fr\}/);
});

test("the historical profile stays display-only while exposing four temporary appearance comparison controls", () => {
  assert.doesNotMatch(html, /player-id-number|player-rank-hue|player-identity-save/);
  for (const id of ["demo-card-hue","demo-card-tone","demo-card-lightness","demo-card-saturation"]) assert.ok(html.includes('id="'+id+'"'));
  assert.match(html, /CARD APPEARANCE · DEMO CONTROLS/);
  assert.ok(html.indexOf('class="demo-profile-card"') < html.indexOf('class="demo-profile-appearance"'));
  assert.match(css, /#demo-card-hue::-webkit-slider-runnable-track/);
  assert.match(css, /#demo-card-tone::-webkit-slider-runnable-track/);
  assert.match(css, /#demo-card-lightness::-webkit-slider-runnable-track/);
  assert.match(css, /#demo-card-saturation::-webkit-slider-runnable-track/);
  assert.match(playerUi, /--demo-card-saturation/);
  assert.match(html, /saved appearance settings are available/);
  assert.match(playerUi, /if\(!\$\("player-id"\)\)return/);
  assert.match(playerUi, /demo-profile-warning/);
  assert.match(playerUi, /demo-profile-close/);
  assert.match(playerUi, /applyAppearance\(true\)/);
  assert.match(playerUi, /--demo-card-hue/);
  assert.match(playerUi, /--demo-neutral-alpha/);
});


test("unified workshop exposes explicit privacy, private-view simulation and staged appearance confirmation", () => {
  for (const marker of ["demo-public-preview","demo-private-preview","demo-appearance-confirm","demo-appearance-reset"]) assert.ok(html.includes('id="'+marker+'"'));
  for (const field of ["demo-name","demo-call","demo-family","demo-age"]) assert.ok(html.includes('data-demo-public="'+field+'"'));
  assert.match(html, /All fields start private/);
  assert.match(playerUi, /STAGE B COMPLETE/);
  assert.match(playerUi, /control.disabled=locked/);
  assert.match(playerUi, /resetWorkshop\(\)/);
});

test("image placement concept has eight cells and local-only file preview", () => {
  assert.equal((html.match(/data-demo-placement=/g)||[]).length,8);
  assert.match(html, /type="file" accept="image\/\*"/);
  assert.match(playerUi, /readAsDataURL/);
  assert.match(playerUi, /PLACEHOLDER IMAGE · POSITION 1 OF 8/);
  assert.match(css, /\.demo-placement-grid\{display:grid;grid-template-columns:repeat\(4/);
});

test("profile keeps game stats and wallet outside the historical display card", () => {
  assert.match(html, /GAME STATUS &amp; WALLET BOUNDARY/);
  assert.match(html, /PROFILE CARD.*DISPLAY IDENTITY ONLY/);
  assert.doesNotMatch(html, /player-id-number/);
});

test("final preview lock leaves only image replacement and placement controls editable", () => {
  assert.match(playerUi, /demoFields\.forEach\(id=>\{const field=\$\(id\);if\(field\)field\.disabled=lockFields;\}\)/);
  assert.match(playerUi, /publicToggles\.forEach\(toggle=>\{toggle\.disabled=locked;\}\)/);
  assert.match(playerUi, /demoPrivatePreview\.disabled=locked/);
  assert.match(playerUi, /imageInput\.addEventListener\("change"/);
  assert.match(playerUi, /\[data-demo-placement\]/);
});

test("extended operational profile concepts and visual design controls are present", () => {
  for (const id of ["demo-age-band","demo-bio","demo-interests","demo-frame-material","demo-card-font","demo-corners","demo-holo","demo-glow","demo-glass","demo-scanlines","demo-data-texture","demo-motion","demo-quality"]) {
    assert.ok(html.includes('id="'+id+'"'), "missing "+id);
  }
  assert.match(html, /LOCAL SAVE, SECURITY &amp; FUTURE NETWORK/);
  assert.match(html, /ENCRYPTED EXPORT \/ VALIDATED IMPORT/);
  assert.match(playerUi, /applyVisualDesign\(true\)/);
  assert.match(css, /\.demo-profile-card\.has-scanlines/);
  assert.match(css, /\.demo-profile-card\.has-data-texture/);
});

test("extended profile fields and visual controls are disabled after confirmation", () => {
  assert.match(playerUi, /document\.querySelectorAll\("\[data-demo-editable\]"\)/);
  assert.match(playerUi, /demo-age-band","demo-bio","demo-interests/);
  assert.match(playerUi, /demoFields\.forEach\(id=>\{const field=\$\(id\);if\(field\)field\.disabled=locked;\}\)/);
});

test("human review can compare age, stats, lock and card-privacy alternatives", () => {
  for (const id of ["demo-age-model","demo-stats-location","demo-lock-policy","demo-card-privacy"]) assert.ok(html.includes('id="'+id+'"'));
  for (const value of ['value="compare"','value="exact"','value="band"','value="none"','value="appearance"','value="appearance-fields"','value="full"','value="card"','value="separate"','value="wallet"','value="hidden"']) assert.ok(html.includes(value));
  assert.match(playerUi,/function applyAgeModel/);
  assert.match(playerUi,/function applyStatsLocation/);
  assert.match(playerUi,/STAGE B · LOCK SIMULATION ACTIVE/);
});

test("private access, recovery and sharing are explicit local-only simulations", () => {
  for (const id of ["demo-passphrase-test","demo-private-yes","demo-private-no","demo-auth-model","demo-auth-state","demo-recovery-mode","demo-recovery-preview","demo-share-consent","demo-share-preview","demo-share-state"]) assert.ok(html.includes('id="'+id+'"'));
  assert.match(html,/Never enter a real password or passphrase/);
  assert.match(playerUi,/NO DATA WAS SAVED OR RECOVERED/);
  assert.match(playerUi,/NO DATA SENT/);
  assert.match(playerUi,/NOT AUTHENTICATED/);
});

test("image fit and placement alternatives remain editable after full preview lock", () => {
  for (const id of ["demo-image-fit","demo-placement-mode"]) assert.ok(html.includes('id="'+id+'"'));
  assert.match(playerUi,/photoControl=\["demo-image-fit","demo-placement-mode"\]/);
  assert.match(playerUi,/applyVisualDesign\(true\);applyAgeModel\(\);applyStatsLocation\(\)/);
});

test("full review matrix includes security, storage, sharing and placement simulations", () => {
  for (const id of ["demo-save-preview","demo-export-preview","demo-import-preview","demo-sync-preview","demo-storage-state","demo-storage-options-preview","demo-platform-target","demo-launcher-model","demo-save-model","demo-export-model","demo-import-model","demo-sync-model","demo-stats-card-preview","demo-image-fit","demo-placement-mode","demo-reduced-effects","demo-high-contrast"]) {
    assert.ok(html.includes('id="'+id+'"'), "missing "+id);
  }
  assert.match(playerUi,/NO FILE, SAVE OR NETWORK REQUEST CREATED/);
  assert.match(playerUi,/demo-platform-target/);
  assert.match(playerUi,/demo-high-contrast/);
  assert.match(playerUi,/demo-reduced-effects/);
  assert.match(playerUi,/PHOTO SLOT /);
  assert.match(playerUi,/IMAGE ANCHOR /);
  assert.match(playerUi,/demo-stats-card-preview/);
});

test("closing the profile clears extended personal fields and fake passphrase input", () => {
  assert.match(playerUi,/demo-age-band","demo-bio","demo-interests","demo-passphrase-test/);
  assert.match(playerUi,/resetWorkshop\(\)/);
  assert.match(playerUi,/applyAppearance\(true\);applyVisualDesign\(true\);applyAgeModel\(\);applyStatsLocation\(\)/);
});
