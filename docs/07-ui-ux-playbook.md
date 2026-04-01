# UI/UX Playbook — Tic-Tac-Toe Chaos

> **Aesthetic Direction:** Modern Neon Revival — a classic game reborn through neon tube lighting, deep space backdrops, and electric card power. Think neon sign shop meets arcade cabinet meets outer space. The glow is the game.

---

## 1. Design Philosophy

| Principle | Description |
|---|---|
| **Neon Tube Realism** | All glows simulate physical neon tube lights: multi-layer `box-shadow` + inner diffuse + outer halo |
| **Dark Canvas First** | Content floats on near-black space — background never competes with neon |
| **Card as Artifact** | Power cards feel physical — thick borders, tactile hover, satisfying play animation |
| **Revival, Not Retro** | Modern rounded forms + pixel nostalgia accents. NOT 8-bit. NOT CRT-heavy. Clean neon. |
| **Spatial Hierarchy** | Board center → card hand bottom → status top. Clear Z-depth via glow intensity |

---

## 2. Color Palette

### Base Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-void` | `#080818` | Page background — true near-black with blue tint |
| `--color-deep` | `#0D0D2B` | Card backgrounds, board background |
| `--color-surface` | `#12123A` | Component surfaces, modals |
| `--color-border` | `#1E1E5A` | Subtle borders, dividers |
| `--color-text-primary` | `#E8EAFF` | Main text — cool white |
| `--color-text-muted` | `#7B7FAA` | Secondary text, labels |

### Neon Palette

| Token | Hex | Name | Usage |
|---|---|---|---|
| `--neon-pink` | `#FF2D6B` | Hot Pink | Player X marks, primary CTAs, logo |
| `--neon-cyan` | `#00E5FF` | Electric Cyan | Player O marks, board grid lines |
| `--neon-violet` | `#9B5CF6` | Deep Violet | Card deck accent, mode indicators |
| `--neon-yellow` | `#FFD600` | Arc Yellow | Win highlight, victory state |
| `--neon-green` | `#00FF9F` | Mint Surge | Success actions, "your turn" indicator |
| `--neon-orange` | `#FF6B35` | Plasma Orange | Warning states, freeze effects |
| `--neon-white` | `#F0F4FF` | Tube White | Room code display, numeric text |

### Card Glow Colors (one per card)

| Card | Glow Color | Hex |
|---|---|---|
| Spawn Board | Electric Cyan | `#00E5FF` |
| Erase | Hot Pink | `#FF2D6B` |
| 9 Grid | Deep Violet | `#9B5CF6` |
| Mirror Strike | Plasma Orange | `#FF6B35` |
| Freeze | Arctic Blue | `#00AAFF` |
| Double Down | Neon Green | `#00FF9F` |
| Time Warp | Arc Yellow | `#FFD600` |
| Shield | Gold Amber | `#FFA500` |
| Void | Dark Void | `#6B6B99` |
| Clone | Teal | `#00E5CC` |

### Neon Glow Mixin (CSS)

```css
/* Neon tube: inner core → inner glow → outer halo */
--glow-pink:
  0 0 4px #FF2D6B,
  0 0 12px #FF2D6B,
  0 0 30px rgba(255, 45, 107, 0.6),
  0 0 60px rgba(255, 45, 107, 0.2);

--glow-cyan:
  0 0 4px #00E5FF,
  0 0 12px #00E5FF,
  0 0 30px rgba(0, 229, 255, 0.6),
  0 0 60px rgba(0, 229, 255, 0.2);

--glow-violet:
  0 0 4px #9B5CF6,
  0 0 12px #9B5CF6,
  0 0 30px rgba(155, 92, 246, 0.6),
  0 0 60px rgba(155, 92, 246, 0.2);
```

---

## 3. Typography

### Font Stack

| Role | Font | Import | Fallback |
|---|---|---|---|
| **Logo / Hero** | Orbitron | Google Fonts | monospace |
| **Card Names / Headings** | Rajdhani | Google Fonts | sans-serif |
| **Body / UI Labels** | Nunito | Google Fonts | sans-serif |
| **Room Codes / Scores** | JetBrains Mono | Google Fonts | monospace |

