'use client'

import { cn } from '@/lib/utils'
import { Board } from './Board'
import type { Mark, ErasedCell, ShieldedCell, VoidedCell, MultiBoard as MultiBoardType } from '@/lib/types'

type Props = {
  boards: { cells: Mark[] }[]
  layout: MultiBoardType['layout']
  onCellClick: (boardIndex: number, cellIndex: number) => void
  frozenCells?: number[]
  erasedCell?: ErasedCell | null
  shieldedCell?: ShieldedCell | null
  voidedCells?: VoidedCell[]
  turnNumber?: number
  selectionMode?: 'erase' | 'mirror' | 'shield' | 'void' | 'clone_src' | 'clone_dst'
  selectionFilter?: Mark
  cloneSelectableCells?: { boardIndex: number; cells: number[] }
  disabled?: boolean
}

export function MultiBoard({
  boards,
  layout,
  onCellClick,
  frozenCells = [],
  erasedCell = null,
  shieldedCell = null,
  voidedCells = [],
  turnNumber = 0,
  selectionMode,
  selectionFilter,
  cloneSelectableCells,
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

  const getShieldedCells = (boardIndex: number): number[] => {
    if (!shieldedCell) return []
    if (shieldedCell.expiresAfterTurn <= turnNumber) return []
    if (shieldedCell.boardIndex !== boardIndex) return []
    return [shieldedCell.cellIndex]
  }

  const getVoidedCells = (boardIndex: number): number[] =>
    voidedCells.filter(v => v.boardIndex === boardIndex).map(v => v.cellIndex)

  // Always vertical on mobile; respect layout direction on sm+
  const separator = isHorizontal ? (
    <div className="h-px w-24 my-4 sm:h-24 sm:w-px sm:my-0 sm:mx-4 bg-gradient-to-r sm:bg-gradient-to-b from-transparent via-[#9B5CF6] to-transparent [box-shadow:0_0_8px_rgba(155,92,246,.5)]" />
  ) : (
    <div className="h-px w-24 my-4 bg-gradient-to-r from-transparent via-[#9B5CF6] to-transparent [box-shadow:0_0_8px_rgba(155,92,246,.5)]" />
  )

  return (
    <div className={cn(
      'flex items-center gap-0',
      isHorizontal ? 'flex-col sm:flex-row' : 'flex-col'
    )}>
      {renderOrder.map((boardIndex, renderIdx) => (
        <div
          key={boardIndex}
          className={cn(
            'flex items-center',
            isHorizontal ? 'flex-col sm:flex-row' : 'flex-col'
          )}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#5E6390]">
              Board {boardIndex + 1}
            </span>
            <Board
              cells={boards[boardIndex].cells}
              onCellClick={(cellIndex) => onCellClick(boardIndex, cellIndex)}
              winningLine={null}
              frozenCells={frozenCells}
              erasedCells={getErasedCells(boardIndex)}
              shieldedCells={getShieldedCells(boardIndex)}
              voidedCells={getVoidedCells(boardIndex)}
              selectionMode={selectionMode}
              selectionFilter={selectionFilter}
              selectableCells={cloneSelectableCells?.boardIndex === boardIndex ? cloneSelectableCells.cells : undefined}
              disabled={disabled}
            />
          </div>

          {renderIdx < renderOrder.length - 1 && separator}
        </div>
      ))}
    </div>
  )
}
