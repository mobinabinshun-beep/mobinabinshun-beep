# N.U Generation 2 — Territory and wager rules (revised)

Status: isolated test branch; not merged or deployed to the public site.

## Board and movement
- The board contains 30 × 30 cells. Coordinates are cell coordinates 0..29; the upper side is Chaos and the lower side is the player.
- Each side begins in the middle cell of its opposing edge.
- A move is exactly one orthogonal step (up, down, left, right) into an in-bounds, unoccupied cell.
- Occupied cells remain blocked for the rest of the round. No diagonal moves, jumping, crossing, revisiting, erasing, or breaking a trail.
- A side with no legal move is blocked and passes. The other side may continue. The round ends only when both sides have no legal moves.

## Territory scoring
- The path is a sequence of occupied dots/cells; no continuous visible line is drawn.
- After both sides are blocked, flood-fill the remaining empty board into connected regions using four-neighbor adjacency.
- Each whole region is awarded to the side whose path is closest to that region (minimum Manhattan distance from any region cell to that side's occupied path). Equal-distance regions are split evenly.
- Occupied path cells count for their owner. Higher total territory wins; equal totals are a draw.
- This is an explicit first-pass territory model for playtesting; it should be validated against hand-drawn sample boards before production lock.

## Wager escrow and settlement
- HP is not a wager asset and is not listed in the wager selector.
- Stake must be an integer from 1 through the available balance. Zero balance cannot place a bet.
- Stake is debited before the first move and persisted in localStorage. Reloading or leaving during a live round does not refund it; the unfinished stake is forfeited.
- Win: gross return is 2× stake, subject to the relevant wallet/capsule capacity. Overflow is burned and never credited.
- Loss: the entire stake is forfeited.
- Draw: stake remains escrowed; the player may replay without adding another stake, or leave and forfeit the escrowed stake.
- After a win, the quest offers continuation with the same asset and exactly 2× the previous stake, or exit. Leaving the casino resets the win streak. After a loss, the player may choose a fresh stake from the remaining balance.
- Closing the casino during an active round is blocked. The casino close control uses the same guarded exit path as the explicit exit action.

## AI
- One of 70 numbered profiles is selected per round. Profile-specific biases and move scoring vary the opponent's route; all profiles obey the same legal-move constraints.
- These are local heuristic profiles, not 70 separately trained models.

## Preservation
- Generation 1 source snapshots are stored in _backups/generation-1/.
- This branch is based on the isolated Generation 2 test branch. It does not merge to the public/default branch and does not edit Generation 1 runtime files.
- Local browser wallet persistence is for prototype testing only. It is not secure against tampering and is not suitable for real-money or competitive online play.