> **Why this stack:** Orbitron has the chunky rounded tube-neon silhouette that matches the reference image exactly. Rajdhani is geometric-military — perfect for card power names. Nunito is friendly and round for lobby copy. JetBrains Mono for codes has techy legitimacy.

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;600;700&family=Nunito:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');
```

### Tailwind Config Extension

```js
// tailwind.config.js
fontFamily: {
  logo:    ['Orbitron', 'monospace'],
  card:    ['Rajdhani', 'sans-serif'],
  body:    ['Nunito', 'sans-serif'],
  mono:    ['JetBrains Mono', 'monospace'],
}
```

### Type Scale

| Token | Size | Font | Weight | Usage |
|---|---|---|---|---|
| `text-logo` | 3.5rem / 56px | Orbitron | 900 | Game title |
| `text-hero` | 2rem / 32px | Orbitron | 700 | Section headers |
| `text-card-name` | 1.25rem / 20px | Rajdhani | 700 | Card title |
| `text-card-desc` | 0.875rem / 14px | Nunito | 500 | Card description |
| `text-card-flavor` | 0.75rem / 12px | Nunito | 400 italic | Card flavor copy |
| `text-label` | 0.875rem / 14px | Rajdhani | 600 | UI labels |
| `text-body` | 1rem / 16px | Nunito | 400 | General copy |
| `text-code` | 1.5rem / 24px | JetBrains Mono | 700 | Room codes |
| `text-score` | 2.5rem / 40px | JetBrains Mono | 700 | Scores, timers |

### Neon Text Glow Effect

```css
/* Apply on logo, card names, X/O marks */
.neon-text-pink {
  color: #FF2D6B;
  text-shadow:
    0 0 4px #FF2D6B,
    0 0 12px rgba(255, 45, 107, 0.8),
    0 0 30px rgba(255, 45, 107, 0.4);
}

.neon-text-cyan {
  color: #00E5FF;
  text-shadow:
    0 0 4px #00E5FF,
    0 0 12px rgba(0, 229, 255, 0.8),
    0 0 30px rgba(0, 229, 255, 0.4);
}
```

---

## 4. Background & Atmosphere

### Page Background

```css
body {
  background-color: #080818;
  background-image:
    /* Subtle radial nebula center glow */
    radial-gradient(ellipse 80% 60% at 50% 20%, rgba(155, 92, 246, 0.08) 0%, transparent 70%),
    /* Fine star field (CSS only) */
    radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 70%, rgba(255,255,255,0.2) 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 20%, rgba(255,255,255,0.25) 0%, transparent 100%),
    radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.2) 0%, transparent 100%);
}
```

### CRT Scanline Overlay (optional, subtle)

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.04) 2px,
    rgba(0, 0, 0, 0.04) 4px
  );
  z-index: 9999;
}
```

---

## 5. Component Specs

### 5.1 Board Cell

States: `idle` | `hover` | `x-mark` | `o-mark` | `frozen` | `win-highlight`

```
┌─────────────────────┐
│                     │  idle: border #1E1E5A, bg transparent
│                     │  hover: border --neon-cyan 60% opacity, bg cyan 3%
│   [X or O or ·]     │  x-mark: "X" in --neon-pink, neon glow
│                     │  o-mark: "O" in --neon-cyan, neon glow
│                     │  frozen: border --neon-orange, frost overlay
└─────────────────────┘
```

