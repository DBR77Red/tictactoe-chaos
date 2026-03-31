import type { CardId, GameState, Mark } from './types'
import { classicToUltimate, classicToMulti, checkWinner } from './game-logic'

export const ALL_CARD_IDS: CardId[] = [
  'spawn_board', 'erase', 'nine_grid',
  'mirror_strike', 'freeze', 'double_down', 'time_warp'
]

export function dealCards(): { cardsX: CardId[], cardsO: CardId[] } {
  const shuffled = [...ALL_CARD_IDS].sort(() => Math.random() - 0.5)
  return {
    cardsX: shuffled.slice(0, 3) as CardId[],
    cardsO: shuffled.slice(3, 6) as CardId[]
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

// Card 1 — Spawn Board: transitions classic → multi
export function applySpawnBoard(state: GameState): GameState {
  if (state.board.mode !== 'classic') return state
  if (state.turn === 'X' && state.spawnBoardUsedX) return state
  if (state.turn === 'O' && state.spawnBoardUsedO) return state

  return {
    ...spendCard(state, 'spawn_board'),
    board: classicToMulti(state.board),
    spawnBoardUsedX: state.turn === 'X' ? true : state.spawnBoardUsedX,
    spawnBoardUsedO: state.turn === 'O' ? true : state.spawnBoardUsedO,
  }
}

// Card 2 — Erase: removes one opponent mark
export function applyErase(state: GameState, boardIndex: number, cellIndex: number): GameState {
  const opponent: Mark = state.turn === 'X' ? 'O' : 'X'
  const board = state.board

  if (board.mode === 'classic') {
    if (board.cells[cellIndex] !== opponent) return state
    const cells = [...board.cells]
    cells[cellIndex] = null
    return { ...spendCard(state, 'erase'), board: { ...board, cells } }
  }

  if (board.mode === 'multi') {
    if (board.boards[boardIndex]?.cells[cellIndex] !== opponent) return state
    const boards = board.boards.map((b, i) => {
      if (i !== boardIndex) return b
      const cells = [...b.cells]
      cells[cellIndex] = null
      return { cells }
    })
    return { ...spendCard(state, 'erase'), board: { ...board, boards } }
  }

  if (board.mode === 'ultimate') {
    if (board.boards[boardIndex]?.cells[cellIndex] !== opponent) return state
    const boards = board.boards.map((b, i) => {
      if (i !== boardIndex) return b
      const cells = [...b.cells]
      cells[cellIndex] = null
      return { cells }
    })
    return { ...spendCard(state, 'erase'), board: { ...board, boards } }
  }

  return state
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
    expiresAfterTurn: state.turnNumber + 2, // expires after opponent's next move
  }
  return { ...spendCard(state, 'freeze'), frozen }
}

// Card 6 — Double Down: grants a second move this turn (UI handles 2-click flow)
// This function marks the card as spent and sets a flag the UI uses to request a 2nd move.
// The actual second move is applied via the normal applyMove path.
export function applyDoubleDown(state: GameState): GameState {
  return { ...spendCard(state, 'double_down'), doubleDownActive: true } as GameState & { doubleDownActive: boolean }
}

// Card 7 — Time Warp: undoes the last 2 moves given a move history snapshot
// historySnapshot: the board state from 2 turns ago
export function applyTimeWarp(state: GameState, boardTwoTurnsAgo: GameState['board']): GameState {
  if (state.turnNumber < 3) return state // not enough moves to undo
  return {
    ...spendCard(state, 'time_warp'),
    board: boardTwoTurnsAgo,
    turnNumber: state.turnNumber - 2,
  }
}
