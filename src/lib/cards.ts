import type { CardId, GameState, Mark, MultiBoard } from './types'
import { classicToUltimate, classicToMulti, checkWinner, isCellShielded, isCellVoided } from './game-logic'

export const ALL_CARD_IDS: CardId[] = [
  'spawn_board', 'erase', 'nine_grid',
  'mirror_strike', 'freeze', 'double_down', 'time_warp',
  'shield', 'void', 'clone',
]

// Weighted deck: rare cards appear once, uncommon twice, common three times.
// Total: 5×1 + 3×2 + 2×3 = 17 cards.
export const CARD_DECK: CardId[] = [
  // Rare (×1)
  'mirror_strike', 'double_down', 'clone', 'spawn_board', 'nine_grid',
  // Uncommon (×2)
  'void', 'void',
  'erase', 'erase',
  'shield', 'shield',
  // Common (×3)
  'time_warp', 'time_warp', 'time_warp',
  'freeze', 'freeze', 'freeze',
]

export function dealCards(): { cardsX: CardId[], cardsO: CardId[] } {
  const shuffled = [...CARD_DECK].sort(() => Math.random() - 0.5)
  return {
    cardsX: shuffled.slice(0, 3) as CardId[],
    cardsO: shuffled.slice(3, 6) as CardId[]
  }
}

export function createInitialGameState(): GameState {
  const { cardsX, cardsO } = dealCards()
  return {
    board: { mode: 'classic', cells: Array(9).fill(null) as Mark[] },
    turn: 'X',
    cardsX,
    cardsO,
    frozen: {},
    erasedCell: null,
    shieldedCell: null,
    voidedCells: [],
    spawnBoardUsedX: false,
    spawnBoardUsedO: false,
    winner: null,
    turnNumber: 1,
    boardHistory: [],
  }
}

export function removeCard(hand: CardId[], cardId: CardId): CardId[] {
  const idx = hand.indexOf(cardId)
  if (idx === -1) return hand
  return [...hand.slice(0, idx), ...hand.slice(idx + 1)]
}

function spendCard(state: GameState, cardId: CardId): GameState {
  return {
    ...state,
    cardsX: state.turn === 'X' ? removeCard(state.cardsX, cardId) : state.cardsX,
    cardsO: state.turn === 'O' ? removeCard(state.cardsO, cardId) : state.cardsO,
  }
}

// Card 1 — Spawn Board: transitions classic → multi with a chosen layout.
// Does NOT advance the turn — the player gets their move immediately after.
export function applySpawnBoard(state: GameState, layout: MultiBoard['layout']): GameState {
  if (state.board.mode !== 'classic') return state
  if (state.turn === 'X' && state.spawnBoardUsedX) return state
  if (state.turn === 'O' && state.spawnBoardUsedO) return state

  return {
    ...spendCard(state, 'spawn_board'),
    board: classicToMulti(state.board, layout),
    spawnBoardUsedX: state.turn === 'X' ? true : state.spawnBoardUsedX,
    spawnBoardUsedO: state.turn === 'O' ? true : state.spawnBoardUsedO,
  }
}

