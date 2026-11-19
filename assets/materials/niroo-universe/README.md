# N.U Material Layer Preview

This branch stages the Niroo Universe background material as a layered SVG preview.

- Base layer references the existing repository artwork at `assets/backgrounds/niroo-universe-background.svg` without modifying it.
- Separate SVG overlays provide orbit motion, day/night atmosphere, ambient particles, water shimmer and central light pulse.
- `manifest.json` defines stable layer IDs and z-order.

All overlays use the 1536×1024 reference coordinate system. Apply one camera transform to the entire scene group. The uploaded PNG is not yet pixel-compared with the existing repository SVG, so do not lock this material into production until visual identity is confirmed. The overlays are animated effect layers; painted objects in the flattened artwork have not been extracted as separate transparent cutouts.