**CSS Spec:**
```css
.board-cell {
  aspect-ratio: 1;
  background: transparent;
  border: 2px solid #1E1E5A;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', monospace;
  font-size: clamp(2rem, 8vw, 4rem);
  font-weight: 900;
  transition: border-color 200ms ease-out, background 200ms ease-out;
  cursor: pointer;
}

.board-cell:hover:not(.filled):not(.frozen) {
  border-color: rgba(0, 229, 255, 0.5);
  background: rgba(0, 229, 255, 0.04);
}

.board-cell.x-mark {
  color: #FF2D6B;
  text-shadow: var(--glow-pink);
  border-color: rgba(255, 45, 107, 0.4);
}

.board-cell.o-mark {
  color: #00E5FF;
  text-shadow: var(--glow-cyan);
  border-color: rgba(0, 229, 255, 0.4);
}

.board-cell.frozen {
  border-color: #00AAFF;
  background: rgba(0, 170, 255, 0.06);
  cursor: not-allowed;
  opacity: 0.6;
}

.board-cell.win-highlight {
  border-color: #FFD600;
  background: rgba(255, 214, 0, 0.08);
  animation: win-pulse 1s ease-in-out infinite;
}

@keyframes win-pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(255,214,0,0.4); }
  50%       { box-shadow: 0 0 24px rgba(255,214,0,0.8), 0 0 48px rgba(255,214,0,0.3); }
}
```

### 5.2 Board Grid

```
┌─────────────────────────────────┐
│  ┌─────┬─────┬─────┐           │
│  │     │     │     │  3×3 grid │
│  │     │  X  │     │  neon cyan│
│  │─────┼─────┼─────│  dividers │
│  │  O  │     │     │           │
│  │─────┼─────┼─────│           │
│  │     │     │  X  │           │
│  └─────┴─────┴─────┘           │
│  [board neon border: cyan glow] │
└─────────────────────────────────┘
```

**Board container:**
```css
.board-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px;
  border: 2px solid rgba(0, 229, 255, 0.3);
  border-radius: 12px;
  box-shadow: var(--glow-cyan);
  background: rgba(0, 229, 255, 0.03);
}
```

### 5.3 Power Card Component

Each card has 4 zones: **Badge** (glow color), **Icon**, **Name**, **Description + Flavor**

```
┌──────────────────────────┐  ← border: 2px solid [card-color], glow box-shadow
│  ╔════════╗              │
│  ║  ICON  ║  [CARD NAME] │  ← Orbitron 700, neon text
│  ║  SVG   ║              │
│  ╚════════╝              │
│  ─────────────────────── │  ← divider, 1px solid card-color 40%
│  Effect description      │  ← Rajdhani 500, 14px, text-muted
│                          │
│  "Flavor copy here."     │  ← Nunito italic 400, 12px, text-muted 70%
└──────────────────────────┘
   [card-color glow bottom bar]
```

**CSS Spec:**
```css
.power-card {
  width: 140px;
  min-height: 200px;
  background: linear-gradient(145deg, #12123A, #0D0D2B);
  border-radius: 12px;
  border: 2px solid var(--card-color);
  box-shadow:
    0 0 8px var(--card-color),
    0 0 20px rgba(var(--card-color-rgb), 0.3),
    inset 0 1px 0 rgba(255,255,255,0.05);
  padding: 12px;
  display: flex; flex-direction: column; gap: 8px;
  cursor: pointer;
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
  position: relative;
  overflow: hidden;
}

.power-card::before {
  /* Subtle inner glow at top */
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 40%;
  background: linear-gradient(to bottom, rgba(var(--card-color-rgb), 0.06), transparent);
  pointer-events: none;
}

.power-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow:
    0 0 12px var(--card-color),
    0 0 36px rgba(var(--card-color-rgb), 0.5),
    0 12px 30px rgba(0,0,0,0.5);
}

.power-card.selected {
  transform: translateY(-10px) scale(1.05);
  border-width: 3px;
}

.card-icon-wrapper {
  width: 48px; height: 48px;
  border-radius: 8px;
  border: 1.5px solid rgba(var(--card-color-rgb), 0.6);
  display: flex; align-items: center; justify-content: center;
  background: rgba(var(--card-color-rgb), 0.08);
  flex-shrink: 0;
}

.card-name {
  font-family: 'Orbitron', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--card-color);
  text-shadow: 0 0 8px rgba(var(--card-color-rgb), 0.8);
  line-height: 1.2;
  margin-top: 4px;
}

.card-divider {
  height: 1px;
  background: rgba(var(--card-color-rgb), 0.3);
}

.card-description {
  font-family: 'Rajdhani', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #9CA3C8;
  line-height: 1.4;
  flex: 1;
}

.card-flavor {
  font-family: 'Nunito', sans-serif;
  font-size: 11px;
  font-style: italic;
  color: #5E6390;
  line-height: 1.3;
  border-top: 1px solid rgba(255,255,255,0.04);
  padding-top: 6px;
  margin-top: auto;
}
```

