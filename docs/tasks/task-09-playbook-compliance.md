# Task 09 — Playbook Compliance Pass

## Goal

Bring the live app into full visual alignment with the UI/UX playbook at `/visualplaybook`.
Every divergence listed below was identified by diffing `docs/ui-playbook.html` against the
running source code. Fix them top-down: critical → significant → minor.

---

## Files to touch

| File | Changes |
|---|---|
| `src/app/globals.css` | Dark mode default, starfield + scanline pseudo-elements |
| `src/app/[locale]/layout.tsx` | Add `dark` class to `<html>` |
| `src/app/[locale]/page.tsx` | Wrap `HomeClient` in full hero layout |
| `src/app/[locale]/HomeClient.tsx` | Add hero section above the lobby |
| `src/components/game/RoomLobby.tsx` | Lobby-card container, tabs, room-code cyan |
| `src/components/game/Board.tsx` | Cyan border/glow, correct cell size, frozen styling |
| `src/app/[locale]/game/[roomId]/GameClient.tsx` | Room code display color fix |

---

## 🔴 Critical fixes

### 1 — Dark mode always on

**Problem:** `globals.css` `:root` defaults to light (white background). The `<html>` element
never receives the `dark` class, so `bg-background` = white. Game components hardcode their
own dark colors so gameplay looks fine, but the body can flash white on load.

**Fix — `src/app/[locale]/layout.tsx`:**
Add `dark` to the `<html>` className alongside the existing font variables.

```tsx
<html lang={locale} className={`dark ${geistSans.variable} ... h-full antialiased`}>
```

---

### 2 — Starfield + scanline background

**Problem:** The playbook uses two `body` pseudo-elements for atmosphere.
The app has none of this — just a flat dark background.

**Fix — `src/app/globals.css`** (add inside `@layer base` or after it):

```css
/* Starfield */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 90% 60% at 50% 0%, rgba(155,92,246,.10) 0%, transparent 70%),
    radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,.35) 0%, transparent 100%),
    radial-gradient(1px 1px at 35% 60%, rgba(255,255,255,.20) 0%, transparent 100%),
    radial-gradient(1px 1px at 55% 35%, rgba(255,255,255,.28) 0%, transparent 100%),
    radial-gradient(1px 1px at 72% 78%, rgba(255,255,255,.22) 0%, transparent 100%),
    radial-gradient(1px 1px at 88% 15%, rgba(255,255,255,.30) 0%, transparent 100%),
    radial-gradient(1px 1px at 92% 55%, rgba(255,255,255,.18) 0%, transparent 100%),
    radial-gradient(1px 1px at  8% 88%, rgba(255,255,255,.20) 0%, transparent 100%),
    radial-gradient(1px 1px at 48% 92%, rgba(255,255,255,.15) 0%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}

/* Scanline */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,.035) 2px,
    rgba(0,0,0,.035) 4px
  );
  pointer-events: none;
  z-index: 1;
}
```

Also ensure the `dark` block background matches playbook void color:
```css
.dark {
  --background: #080818;   /* --void from playbook */
  --foreground: #E8EAFF;   /* --text-primary */
  /* keep remaining shadcn tokens as-is */
}
```

---

### 3 — Home page: hero section missing

**Problem:** `HomeClient` renders only `<RoomLobby>` — no game title, no identity.
The playbook hero has: eyebrow label, `TIC-TAC-TOE` line 1 (neon-pink, Orbitron, flicker
animation), `CHAOS` line 2 (neon-cyan, flicker animation), subtitle, violet divider.

**Fix — `src/app/[locale]/HomeClient.tsx`:**

Wrap `<RoomLobby>` with a full-page layout:

```tsx
<div className="relative z-[2] min-h-screen flex flex-col items-center px-6 pb-20">

  {/* Hero */}
  <div className="text-center pt-24 pb-16">
    <p className="font-mono text-[11px] tracking-[.25em] uppercase text-[#5E6390] mb-6">
      UI/UX Playbook · Visual Reference
    </p>
    <h1 style={{ fontFamily: 'var(--font-orbitron)' }}
        className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-none tracking-[.04em]">
      <span className="block text-[#FF2D6B] [filter:drop-shadow(0_0_14px_#FF2D6B)_drop-shadow(0_0_40px_rgba(255,45,107,.5))]
                       animate-[neon-flicker-pink_6s_ease-in-out_infinite]">
        TIC-TAC-TOE
      </span>
      <span className="block text-[#00E5FF] [filter:drop-shadow(0_0_14px_#00E5FF)_drop-shadow(0_0_40px_rgba(0,229,255,.5))]
                       animate-[neon-flicker-cyan_8s_ease-in-out_infinite_1s]">
        CHAOS
      </span>
    </h1>
    <p style={{ fontFamily: 'var(--font-rajdhani)' }}
       className="text-lg font-medium tracking-[.08em] uppercase text-[#7B7FAA] mt-6">
      Real-time · Power Cards · No accounts
    </p>
    {/* Violet divider */}
    <div className="w-[120px] h-px mx-auto mt-8
                    bg-gradient-to-r from-transparent via-[#9B5CF6] to-transparent
                    [box-shadow:0_0_4px_#9B5CF6,0_0_14px_#9B5CF6,0_0_40px_rgba(155,92,246,.5)]" />
  </div>

  {/* Lobby card */}
  <RoomLobby ... />
</div>
```

