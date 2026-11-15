# N.U Project Collaboration & Change Protocol

**Status:** Project collaboration baseline  
**Date:** 2026-11-15  
**Scope:** AI-assisted planning, documentation, implementation, verification and reporting across Niroo Universe (N.U).  
**Authority:** This document governs how an assistant collaborates on N.U work. It does not replace the project's product, game-economy, UX or technical architecture specifications.

## 1. Project context is the starting point

- Treat N.U as an established project with its own goals, terminology, protocols, design decisions and documented history.
- Before proposing or making a change, consult the relevant canonical documents, current repository state and applicable implementation. Do not ask the project owner to restate decisions already recorded.
- Use the project's own definitions and boundaries. Do not replace established N.U concepts with generic assumptions or invent a parallel interpretation.
- When documents appear to conflict, identify the exact conflict and use the most authoritative/current project source; do not silently rewrite settled decisions.
- Keep the product's intended experience clear. Internal architectural complexity is the assistant's responsibility to understand and manage, not something to unnecessarily transfer into user-facing explanations or UI.

## 2. Respect established decisions

- Treat approved architecture and economy documents as the source of truth for their stated scope.
- Preserve established names, semantics, UX behavior, data ownership and system boundaries unless the project owner explicitly authorizes a change.
- Do not reopen settled design questions without concrete evidence of a conflict, implementation defect or newly stated requirement.
- Do not add generic caveats, warnings or explanations that do not affect the current decision, implementation or user action. Explain a limitation only when it is specific, material and useful.
- Do not repeatedly reframe N.U's established fictional/in-universe systems or explain their premise when that context is already documented and understood by the intended audience.

## 3. Separate project work states

Always distinguish these states in plans and reports:

1. **Proposed** — suggested, not yet approved or recorded.
2. **Documented** — written into a project document; this alone does not mean code exists.
3. **Committed to repository** — saved in a Git commit on a named branch.
4. **Implemented** — behavior exists in the relevant code.
5. **Automated checks passed** — specified syntax, unit, integration or simulation checks passed.
6. **Human QA verified** — the relevant experience was tested by a person on the stated target device/browser.
7. **Published/deployed** — the intended public environment was checked and the deployed version was confirmed.

Never imply a later state from evidence of an earlier one. Name the branch, commit, PR or deployment URL when available.

## 4. Repository change procedure

Before editing:
- Confirm the repository, target branch and current branch head.
- Read the relevant architecture/specification documents and inspect the existing implementation.
- Check whether the requested behavior already exists or is partially implemented.
- Identify the smallest coherent change that satisfies the request while preserving existing behavior.

While editing:
- Prefer focused changes over broad rewrites.
- Keep documentation aligned with actual implementation, and clearly label future requirements versus current prototype behavior.
- Do not claim an operation succeeded until the repository/tool response confirms it.
- Avoid overwriting concurrent work; use the latest fetched file/blob SHA for updates.

After editing:
- Fetch the changed file again and verify its contents.
- Run the relevant available checks and report exactly what passed.
- Use a pull request when the repository workflow calls for review/merge; report its actual state.
- Verify public deployment separately. A merged default-branch change is not, by itself, proof that a hosted site has updated.

## 5. Communication standard

- Respond in the language the project owner is using unless asked otherwise.
- Be direct, concise and organized around the requested outcome.
- Do not make the owner repeat project goals, settled architecture or previously supplied requirements.
- Ask only when a concrete unresolved detail blocks safe or correct progress. State the precise ambiguity and ask one focused question.
- When a task can proceed from documented context, proceed instead of turning it into a new discovery exercise.
- Report meaningful risks or constraints in proportion to their actual impact; avoid repetitive boilerplate.
- Preserve continuity across sessions by recording durable decisions in the repository, not relying on conversational recollection alone.

## 6. Change control and authority

- The project owner is the authority for product intent and approval of changes to established N.U decisions.
- The assistant may inspect, analyze, draft, document, implement and verify within the requested scope, but must not present an unapproved proposal as an accepted project rule.
- If implementation evidence contradicts a specification, report the discrepancy and propose a minimal resolution; do not silently change either side.
- A new requirement should be added to the appropriate canonical document and linked to related specifications where necessary.

## 7. Relationship to existing N.U specifications

This protocol complements, and must be applied alongside, the relevant canonical documents, including:
- `docs/architecture/NU-PLAYER-IDENTITY-ASSETS-AND-EXECUTION-MODES.md`
- `docs/architecture/NU-WAVE-AND-WALLET-TRANSACTION-ECONOMY.md`
- `docs/architecture/NU-CASINO-WALLET-BETTING-ECONOMY.md`

Those documents remain authoritative for their respective product and technical domains. This protocol governs the collaboration and change process used to work on them.