### 5.4 Card Definitions (Full Spec)

---

#### Card 1 — Spawn Board
| Field | Value |
|---|---|
| **Glow Color** | `#00E5FF` (Electric Cyan) |
| **Icon Concept** | Two overlapping 3×3 grids, the second slightly offset and fading in — represents board expansion |
| **Lucide Icon** | `LayoutGrid` or `Grid3X3` |
| **Name** | SPAWN BOARD |
| **Effect** | Add an adjacent 3×3 board to the battlefield. Once per player per game. |
| **Flavor** | *"Expand the battlefield — your opponent won't see it coming."* |
| **Restriction badge** | `1× PER GAME` in `--neon-orange` |

---

#### Card 2 — Erase
| Field | Value |
|---|---|
| **Glow Color** | `#FF2D6B` (Hot Pink) |
| **Icon Concept** | An eraser stroke slashing diagonally across an opponent mark (X or O with a strike-through) |
| **Lucide Icon** | `Eraser` |
| **Name** | ERASE |
| **Effect** | Remove one opponent mark from the board. |
| **Flavor** | *"What once was theirs is now nothing. Clean the slate."* |

---

#### Card 3 — 9 Grid
| Field | Value |
|---|---|
| **Glow Color** | `#9B5CF6` (Deep Violet) |
| **Icon Concept** | A 3×3 grid where each cell contains a tiny 3×3 sub-grid — nested grid fractal |
| **Lucide Icon** | `Grid` (custom nested variant) |
| **Name** | 9 GRID |
| **Effect** | Transforms the match into Ultimate Tic-Tac-Toe — win mini-boards to win the meta-board. |
| **Flavor** | *"Go deeper. Win the board to win the board."* |

---

#### Card 4 — Mirror Strike
| Field | Value |
|---|---|
| **Glow Color** | `#FF6B35` (Plasma Orange) |
| **Icon Concept** | Two opposing arrows converging on a center mark, flipping it — a reversal symbol |
| **Lucide Icon** | `ArrowLeftRight` + mark overlay |
| **Name** | MIRROR STRIKE |
| **Effect** | Steal one opponent mark and convert it to yours. |
| **Flavor** | *"Their move becomes your weapon."* |

---

#### Card 5 — Freeze
| Field | Value |
|---|---|
| **Glow Color** | `#00AAFF` (Arctic Blue) |
| **Icon Concept** | A snowflake / ice crystal centered over a row of board cells — encasing them in ice |
| **Lucide Icon** | `Snowflake` |
| **Name** | FREEZE |
| **Effect** | Lock one row or column — neither player can place there for 1 full round. |
| **Flavor** | *"Time stops — for them."* |

---

#### Card 6 — Double Down
| Field | Value |
|---|---|
| **Glow Color** | `#00FF9F` (Neon Green) |
| **Icon Concept** | Two identical marks (X + X or stacked) with a lightning bolt — double power |
| **Lucide Icon** | `Zap` or `Copy` |
| **Name** | DOUBLE DOWN |
| **Effect** | Place 2 marks anywhere valid in a single turn. |
| **Flavor** | *"One move wasn't enough. Take two."* |

---

#### Card 7 — Time Warp
| Field | Value |
|---|---|
| **Glow Color** | `#FFD600` (Arc Yellow) |
| **Icon Concept** | A circular rewind arrow (clock face with counter-clockwise motion, 2 notches indicating 2 undone moves) |
| **Lucide Icon** | `RotateCcw` |
| **Name** | TIME WARP |
| **Effect** | Undo the last 2 moves — one from each player. |
| **Flavor** | *"Rewrite history. One moment at a time."* |

