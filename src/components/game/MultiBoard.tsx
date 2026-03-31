'use client'

import { cn } from '@/lib/utils'
import { Board } from './Board'
import type { Mark } from '@/lib/types'

type Props = {
  boards: { cells: Mark[] }[]
  onCellClick: (boardIndex: number, cellIndex: number) => void
  frozenCells?: number[]
  selectionMode?: 'erase' | 'mirror'
  selectionFilter?: Mark
  disabled?: boolean
}

export function MultiBoard({
  boards,
  onCellClick,
  frozenCells = [],
  selectionMode,
  selectionFilter,
  disabled,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-0">
      {boards.map((board, boardIndex) => (
        <div key={boardIndex} className="flex flex-col sm:flex-row items-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7b2fff] [filter:drop-shadow(0_0_6px_#7b2fff)]">
              Board {boardIndex + 1}
            </span>
            <Board
              cells={board.cells}
              onCellClick={(cellIndex) => onCellClick(boardIndex, cellIndex)}
              winningLine={null}
              frozenCells={frozenCells}
              selectionMode={selectionMode}
              selectionFilter={selectionFilter}
              disabled={disabled}
            />
          </div>

          {/* Neon separator between boards */}
          {boardIndex < boards.length - 1 && (
            <>
              {/* vertical separator on sm+ */}
              <div className="hidden sm:block w-px h-24 mx-4 bg-[#7b2fff] [box-shadow:0_0_8px_#7b2fff]" />
              {/* horizontal separator on mobile */}
              <div className="sm:hidden h-px w-24 my-4 bg-[#7b2fff] [box-shadow:0_0_8px_#7b2fff]" />
            </>
          )}
        </div>
      ))}
    </div>
  )
}
