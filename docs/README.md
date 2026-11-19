# N.U Documentation Hub

This page is the navigation index for the Generation 1 implementation repository. It separates **current rules**, **technical descriptions**, **implementation records**, **QA evidence**, and **historical archives** so that a dated work log is not mistaken for the current product contract.

> **Repository roles**
> - This repository is the public Generation 1 implementation and demo source.
> - [Repository](https://github.com/mobinabinshun-beep/Repository) is a separate private quarantine/archive repository. It preserves intake material, backups, research, handoffs and historical records. It is not the runtime source of truth.
> - Do not copy private archive material into this public repository unless the owner explicitly approves publication.

## Start here

1. [Project overview and current public-demo boundaries](../README.md)
2. [Generation 1 manifest](../NU-GENERATION-1-MANIFEST.json)
3. [Repository-wide contributor/agent instructions](../AGENTS.md)
4. [Protected areas and mandatory edit restrictions](operations/LOCKED-AREAS.md)
5. [Technical audit and verified baseline (2026-11-12)](GEN1-TECHNICAL-AUDIT-2026-11-12.md)
6. [Change and demo protocol](../CHANGE-AND-DEMO-PROTOCOL.md)
7. [Four execution-governance protocols](https://github.com/mobinabinshun-beep/Repository/blob/main/Operations/2026-11-19/NU-FOUR-EXECUTION-GOVERNANCE-PROTOCOLS-fa.md) — intake, fail-closed assessment, continuous change documentation and versioned backup/archive.

## Canonical architecture and product rules

These documents define durable system behavior or architecture. If a dated implementation log disagrees with a current canonical contract, stop and reconcile the conflict before changing code.

- [UI layer, rendering isolation and extension safety protocol](architecture/NU-UI-LAYER-AND-EXTENSION-ISOLATION-PROTOCOL.md) — normative foreground/background separation and extension isolation.
- [Wave and wallet transaction economy](architecture/NU-WAVE-AND-WALLET-TRANSACTION-ECONOMY.md) — core-game settlement and ledger semantics.
- [Casino wallet and betting economy](architecture/NU-CASINO-WALLET-BETTING-ECONOMY.md) — virtual casino wager/payout rules and limits.
- [Player identity, assets and execution modes](architecture/NU-PLAYER-IDENTITY-ASSETS-AND-EXECUTION-MODES.md) — current demo boundary and future-facing identity/asset concepts.
- [Modular graphics architecture](../NU-MODULAR-GRAPHICS-ARCHITECTURE-2026-11-11.md) — rendering modules and capability tiers.
- [Launcher architecture](../NU-LAUNCHER-ARCHITECTURE.md) — browser capability detection and launch behavior.
- [World visual bible G1.5](../NU-WORLD-VISUAL-BIBLE-G1.5.md) and [G1.6](../NU-WORLD-VISUAL-BIBLE-G1.6.md) — visual direction and revisions.
- [Player profile operational specification](implementation/NU-G1-PLAYER-PROFILE-OPERATIONAL-SPEC.md) — profile behavior and implementation constraints.

## Operations and implementation records

These explain how a particular change was made. They are dated evidence, not automatically current requirements.

- Gateway and navigation:
  - [Gateway main-game implementation](operations/GATEWAY-MAIN-GAME-IMPLEMENTATION-2026-11-15.md)
  - [Gateway main-game unfreeze](operations/GATEWAY-MAIN-GAME-UNFREEZE-2026-11-14.md)
  - [Gateway unfreeze conversation archive](operations/GATEWAY-MAIN-GAME-UNFREEZE-CONVERSATION-ARCHIVE-2026-11-14.md)
  - [Gateway menu and Exchange implementation](operations/GATEWAY-MENU-EXCHANGE-IMPLEMENTATION-2026-11-15.md)
- Exchange:
  - [Virtual market simulator](operations/NU-VIRTUAL-MARKET-SIMULATOR.md)
  - [Modular runtime](operations/NU-EXCHANGE-MODULAR-RUNTIME-2026-11-14.md)
  - [Ambient flow and chart drawing](operations/EXCHANGE-AMBIENT-FLOW-CHART-DRAWING-2026-11-15.md)
  - [Wallet bridge lifecycle](operations/EXCHANGE-WALLET-BRIDGE-LIFECYCLE-2026-11-15.md)
  - [Chart controls](operations/NU-EXCHANGE-CHART-CONTROLS-2026-11-15.md)
- Wallet, HUD and operational safeguards:
  - [Wallet audit animation layer](operations/WALLET-AUDIT-ANIMATION-LAYER-2026-11-15.md)
  - [Classic resource HUD restoration record](operations/CLASSIC-XP-MANA-RESOURCE-HUD-RESTORE-2026-11-14.md)
  - [HUD capsule layout](operations/GEN1-HUD-CAPSULE-LAYOUT-2026-11-14.md)
  - [Locked areas](operations/LOCKED-AREAS.md)
  - [Operations implementation plan](operations/NU-OPS-IMPLEMENT-01.md)
- Human QA operations:
  - [Human test report template](operations/HUMAN-TEST-REPORT-TEMPLATE.md)
  - [Public demo human-QA operating principle](operations/PUBLIC-DEMO-HUMAN-QA-OPERATING-PRINCIPLE.md)
- Profile and studio:
  - [Profile preview and wallet tabs](../PLAYER-PROFILE-PREVIEW-AND-WALLET-TABS-2026-11-14.md)
  - [Adaptive pixel workspace](GEN1-ADAPTIVE-PIXEL-WORKSPACE-2026-11-12.md)
  - [Original-dimension studio import](GEN1-STUDIO-ORIGINAL-DIMENSION-IMPORT-2026-11-12.md)

## Testing and acceptance

A test file or a successful static check is not the same as browser QA or owner acceptance. Read the evidence and its date.

- [Public demo human acceptance gate](PUBLIC-DEMO-HUMAN-ACCEPTANCE-GATE.md)
- [Wave wallet human QA procedure](testing/NU-PUBLIC-DEMO-WAVE-WALLET-HUMAN-QA.md)
- [Mana material human test](../QA-MANA-MATERIAL-HUMAN-TEST.md)
- [Profile appearance human QA](qa/NU-G1-PROFILE-APPEARANCE-HUMAN-QA-2026-11-14.md)
- [Modular graphics QA](../QA-MODULAR-GRAPHICS-2026-11-11.md)
- [Generation 1 QA records](../QA-GEN-1.4.md), [G1.5](../QA-GEN-1.5.md), and [G1.6](../QA-GEN-1.6.md)
- CI workflows live in [the .github/workflows directory](../.github/workflows/).

## Assets and visual references

- [Background asset inventory](background-assets-inventory-2026-11-14.md)
- [Assets README](../assets/README.md)
- [Background assets README](../assets/backgrounds/README.md)
- [World visual bible G1.5](../NU-WORLD-VISUAL-BIBLE-G1.5.md) and [G1.6](../NU-WORLD-VISUAL-BIBLE-G1.6.md)

## Historical records and handoffs

- [Project handoff and conversation archive (2026-11-13)](../PROJECT-HANDOFF-AND-CONVERSATION-ARCHIVE-2026-11-13.md)
- [Repository audit (2026-11-10)](../REPOSITORY-AUDIT-2026-11-10.md)
- [Archived classic resource HUD snapshot](archive/2026-11-15/classic-resource-hud/README.md)
- [Conversation archive directory](operations/conversation-archive/)
- [Implementation records directory](operations/implementation-records/)
- [Archive repository](https://github.com/mobinabinshun-beep/Repository) — private quarantine/archive; use its own README and folder structure for archived material.

## Reading and change rules

1. **Start with this index and the root README.** Then read the relevant canonical contract before editing a subsystem.
2. **Canonical contract beats dated work log.** An implementation record describes what happened at a point in time; it does not silently supersede architecture, safety or product-boundary documents.
3. **Check status before relying on a document.** Treat words such as *proposed*, *candidate*, *implemented*, *static-tested*, *browser-tested*, *human-accepted* and *released* as distinct states.
4. **Keep evidence attached.** QA records must state environment, steps, expected/actual result, date and whether the check was automated or human-performed.
5. **Do not delete historical records as a cleanup shortcut.** Mark superseded documents and link to the replacement; preserve audit history.
6. **Avoid duplicate sources of truth.** Update the canonical document first, then add a short dated implementation/QA record only when it adds evidence or explains a specific change.
7. **Respect repository boundaries.** Private quarantine material is not public documentation and must not be copied here without explicit approval.

## Known documentation debt

- There are multiple dated QA and implementation records. They are intentionally retained as history, but their current validity must be checked against the canonical contracts and current code.
- Some subjects have multiple revisioned documents (for example visual bible and QA generations). This index groups them but does not claim that every historical revision is current.
- This pass establishes navigation and document roles; it does **not** rewrite every historical document or certify every claim against a live browser/device run.
