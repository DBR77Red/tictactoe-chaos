# Task 07.2 — New Cards: Shield, Void, Clone

Three new power cards to add to the game roster, chosen for balance and thematic fit.

---

## Card 8 — Shield

| Field | Value |
|---|---|
| **Glow Color** | `#00FF9F` (Neon Green) — or a distinct gold/amber `#FFD600` |
| **Lucide Icon** | `ShieldCheck` |
| **Name** | SHIELD |
| **Effect** | Mark one of your existing cells as protected for 2 rounds. Protected cells cannot be targeted by Erase or Mirror Strike. |
| **Flavor** | *"Some things cannot be taken."* |
| **Restriction** | Must have at least one mark on the board to play. |
| **Target** | Requires cell selection (your own marks only). |

**Implementation notes:**
- Add `shieldedCell: { boardIndex: number; cellIndex: number; expiresAfterTurn: number } | null` to `GameState`.
- `applyErase` and `applyMirrorStrike` must check `isCellShielded` before acting.
- Visual: golden border/glow on the shielded cell, shield icon badge in corner.
- DB: add `shielded_cell jsonb DEFAULT NULL` column to `game_states`.

---

## Card 9 — Void

| Field | Value |
|---|---|
| **Glow Color** | `#555577` (Dark Void / desaturated purple) |
| **Lucide Icon** | `Minus` or `X` (cross-out) |
| **Name** | VOID |
| **Effect** | Permanently remove one cell from the board. No mark can ever be placed there again. Does not affect existing marks — only empty cells can be voided. |
| **Flavor** | *"Some squares stop existing."* |
| **Restriction** | Can only target empty cells. |
| **Target** | Requires cell selection. |

**Implementation notes:**
- Add `voidedCells: { boardIndex: number; cellIndex: number }[]` to `GameState`.
- `playMove` must check `isCellVoided` before allowing placement.
- `checkWinner` / `isBoardFull` are unaffected — voided cells are simply permanently unplayable.
- Visual: dark grey overlay, void/X glyph, no hover state.
- DB: add `voided_cells jsonb NOT NULL DEFAULT '[]'` column to `game_states`.

---

## Card 10 — Clone

| Field | Value |
|---|---|
| **Glow Color** | `#9B5CF6` (Deep Violet) — or a distinct teal `#00E5CC` |
| **Lucide Icon** | `Copy` or `Layers` |
| **Name** | CLONE |
| **Effect** | Copy one of your existing marks to any adjacent empty cell (orthogonal or diagonal). Rewards good positioning — useless without setup. Does not count as a turn move; turn passes after playing. |
| **Flavor** | *"One becomes two."* |
| **Restriction** | Must have a mark with at least one adjacent empty cell. |
| **Target** | Two-step: select your mark to clone, then select the destination adjacent cell. |

**Implementation notes:**
- Two-step UI flow: first click selects source (own mark), second click selects an adjacent empty cell.
- `applyClone` validates adjacency: `Math.abs(srcRow - dstRow) <= 1 && Math.abs(srcCol - dstCol) <= 1`.
- Check winner after cloning (could complete a 3-in-a-row).
- For multi-board: cloning across board boundaries is **not** allowed — source and destination must be on the same board.
- Turn passes after Clone (unlike Spawn Board / Time Warp / Double Down).

---

## Card Glow Colors (updated roster)

| Card | Color | Hex |
|---|---|---|
| Spawn Board | Electric Cyan | `#00E5FF` |
| Erase | Hot Pink | `#FF2D6B` |
| 9 Grid | Deep Violet | `#9B5CF6` |
| Mirror Strike | Plasma Orange | `#FF6B35` |
| Freeze | Arctic Blue | `#00AAFF` |
| Double Down | Neon Green | `#00FF9F` |
| Time Warp | Arc Yellow | `#FFD600` |
| **Shield** | **Gold** | **`#FFD600`** or distinct amber |
| **Void** | **Dark Void** | **`#6B6B99`** |
| **Clone** | **Teal** | **`#00E5CC`** |

> Note: Shield and Time Warp share Arc Yellow — assign Shield a distinct amber `#FFA500` to avoid confusion.