// Card 2 — Erase: removes one opponent mark and blocks that cell for 1 full round.
export function applyErase(state: GameState, boardIndex: number, cellIndex: number): GameState {
  if (isCellShielded(state.shieldedCell ?? null, boardIndex, cellIndex, state.turnNumber)) return state

  const opponent: Mark = state.turn === 'X' ? 'O' : 'X'
  const board = state.board

  let newState: GameState = state

  if (board.mode === 'classic') {
    if (board.cells[cellIndex] !== opponent) return state
    const cells = [...board.cells]
    cells[cellIndex] = null
    newState = { ...spendCard(state, 'erase'), board: { ...board, cells } }
  } else if (board.mode === 'multi') {
    if (board.boards[boardIndex]?.cells[cellIndex] !== opponent) return state
    const boards = board.boards.map((b, i) => {
      if (i !== boardIndex) return b
      const cells = [...b.cells]
      cells[cellIndex] = null
      return { cells }
    })
    newState = { ...spendCard(state, 'erase'), board: { ...board, boards } }
  } else if (board.mode === 'ultimate') {
    if (board.boards[boardIndex]?.cells[cellIndex] !== opponent) return state
    const boards = board.boards.map((b, i) => {
      if (i !== boardIndex) return b
      const cells = [...b.cells]
      cells[cellIndex] = null
      return { cells }
    })
    newState = { ...spendCard(state, 'erase'), board: { ...board, boards } }
  }

  if (newState === state) return state

  // Block the erased cell for 1 full round (opponent's next turn + current player's next turn)
  return {
    ...newState,
    erasedCell: {
      boardIndex,
      cellIndex,
      expiresAfterTurn: state.turnNumber + 2,
    },
  }
}

// Card 3 — 9 Grid: transitions to ultimate mode
export function applyNineGrid(state: GameState): GameState {
  if (state.board.mode === 'ultimate') return state
  const classicBoard = state.board.mode === 'classic'
    ? state.board
    : { mode: 'classic' as const, cells: state.board.boards[0].cells }

  return {
    ...spendCard(state, 'nine_grid'),
    board: classicToUltimate(classicBoard),
  }
}

// Card 4 — Mirror Strike: flips one opponent mark to current player's mark
export function applyMirrorStrike(state: GameState, boardIndex: number, cellIndex: number): GameState {
  if (isCellShielded(state.shieldedCell ?? null, boardIndex, cellIndex, state.turnNumber)) return state

  const opponent: Mark = state.turn === 'X' ? 'O' : 'X'
  const myMark: Mark = state.turn
  const board = state.board

  if (board.mode === 'classic') {
    if (board.cells[cellIndex] !== opponent) return state
    const cells = [...board.cells]
    cells[cellIndex] = myMark
    const newState = { ...spendCard(state, 'mirror_strike'), board: { ...board, cells } }
    const winner = checkWinner(cells)
    return winner ? { ...newState, winner } : newState
  }

  if (board.mode === 'multi') {
    if (board.boards[boardIndex]?.cells[cellIndex] !== opponent) return state
    const boards = board.boards.map((b, i) => {
      if (i !== boardIndex) return b
      const cells = [...b.cells]
      cells[cellIndex] = myMark
      return { cells }
    })
    const newState = { ...spendCard(state, 'mirror_strike'), board: { ...board, boards } }
    const winner = checkWinner(boards[boardIndex].cells)
    return winner ? { ...newState, winner } : newState
  }

  if (board.mode === 'ultimate') {
    if (board.boards[boardIndex]?.cells[cellIndex] !== opponent) return state
    const boards = board.boards.map((b, i) => {
      if (i !== boardIndex) return b
      const cells = [...b.cells]
      cells[cellIndex] = myMark
      return { cells }
    })
    const newState = { ...spendCard(state, 'mirror_strike'), board: { ...board, boards } }
    const winner = checkWinner(boards[boardIndex].cells)
    return winner ? { ...newState, winner } : newState
  }

  return state
}

// Card 5 — Freeze: locks a row or column for 1 full round
export function applyFreeze(
  state: GameState,
  target: { type: 'row' | 'col'; index: number }
): GameState {
  const frozen = {
    type: target.type,
    index: target.index,
    expiresAfterTurn: state.turnNumber + 2,
  }
  return { ...spendCard(state, 'freeze'), frozen }
}

// Card 6 — Double Down: only allowed in multi or ultimate mode.
// Grants a second move this turn; does NOT advance the turn.
export function applyDoubleDown(state: GameState): GameState {
  if (state.board.mode === 'classic') return state   // not allowed on a single board
  return { ...spendCard(state, 'double_down'), doubleDownActive: true } as GameState & { doubleDownActive: boolean }
}

