# N.U Player Identity, Asset Profiles & Execution Modes
**Status:** Archived architecture baseline / future implementation reference  
**Demo boundary:** Public browser demo is for visual familiarity and human review only. It must not collect real personal data, credentials, payment information or private user records.

## 1. Profile surface and freeze boundary
- The historical player card is a fixed Generation 1 visual baseline: the original identity fields and established card geometry remain unchanged unless the project owner explicitly authorizes a separate change.
- Keep the profile page focused on player identity, the card appearance preview, the photo and the small number of card-specific controls. Game HUD, HP/XP/Mana, wallet balances, transactions, launcher deployment and network architecture belong in their own views and documents.
- Advanced choices are grouped into collapsed categories. They must not compete visually with the card.
- Hologram Intensity, Edge Glow and Glass Transparency are bounded numeric controls from 0 to 100, step 1. Clamp values before applying them. The card preview updates live. Respect reduced-motion and high-contrast preferences.
- Existing card structure, typography, dimensions, frame geometry and historical identity fields are frozen by default. Do not redesign them as a side effect of adding controls.
- After player confirmation, the appearance is locked for that game save. The photo and its 2×4 placement remain editable. Demo lock behavior is illustrative only.

## 2. Photo handling and recovery
- The photo picker is always inside the photo frame on the player card; replacement uses the same control.
- Public browser demo: accept image/jpeg, image/png, image/webp and image/gif; enforce a conservative 5 MiB limit; preview locally; keep the most recent selected image in origin-scoped IndexedDB so it can be recovered in the same browser profile; offer an explicit image-copy download.
- Browser security deliberately prevents a web page from reading the original absolute path in Desktop/Gallery or silently writing to arbitrary folders. The browser or operating system chooses the destination when the player explicitly downloads a copy. Do not claim the original source path is preserved.
- Operational desktop/launcher builds may retain a user-authorized file URI/bookmark or managed copy in an application-owned media directory, subject to platform permissions and privacy policy. Persist a relative media identifier and checksum, not an assumed absolute path. Provide a visible replace, export and recovery path.
- The 2×4 selector means eight stable photo anchor/slot positions. It must not change card geometry or profile layout.

## 3. Three appearance effect controls
| Control | Range | Meaning |
|---|---:|---|
| Hologram Intensity | 0–100 | Strength of holographic surface detail |
| Edge Glow | 0–100 | Strength of the card perimeter glow |
| Glass Transparency | 0–100 | Glass/translucency amount |
All values are percentages, integer step 1, default values conservative. Values outside range are clamped. Reduced-effects mode overrides decorative intensity; it does not alter identity data or the underlying card structure. Keyboard arrows change numeric values by one step. Provide short contextual help on focus/hover and keep the live preview visible.

## 4. Two asset-profile models (not two identity cards)
### 4.1 Game-scoped asset profile
- Each game owns its own asset summary/projection.
- It appears as a nostalgic floating overlay only while the player touches/opens the corresponding game context; it is not permanently mounted on the player identity card.
- It shows only that game's actual owned assets and relevant game-scoped values. No values are fabricated or copied from another game.
- Closing/leaving the game dismisses the floating view.

### 4.2 Global N.U Wallet
- One cross-game wallet view aggregates the player's owned assets across registered games and services.
- Target presentation: all current asset balances plus the latest 24 meaningful transaction records.
- A meaningful record is an aggregate outcome for a completed view/session or a completed store/exchange operation, not every low-level click, tap or +1 event.
- Example aggregation: View A generates 5 units across 5 interactions, View B generates 10 across 10 interactions, and View C generates 1. The ledger should show completed-view aggregates of +5, +10 and +1 (subject to transaction policy), not 16 separate click records.
- Store purchases, exchange operations and completed view/session reward aggregates must each create auditable transaction entries with source, asset, signed amount, timestamp and resulting balance. Prevent duplicate settlement with an idempotency key.
- The wallet must not double-count the game-scoped projection. A game view reports its own assets; the global wallet aggregates authoritative completed transactions.
- Keep HP, XP and Mana in their game HUD and shared wallet projection as defined by the game economy; they do not belong in the historical four-field profile card.

## 5. Execution and deployment modes
These are distinct deployment/runtime modes, not profile appearance settings. They are future architecture options and must be implemented incrementally with threat modelling and human QA.

1. **Guest browser (public demo):** familiar browser experience with tightly limited, disposable cache. No real personal profile data, passwords, private information, or operational save. It is a showcase and familiarization environment.
2. **Offline browser:** same browser client can resume locally available content only while required cached assets remain available. Clearing browser data, eviction, private browsing or changing browser/device may remove availability. Do not promise durable offline storage.
3. **Personal downloadable launcher:** player downloads and runs the launcher on a supported personal platform; game modules are installed/loaded as required. Local save, OS permissions, updates, integrity checks and backups are explicit.
4. **Small local-network deployment (LAN / gaming café):** multiple clients connect to a local management computer/server without requiring internet access. A local administrator manages the deployment and shared operational data. User privacy must be protected from other players and the administrator; access and audit boundaries are documented.
5. **Online launcher with client rendering:** launcher authenticates to online services and can optimize module selection for the local system. Server storage may hold synchronized data, while game execution/rendering remains on the player's system. Saves must be atomic, versioned, encrypted in transit and protected at rest; local recovery remains available.
6. **High-capacity N.U online profile/network mode:** stronger online infrastructure and more capable servers support richer synchronized profile experiences and workload sharing. Rendering split between server and client is a measured feature, not an assumption. Define latency, ownership, conflict resolution and failover.
7. **Server-rendered / thin-client mode:** game execution/rendering is primarily server-side; client requirements are lower but experience depends on network quality, latency and bandwidth. Profile data requires strong encryption, least-privilege access, secure session management and tested recovery. Biometric authentication is optional and must never be the only recovery route.
8. **Research horizon:** an unselected future mode. Do not implement, promise, or allocate infrastructure until a concrete use case, security model and owner approval exist.

