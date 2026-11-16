# Conversation archive — Wallet Health module

**Date:** 2026-11-15  
**Request:** Add a Health module accessible as a Wallet tab, but with an independent data store and independent display. Record the last five medicine/health-item uses, damage events, healing events, and deaths across games. Darken wallet drawers and slightly enlarge the transparent field-guide frame.

**Architecture decision:** Wallet and Health share navigation only. Health records are stored under `nu-health-records-v1`; wallet data remains under its existing save key. The Health module does not read or archive wallet balances or financial transactions. Every category keeps its own latest five entries.

**Implementation references:**
- Backup branch: `backup/pre-wallet-health-module-2026-11-15-1707`
- Candidate branch: `feat/wallet-health-module-2026-11-15`
- Base commit: `3a0de39d2b99f99264e2a08c3da7db2c79887511`

**Acceptance:** CI and human QA are separate. Human acceptance remains pending until the owner tests the candidate and supplies a traceable report.
