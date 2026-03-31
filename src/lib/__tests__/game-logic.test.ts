import { describe, it, expect } from 'vitest'
import {
  checkWinner,
  getWinningLine,
  isBoardFull,
  checkClassicResult,
  checkMultiResult,
  checkUltimateResult,
  checkResult,
  getNextForcedBoard,
  applyClassicMove,
  applyMultiMove,
  applyUltimateMove,
  isCellFrozen,
  classicToUltimate,
  classicToMulti,
} from '../game-logic'
import type { ClassicBoard, MultiBoard, UltimateBoard, Mark } from '../types'

// Helpers
const empty9 = (): Mark[] => Array(9).fill(null)
const classic = (cells: Mark[]): ClassicBoard => ({ mode: 'classic', cells })

describe('checkWinner', () => {
  it('detects row wins', () => {
    expect(checkWinner(['X','X','X', null,null,null, null,null,null])).toBe('X')
    expect(checkWinner([null,null,null, 'O','O','O', null,null,null])).toBe('O')
    expect(checkWinner([null,null,null, null,null,null, 'X','X','X'])).toBe('X')
  })

  it('detects column wins', () => {
    expect(checkWinner(['X',null,null, 'X',null,null, 'X',null,null])).toBe('X')
    expect(checkWinner([null,'O',null, null,'O',null, null,'O',null])).toBe('O')
    expect(checkWinner([null,null,'X', null,null,'X', null,null,'X'])).toBe('X')
  })

  it('detects diagonal wins', () => {
    expect(checkWinner(['X',null,null, null,'X',null, null,null,'X'])).toBe('X')
    expect(checkWinner([null,null,'O', null,'O',null, 'O',null,null])).toBe('O')
  })

  it('returns null when no winner', () => {
    expect(checkWinner(empty9())).toBeNull()
    expect(checkWinner(['X','O','X', 'O','X','O', 'O','X','O'])).toBeNull()
  })

  it('does not count empty cells as wins', () => {
    expect(checkWinner([null, null, null, null, null, null, null, null, null])).toBeNull()
  })
})

describe('getWinningLine', () => {
  it('returns the winning line indices', () => {
    expect(getWinningLine(['X','X','X', null,null,null, null,null,null])).toEqual([0,1,2])
    expect(getWinningLine(['X',null,null, 'X',null,null, 'X',null,null])).toEqual([0,3,6])
  })

  it('returns null when no winner', () => {
    expect(getWinningLine(empty9())).toBeNull()
  })
})

describe('isBoardFull', () => {
  it('returns true when all cells are filled', () => {
    expect(isBoardFull(['X','O','X','O','X','O','O','X','O'])).toBe(true)
  })

  it('returns false when any cell is null', () => {
    expect(isBoardFull(['X','O','X','O',null,'O','O','X','O'])).toBe(false)
    expect(isBoardFull(empty9())).toBe(false)
  })
})

describe('checkClassicResult', () => {
  it('returns winner when there is one', () => {
    expect(checkClassicResult(classic(['X','X','X',null,null,null,null,null,null]))).toBe('X')
  })

  it('returns draw when board is full and no winner', () => {
    expect(checkClassicResult(classic(['X','O','X','O','X','O','O','X','O']))).toBe('draw')
  })

  it('returns null when game is still ongoing', () => {
    expect(checkClassicResult(classic(empty9()))).toBeNull()
    expect(checkClassicResult(classic(['X',null,null,null,null,null,null,null,null]))).toBeNull()
  })
})

describe('checkMultiResult', () => {
  it('returns winner if any single board is won', () => {
    const board: MultiBoard = {
      mode: 'multi',
      boards: [
        { cells: ['X','X','X',null,null,null,null,null,null] },
        { cells: empty9() },
      ]
    }
    expect(checkMultiResult(board)).toBe('X')
  })

  it('returns draw when all boards are full and no winner', () => {
    const full: Mark[] = ['X','O','X','O','X','O','O','X','O']
    const board: MultiBoard = {
      mode: 'multi',
      boards: [{ cells: [...full] }, { cells: [...full] }]
    }
    expect(checkMultiResult(board)).toBe('draw')
  })

  it('returns null when game is ongoing', () => {
    const board: MultiBoard = {
      mode: 'multi',
      boards: [{ cells: empty9() }, { cells: empty9() }]
    }
    expect(checkMultiResult(board)).toBeNull()
  })
})

