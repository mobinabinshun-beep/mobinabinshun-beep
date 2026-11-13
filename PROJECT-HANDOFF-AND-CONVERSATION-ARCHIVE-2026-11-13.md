# N.U Interactive World — Project Handoff & Conversation Archive
**Archive date:** 2026-11-13  
**Purpose:** Resume work in a new ChatGPT conversation without losing project context.

> This is a structured handoff assembled from the conversation context and repository records available to the assistant on 2026-11-13. The chat interface supplied many earlier messages only as “Skipped N messages”; therefore this file is a faithful summary of visible requirements and verified repository facts, **not a verbatim export of every historical chat message**. The Git repository, commits, manifests, QA files and linked PRs remain the source of truth for implementation details.

## 1. Project identity and repository
- Project: **N.U — Niroo Universe / N.U Interactive World**.
- Public repository: https://github.com/mobinabinshun-beep/mobinabinshun-beep
- Public GitHub Pages home: https://mobinabinshun-beep.github.io/mobinabinshun-beep/
- Generation 1 entry: `index.html`
- Generation 1 manifest: `NU-GENERATION-1-MANIFEST.json`
- Main runtime: N.U Adaptive Runtime, prototype 0.1.
- Save provider: browser `localStorage`, key `nu-world-save-v1`; no server account/cloud save.
- This is an experimental browser prototype, not a production release.

## 2. Critical generation boundary — do not mix generations
**N.U Casino belongs to Generation 1.** It was requested as a playable addition to the Generation 1 public demo and merged as Generation 1.31. The user later clarified that casino documentation/data had been mistakenly associated with Generation 2. Do not migrate, reclassify, or describe the casino as a Generation 2 feature. If a Generation 2 document elsewhere references it, correct that reference so it points back to Generation 1 or explicitly labels it as historical context only. Keep the canonical casino module and implementation in Generation 1.

Evidence:
- Generation 1 manifest explicitly has `"generation": 1`, packageVersion `0.5.4-gen1-casino-mini-games`, and casino module/feature entries.
- Merged PR #57 title: “Generation 1.31: add playable N.U Casino mini-games”.
- Merge commit: `5406e20ce5cf42678fc5a366e248d980ae20519e`.
- PR: https://github.com/mobinabinshun-beep/mobinabinshun-beep/pull/57

## 3. Generation 1 core gameplay
The root demo includes:
1. **Bubble Hunt** — each successful bubble interaction grants +1 XP.
2. **Mana Collector** — each successful Mana interaction grants +1 Mana.
3. **Chaos Attack** — successful N-BI shot neutralizes one Chaos mass and grants +3 XP; unneutralized masses advance to the defensive boundary and each breach removes 1 HP.
- Each selected game round uses 10 successful interactions. Missed clicks do not count.
- A round remains on the selected game until completed or page reload; a fresh launch selects randomly from the active game pool.
- XP and Mana are local-save values. Level progression is based on cumulative XP per 100 XP.
- N-BI currently costs 10 Mana per successful shot; upgrade-based cost reduction is not implemented.
- Full online accounts, cloud save, multiplayer economy and native app delivery are not implemented.

## 4. Previously requested interaction and visual requirements
These requirements were explicitly stated by the user in the visible conversation summaries. Confirm implementation against current source and QA tests before modifying:
- Search the repository for the Material assets and use the Material source for interactive objects and interaction effects.
- Bubble targets must be circular/round.
- Mana and bubble collection should have an interaction notification/animation positioned at the clicked object's coordinates.
- Preserve the visual/interaction behavior and use the Material SVG assets for the relevant effects.
- HP Capsule / Heal Pill:
  - The HP bar should not permanently display the capsule icon.
  - When HP decreases and the player owns a capsule, the icon animates into the reserved right side of the HP frame from the right edge.
  - The HP frame is widened enough to hold the capsule beside the HP rail.
  - The capsule icon is clickable and directly usable.
  - Once HP is restored, the icon reverses its entrance animation, exits the frame and fades; it should not remain visible when HP is full.
  - Using a capsule from the Store or the HP HUD consumes exactly one capsule and both interfaces must show the same inventory count.
  - The icon should be illuminated/active only when the player owns at least one capsule.
  - The Store should not have a separate “use capsule” user card/area. Clicking the capsule icon in the capsule purchase row uses an owned capsule; clicking the Buy control purchases one.
  - Capsule count is displayed beside its icon.
  - Capsule healing is capped by missing HP / the defined heal amount; the manifest and tests describe the current behavior.
- Store inventory and HUD must refresh together immediately after purchase or consumption.
- Keep interaction hit targets accurate; avoid event bubbling from HUD asset/profile controls into gameplay pointer handlers.
- Human browser/touch/device QA is required; source tests do not substitute for actual human acceptance.

Useful historical regression files include `tests/nu-hp-pill-interaction.test.js`, `tests/nu-wallet.test.js`, `tests/nu-materials.test.js`, and `tests/nu-bubble-geometry.test.js` (verify exact current filenames in `tests/`).