### 5.1 Local LAN privacy variant
For a LAN deployment, a minimal profile may consist of a child-lock/passcode gate and the three historical/classic profile panels only. Personal details should be optional, hidden from other clients and inaccessible to ordinary local administrators. A local server operator is not automatically entitled to inspect private user data. The public demo must never accept real passcodes or personal information; attempts to use protected fields in demo mode should show a conspicuous red demo-only warning and must not save or transmit the input.

## 6. Identity and asset terminology
These names refer to different fictional/product concepts and must not be treated as interchangeable:
- **Player Profile / Profile ID:** the player's core identity record and stable internal identifier.
- **Player ID Card:** a visual identity card representing the profile. Its historical layout is a protected design baseline.
- **Niroo City Citizen Card:** an in-world civic identity credential used by a scenario set in Niroo City. It may reference a Profile ID but is not itself the global wallet.
- **Niroo City Credit Card:** an in-world payment/credit instrument for a scenario. It represents a fictional financial interface, not a real bank card or proof of real funds.
- **Game Asset Profile:** a game-scoped, temporary floating view of assets for one game.
- **Global N.U Wallet:** cross-game owned assets and the consolidated transaction ledger.
When one of these terms appears in a scenario, use the matching concept and do not silently substitute another.

## 7. Security, demo and release boundaries
- Guest demo and any visual-only control must be labelled as simulation. No passwords, private data, real authentication, actual sync, real import/export, financial transaction or privileged operation is permitted in the public demo.
- The demo's purpose is interface familiarity and human review. A visible red warning is required when a user reaches a field or action that looks like protected operational input.
- Browser local IndexedDB is not a secure vault and is not cross-device backup. Do not store credentials or sensitive personal information there.
- Before operational release: threat model each runtime mode, define data classification/retention, encrypt transport and storage, implement least privilege, validate imports, add versioned backups and recovery, test deletion, audit privileged access, and commission independent security review.
- At Generation 1 packaging, create a clean operational launcher package from approved source and specifications. Do not distribute the public demo as the operational build. Keep private infrastructure details, secrets, deployment credentials and sensitive build history out of public archives.

## 8. Human acceptance checklist
- Profile page is visually quieter; advanced sections are collapsed by default.
- No Game Status & Wallet Boundary explainer appears on the profile page.
- Photo replacement happens only inside the card's photo frame; photo survives profile close/reopen in the same browser profile; explicit download copy works.
- Browser does not claim it can recover the source file's original desktop/gallery path.
- 2×4 photo positions remain inside the photo frame.
- The three numeric effect controls reject/clamp values below 0 and above 100; keyboard arrows change by one; live preview responds without changing card geometry.
- Appearance lock prevents effect changes after confirmation, while photo replacement/position remains available.
- Game-scoped asset overlay and global wallet remain separate. Wallet history aggregates completed view/session outcomes and store/exchange operations rather than raw clicks.
- Guest demo and LAN/online operational boundaries show red warnings and do not collect actual secrets.


## Profile photo controls — clarified demo boundary (2026-11-15)
- The player card has exactly two compact photo actions inside its own image frame: **Upload Image** and **Download Previous Image**. Do not add crop grids, placement selectors, image-fit controls, album tools, or other photo utilities to this compact surface unless the project owner separately approves them.
- **Public demo:** both actions are illustrative only. The upload action must not open a file picker, read file bytes, create a preview from a user file, write browser storage, transmit an image, or imply that an upload succeeded. It displays a clear demo-only notice. The previous-image action likewise performs no download and explains that no prior image exists in demo mode. This protects visitors from mistakenly supplying private images to a non-operational prototype.
- **Operational replacement flow:** when an authenticated player replaces a profile photo, first create a recoverable copy of the currently active image and initiate its download/export to a player-selected destination; only after the recovery step succeeds may the replacement become active. If recovery fails or is cancelled, do not replace the previous image. Never claim that a browser can silently write to an arbitrary Desktop/Gallery folder or reveal the original absolute source path. Desktop launchers may use explicit OS file permissions and a managed media directory.
- **Network/server future:** support player-owned private photo albums and interactive profile surfaces that players can selectively share with other players and community members. Sharing must be opt-in, scoped (private/friends/community/public), revocable, auditable and protected by access control. Do not expose private albums or original files to other players by default. This is a future online capability, not a Generation 1 public-demo feature.
- **Demo extension exception:** a collaborator may create a clearly labelled static/illustrative mock-up of albums or community interaction for design review, but it must not accept real uploads, persist personal images, contact a server or imply a live social feature. Keep it separate from the operational feature implementation.