**Neon flicker keyframes** — add to `globals.css`:
```css
@keyframes neon-flicker-pink {
  0%, 95%, 100% { opacity: 1; }
  96%           { opacity: .85; }
  97%           { opacity: 1; }
  98%           { opacity: .7; }
  99%           { opacity: 1; }
}
@keyframes neon-flicker-cyan {
  0%, 93%, 100% { opacity: 1; }
  94%           { opacity: .8; }
  96%           { opacity: 1; }
  98%           { opacity: .75; }
  99%           { opacity: 1; }
}
@keyframes neon-idle-pulse {
  0%, 100% { box-shadow: 0 0 4px #00E5FF, 0 0 14px #00E5FF, 0 0 40px rgba(0,229,255,.5); }
  50%       { box-shadow: 0 0 8px #00E5FF, 0 0 22px #00E5FF, 0 0 60px rgba(0,229,255,.35); }
}
@keyframes win-pulse {
  0%, 100% { box-shadow: inset 0 0 12px rgba(255,214,0,.4); }
  50%       { box-shadow: inset 0 0 24px rgba(255,214,0,.7), 0 0 16px rgba(255,214,0,.4); }
}
@keyframes cell-fill {
  0%   { transform: scale(0.4); opacity: 0; }
  70%  { transform: scale(1.15); }
  100% { transform: scale(1);   opacity: 1; }
}
```

---

### 4 — Lobby card: no container, no tabs

**Problem:** `RoomLobby` has no surface card, no gradient accent line, and uses a stacked
button+input layout instead of the playbook's Create/Join tabs.

**Fix — `src/components/game/RoomLobby.tsx`:**

Wrap the content in a `lobby-card`-equivalent container:

```tsx
<div className="relative w-full max-w-[480px] mx-auto rounded-2xl overflow-hidden
                bg-[#0D0D2B] border border-[#1E1E5A]
                shadow-[0_0_0_1px_rgba(155,92,246,.1),0_32px_64px_rgba(0,0,0,.5)]">

  {/* Gradient accent line at top */}
  <div className="absolute top-0 inset-x-0 h-[2px]
                  bg-gradient-to-r from-transparent via-[#9B5CF6] via-[#FF2D6B] to-transparent
                  shadow-[0_0_12px_#9B5CF6]" />

  <div className="p-10">

    {/* Tabs */}
    <div className="flex border border-[#1E1E5A] rounded-lg overflow-hidden mb-7">
      <button onClick={() => setTab('create')}
        className={tab === 'create'
          ? 'flex-1 py-2.5 font-[Rajdhani] text-sm font-bold tracking-[.08em] uppercase text-[#FF2D6B] bg-[rgba(255,45,107,.08)] shadow-[inset_0_-2px_0_#FF2D6B]'
          : 'flex-1 py-2.5 font-[Rajdhani] text-sm font-bold tracking-[.08em] uppercase text-[#7B7FAA] bg-transparent'}>
        Create
      </button>
      <button onClick={() => setTab('join')}
        className={tab === 'join'
          ? 'flex-1 py-2.5 font-[Rajdhani] text-sm font-bold tracking-[.08em] uppercase text-[#FF2D6B] bg-[rgba(255,45,107,.08)] shadow-[inset_0_-2px_0_#FF2D6B]'
          : 'flex-1 py-2.5 font-[Rajdhani] text-sm font-bold tracking-[.08em] uppercase text-[#7B7FAA] bg-transparent'}>
        Join
      </button>
    </div>

    {/* Tab panels — existing create/join content */}
    {tab === 'create' ? <CreatePanel /> : <JoinPanel />}

  </div>
</div>
```

Add `const [tab, setTab] = useState<'create' | 'join'>('create')` to component state.

---

### 5 — Room code color: pink → cyan

**Problem:** Both `RoomLobby` and `GameClient` (waiting screen) render the room code in pink
(`#ff2d7a`). Playbook specifies cyan (`#00E5FF`) with `var(--glow-cyan)`.

