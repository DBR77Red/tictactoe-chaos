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
}

const MARK_STYLES: Record<NonNullable<Mark>, string> = {
  X: 'text-[#ff2d7a] [filter:drop-shadow(0_0_10px_#ff2d7a)_drop-shadow(0_0_20px_#ff2d7a80)] font-black',
  O: 'text-[#00d4ff] [filter:drop-shadow(0_0_10px_#00d4ff)_drop-shadow(0_0_20px_#00d4ff80)] font-black',
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
}: Props) {
  return (
    <div
      className={cn(
        'grid grid-cols-3 border-2 border-[#7b2fff]',
        '[box-shadow:0_0_12px_#7b2fff60,inset_0_0_12px_#7b2fff20]',
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
              'h-20 w-20 text-4xl font-mono select-none',
              'border border-[#7b2fff40]',
              'transition-all duration-150',
              /* hover glow on empty cells */
              canClick && isEmpty && 'hover:bg-[#7b2fff15] hover:border-[#7b2fff]',
              /* hover glow on selectable marks */
              canClick && !isEmpty && 'hover:bg-[#ff2d7a10]',
              /* winning cell */
              isWinning &&
                'bg-[#ffd700]/10 border-[#ffd700] [box-shadow:inset_0_0_12px_#ffd70040]',
              /* frozen cell */
              isFrozen && 'bg-[#00d4ff]/20',
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
              <span className={MARK_STYLES[mark]}>{mark}</span>
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
