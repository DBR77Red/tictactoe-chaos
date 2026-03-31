'use client'

import { cn } from '@/lib/utils'
import { Board } from './Board'
import type { Mark, ErasedCell, MultiBoard as MultiBoardType } from '@/lib/types'

type Props = {
  boards: { cells: Mark[] }[]
  layout: MultiBoardType['layout']
  onCellClick: (boardIndex: number, cellIndex: number) => void
  frozenCells?: number[]
  erasedCell?: ErasedCell | null
  turnNumber?: number
  selectionMode?: 'erase' | 'mirror'
  selectionFilter?: Mark
  disabled?: boolean
}

export function MultiBoard({
  boards,
  layout,
  onCellClick,
  frozenCells = [],
  erasedCell = null,
  turnNumber = 0,
  selectionMode,
  selectionFilter,
  disabled,
}: Props) {
  const isHorizontal = layout === 'right' || layout === 'left'

  // For 'left' and 'above', boards[1] renders before boards[0] visually
  const renderOrder = (layout === 'left' || layout === 'above')
    ? [1, 0]
    : [0, 1]

  const getErasedCells = (boardIndex: number): number[] => {
    if (!erasedCell) return []
    if (erasedCell.expiresAfterTurn <= turnNumber) return []
    if (erasedCell.boardIndex !== boardIndex) return []
    return [erasedCell.cellIndex]
  }

  const separator = isHorizontal ? (
    <div className="w-px h-24 mx-4 bg-[#7b2fff] [box-shadow:0_0_8px_#7b2fff]" />
  ) : (
    <div className="h-px w-24 my-4 bg-[#7b2fff] [box-shadow:0_0_8px_#7b2fff]" />
  )

  return (
    <div className={cn(
      'flex items-center gap-0',
      isHorizontal ? 'flex-row' : 'flex-col'
    )}>
      {renderOrder.map((boardIndex, renderIdx) => (
        <div
          key={boardIndex}
          className={cn(
            'flex items-center',
            isHorizontal ? 'flex-row' : 'flex-col'
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#7b2fff] [filter:drop-shadow(0_0_6px_#7b2fff)]">
              Board {boardIndex + 1}
            </span>
            <Board
              cells={boards[boardIndex].cells}
              onCellClick={(cellIndex) => onCellClick(boardIndex, cellIndex)}
              winningLine={null}
              frozenCells={frozenCells}
              erasedCells={getErasedCells(boardIndex)}
              selectionMode={selectionMode}
              selectionFilter={selectionFilter}
              disabled={disabled}
            />
          </div>

          {renderIdx < renderOrder.length - 1 && separator}
        </div>
      ))}
    </div>
  )
}
