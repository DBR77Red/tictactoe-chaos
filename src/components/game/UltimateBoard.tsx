'use client'

import { cn } from '@/lib/utils'
import { Board } from './Board'
import type { Mark, UltimateBoard as UltimateBoardType } from '@/lib/types'

type Props = {
  board: UltimateBoardType
  onCellClick: (boardIndex: number, cellIndex: number) => void
  myMark: Mark
  frozenCells?: number[]
  selectionMode?: 'erase' | 'mirror'
  disabled?: boolean
}

const META_MARK_STYLES: Record<NonNullable<Mark>, string> = {
  X: 'text-[#ff2d7a] [filter:drop-shadow(0_0_16px_#ff2d7a)_drop-shadow(0_0_32px_#ff2d7a80)]',
  O: 'text-[#00d4ff] [filter:drop-shadow(0_0_16px_#00d4ff)_drop-shadow(0_0_32px_#00d4ff80)]',
}

export function UltimateBoard({
  board,
  onCellClick,
  myMark,
  frozenCells = [],
  selectionMode,
  disabled,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-1 p-1 bg-[#0a0a0f] border-2 border-[#c026d3] [box-shadow:0_0_20px_#c026d360]">
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
              cells={mini.cells}
              onCellClick={(cellIndex) => onCellClick(boardIndex, cellIndex)}
              winningLine={null}
              frozenCells={frozenCells}
              selectionMode={selectionMode}
              disabled={disabled || isWon || isDraw || (!isActive && !selectionMode)}
            />

            {/* Won overlay */}
            {isWon && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/80 pointer-events-none">
                <span
                  className={cn(
                    'text-6xl font-black font-mono leading-none',
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
