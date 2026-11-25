"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { validateStudioProject } = require("../nu-studio-pro-tools.js");

function fixture() {
  const blank = Array(4).fill(null);
  return {
    format: "N.U-Pixel-Art-Studio-Project",
    version: 1,
    project: {
      width: 2,
      height: 2,
      layers: [
        { name: "Layer 1", pixels: ["#ff0000", null, null, null], opacity: 100, visible: true, locked: false, mask: [1, 1, 1, 1], blend: "normal", group: "Ungrouped" },
        { name: "Layer 2", pixels: blank.slice(), opacity: 75, visible: true, locked: false, mask: null, blend: "multiply", group: "Group A" },
        { name: "Layer 3", pixels: blank.slice(), opacity: 100, visible: false, locked: true, mask: null, blend: "screen", group: "Background" },
        { name: "Layer 4", pixels: blank.slice(), opacity: 50, visible: true, locked: false, mask: null, blend: "add", group: "Foreground" }
      ],
      active: 1,
      selection: [1, 0, 1, 0],
      groups: { "Group A": { visible: true, opacity: 82 } },
      palette: ["#FF0000", "#00FF00"],
      color: "#ABCDEF",
      tool: "pencil",
      imageImported: true,
      sourceInfo: "2 × 2 source",
      settings: {
        zoom: 175, brushSize: 4, fadeIntensity: 35, mixBrushStrength: 65, viewRotation: 15,
        guideState: { blueprint: true, ruler: false, divisions: true, axes: false, depth: true },
        guideHighContrast: true, magnifierFactor: 6, magnifierSize: 180,
        bucket: "similar", tolerance: 18, symmetry: "horizontal",
        brushShape: "circle", texture: "dots", textureDensity: 72
      }
    }
  };
}

test("valid project normalizes colors and preserves all editable state", () => {
  const input = fixture();
  const result = validateStudioProject(input);
  assert.equal(result.project.width, 2);
  assert.equal(result.project.active, 1);
  assert.equal(result.project.layers[0].pixels[0], "#ff0000");
  assert.equal(result.project.layers[1].blend, "multiply");
  assert.equal(result.project.layers[1].opacity, 75);
  assert.deepEqual(result.project.selection, [1, 0, 1, 0]);
  assert.deepEqual(result.project.groups["Group A"], { visible: true, opacity: 82 });
  assert.equal(result.project.settings.zoom, 175);
  assert.equal(result.project.settings.texture, "dots");
  assert.equal(input.project.palette[0], "#FF0000", "validation must not mutate the source document");
});

test("rejects unknown project format and version", () => {
  const a = fixture(); a.format = "other";
  assert.throws(() => validateStudioProject(a), /unsupported format or version/);
  const b = fixture(); b.version = 2;
  assert.throws(() => validateStudioProject(b), /unsupported format or version/);
});

test("rejects unsupported dimensions and configured pixel-budget overflow", () => {
  const a = fixture(); a.project.width = 0;
  assert.throws(() => validateStudioProject(a), /canvas dimensions/);
  const b = fixture();
  assert.throws(() => validateStudioProject(b, { maxPixels: 3 }), /canvas dimensions/);
});

test("rejects wrong layer count, active index and pixel-array length", () => {
  const a = fixture(); a.project.layers.pop();
  assert.throws(() => validateStudioProject(a), /exactly four layers/);
  const b = fixture(); b.project.active = 4;
  assert.throws(() => validateStudioProject(b), /active layer index/);
  const c = fixture(); c.project.layers[0].pixels.pop();
  assert.throws(() => validateStudioProject(c), /pixel count/);
});

test("rejects malformed colors, masks and selection bits", () => {
  const a = fixture(); a.project.layers[0].pixels[0] = "red";
  assert.throws(() => validateStudioProject(a), /invalid color/);
  const b = fixture(); b.project.layers[0].mask = [1, 0];
  assert.throws(() => validateStudioProject(b), /mask size/);
  const c = fixture(); c.project.selection = [1, 0, 2, 0];
  assert.throws(() => validateStudioProject(c), /invalid mask bit/);
});

test("rejects unsafe group keys and invalid layer metadata", () => {
  const a = fixture(); a.project.groups = JSON.parse('{"__proto__":{"visible":true,"opacity":100}}');
  assert.throws(() => validateStudioProject(a), /unsupported layer group name/);
  const b = fixture(); b.project.layers[0].blend = "url";
  assert.throws(() => validateStudioProject(b), /blend\/group/);
  const c = fixture(); c.project.layers[0].opacity = 101;
  assert.throws(() => validateStudioProject(c), /opacity/);
});

test("rejects invalid settings and metadata", () => {
  const a = fixture(); a.project.settings.zoom = 900;
  assert.throws(() => validateStudioProject(a), /zoom is out of range/);
  const b = fixture(); b.project.settings.bucket = "unknown";
  assert.throws(() => validateStudioProject(b), /bucket is unsupported/);
  const c = fixture(); c.project.tool = "../script";
  assert.throws(() => validateStudioProject(c), /selected tool is invalid/);
  const d = fixture(); d.project.sourceInfo = "x".repeat(513);
  assert.throws(() => validateStudioProject(d), /source metadata/);
});
