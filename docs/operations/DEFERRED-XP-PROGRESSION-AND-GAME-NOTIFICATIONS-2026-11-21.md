# Deferred Work — XP Progression and Game Notification Corrections

**Date:** 2026-11-21  
**Status:** DEFERRED · NOT IMPLEMENTED · OWNER-REPORTED  
**Tracking issue:** [#237 — XP capsule level-up/reset and standardize floating game notifications](https://github.com/mobinabinshun-beep/mobinabinshun-beep/issues/237)  
**Related accepted feature:** [Transient Game Asset Profile](./ASSET-PROFILE-TRANSIENT-HOVER-2026-11-21.md)

## Separation from the Asset Profile release

This is a separate defect/workstream reported after the owner confirmed that the transient Asset Profile mechanism no longer interferes with gameplay. It does not reopen, expand or invalidate the Asset Profile implementation. No runtime changes have been made for the items below.

## Owner report and requested behavior

### 1. XP capsule / level progression
- The XP capsule fills at 100 XP.
- It does not convert into a level-up.
- The expected +1 level is not awarded.
- The XP capsule does not reset to 0 after conversion.
- Owner clarification: consumed XP is converted; it must not become negative.

Investigate threshold semantics, progression state updates, persistence, overflow and repeat level-ups before implementing a minimal correction.

### 2. Remove duplicate +1 overlays
- Preserve the classic standard +1 feedback above the bar.
- Remove the extra boxed +1 XP and +1 Mana notifications.

### 3. Notification visual consistency
- HP capsule consumption notification is the owner's accepted visual reference.
- Other notifications do not meet the visual standard.
- Audit and align notification appearance/behavior with the HP capsule reference, reusing the existing notification mechanism where possible.

### 4. HP capsule notification placement and motion
- The current corner placement is not suitable.
- Center the notification horizontally, starting below the HP bar and moving upward.

### 5. Capsule-local consumption feedback
- On capsule consumption, show -1 on the capsule itself.
- Animate the -1 upward and fade it out.

## Acceptance criteria

1. At the XP threshold, award +1 level and consume/reset the required XP without ever producing a negative XP value.
2. Repeat level-ups and persisted state work correctly after reload.
3. Only the classic standard +1 feedback remains above the bar; duplicate boxed +1 XP/+1 Mana overlays are absent.
4. Notifications follow the accepted HP capsule visual language and preserve accessible announcements.
5. HP consumption notification appears centered below the HP bar and rises upward.
6. The consumed capsule itself shows a rising/fading -1.
7. No unrelated HUD, Gateway, controller, wallet or game rules change.
8. Focused tests, relevant regression checks, backup and demo/human-QA gates pass.

## Execution boundary

This record is a deferred specification, not implementation authorization. No source changes have been made. Start only when the owner prioritizes or explicitly authorizes this workstream. Keep the classic LV/XP/Mana HUD lock and all unrelated protected scopes intact.

## Human evidence kept separate

The owner's positive report that Asset Profile no longer interferes with gameplay is recorded in the related Asset Profile change record. It is not evidence that the XP progression or notification defects are fixed.