**Fix — `src/components/game/RoomLobby.tsx` line 89, `src/app/[locale]/game/[roomId]/GameClient.tsx` line 30:**

```diff
- text-[#ff2d7a] [filter:drop-shadow(0_0_10px_#ff2d7a)]
+ text-[#00E5FF] [filter:drop-shadow(0_0_10px_#00E5FF)_drop-shadow(0_0_40px_rgba(0,229,255,.5))]
```

---

## 🟡 Significant fixes

### 6 — Board: violet border → cyan border

**Problem:** `Board.tsx:43` uses `border-[#7b2fff]` (violet). Playbook specifies
cyan (`rgba(0,229,255,.4)`) with cyan glow, and cell borders should be `#1E1E5A` (dark navy),
not violet.

**Fix — `src/components/game/Board.tsx`:**

```diff
- 'grid grid-cols-3 border-2 border-[#7b2fff]',
- '[box-shadow:0_0_12px_#7b2fff60,inset_0_0_12px_#7b2fff20]',
+ 'grid grid-cols-3 border-2 border-[rgba(0,229,255,0.4)] rounded-xl',
+ 'bg-[rgba(0,229,255,0.025)]',
+ '[box-shadow:0_0_4px_#00E5FF,0_0_14px_#00E5FF,0_0_40px_rgba(0,229,255,.5)]',
+ 'animate-[neon-idle-pulse_3s_ease-in-out_infinite]',
```

Cell inner borders:
```diff
- 'border border-[#7b2fff40]',
+ 'border border-[#1E1E5A]',
```

Cell hover (empty):
```diff
- canClick && isEmpty && 'hover:bg-[#7b2fff15] hover:border-[#7b2fff]',
+ canClick && isEmpty && 'hover:bg-[rgba(0,229,255,0.04)] hover:border-[rgba(0,229,255,0.5)]',
```

---

### 7 — Frozen cells: border + opacity missing

**Problem:** Frozen only applies a background. Playbook: border = `#00AAFF`, bg = `rgba(0,170,255,.06)`, `opacity: 0.6`.

**Fix — `src/components/game/Board.tsx` line 88:**
```diff
- isFrozen && 'bg-[#00d4ff]/20',
+ isFrozen && 'bg-[rgba(0,170,255,0.06)] border-[#00AAFF] opacity-60',
```

---

### 8 — Win cells: add pulse animation

**Problem:** Winning cells are static. Playbook has `win-pulse` animation.

**Fix — `src/components/game/Board.tsx` line 86:**
```diff
- isWinning && 'bg-[#ffd700]/10 border-[#ffd700] [box-shadow:inset_0_0_12px_#ffd70040]',
+ isWinning && 'border-[#FFD600] bg-[rgba(255,214,0,0.07)] animate-[win-pulse_1.2s_ease-in-out_infinite]',
```

---

## 🟢 Minor fixes

### 9 — Mark entrance animation

**Problem:** Marks appear instantly. Playbook: `cell-fill` animation (scale 0.4→1.15→1, 280ms).

**Fix — `src/components/game/Board.tsx`:**
Wrap the mark `<span>` in an animated container:
```tsx
{mark && (
  <span className={cn(MARK_STYLES[mark], 'animate-[cell-fill_280ms_ease-out_forwards]')}>
    {mark}
  </span>
)}
```

---

### 10 — Mark color precision

| Mark | App (current) | Playbook |
|---|---|---|
| X | `#ff2d7a` | `#FF2D6B` |
| O | `#00d4ff` | `#00E5FF` |

**Fix — `src/components/game/Board.tsx` `MARK_STYLES`:**
```diff
- X: 'text-[#ff2d7a] [filter:drop-shadow(0_0_10px_#ff2d7a)_drop-shadow(0_0_20px_#ff2d7a80)] font-black',
- O: 'text-[#00d4ff] [filter:drop-shadow(0_0_10px_#00d4ff)_drop-shadow(0_0_20px_#00d4ff80)] font-black',
+ X: 'text-[#FF2D6B] [filter:drop-shadow(0_0_10px_#FF2D6B)_drop-shadow(0_0_40px_rgba(255,45,107,.5))] font-black',
+ O: 'text-[#00E5FF] [filter:drop-shadow(0_0_10px_#00E5FF)_drop-shadow(0_0_40px_rgba(0,229,255,.5))] font-black',
```

---

## Implementation order

1. `globals.css` — dark default + background effects + keyframes
2. `[locale]/layout.tsx` — add `dark` class
3. `Board.tsx` — cyan border, cell fixes, animations, mark colors
4. `RoomLobby.tsx` — lobby card container + tabs
5. `HomeClient.tsx` — hero section
6. `GameClient.tsx` — room code color

After all fixes: commit → push → `vercel --prod`.