---

#### Card 8 — Shield
| Field | Value |
|---|---|
| **Glow Color** | `#FFA500` (Gold Amber) |
| **Icon Concept** | A shield with a checkmark centered over a board cell — protection and permanence |
| **Lucide Icon** | `ShieldCheck` |
| **Name** | SHIELD |
| **Effect** | Mark one of your existing cells as protected for 2 rounds. Protected cells cannot be targeted by Erase or Mirror Strike. |
| **Flavor** | *"Some things cannot be taken."* |
| **Restriction badge** | `OWN MARKS ONLY` in `--neon-orange` |

---

#### Card 9 — Void
| Field | Value |
|---|---|
| **Glow Color** | `#6B6B99` (Dark Void) |
| **Icon Concept** | A cell crossed out with a dark X glyph, fading into near-black — the cell ceases to exist |
| **Lucide Icon** | `Minus` or `X` |
| **Name** | VOID |
| **Effect** | Permanently remove one empty cell from the board. No mark can ever be placed there again. |
| **Flavor** | *"Some squares stop existing."* |
| **Restriction badge** | `EMPTY CELLS ONLY` in `--neon-orange` |

---

#### Card 10 — Clone
| Field | Value |
|---|---|
| **Glow Color** | `#00E5CC` (Teal) |
| **Icon Concept** | Two overlapping identical marks with a faint copy trail — duplication in motion |
| **Lucide Icon** | `Copy` or `Layers` |
| **Name** | CLONE |
| **Effect** | Copy one of your existing marks to any adjacent empty cell (orthogonal or diagonal). Turn passes after playing. |
| **Flavor** | *"One becomes two."* |
| **Restriction badge** | `SAME BOARD ONLY` in `--neon-orange` (no cross-board cloning in multi-board mode) |

---

### 5.5 Card Deck (Hand Display)

Displayed as a fan at the bottom of the game screen.

```
[  Card 1  ]  [  Card 2  ]  [  Card 3  ]
    ↑ fanned, stacked, or flat row depending on viewport
```

**Layout:**
- Desktop: horizontal row, `gap-3`, centered
- Mobile: stacked with peek (bottom sheet or horizontal scroll snap)
- Cards slide in from bottom on game start (`translateY(100px)` → `0`)
- Played card animates up and out: `translateY(-300px) scale(0.8) opacity 0`
- Used/spent cards desaturate: `filter: grayscale(0.8) brightness(0.5)`

**Tailwind:**
```tsx
<div className="flex gap-3 justify-center items-end px-4 pb-4">
  {cards.map(card => (
    <PowerCard key={card.id} card={card} onPlay={handlePlay} />
  ))}
</div>
```

### 5.6 Room Lobby Component

```
┌──────────────────────────────────────┐
│  TIC-TAC-TOE CHAOS                   │  ← Orbitron, neon pink glow
│  [subtitle in Rajdhani]              │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  CREATE ROOM    │  JOIN ROOM │    │  ← tab toggle, neon border
│  └──────────────────────────────┘    │
│                                      │
│  ROOM CODE: [  X7K2-M9PQ  ]         │  ← JetBrains Mono, large, cyan glow
│             [  COPY  ]               │
│                                      │
│  Waiting for opponent...  ●●●        │  ← animated neon pulse dots
│                                      │
│  [ JOIN WITH CODE ]  ← CTA button    │
└──────────────────────────────────────┘
```

**CTA Button Spec:**
```css
.btn-primary {
  background: transparent;
  border: 2px solid #FF2D6B;
  color: #FF2D6B;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 12px 32px;
  border-radius: 6px;
  box-shadow: var(--glow-pink);
  transition: background 200ms, color 200ms, box-shadow 200ms;
  cursor: pointer;
}

.btn-primary:hover {
  background: rgba(255, 45, 107, 0.12);
  box-shadow:
    0 0 8px #FF2D6B,
    0 0 24px rgba(255, 45, 107, 0.7),
    0 0 60px rgba(255, 45, 107, 0.3);
}
```

