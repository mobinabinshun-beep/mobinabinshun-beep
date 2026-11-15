import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../nu-launcher.js", import.meta.url), "utf8");

test("fresh installs default to automatic calibration", () => {
  assert.match(source, /mode:"automatic"\},JSON\.parse\(localStorage\.getItem\(PREF\)\|\|"\{\}"\)\)/);
  assert.match(source, /mode:"automatic"\}\}/);
});

test("startup shows the manual level chooser only when explicitly requested", () => {
  assert.match(source, /calibrate\(!!p\.ask\)\.catch\(fail\)/);
});

test("automatic profile is persisted locally after calibration", () => {
  assert.match(source, /function apply\(n\)[\s\S]*localStorage\.setItem\(KEY,JSON\.stringify\(profile\)\)/);
});