## 5. N.U Casino — Generation 1.31
Public page: https://mobinabinshun-beep.github.io/mobinabinshun-beep/casino.html  
Source files: `casino.html`, `nu-casino.js`, `nu-casino.css`, shared wallet module `nu-wallet.js`, tests under `tests/`.

Implemented games:
- **Coin Flip:** Heads/Tails; correct call returns 2× wager.
- **Lucky Dice:** exact guess from 1–6; match returns 5× wager.
- **Mini Slots:** three of a kind returns 8× wager; a pair returns 2×; no match returns 0.
- Starting balance: 100 virtual credits.
- Separate `casinoCredits` balance and settlement ledger in the browser-local save.
- Casino credits are virtual only and do not change XP, Mana, HP or HP Capsules.
- No deposits, payments, real-money prizes, withdrawals or cash-out.
- Insufficient balance blocks the wager. Fractional wagers are explicitly rejected rather than rounded.
- Balance persists in the same browser save.
- Human browser/device acceptance was pending at the time of this archive.

## 6. Generation 1 creative tools and visual world
- `pixel-art-studio.html` is a separate local creative tool and excluded from the random gameplay pool.
- Studio supports local image import, non-destructive editing, palette reduction, drawing tools and exports; see its QA docs and manifest for exact current capabilities.
- Image analysis/export includes a human-readable report and machine-readable N.U graphics instructions.
- The pixel-world renderer is a procedural visual proposal, not an approved canonical Niroo City map.
- The published visual bible documents art direction and canon boundaries.

## 7. Key repository documents
Read these first in a new chat:
- `README.md`
- `NU-GENERATION-1-MANIFEST.json`
- `ENGINE-LOCK.md`
- `NU-WORLD-VISUAL-BIBLE-G1.5.md` and `NU-WORLD-VISUAL-BIBLE-G1.6.md`
- `NU-MODULAR-GRAPHICS-ARCHITECTURE-2026-11-11.md`
- `QA-MANA-MATERIAL-HUMAN-TEST.md`
- `QA-MODULAR-GRAPHICS-2026-11-11.md`
- `NU-LAUNCHER-ARCHITECTURE.md`, `NU-LAUNCHER-HUMAN-QA.md`
- `REPOSITORY-AUDIT-2026-11-10.md`
- `STUDIO-EXPORT-LOCK.md`, `STUDIO-KNOWN-GOOD-LOCK.md`
- `tests/` regression tests.
- `BACKUPS/` and `docs/` for historical snapshots and additional specifications.

## 8. Recent delivery record — Casino
- PR #57 was merged (closed, merged=true).
- Merge commit SHA: `5406e20ce5cf42678fc5a366e248d980ae20519e`.
- PR changed 11 files, 142 additions and 16 deletions (as recorded by GitHub).
- CI checks were inspected during the work. The assistant reported two successful checks on the candidate branch; verify the current default-branch workflow state before relying on that as a release guarantee.
- The assistant could not independently verify the final GitHub Pages deployment state at the time of the final casino message. If the page appears stale, inspect Actions / Pages deployment before changing code.

## 9. User's preferred working process
- Search the connected GitHub repository before implementing; do not assume a feature/file is absent.
- Use existing source assets/material files rather than inventing replacements when a canonical asset exists.
- Make requested changes in the **Generation 1 public demo** when the user says Generation 1.
- Deliver the actual public demo URL for human testing after confirming the deployment.
- Be precise about which element is clickable, what action it triggers, animation entry/exit, inventory decrement, persistence and UI refresh.
- Provide a human QA checklist and ask the user for observed results; incorporate that report into the next iteration.
- Keep generation ownership and manifests/docs consistent.
- Do not claim deployment or human testing is complete unless verified.

## 10. New-chat starting prompt
Paste this into a new ChatGPT conversation:

“Continue the N.U Interactive World project from the GitHub repository https://github.com/mobinabinshun-beep/mobinabinshun-beep. First read `PROJECT-HANDOFF-AND-CONVERSATION-ARCHIVE-2026-11-13.md`, README, NU-GENERATION-1-MANIFEST.json, engine locks, visual bibles, relevant QA docs and tests. Treat the repository as source of truth. Important generation boundary: N.U Casino is a Generation 1.31 feature only; it was incorrectly associated with Generation 2 in some documentation and must not be moved to Gen2. Review current branches, latest commits, workflows and GitHub Pages deployment before making changes. Continue from verified current state and preserve all existing interactions and regression tests.”

## 11. Archive completeness note
This file captures all project context and user requirements that were visible in the current conversation context, plus verifiable repository facts. Earlier messages were truncated by the chat system (“Skipped N messages”), so a byte-for-byte transcript of every message was not available to export. For exact implementation history, use Git commits, PR #57, manifests, QA reports and repository backups. Add future human test reports to the appropriate QA file and update this handoff when generation boundaries or project architecture change.
