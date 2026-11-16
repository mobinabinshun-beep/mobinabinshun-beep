# Owner workflow correction — implementation, public demo, QA and scope locks

**Protocol amendment:** NU-OPS-IMPLEMENT-01  
**Date:** 2026-11-16  
**Status:** ACTIVE — owner-directed process correction

## Owner's corrected operating model

The project owner is the idea director and human quality approver. The assistant is the execution/operations arm: implement the requested change, run machine tests, debug, document, back up, deploy to the public demo, test the deployed candidate where machine checks are available, and report evidence and limitations.

The corrected order is:

1. Read the project protocols, objectives, scenarios, architecture, dependencies and existing locks.
2. Implement one scoped request on a candidate branch.
3. Run all relevant automated checks. A passing machine result means the code has passed the named machine verification; it is not human acceptance.
4. Create and verify a machine backup of the exact candidate and preserve the prior state for rollback.
5. Deploy to the public demo. **Do not wait for human approval before this demo deployment.**
6. Verify that the public URL serves the intended commit/build and run post-deploy smoke checks.
7. Give the owner the live demo URL and exact test scope. The owner and their testers perform human QA on the public demo.
8. Record the human result. On approval, lock only the accepted scope. On rejection, fix the reported scope and repeat machine tests, backup, public deployment, post-deploy checks and human QA.

## Approval granularity

Approval can be for:
- one specific item,
- one feature/section,
- or a complete pack.

Only the exact approved scope is locked. Adjacent features are not implicitly locked or approved.

## Reopening a lock

A later explicit request naming a locked feature (for example, “reopen HP Capsule and change …”) temporarily reopens only that named scope. All other locks remain active. After the correction, repeat the full machine → backup → public demo → human QA cycle; relock the corrected scope after owner acceptance.

## Cross-system dependency rule

If a requested correction affects another area (for example HP Capsule ↔ Bag/Wallet/Store, or Exchange ↔ Wallet ledger), do not silently change both systems. Stop before making the cross-system change. Explain the connection and provide three practical options based on repository documentation, project goals and user scenarios, naming the recommended candidate. Wait for the owner to explain or choose. Then implement the authorized option and repeat the full test/deploy/report cycle.

## Status vocabulary

Keep separate:
- IMPLEMENTED
- MACHINE-TEST-PASSED / MACHINE-TEST-FAILED
- BACKUP-VERIFIED
- DEMO-DEPLOYED / DEMO-DEPLOYMENT-BLOCKED
- POST-DEPLOY-SMOKE-PASSED / FAILED / NOT-RUN
- HUMAN-QA-PENDING / PARTIAL / PASSED / FAILED
- OWNER-APPROVED / OWNER-REJECTED
- SCOPE-LOCKED
- PROMOTED

No automated result may be described as human approval. A live public demo may remain pending human QA.

## Superseded rule

The previous rule that prohibited deployment before explicit human approval is withdrawn. The current rule is: **relevant machine checks pass + verified backup → public demo deployment → human QA → scope-specific owner approval/lock**.

This amendment does not authorize edits to any separately locked feature. It changes only the order and responsibility of deployment and acceptance.