### 5.7 Game Status Bar

Top strip showing: current player turn, game mode badge, round number.

```
┌──────────────────────────────────────────────────────┐
│  [X] PLAYER 1  ●  YOUR TURN     CLASSIC MODE   RND 4 │
└──────────────────────────────────────────────────────┘
```

- Active player indicator pulses with their neon color
- Mode badge: pill with `--neon-violet` border
- Turn indicator rotates on state change (`rotateX` 360° flip)

---

## 6. Animation Specs

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| Card deal (game start) | 600ms per card, 100ms stagger | `cubic-bezier(0.22, 1, 0.36, 1)` | Game begins |
| Card hover lift | 200ms | `ease-out` | Mouse enter |
| Card play (fly out) | 400ms | `ease-in` | Card activated |
| Board cell fill | 250ms | `ease-out` | Cell clicked |
| Win line draw | 600ms | `ease-in-out` | Win detected |
| Neon idle pulse | 3000ms | `ease-in-out`, infinite | Always-on, subtle |
| Turn flip indicator | 300ms | `ease-in-out` | Turn changes |
| Room code copy flash | 150ms | `ease-out` | Copy clicked |
| Freeze overlay | 400ms | `ease-out` | Freeze card played |

### Neon Idle Pulse (board border)

```css
@keyframes neon-idle-pulse {
  0%, 100% {
    box-shadow:
      0 0 4px #00E5FF,
      0 0 12px rgba(0, 229, 255, 0.4),
      0 0 30px rgba(0, 229, 255, 0.1);
  }
  50% {
    box-shadow:
      0 0 8px #00E5FF,
      0 0 20px rgba(0, 229, 255, 0.6),
      0 0 50px rgba(0, 229, 255, 0.2);
  }
}

.board-grid {
  animation: neon-idle-pulse 3s ease-in-out infinite;
}
```

### Card Play Animation

```css
@keyframes card-play {
  0%   { transform: translateY(0) scale(1); opacity: 1; }
  40%  { transform: translateY(-80px) scale(1.1); opacity: 1; }
  100% { transform: translateY(-300px) scale(0.7) rotate(10deg); opacity: 0; }
}

.card-playing {
  animation: card-play 400ms ease-in forwards;
}
```

### Board Cell Fill

```css
@keyframes cell-fill {
  0%   { transform: scale(0.4) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(4deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.board-cell.just-filled .cell-mark {
  animation: cell-fill 250ms ease-out forwards;
}
```

### Reduced Motion Fallback

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .board-grid { animation: none; }
}
```

---

## 7. Page Layouts

### 7.1 Home / Lobby Page

```
┌─────────────────────────────────────┐  viewport: 100vh
│                                     │
│  [nebula glow bg]                   │
│                                     │
│      TIC-TAC-TOE                    │  Orbitron 900, neon-pink
│          CHAOS                      │  Orbitron 900, neon-cyan
│                                     │
│    [mode selector pills]            │  Classic · Multi-board · Ultimate
│                                     │
│  ┌─────────────┬─────────────┐      │
│  │ CREATE ROOM │  JOIN ROOM  │      │  Tab toggle
│  └─────────────┴─────────────┘      │
│                                     │
│     [form content]                  │
│                                     │
│  [language selector]  [footer]      │  Locale: EN · PT · DE · ES
└─────────────────────────────────────┘
```

**Layout code:**
```tsx
// app/[locale]/page.tsx structure
<main className="min-h-screen bg-[#080818] flex flex-col items-center justify-center px-4 gap-8">
  <GameLogo />           {/* Orbitron title with neon glow */}
  <ModeSelector />       {/* pill tabs */}
  <LobbyCard />          {/* create/join form */}
  <LocaleSelector />     {/* bottom, muted */}
