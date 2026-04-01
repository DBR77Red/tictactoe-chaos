'use client'

import { cn } from '@/lib/utils'
import type { Mark } from '@/lib/types'

type Props = {
  cells: Mark[]
  onCellClick: (cellIndex: number) => void
  winningLine: number[] | null
  frozenCells: number[]
  erasedCells?: number[]
  voidedCells?: number[]
  shieldedCells?: number[]
  selectionMode?: 'erase' | 'mirror' | 'shield' | 'void' | 'clone_src' | 'clone_dst'
  selectionFilter?: Mark
  selectableCells?: number[]  // override for clone_dst: which cells are valid targets
  disabled?: boolean
  compact?: boolean  // smaller cells for UltimateBoard mini-boards
}

const MARK_STYLES: Record<NonNullable<Mark>, string> = {
  X: 'text-[#FF2D6B] [filter:drop-shadow(0_0_10px_#FF2D6B)_drop-shadow(0_0_40px_rgba(255,45,107,.5))] font-black',
  O: 'text-[#00E5FF] [filter:drop-shadow(0_0_10px_#00E5FF)_drop-shadow(0_0_40px_rgba(0,229,255,.5))] font-black',
}

export function Board({
  cells,
  onCellClick,
  winningLine,
  frozenCells,
  erasedCells = [],
  voidedCells = [],
  shieldedCells = [],
  selectionMode,
  selectionFilter,
  selectableCells,
  disabled,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        'grid grid-cols-3 rounded-xl border-2 border-[rgba(0,229,255,0.4)]',
        'bg-[rgba(0,229,255,0.025)]',
        '[box-shadow:0_0_4px_#00E5FF,0_0_14px_#00E5FF,0_0_40px_rgba(0,229,255,.5)]',
        '[animation:neon-idle-pulse_3s_ease-in-out_infinite]',
        disabled && 'opacity-60'
      )}
    >
      {cells.map((mark, i) => {
        const isWinning = winningLine?.includes(i) ?? false
        const isFrozen = frozenCells.includes(i)
        const isErased = erasedCells.includes(i)
        const isVoided = voidedCells.includes(i)
        const isShielded = shieldedCells.includes(i)
        const isEmpty = mark === null

        const isSelectable = selectionMode != null
          ? (selectableCells != null ? selectableCells.includes(i) : mark === selectionFilter)
          : false
        const isDimmed = selectionMode != null && !isSelectable && !isVoided

        const canClick =
          !disabled &&
          !isErased &&
          !isVoided &&
          (selectionMode == null ? isEmpty : isSelectable)

        return (
          <button
            key={i}
            onClick={() => canClick && onCellClick(i)}
            disabled={!canClick}
            className={cn(
              'relative flex items-center justify-center',
              compact
                ? 'h-[clamp(28px,8vw,56px)] w-[clamp(28px,8vw,56px)] text-[clamp(0.75rem,2.5vw,1.5rem)]'
                : 'h-20 w-20 text-4xl',
              'font-mono select-none',
              'border border-[#1E1E5A]',
              'transition-all duration-150',
              /* hover glow on empty cells */
              canClick && isEmpty && 'hover:bg-[rgba(0,229,255,0.04)] hover:border-[rgba(0,229,255,0.5)]',
              /* hover glow on selectable marks */
              canClick && !isEmpty && 'hover:bg-[rgba(255,45,107,0.06)]',
              /* winning cell */
              isWinning && 'border-[#FFD600] bg-[rgba(255,214,0,0.07)] [animation:win-pulse_1.2s_ease-in-out_infinite]',
              /* frozen cell */
              isFrozen && 'bg-[rgba(0,170,255,0.06)] border-[#00AAFF] opacity-60',
              /* erased/blocked cell */
              isErased && 'bg-[#ff2d7a]/10 border-[#ff2d7a40] cursor-not-allowed',
              /* voided cell — permanently unplayable */
              isVoided && 'bg-[#111122] border-[#2a2a55] cursor-not-allowed',
              /* selection mode dimming */
              isDimmed && 'opacity-30',
              /* pulsing ring for selectable targets */
              isSelectable && 'animate-pulse ring-2 ring-[#ff2d7a] ring-offset-1 ring-offset-[#0a0a0f]',
              /* cursor */
              !canClick && 'cursor-not-allowed',
            )}
            style={isShielded ? { borderColor: '#FFA500', boxShadow: 'inset 0 0 10px #FFA50040, 0 0 8px #FFA50060' } : undefined}
          >
            {mark && (
              <span className={cn(MARK_STYLES[mark], '[animation:cell-fill_280ms_ease-out_forwards]')}>
                {mark}
              </span>
            )}

            {/* frozen badge */}
            {isFrozen && (
              <span className="absolute top-0.5 right-0.5 text-xs leading-none">
                ❄️
              </span>
            )}
            {/* erased/blocked badge */}
            {isErased && (
              <span className="absolute top-0.5 right-0.5 text-[10px] leading-none font-mono text-[#ff2d7a80]">
                ✕
              </span>
            )}
            {/* voided badge */}
            {isVoided && (
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-[#333366] select-none pointer-events-none">
                ✕
              </span>
            )}
            {/* shielded badge */}
            {isShielded && (
              <span className="absolute top-0.5 right-0.5 text-xs leading-none" style={{ color: '#FFA500', filter: 'drop-shadow(0 0 4px #FFA500)' }}>
                ⬡
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
