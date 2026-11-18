# N.U Pack 1 — User Lifecycle and Storage Contract

- Revision: draft 1
- Status: implementation contract; not a release claim
- Applies to: initial public experimental pack and compatible future full-pack upgrades

## 1. Product promise

The first download is a complete, self-contained installation pack. It installs the N.U host and the modules included in that release. Later releases are also distributed as complete packs so a user can install from scratch. When a compatible N.U host is already installed, setup discovers it, validates its product identity and version, then applies only missing or changed components. It must not overwrite player data.

A future plug-in is a separately described module with a stable module ID, generation/ABI, dependencies, capability declarations, package digest and publisher signature. The host owns lifecycle and resource policy; the plug-in owns its game/content logic. An add-on must not raise the host's resource ceiling or bypass module isolation.

## 2. Installation experience

The installer has three clear stages, with large icons, short labels and optional spoken/accessibility prompts:

1. **Choose destination / detect previous N.U.** Search only known N.U install markers and registered install locations; show the detected location and version. If several valid installs exist, ask which one. Never guess by matching a folder name alone.
2. **Choose what to install.** Show the core and each game/add-on as separate choices, with required dependencies marked. Explain required disk space before writing. A full pack can be installed cleanly or used as an upgrade source.
3. **Review and install.** Show a simple summary, then stage files, verify every package, write a recovery journal, and activate atomically. If any step fails, restore the previous active version and keep user data intact.

No silent migration of save formats. If a game requires a save migration, retain a verified backup and provide a recoverable path.

## 3. Upgrade contract

- Every release has a pack ID, release version, compatible host range and component inventory.
- Setup detects a previous host by a signed/verified install identity record, not by folder-name heuristics.
- Compare component IDs and versions. Downloaded full-pack media remains available as the complete offline installer; installed content is reconciled component-by-component.
- Stage new files beside the active version, verify digest/signature and dependencies, then switch the active version in one recoverable transaction.
- Keep the previous known-good version until the new host launches successfully or the rollback window expires.
- Never place cache, save data or wallet data inside a versioned executable directory.

## 4. Storage classes

Every file created by N.U must be assigned one class in the install inventory:

| Class | Meaning | Default uninstall action |
|---|---|---|
| Core/runtime | N.U-owned program files | Delete |
| Game/add-on | Separately installed module files | Delete if selected; otherwise keep only if dependencies permit |
| Temporary cache | Re-creatable transient data | Delete |
| Save data | Player progress and save slots | Keep |
| Wallet/profile | Player-owned wallet and profile state | Keep |
| User assets | User-imported/custom content | Keep |
| Settings | User preferences and accessibility choices | Keep unless selected |
| Downloaded installer pack | Original complete setup archive | **Always keep** |

The downloaded installer archive is outside the managed install root and is not part of ordinary uninstall. It may only be deleted from a separate, explicit “Delete downloaded installer” action with a second confirmation. This action is not preselected and is not reachable by “Select all” in the uninstall checklist.

## 5. Three-stage uninstall experience

The uninstall flow is intentionally understandable without reading technical documentation:

1. **Choose removal.** One large “Remove N.U from this computer” action. A separate “Manage downloaded installer” action is not bundled into uninstall.
2. **Choose what happens to personal data.** Show simple icons and plain labels for saves, wallet/profile, user assets and settings. Default is to keep them. Show a distinct “Remove temporary files and cache” choice. Show estimated space recovered. The installer archive is shown as “Kept” and cannot be selected here.
3. **Review and finish.** Summarize what will be removed and what will remain, with large Back and Remove buttons. After completion, show the exact location of the retained, identity-marked backup bundle so it can be copied into a later version.

A “Remove everything managed by N.U” preset may select all removable classes, but it must still preserve the downloaded installer archive and require the user to explicitly confirm deletion of personal saves/wallet/assets. The installer archive remains an independent user decision.

## 6. Portable identity-marked data bundle

Preserved data is exported to a clearly named, versioned folder/file with a machine-readable manifest containing product ID, schema versions, component IDs, sizes and digests. The bundle must not contain executable code or cache. It should be copyable to USB or another folder and importable by a later N.U version after validation.

The bundle must be written atomically: create a temporary sibling, write and verify all content, then rename into place. Never overwrite a previous valid bundle without an explicit choice. Import must reject path traversal, unknown schema versions and digest mismatches. Wallet data needs integrity protection and a documented migration policy; no claim of cryptographic authenticity until the signature provider and trust roots are implemented.

## 7. Low-resource policy