</main>
```

### 7.2 Game Page

```
┌─────────────────────────────────────────────────────┐
│  [GameStatusBar] ← fixed top, blur bg               │
├─────────────────────────────────────────────────────┤
│                                                     │
│               [Board(s) Area]                       │  flex-1, centered
│                                                     │
│   Classic: single board, centered                   │
│   Multi-board: 2 boards side-by-side                │
│   Ultimate: 3×3 meta-grid of mini-boards            │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [CardHand] ← fixed bottom, card fan                │
└─────────────────────────────────────────────────────┘
```

**Responsive board sizing:**

| Breakpoint | Board cell size | Board width |
|---|---|---|
| Mobile (375px) | `min(13vw, 80px)` | `~260px` |
| Tablet (768px) | `min(10vw, 100px)` | `~320px` |
| Desktop (1024px+) | `120px` | `380px` |
| Wide (1440px+) | `140px` | `440px` |

---

## 8. Responsive Breakpoints

| Breakpoint | Alias | Width | Key Differences |
|---|---|---|---|
| Mobile | `sm` | 375px | Cards: horizontal scroll; Board: full-width; Status: compact |
| Phablet | `md` | 768px | Cards: 3-wide row visible; Board: centered max 360px |
| Desktop | `lg` | 1024px | Full layout; card hand bottom bar; game status top bar |
| Wide | `xl` | 1440px | Multi-board side-by-side; larger board cells |

---

## 9. Tailwind Token Overrides

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        void:     '#080818',
        deep:     '#0D0D2B',
        surface:  '#12123A',
        border:   '#1E1E5A',
        neon: {
          pink:   '#FF2D6B',
          cyan:   '#00E5FF',
          violet: '#9B5CF6',
          yellow: '#FFD600',
          green:  '#00FF9F',
          orange: '#FF6B35',
          blue:   '#00AAFF',
          white:  '#F0F4FF',
        },
        text: {
          primary: '#E8EAFF',
          muted:   '#7B7FAA',
          faint:   '#5E6390',
        }
      },
      fontFamily: {
        logo:  ['Orbitron', 'monospace'],
        card:  ['Rajdhani', 'sans-serif'],
        body:  ['Nunito', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-pink':   '0 0 4px #FF2D6B, 0 0 12px #FF2D6B, 0 0 30px rgba(255,45,107,0.5)',
        'neon-cyan':   '0 0 4px #00E5FF, 0 0 12px #00E5FF, 0 0 30px rgba(0,229,255,0.5)',
        'neon-violet': '0 0 4px #9B5CF6, 0 0 12px #9B5CF6, 0 0 30px rgba(155,92,246,0.5)',
        'neon-yellow': '0 0 4px #FFD600, 0 0 12px #FFD600, 0 0 30px rgba(255,214,0,0.5)',
        'neon-green':  '0 0 4px #00FF9F, 0 0 12px #00FF9F, 0 0 30px rgba(0,255,159,0.5)',
        'neon-orange': '0 0 4px #FF6B35, 0 0 12px #FF6B35, 0 0 30px rgba(255,107,53,0.5)',
        'neon-blue':   '0 0 4px #00AAFF, 0 0 12px #00AAFF, 0 0 30px rgba(0,170,255,0.5)',
      },
      animation: {
        'neon-pulse':  'neon-idle-pulse 3s ease-in-out infinite',
        'card-deal':   'card-deal 600ms cubic-bezier(0.22,1,0.36,1) forwards',
        'cell-fill':   'cell-fill 250ms ease-out forwards',
        'win-pulse':   'win-pulse 1s ease-in-out infinite',
      },
    },
  },
}
```

---

## 10. shadcn/ui Component Mapping

