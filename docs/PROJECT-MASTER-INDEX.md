# N.U Project — Master Documentation Index

**Status:** canonical navigation and conflict-resolution index  
**Updated:** 2026-11-15

This file is the entry point for N.U technical documentation. It does not erase historical records or replace original creative publications. It identifies which documents are current, which are implementation records, and which are archived evidence.

## 1. Current product surfaces

| Surface | Current truth | Canonical document |
|---|---|---|
| Public N.U interactive world | Browser-based Generation 1 prototype; local saves; no server account or cloud wallet | \`README.md\`, \`NU-GENERATION-1-MANIFEST.json\` |
| Native Windows launcher v0.1 | XP-first x86 image-only shell; separate from the browser preview | \`docs/LAUNCHER-UNIFIED-SPEC.md\` |
| Browser launcher calibration | Browser-only preview; capability signals are approximate; budget is not yet enforced by all game loops | \`NU-LAUNCHER-ARCHITECTURE.md\`, \`NU-LAUNCHER-MANIFEST.json\`, \`NU-LAUNCHER-HUMAN-QA.md\` |
| Graphics and world art | Browser renderers and archived/reference artwork; browser visual QA remains distinct from native launcher QA | \`NU-MODULAR-GRAPHICS-ARCHITECTURE-2026-11-11.md\`, \`NU-WORLD-VISUAL-BIBLE-G1.5.md\`, \`NU-WORLD-VISUAL-BIBLE-G1.6.md\` |
| Wallet and virtual economy | Browser-local prototype state; not a real account, payment or server-authoritative ledger | \`NU-GENERATION-1-MANIFEST.json\`, relevant wallet/Exchange operation records |
| Protected classic resource HUD | Locked; no edits without a fresh direct user instruction naming that HUD | \`AGENTS.md\`, \`docs/operations/LOCKED-AREAS.md\` |

## 2. Source-of-truth rules

When documents disagree, apply this order:

1. Current source code on the target branch describes what is actually implemented.
2. The current manifest describes intended package composition, but code wins if they disagree.
3. The latest canonical architecture/specification describes the accepted target contract.
4. QA reports describe what was actually tested, with the exact platform and date.
5. Dated implementation records explain why a change was made.
6. Backups, snapshots, conversation archives and old generation notes are historical evidence only.

A document that says "planned", "candidate", "pending", "future", "should" or "intended" is not proof of implementation. A test file existing is not proof that the test passed. A passing Node/CI test is not proof of browser or physical-device acceptance.

## 3. Recommended reading path

1. \`README.md\` — public project summary and known product limits.
2. \`NU-GENERATION-1-MANIFEST.json\` — current browser demo entry points and modules.
3. \`docs/LAUNCHER-UNIFIED-SPEC.md\` — native XP-first downloadable launcher.
4. \`NU-LAUNCHER-ARCHITECTURE.md\` — separate browser calibration preview.
5. \`NU-LAUNCHER-HUMAN-QA.md\` — manual browser-preview acceptance.
6. \`docs/operations/LOCKED-AREAS.md\` — protected HUD rules before any code edit.
7. Relevant \`docs/operations/*\` records — scoped implementation history.

## 4. Important separation of concepts

- **Native installer compatibility** means setup can install and uninstall on a Windows version.
- **Native launcher compatibility** means the small Win32 shell can start and show its image.
- **Browser compatibility** means the default browser can render the N.U web hub.
- **Game compatibility** means the game code, APIs and storage behave correctly.
- **Adaptive performance** means the running workload consumes the selected budget; merely measuring or saving a score does not implement this.

These are separate acceptance gates and must be reported separately.

## 5. Documentation maintenance

- Add new stable technical contracts under \`docs/\` and link them here.
- Keep one current specification per product surface; avoid creating competing "final" documents.
- Keep dated operation records concise and link them to the relevant canonical spec.
- Mark superseded documents as historical; do not silently delete useful decision history.
- Update manifests when package composition or capabilities change.
- Record platform-specific test evidence with OS edition/version/architecture, test date, result and known limitations. Do not infer exact OS versions from a user's inability to identify them.