describe('checkUltimateResult', () => {
  const emptyMeta = (): (Mark | 'draw')[] => Array(9).fill(null)
  const emptyBoards = () => Array.from({ length: 9 }, () => ({ cells: empty9() }))

  it('returns winner when meta-board has 3 in a row', () => {
    const metaBoard: (Mark | 'draw')[] = ['X','X','X',null,null,null,null,null,null]
    const board: UltimateBoard = { mode: 'ultimate', metaBoard, boards: emptyBoards(), forcedBoard: null }
    expect(checkUltimateResult(board)).toBe('X')
  })

  it('treats draw mini-boards as null for meta win check', () => {
    const metaBoard: (Mark | 'draw')[] = ['draw','draw','draw',null,null,null,null,null,null]
    const board: UltimateBoard = { mode: 'ultimate', metaBoard, boards: emptyBoards(), forcedBoard: null }
    expect(checkUltimateResult(board)).toBeNull() // draws don't form a winning line
  })

  it('returns draw when all meta cells are claimed and no winner', () => {
    const metaBoard: (Mark | 'draw')[] = ['X','O','X','O','X','O','draw','X','O']
    const board: UltimateBoard = { mode: 'ultimate', metaBoard, boards: emptyBoards(), forcedBoard: null }
    expect(checkUltimateResult(board)).toBe('draw')
  })

  it('returns null when game is ongoing', () => {
    const board: UltimateBoard = { mode: 'ultimate', metaBoard: emptyMeta(), boards: emptyBoards(), forcedBoard: null }
    expect(checkUltimateResult(board)).toBeNull()
  })
})

describe('checkResult', () => {
  it('dispatches correctly by mode', () => {
    expect(checkResult(classic(['X','X','X',null,null,null,null,null,null]))).toBe('X')
    expect(checkResult({ mode: 'multi', boards: [{ cells: empty9() }] })).toBeNull()
  })
})

describe('getNextForcedBoard', () => {
  const makeUltimate = (overrides: Partial<UltimateBoard> = {}): UltimateBoard => ({
    mode: 'ultimate',
    metaBoard: Array(9).fill(null),
    boards: Array.from({ length: 9 }, () => ({ cells: empty9() })),
    forcedBoard: null,
    ...overrides,
  })

  it('returns the cellIndex as forced board when it is open', () => {
    const board = makeUltimate()
    expect(getNextForcedBoard(board, 4)).toBe(4)
  })

  it('returns null when target mini-board is already won', () => {
    const metaBoard: (Mark | 'draw')[] = Array(9).fill(null)
    metaBoard[4] = 'X'
    const board = makeUltimate({ metaBoard })
    expect(getNextForcedBoard(board, 4)).toBeNull()
  })

  it('returns null when target mini-board is full', () => {
    const boards = Array.from({ length: 9 }, () => ({ cells: empty9() }))
    boards[4] = { cells: ['X','O','X','O','X','O','O','X','O'] }
    const board = makeUltimate({ boards })
    expect(getNextForcedBoard(board, 4)).toBeNull()
  })
})

describe('applyClassicMove', () => {
  it('places a mark without mutating the original', () => {
    const original = classic(empty9())
    const updated = applyClassicMove(original, 4, 'X')
    expect(updated.cells[4]).toBe('X')
    expect(original.cells[4]).toBeNull() // immutable
  })
})

describe('applyMultiMove', () => {
  it('places a mark on the correct board without mutating others', () => {
    const board: MultiBoard = {
      mode: 'multi',
      boards: [{ cells: empty9() }, { cells: empty9() }]
    }
    const updated = applyMultiMove(board, 1, 3, 'O')
    expect(updated.boards[1].cells[3]).toBe('O')
    expect(updated.boards[0].cells[3]).toBeNull()
    expect(board.boards[1].cells[3]).toBeNull() // immutable
  })
})

