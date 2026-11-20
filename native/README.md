# N.U Native Runtime — Generation 1

Status: engineering candidate; not a public installer or playable release.

## Canonical project documents

- [Master engineering index and repository consolidation](../docs/architecture/NU-MASTER-ENGINEERING-INDEX-fa.md)
- [Unified Generation 1 runtime specification](../docs/architecture/NU-GEN1-UNIFIED-ENGINEERING-SPEC.md)
- [Pack 1 install / upgrade / uninstall contract](../docs/architecture/NU-PACK-1-USER-LIFECYCLE.md)
- [Generation 1 pack manifest](NU-GEN1-PACK-MANIFEST.json)
- [Translator, Pulse and resource-control contract](NU-LAUNCHER-GEN1-TRANSLATOR-RESOURCE-ARCHITECTURE-fa.md)
- [Machine and human acceptance checklist](NU-LAUNCHER-MACHINE-ACCEPTANCE-fa.md)
- [Generation 1 module contract](NUVM-1-GENERATION-1-MODULE-CONTRACT.md)

Only this master index determines document precedence. Dated reports and parallel PR descriptions are historical evidence, not competing normative specifications.

## Current code

- Portable C90 core, bounded NUVM bytecode interpreter and Generation 1 IR translator subset.
- Disk-backed FIFO cache with CRC-protected chunks (max 64 KiB) and quota enforcement.
- Unsigned NUPK/1 development-container builder carrying NUVM/1 bytecode; structural manifest parser.
- Fail-closed crypto-provider boundary; no production signing keys/trust roots.
- Bounded dependency resolver, cleanup planner, component reconciliation, in-memory journal state model, and NUDb/1 user-data bundle builder/parser for Save/Wallet/Profile/Assets/Settings classes.
- Minimal Win32/GDI host targeting XP-era subsystem metadata; loads one canonical still BMP from beside the executable and scales it with GDI. No animation, Canvas, WebGL, shader, browser or decorative image layers.

## Important format compatibility warning

Parallel candidate branches used the label `NUVM/1` for incompatible text and binary formats. This branch now separates the NUPK/1 package container from the NUVM/1 bytecode ISA and rejects the old binary container magic. Text-based modules from the old shell branches still require an explicit translator/importer and must not be passed directly to this runtime.

## Not yet implemented

No native playable ports of Bubble Hunt, Mana Collector or Chaos Attack; no complete translator registry/canonical IR; no production signature verification; no filesystem-transactional Package Manager; no three-stage installer/uninstaller; no data-bundle export/import; no complete RAM-ledger integration; no native GPU renderer; no actual Windows XP runtime certification.

The current Win32 executable is not an installer and does not contain playable games. The build extracts the canonical SVG's embedded PNG to a single BMP; the host draws only that still image using software GDI scaling. This is not a GPU game renderer. PE subsystem 5.01 is not XP certification.

Build artwork: `python3 native/build.py` (requires Pillow). The CI artifact contains `NULauncher.exe`, `background.bmp`, `README.txt` and `SHA256SUMS.txt`; these files are a test payload, not a setup installer.

NUDb/1 entries carry their own schema major/minor as well as the data-class ID, stable entry ID, length and CRC32. The bundle has a product tag and independent container version. This allows Save and Wallet migrations to evolve separately.
