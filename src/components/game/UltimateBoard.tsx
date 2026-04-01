'use client'

import { cn } from '@/lib/utils'
import { Board } from './Board'
import type { Mark, ShieldedCell, VoidedCell, UltimateBoard as UltimateBoardType } from '@/lib/types'

type Props = {
  board: UltimateBoardType
  onCellClick: (boardIndex: number, cellIndex: number) => void
  myMark: Mark
  frozenCells?: number[]
  shieldedCell?: ShieldedCell | null
  voidedCells?: VoidedCell[]
  turnNumber?: number
  selectionMode?: 'erase' | 'mirror' | 'shield' | 'void' | 'clone_src' | 'clone_dst'
  selectionFilter?: Mark
  cloneSelectableCells?: { boardIndex: number; cells: number[] }
  disabled?: boolean
}

const META_MARK_STYLES: Record<NonNullable<Mark>, string> = {
  X: 'text-[#FF2D6B] [filter:drop-shadow(0_0_16px_#FF2D6B)_drop-shadow(0_0_40px_rgba(255,45,107,.5))]',
  O: 'text-[#00E5FF] [filter:drop-shadow(0_0_16px_#00E5FF)_drop-shadow(0_0_40px_rgba(0,229,255,.5))]',
}

export function UltimateBoard({
  board,
  onCellClick,
  myMark,
  frozenCells = [],
  shieldedCell = null,
  voidedCells = [],
  turnNumber = 0,
  selectionMode,
  selectionFilter,
  cloneSelectableCells,
  disabled,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1 bg-[#080818] border-2 border-[rgba(155,92,246,0.5)] rounded-xl [box-shadow:0_0_4px_#9B5CF6,0_0_14px_#9B5CF6,0_0_40px_rgba(155,92,246,.5)]">
      {board.boards.map((mini, boardIndex) => {
        const metaValue = board.metaBoard[boardIndex]
        const isForced = board.forcedBoard === boardIndex
        const isWon = metaValue !== null && metaValue !== 'draw'
        const isDraw = metaValue === 'draw'
        const isFree = board.forcedBoard === null
        const isActive = isForced || isFree
        const forcedColor =
          myMark === 'X' ? '#ff2d7a' : '#00d4ff'

        return (
          <div
            key={boardIndex}
            className={cn(
              'relative transition-all duration-200',
              !isActive && !isWon && !isDraw && 'opacity-50',
              isForced &&
                `[box-shadow:0_0_16px_${forcedColor},0_0_4px_${forcedColor}]`,
            )}
            style={
              isForced
                ? { boxShadow: `0 0 16px ${forcedColor}, 0 0 4px ${forcedColor}` }
                : undefined
            }
          >
            <Board
              compact
              cells={mini.cells}
              onCellClick={(cellIndex) => onCellClick(boardIndex, cellIndex)}
              winningLine={null}
              frozenCells={frozenCells}
              shieldedCells={
                shieldedCell && shieldedCell.boardIndex === boardIndex && shieldedCell.expiresAfterTurn > turnNumber
                  ? [shieldedCell.cellIndex]
                  : []
              }
              voidedCells={voidedCells.filter(v => v.boardIndex === boardIndex).map(v => v.cellIndex)}
              selectionMode={selectionMode}
              selectionFilter={selectionFilter}
              selectableCells={cloneSelectableCells?.boardIndex === boardIndex ? cloneSelectableCells.cells : undefined}
              disabled={disabled || isWon || isDraw || (!isActive && !selectionMode)}
            />

            {/* Won overlay */}
            {isWon && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/80 pointer-events-none">
                <span
                  className={cn(
                    'text-[clamp(1.5rem,7vw,3.75rem)] font-black font-mono leading-none',
                    META_MARK_STYLES[metaValue as 'X' | 'O'],
                  )}
                >
                  {metaValue}
                </span>
              </div>
            )}

            {/* Draw overlay */}
            {isDraw && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/80 pointer-events-none">
                <span className="text-4xl font-black text-[#555] font-mono">—</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
