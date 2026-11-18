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
- Unsigned development package builder and structural manifest parser.
- Fail-closed crypto-provider boundary; no production signing keys/trust roots.
- Bounded dependency resolver, cleanup planner, component reconciliation and in-memory journal state model.
- Minimal Win32 smoke-test host targeting XP-era subsystem metadata.

## Important format compatibility warning

Parallel candidate branches used the label `NUVM/1` for incompatible text and binary formats. Do not mix modules from the old shell samples with this portable runtime. The canonical package/container and VM naming migration is a required pre-integration gate; see the master engineering index.

## Not yet implemented

No native playable ports of Bubble Hunt, Mana Collector or Chaos Attack; no complete translator registry/canonical IR; no production signature verification; no filesystem-transactional Package Manager; no three-stage installer/uninstaller; no data-bundle export/import; no complete RAM-ledger integration; no native GPU renderer; no actual Windows XP runtime certification.

The current Win32 executable is not an installer and does not contain playable games. PE subsystem 5.01 is not XP certification.