describe('applyUltimateMove', () => {
  const makeUltimate = (): UltimateBoard => ({
    mode: 'ultimate',
    metaBoard: Array(9).fill(null),
    boards: Array.from({ length: 9 }, () => ({ cells: empty9() })),
    forcedBoard: null,
  })

  it('places a mark and sets forcedBoard', () => {
    const board = makeUltimate()
    const updated = applyUltimateMove(board, 0, 4, 'X')
    expect(updated.boards[0].cells[4]).toBe('X')
    expect(updated.forcedBoard).toBe(4) // cell 4 → play in mini-board 4
  })

  it('claims the meta-board when a mini-board is won', () => {
    const board = makeUltimate()
    // Set up mini-board 0 so next move wins it
    board.boards[0].cells = ['X','X',null,null,null,null,null,null,null]
    const updated = applyUltimateMove(board, 0, 2, 'X') // completes row 0
    expect(updated.metaBoard[0]).toBe('X')
  })

  it('marks mini-board as draw when full and no winner', () => {
    const board = makeUltimate()
    board.boards[0].cells = ['X','O','X','O','X','O','O','X',null]
    const updated = applyUltimateMove(board, 0, 8, 'O') // fills the board
    expect(updated.metaBoard[0]).toBe('draw')
  })
})

describe('isCellFrozen', () => {
  it('returns true for a frozen row', () => {
    const frozen = { type: 'row' as const, index: 1, expiresAfterTurn: 5 }
    expect(isCellFrozen(frozen, 3, 3)).toBe(true)  // row 1 = cells 3,4,5
    expect(isCellFrozen(frozen, 4, 3)).toBe(true)
    expect(isCellFrozen(frozen, 5, 3)).toBe(true)
    expect(isCellFrozen(frozen, 0, 3)).toBe(false) // row 0
  })

  it('returns true for a frozen column', () => {
    const frozen = { type: 'col' as const, index: 2, expiresAfterTurn: 5 }
    expect(isCellFrozen(frozen, 2, 3)).toBe(true)  // col 2 = cells 2,5,8
    expect(isCellFrozen(frozen, 5, 3)).toBe(true)
    expect(isCellFrozen(frozen, 8, 3)).toBe(true)
    expect(isCellFrozen(frozen, 0, 3)).toBe(false) // col 0
  })

  it('returns false when freeze has expired', () => {
    const frozen = { type: 'row' as const, index: 0, expiresAfterTurn: 3 }
    expect(isCellFrozen(frozen, 0, 3)).toBe(false) // turnNumber === expiresAfterTurn
    expect(isCellFrozen(frozen, 0, 4)).toBe(false) // past expiry
  })

  it('returns false when no freeze is active', () => {
    expect(isCellFrozen({}, 4, 1)).toBe(false)
  })
})

describe('classicToUltimate', () => {
  it('preserves existing marks in mini-board 0', () => {
    const cells: Mark[] = ['X', null, 'O', null, null, null, null, null, null]
    const ultimate = classicToUltimate({ mode: 'classic', cells })
    expect(ultimate.boards[0].cells).toEqual(cells)
    expect(ultimate.boards[1].cells).toEqual(empty9())
  })

  it('creates 9 mini-boards', () => {
    const ultimate = classicToUltimate(classic(empty9()))
    expect(ultimate.boards).toHaveLength(9)
  })

  it('initializes metaBoard as all null', () => {
    const ultimate = classicToUltimate(classic(empty9()))
    expect(ultimate.metaBoard.every(v => v === null)).toBe(true)
  })
})

describe('classicToMulti', () => {
  it('preserves existing board as boards[0]', () => {
    const cells: Mark[] = ['X', null, null, null, null, null, null, null, null]
    const multi = classicToMulti({ mode: 'classic', cells })
    expect(multi.boards[0].cells).toEqual(cells)
  })

  it('adds one empty board as boards[1]', () => {
    const multi = classicToMulti(classic(empty9()))
    expect(multi.boards).toHaveLength(2)
    expect(multi.boards[1].cells).toEqual(empty9())
  })
})