- Keep only the active game module resident; stage other modules on disk.
- Cache is disposable and bounded; clear it on uninstall and when it cannot be safely reused after upgrade.
- Reserve memory before N.U-owned allocations; reject allocation requests that exceed the current adaptive budget.
- Use bounded VM instruction slices and yield to the host scheduler.
- Load graphics/audio assets on demand, release them when a module exits, and provide a low-resolution/low-effects mode.
- Avoid background polling and automatic update checks while a game is running. Updates are user-initiated for the public demo unless the user explicitly opts in.
- Measure actual peak RAM, CPU time, disk I/O and frame pacing on low-end test machines; publish measurements, not assumed hardware percentages.

## 8. Non-negotiable safety rules

- Never delete outside the verified N.U-owned inventory roots.
- Reject symlinks/reparse-point escapes and path traversal before file operations.
- Never classify an unknown file as disposable cache.
- Keep the installer archive out of the uninstall root.
- Journal every destructive operation; recover safely after power loss.
- Verify the final inventory after deletion and report leftovers rather than claiming a clean uninstall if any owned files remain.
- User data deletion requires explicit opt-in and a clear summary.

## 9. Current code status

native/nu_cleanup.c and native/nu_cleanup.h currently implement a portable C90 cleanup planning primitive. It classifies inventory entries, calculates delete/preserve counts and byte totals, and preserves the installer archive unless a separate explicit argument is supplied. Unit tests cover keep/delete planning and explicit installer deletion.

This primitive does not perform filesystem deletion, discover installations, build the identity bundle, display the three-stage UI or guarantee zero leftovers. A bounded full-pack component reconciler now compares stable component IDs and versions (keep/add/update) and leaves installed components absent from the incoming pack untouched. An in-memory journal state model validates prepared → staging → verified → activated and rollback transitions, but it is not yet persisted to disk and cannot recover from power loss. These primitives do not constitute a transactional installer. Safe filesystem operations, durable journal persistence, installation identity discovery, portable data-bundle export/import, the three-stage UI and human QA remain required. The public demo must not be advertised as supporting complete install/uninstall until those paths are implemented and tested.


## 10. Migration from the existing browser demo

The current public Generation 1 web demo stores its shared local save under the browser localStorage key `nu-world-save-v1`. The current wallet normalizer recognizes XP, level, Mana, X/N Credits, upgrade, HP, HP capsules, Mana capsule capacity, Arcane Shield charge/level/prepared state, Shield-used Wave IDs, casino credits, transaction history, reward IDs, non-exchangeable assets, active Wave, settled Wave IDs and casino round IDs.

A native Win32 process cannot directly read another browser profile's localStorage. Therefore “preserve existing progress” requires an explicit, user-initiated browser export followed by N.U import; it cannot be assumed to happen automatically. The import/export implementation is not yet present.

Migration requirements:
- export only after the browser save is successfully parsed and normalized;
- include product ID, source schema/key, schema version, component IDs, lengths and per-file digests in a portable identity-marked bundle;
- preserve transaction IDs, reward IDs, settled Wave IDs and idempotency history to prevent duplicate rewards or wallet movements;
- keep Save, Wallet/Profile and User Assets as separate logical data classes even if they are stored in one physical bundle;
- import into a new native profile without overwriting a non-empty profile unless the user explicitly chooses replace/merge and sees a preview;
- reject unknown schema versions, path traversal, size overflows and digest mismatch;
- keep the original browser data unchanged until the native import is verified and the user confirms the migration;
- never put browser data, wallet data or save files in disposable cache or inside a versioned executable directory.

The first public native demo may start with a new local profile if migration is not ready, but it must clearly disclose that the old browser save has not been imported. It must not claim automatic continuity.


## 11. NUDb/1 portable user-data bundle primitive

The portable core now defines a bounded NUDb/1 (magic `NUDB`) container for user-owned data only. It accepts five classes: Save, Wallet, Profile, User Asset and Settings. Each entry has a stable ASCII ID, explicit class, length and CRC32. The complete bundle also carries a product tag, format version, entry count, payload length and payload CRC. Unknown classes, duplicate stable IDs across the entire bundle, unsafe IDs, malformed sizes, unsupported versions and CRC mismatch are rejected before entry pointers are exposed.

The format does not accept executable modules, installer archives or cache entries. CRC32 detects accidental corruption; it is not a cryptographic signature or tamper-proof wallet seal.

The C90 build/parse primitive and unit tests are implemented. Host-level file writing, atomic sibling-file replacement, export UI, import preview, merge/replace decisions, migration from browser localStorage and post-import recovery are still not wired. Do not yet advertise a working Save/Wallet backup button.

Each NUDb/1 entry now carries its own schema major/minor in addition to the class and stable ID. Save and Wallet schemas can therefore migrate independently inside the same portable identity-marked bundle.