// Card 7 — Time Warp: undoes the last 2 moves using the board history stored in state.
export function applyTimeWarp(state: GameState): GameState {
  if (state.turnNumber < 3) return state
  const history = state.boardHistory ?? []
  const boardTwoTurnsAgo = history[history.length - 2]
  if (!boardTwoTurnsAgo) return state

  return {
    ...spendCard(state, 'time_warp'),
    board: boardTwoTurnsAgo,
    boardHistory: history.slice(0, -2),
    turnNumber: state.turnNumber - 2,
  }
}

// Card 8 — Shield: protects one of the current player's marks for 2 rounds.
// Targeted cell cannot be erased or mirror-striked while the shield is active.
export function applyShield(state: GameState, boardIndex: number, cellIndex: number): GameState {
  const myMark: Mark = state.turn
  const board = state.board

  let isOwn = false
  if (board.mode === 'classic') {
    isOwn = board.cells[cellIndex] === myMark
  } else {
    isOwn = board.boards[boardIndex]?.cells[cellIndex] === myMark
  }
  if (!isOwn) return state

  return {
    ...spendCard(state, 'shield'),
    shieldedCell: { boardIndex, cellIndex, expiresAfterTurn: state.turnNumber + 2 },
  }
}

// Card 9 — Void: permanently removes an empty cell from the board.
export function applyVoid(state: GameState, boardIndex: number, cellIndex: number): GameState {
  const board = state.board

  let isEmpty = false
  if (board.mode === 'classic') {
    isEmpty = board.cells[cellIndex] === null
  } else {
    isEmpty = board.boards[boardIndex]?.cells[cellIndex] === null
  }
  if (!isEmpty) return state
  if (isCellVoided(state.voidedCells ?? [], boardIndex, cellIndex)) return state

  return {
    ...spendCard(state, 'void'),
    voidedCells: [...(state.voidedCells ?? []), { boardIndex, cellIndex }],
  }
}

// Card 10 — Clone: copies one of the current player's marks to an adjacent empty cell on the same board.
export function applyClone(
  state: GameState,
  srcBoardIndex: number,
  srcCellIndex: number,
  dstBoardIndex: number,
  dstCellIndex: number
): GameState {
  if (srcBoardIndex !== dstBoardIndex) return state
  if (srcCellIndex === dstCellIndex) return state

  const srcRow = Math.floor(srcCellIndex / 3)
  const srcCol = srcCellIndex % 3
  const dstRow = Math.floor(dstCellIndex / 3)
  const dstCol = dstCellIndex % 3
  if (Math.abs(srcRow - dstRow) > 1 || Math.abs(srcCol - dstCol) > 1) return state

  const myMark: Mark = state.turn
  const board = state.board

  const getCells = (bi: number): Mark[] | null => {
    if (board.mode === 'classic') return board.cells
    return board.boards[bi]?.cells ?? null
  }

  const cells = getCells(srcBoardIndex)
  if (!cells) return state
  if (cells[srcCellIndex] !== myMark) return state
  if (cells[dstCellIndex] !== null) return state
  if (isCellVoided(state.voidedCells ?? [], dstBoardIndex, dstCellIndex)) return state

  if (board.mode === 'classic') {
    const newCells = [...board.cells]
    newCells[dstCellIndex] = myMark
    const newBoard = { ...board, cells: newCells }
    const winner = checkWinner(newCells)
    return { ...spendCard(state, 'clone'), board: newBoard, ...(winner ? { winner } : {}) }
  }

  const newBoards = board.boards.map((b, i) => {
    if (i !== dstBoardIndex) return b
    const newCells = [...b.cells]
    newCells[dstCellIndex] = myMark
    return { cells: newCells }
  })

  const newState = { ...spendCard(state, 'clone'), board: { ...board, boards: newBoards } }
  const winner = checkWinner(newBoards[dstBoardIndex].cells)
  return winner ? { ...newState, winner } : newState
}
