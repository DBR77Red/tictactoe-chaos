'use client'

import { cn } from '@/lib/utils'
import type { Mark } from '@/lib/types'

type Props = {
  cells: Mark[]
  onCellClick: (cellIndex: number) => void
  winningLine: number[] | null
  frozenCells: number[]
  selectionMode?: 'erase' | 'mirror'
  selectionFilter?: Mark
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
  selectionMode,
  selectionFilter,
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
        const isSelectable =
          selectionMode != null && mark === selectionFilter
        const isDimmed =
          selectionMode != null && mark !== selectionFilter
        const isEmpty = mark === null

        const canClick =
          !disabled &&
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
              /* selection mode dimming */
              isDimmed && 'opacity-30',
              /* pulsing ring for selectable targets */
              isSelectable && 'animate-pulse ring-2 ring-[#ff2d7a] ring-offset-1 ring-offset-[#0a0a0f]',
              /* cursor */
              !canClick && 'cursor-not-allowed',
            )}
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
          </button>
        )
      })}
    </div>
  )
}
