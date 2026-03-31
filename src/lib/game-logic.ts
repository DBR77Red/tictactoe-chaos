import type { Mark, ClassicBoard, MultiBoard, UltimateBoard, Board, FrozenState } from './types'

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

export function checkMultiResult(board: MultiBoard): 'X' | 'O' | 'draw' | null {
  for (const b of board.boards) {
    const winner = checkWinner(b.cells)
    if (winner) return winner
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

export function classicToMulti(board: ClassicBoard): MultiBoard {
  return {
    mode: 'multi',
    boards: [
      { cells: [...board.cells] },
      { cells: Array(9).fill(null) as Mark[] }
    ]
  }
}
