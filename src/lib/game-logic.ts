import type { Mark, ClassicBoard, MultiBoard, UltimateBoard, Board, FrozenState, ErasedCell } from './types'

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
]

export function checkWinner(cells: Mark[]): Mark {
  for (const [a, b, c] of WINNING_LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a]
    }
  }
  return null
}

export function getWinningLine(cells: Mark[]): number[] | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return line
    }
  }
  return null
}

export function isBoardFull(cells: Mark[]): boolean {
  return cells.every(c => c !== null)
}

export function checkClassicResult(board: ClassicBoard): 'X' | 'O' | 'draw' | null {
  const winner = checkWinner(board.cells)
  if (winner) return winner
  if (isBoardFull(board.cells)) return 'draw'
  return null
}

// Cross-board winning lines for a multi-board layout.
// Each line is three [boardIndex, cellIndex] pairs.
// The seam is the boundary between the two boards.
//
// 'right': boards[1] is to the right of boards[0]
//   Row-seam crossing lines (2 per row × 3 rows = 6):
//   e.g. row 0: [B0:1,B0:2,B1:0] and [B0:2,B1:0,B1:1]
//
// 'left': boards[1] is to the left of boards[0] (symmetric)
//   e.g. row 0: [B1:1,B1:2,B0:0] and [B1:2,B0:0,B0:1]
//
// 'below': boards[1] is below boards[0]
//   Col-seam crossing lines (2 per col × 3 cols = 6):
//   e.g. col 0: [B0:3,B0:6,B1:0] and [B0:6,B1:0,B1:3]
//
// 'above': boards[1] is above boards[0] (symmetric)
//   e.g. col 0: [B1:3,B1:6,B0:0] and [B1:6,B0:0,B0:3]
type CrossCell = [number, number] // [boardIndex, cellIndex]
type CrossLine = [CrossCell, CrossCell, CrossCell]

function getCrossBoardLines(layout: MultiBoard['layout']): CrossLine[] {
  const lines: CrossLine[] = []

  if (layout === 'right') {
    for (const rowStart of [0, 3, 6]) {
      lines.push([[0, rowStart + 1], [0, rowStart + 2], [1, rowStart + 0]])
      lines.push([[0, rowStart + 2], [1, rowStart + 0], [1, rowStart + 1]])
    }
  } else if (layout === 'left') {
    for (const rowStart of [0, 3, 6]) {
      lines.push([[1, rowStart + 1], [1, rowStart + 2], [0, rowStart + 0]])
      lines.push([[1, rowStart + 2], [0, rowStart + 0], [0, rowStart + 1]])
    }
  } else if (layout === 'below') {
    for (const col of [0, 1, 2]) {
      lines.push([[0, 3 + col], [0, 6 + col], [1, 0 + col]])
      lines.push([[0, 6 + col], [1, 0 + col], [1, 3 + col]])
    }
  } else { // 'above'
    for (const col of [0, 1, 2]) {
      lines.push([[1, 3 + col], [1, 6 + col], [0, 0 + col]])
      lines.push([[1, 6 + col], [0, 0 + col], [0, 3 + col]])
    }
  }

  return lines
}

export function checkMultiResult(board: MultiBoard): 'X' | 'O' | 'draw' | null {
  // Check each board independently
  for (const b of board.boards) {
    const winner = checkWinner(b.cells)
    if (winner) return winner
  }

  // Check cross-board seam lines
  for (const [[b0, c0], [b1, c1], [b2, c2]] of getCrossBoardLines(board.layout)) {
    const va = board.boards[b0]?.cells[c0]
    const vb = board.boards[b1]?.cells[c1]
    const vc = board.boards[b2]?.cells[c2]
    if (va && va === vb && va === vc) return va
  }

  if (board.boards.every(b => isBoardFull(b.cells))) return 'draw'
  return null
}

export function checkUltimateResult(board: UltimateBoard): 'X' | 'O' | 'draw' | null {
  const metaCells = board.metaBoard.map(v => (v === 'draw' ? null : v))
  const winner = checkWinner(metaCells)
  if (winner) return winner
  if (board.metaBoard.every(v => v !== null)) return 'draw'
  return null
}

export function checkResult(board: Board): 'X' | 'O' | 'draw' | null {
  if (board.mode === 'classic') return checkClassicResult(board)
  if (board.mode === 'multi') return checkMultiResult(board)
  return checkUltimateResult(board as UltimateBoard)
}

export function getNextForcedBoard(board: UltimateBoard, cellIndex: number): number | null {
  const meta = board.metaBoard[cellIndex]
  if (meta !== null) return null  // already claimed or drawn
  const target = board.boards[cellIndex]
  if (isBoardFull(target.cells)) return null
  return cellIndex
}

export function applyClassicMove(board: ClassicBoard, cellIndex: number, mark: Mark): ClassicBoard {
  const cells = [...board.cells]
  cells[cellIndex] = mark
  return { ...board, cells }
}

export function applyMultiMove(board: MultiBoard, boardIndex: number, cellIndex: number, mark: Mark): MultiBoard {
  const boards = board.boards.map((b, i) =>
    i === boardIndex
      ? { cells: [...b.cells.slice(0, cellIndex), mark, ...b.cells.slice(cellIndex + 1)] }
      : b
  )
  return { ...board, boards }
}

export function applyUltimateMove(board: UltimateBoard, boardIndex: number, cellIndex: number, mark: Mark): UltimateBoard {
  const boards = board.boards.map((b, i) => {
    if (i !== boardIndex) return b
    const cells = [...b.cells]
    cells[cellIndex] = mark
    return { cells }
  })

  const updatedMini = boards[boardIndex].cells
  const miniWinner = checkWinner(updatedMini)
  const miniFull = isBoardFull(updatedMini)

  const metaBoard = [...board.metaBoard]
  if (miniWinner) metaBoard[boardIndex] = miniWinner
  else if (miniFull) metaBoard[boardIndex] = 'draw'

  const updatedBoard: UltimateBoard = { ...board, boards, metaBoard, forcedBoard: null }
  updatedBoard.forcedBoard = getNextForcedBoard(updatedBoard, cellIndex)

  return updatedBoard
}

export function isCellFrozen(frozen: FrozenState, cellIndex: number, turnNumber: number): boolean {
  if (!('type' in frozen)) return false
  if (frozen.expiresAfterTurn <= turnNumber) return false
  const row = Math.floor(cellIndex / 3)
  const col = cellIndex % 3
  if (frozen.type === 'row' && row === frozen.index) return true
  if (frozen.type === 'col' && col === frozen.index) return true
  return false
}

export function isCellErased(erasedCell: ErasedCell | null, boardIndex: number, cellIndex: number, turnNumber: number): boolean {
  if (!erasedCell) return false
  if (erasedCell.expiresAfterTurn <= turnNumber) return false
  return erasedCell.boardIndex === boardIndex && erasedCell.cellIndex === cellIndex
}

export function classicToUltimate(board: ClassicBoard): UltimateBoard {
  const emptyBoard = () => ({ cells: Array(9).fill(null) as Mark[] })
  const boards = Array.from({ length: 9 }, () => emptyBoard())
  boards[0] = { cells: [...board.cells] }
  return {
    mode: 'ultimate',
    metaBoard: Array(9).fill(null) as (Mark | 'draw')[],
    boards,
    forcedBoard: null
  }
}

export function classicToMulti(board: ClassicBoard, layout: MultiBoard['layout']): MultiBoard {
  return {
    mode: 'multi',
    layout,
    boards: [
      { cells: [...board.cells] },
      { cells: Array(9).fill(null) as Mark[] }
    ]
  }
}
