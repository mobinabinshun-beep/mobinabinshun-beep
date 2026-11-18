# Generation 1 XP rail and interactive icon feedback — change record

- Date: 2026-11-18
- Status: IMPLEMENTED · MACHINE-TEST-PENDING · BACKUP-VERIFIED · HUMAN-QA-PENDING
- Owner-authorized scope: Issue [#179](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/179)
- Candidate branch: `fix/gen1-xp-rail-icon-feedback-2026-11-18`
- Base commit: `705b5f99a7bf2b32c4156c5d647a5e678985d76a`
- Recovery ref: `backup/pre-gen1-xp-rail-icon-feedback-2026-11-18` at the same base SHA

## Historical comparison
- XP rail source: `fix/gen1-xp-full-width-bottom-rail-2026-11-15`, `nu-world.css` blob `32d7eb835a2a1f4d0aa3ea22ad1306ff58137e96`.
- Historical markup: `index.html` blob `ff67517f50abdb562917390ab046654ae5c13955`; the resource children are LV, XP bar (child 2), Mana bar (child 3), then Mana capsule slots.
- Historical XP data binding: `nu-games.js` blob `b89da134c26548f354d69368bdea4a5bc6059b3d`.
- Current default branch had a later `Classic resource HUD restoration` override that stacked LV, XP and Mana vertically. The owner-authorized final historical override is restored after it, so the CSS cascade now makes XP full-width at the bottom and Mana compact at the left.
- The arithmetic, DOM IDs and live resource data bindings are unchanged.

## Interactive icon feedback audit
- The active page already has the accessible `#transaction-toast` live region (`role=status`, `aria-live=polite`, `aria-atomic=true`).
- The active `useHpPill` flow announces success and unavailable states; Store capsule purchase and Arcane Shield charge flows also use `announceTransaction`.
- The candidate reuses these existing functions and adds tests for their success/warning contracts and reduced-motion handling; no second notification system or parallel wallet behavior is added.
- Toast transitions are disabled under `prefers-reduced-motion: reduce`.

## Changes
- `nu-world.css`: append the owner-authorized historical XP/Mana rail layout and reduced-motion toast override.
- `tests/nu-hud-layout.test.js`: assert the restored XP/Mana rail placement and responsive rules.
- `tests/nu-game-icon-feedback.test.js`: assert live-region accessibility, non-blocking behavior, reduced-motion safety and existing icon/action feedback.
- `.github/workflows/graphics-preview-check.yml`: include the focused tests.
- `docs/operations/LOCKED-AREAS.md`: record the narrow exception and reinstatement of the lock.
- This change record and the resulting CSS snapshot preserve the implementation evidence.

## Explicit exclusions
No XP/Mana calculations, progression, Wallet persistence, HP, shield/N-BI mechanics, Gateway, gameplay rules, or other HUD components changed.

## Verification
- Historical source blobs and current override were read and compared.
- Backup ref was created from the exact pre-change base SHA; ref verification and candidate workflow results are recorded separately.
- Machine test execution is pending; no CI pass is claimed.
- Browser/device visual QA and live demo verification are pending.

## Human QA
- [ ] Verify LV remains at lower-left above the rails.
- [ ] Verify Mana rail remains compact at left and its capsule slots remain visible.
- [ ] Verify XP rail spans the full viewport bottom edge at desktop and mobile sizes.
- [ ] Verify labels and values remain readable and state-driven.
- [ ] Activate HP Capsule icon with success and unavailable state; confirm polite toast.
- [ ] Verify toast does not block touch/gameplay input and respects reduced motion.
- [ ] Confirm Store and Shield feedback remain unchanged.
- [ ] Verify exact deployed build SHA and record URL.

## Restore
Create a new branch from `backup/pre-gen1-xp-rail-icon-feedback-2026-11-18` or revert only this PR through a reviewed commit. Do not force-push or rewrite history.
