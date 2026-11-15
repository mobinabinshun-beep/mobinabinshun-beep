# Mandatory Human Acceptance at Every Change Stage

**Date:** 2026-11-15  
**Change ID:** N.U-QA-HUMAN-GATE-001  
**Status:** Mandatory protocol amendment  
**Branch:** `feat/wallet-static-holographic-backdrop`

## Owner requirement

Every independent change stage requires human testing against its exact deployed public-Demo revision before progression to the next independent stage. Automated tests, CI, source review, local previews, screenshots and an open PR do not replace this approval.

## Governing repository records amended

- `CHANGE-AND-DEMO-PROTOCOL.md` — per-stage human acceptance and progression invariant.
- `docs/PUBLIC-DEMO-HUMAN-ACCEPTANCE-GATE.md` — public-Demo-only testing and stage blocking.
- `docs/operations/HUMAN-TEST-REPORT-TEMPLATE.md` — change ID, candidate/deployed SHA, Demo URL, owner decision and neutral-background scenarios.
- `docs/architecture/NU-UI-LAYER-AND-EXTENSION-ISOLATION-PROTOCOL.md` — mandatory UI/rendering human acceptance gate.

## Required lifecycle

1. Create a fresh backup/archive and change record for the stage.
2. Implement on an isolated branch.
3. Run and record technical checks.
4. Deploy the exact candidate to the designated public Demo and verify its SHA.
5. Have the project owner test that public Demo revision.
6. Record Approved, Rejected, or Approved-with-limitations in a dated report.
7. Do not start the next independent stage, merge, lock or promote while the decision is pending or rejected.
8. For every fix/revision, repeat the lifecycle with a fresh backup and a new human retest.

A deliberately bundled scope must be declared before testing. Exceptions require explicit written project-owner authorization. If the Demo cannot be deployed, record `NOT VERIFIED / HUMAN-QA-PENDING` and stop progression.

## Current four-section backdrop stage

The backdrop candidate remains a Draft PR and has not been merged or promoted. Human browser/device acceptance has not yet been recorded. Therefore its status remains **HUMAN-QA-PENDING**; passing automated checks do not change that status.

## Enforcement

This record supplements and cross-links the governing protocols above. It is a durable repository rule for future contributors and agents, not a claim that this candidate has passed human QA.