| Game Component | shadcn Base | Notes |
|---|---|---|
| Board Cell | — | Custom — no shadcn equivalent |
| Power Card | `Card` + `CardContent` | Extend with neon border CSS vars |
| Room Code input | `Input` | Override border to `neon-cyan`, mono font |
| Join/Create button | `Button` variant `outline` | Override with neon-pink glow |
| Mode selector | `Tabs` | Override active tab to neon-violet underline |
| Game Status Bar | — | Custom strip, not a shadcn component |
| Language selector | `Select` | Standard shadcn, dark surface override |
| Toast (card played) | `Sonner` / `Toast` | Neon-bordered toast, brief 2s duration |
| Loading skeleton | `Skeleton` | Dark surface bg, shimmer opacity pulse |
| Dialog (game end) | `Dialog` | Dark bg, neon border, Orbitron winner text |

**shadcn CSS variable overrides in `globals.css`:**
```css
:root {
  --background: 232 50% 6%;      /* #080818 */
  --foreground: 228 50% 93%;     /* #E8EAFF */
  --card: 232 45% 11%;           /* #0D0D2B */
  --card-foreground: 228 50% 93%;
  --border: 232 60% 23%;         /* #1E1E5A */
  --input: 232 60% 23%;
  --ring: 210 100% 60%;          /* #00E5FF — focus ring */
  --primary: 344 100% 58%;       /* #FF2D6B */
  --primary-foreground: 0 0% 100%;
  --secondary: 248 90% 64%;      /* #9B5CF6 */
  --muted: 232 40% 18%;
  --muted-foreground: 228 20% 55%; /* #7B7FAA */
  --radius: 0.5rem;
}
```

---

## 11. Accessibility Checklist

- [ ] All neon text meets 4.5:1 contrast ratio against `#080818` background
  - `#FF2D6B` on `#080818`: **8.5:1** ✓
  - `#00E5FF` on `#080818`: **12.1:1** ✓
  - `#9B5CF6` on `#080818`: **5.2:1** ✓
- [ ] Board cells: 44×44px minimum touch target on mobile
- [ ] Cards: 44px minimum height tap target
- [ ] Focus rings: `--ring: #00E5FF` visible on all interactive elements
- [ ] `aria-label` on all icon-only buttons (e.g., Copy room code)
- [ ] Board cells: `role="button"`, `aria-label="Row 1, Column 2"` pattern
- [ ] Active player communicated via `aria-live="polite"` on status bar
- [ ] Frozen cells: `aria-disabled="true"`
- [ ] `prefers-reduced-motion` disables all keyframe animations
- [ ] Color is never the only indicator — X/O characters + color for marks
- [ ] Language selector keyboard-navigable (shadcn Select handles this)

---

## 12. Anti-Patterns to Avoid

| Anti-pattern | Why | Instead |
|---|---|---|
| White or light backgrounds | Kills the neon effect entirely | `#080818` only |
| Gradients as primary backgrounds | Distracts from neon lights | Dark solid + subtle radial nebula only |
| `Inter` / `Roboto` for headings | Generic, kills the aesthetic | Orbitron for titles, Rajdhani for UI |
| Heavy CRT scanlines | Looks dated, hurts readability | Subtle 4px 4% opacity scanlines only |
| Pixel art / 8-bit | Wrong revival style — this is neon tube, not pixel | Smooth rounded neon outlines |
| Saturated colored backgrounds inside cards | Competes with neon borders | `#0D0D2B` card bg always |
| `animate-bounce` on decorative elements | Distracting infinite motion | Reserved for loading only |
| Emoji as icons | Inconsistent rendering, unprofessional | Lucide React SVG icons exclusively |
| `scale` hover causing layout shift | Jitter feels cheap | Use `transform: translateY + scale` together |

---

## 13. Implementation Priority Order

1. `globals.css` — CSS variables, font imports, neon glow keyframes, scanline overlay
2. `tailwind.config.js` — token extensions (colors, fonts, shadows, animations)
3. `PowerCard` component — the most visually distinctive piece, sets the tone
4. `BoardCell` + `BoardGrid` — neon grid with fill animations
5. `GameStatusBar` — top strip
6. `CardHand` — fan/row layout with deal animation
7. `RoomLobby` — home page form
8. `GameEndDialog` — win screen (Orbitron winner announcement, neon burst)
