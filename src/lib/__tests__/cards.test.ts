import { describe, it, expect } from 'vitest'
import {
  dealCards,
  removeCard,
  applySpawnBoard,
  applyErase,
  applyNineGrid,
  applyMirrorStrike,
  applyFreeze,
  applyDoubleDown,
  applyTimeWarp,
  ALL_CARD_IDS,
} from '../cards'
import type { GameState, CardId, Mark } from '../types'

// Helpers
const empty9 = (): Mark[] => Array(9).fill(null)

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    board: { mode: 'classic', cells: empty9() },
    turn: 'X',
    cardsX: ['spawn_board', 'erase', 'nine_grid'],
    cardsO: ['mirror_strike', 'freeze', 'double_down'],
    frozen: {},
    spawnBoardUsedX: false,
    spawnBoardUsedO: false,
    winner: null,
    turnNumber: 1,
    ...overrides,
  }
}

describe('dealCards', () => {
  it('deals 3 cards to each player', () => {
    const { cardsX, cardsO } = dealCards()
    expect(cardsX).toHaveLength(3)
    expect(cardsO).toHaveLength(3)
  })

  it('deals non-overlapping hands', () => {
    const { cardsX, cardsO } = dealCards()
    const xSet = new Set(cardsX)
    const oSet = new Set(cardsO)
    const overlap = [...xSet].filter(c => oSet.has(c))
    expect(overlap).toHaveLength(0)
  })

  it('only deals valid card IDs', () => {
    const { cardsX, cardsO } = dealCards()
    const validIds = new Set(ALL_CARD_IDS)
    ;[...cardsX, ...cardsO].forEach(id => expect(validIds.has(id)).toBe(true))
  })
})

describe('removeCard', () => {
  it('removes the first occurrence of a card', () => {
    expect(removeCard(['erase', 'freeze', 'erase'], 'erase')).toEqual(['freeze', 'erase'])
  })

  it('returns the hand unchanged if card not found', () => {
    const hand: CardId[] = ['erase', 'freeze']
    expect(removeCard(hand, 'nine_grid')).toEqual(hand)
  })

  it('does not mutate the original array', () => {
    const hand: CardId[] = ['erase', 'freeze']
    removeCard(hand, 'erase')
    expect(hand).toHaveLength(2)
  })
})

describe('applySpawnBoard', () => {
  it('transitions classic board to multi mode', () => {
    const state = makeState()
    const next = applySpawnBoard(state)
    expect(next.board.mode).toBe('multi')
  })

  it('removes spawn_board from X hand', () => {
    const state = makeState({ cardsX: ['spawn_board', 'erase'] })
    const next = applySpawnBoard(state)
    expect(next.cardsX).not.toContain('spawn_board')
  })

  it('marks spawnBoardUsedX as true', () => {
    const state = makeState()
    const next = applySpawnBoard(state)
    expect(next.spawnBoardUsedX).toBe(true)
  })

  it('does nothing if already used by X', () => {
    const state = makeState({ spawnBoardUsedX: true })
    expect(applySpawnBoard(state)).toBe(state)
  })

  it('does nothing if board is not classic', () => {
    const state = makeState({ board: { mode: 'multi', boards: [{ cells: empty9() }] } })
    expect(applySpawnBoard(state)).toBe(state)
  })

  it('does not mutate original state', () => {
    const state = makeState()
    applySpawnBoard(state)
    expect(state.board.mode).toBe('classic')
  })
})

describe('applyErase', () => {
  it('removes an opponent mark in classic mode', () => {
    const cells: Mark[] = ['O', null, null, null, null, null, null, null, null]
    const state = makeState({ board: { mode: 'classic', cells }, turn: 'X' })
    const next = applyErase(state, 0, 0)
    expect((next.board as { mode: 'classic'; cells: Mark[] }).cells[0]).toBeNull()
  })

  it('does nothing if target is not an opponent mark', () => {
    const cells: Mark[] = ['X', null, null, null, null, null, null, null, null]
    const state = makeState({ board: { mode: 'classic', cells }, turn: 'X' })
    expect(applyErase(state, 0, 0)).toBe(state)
  })

  it('removes erase card from hand after use', () => {
    const cells: Mark[] = ['O', null, null, null, null, null, null, null, null]
    const state = makeState({ board: { mode: 'classic', cells }, cardsX: ['erase'] })
    const next = applyErase(state, 0, 0)
    expect(next.cardsX).not.toContain('erase')
  })

  it('removes an opponent mark in multi mode', () => {
    const state = makeState({
      turn: 'X',
      cardsX: ['erase'],
      board: {
        mode: 'multi',
        boards: [
          { cells: ['O', null, null, null, null, null, null, null, null] },
          { cells: empty9() },
        ]
      }
    })
    const next = applyErase(state, 0, 0)
    expect((next.board as { mode: 'multi'; boards: { cells: Mark[] }[] }).boards[0].cells[0]).toBeNull()
  })
})

describe('applyNineGrid', () => {
  it('transitions classic board to ultimate mode', () => {
    const state = makeState({ cardsX: ['nine_grid'] })
    const next = applyNineGrid(state)
    expect(next.board.mode).toBe('ultimate')
  })

  it('removes nine_grid card from hand', () => {
    const state = makeState({ cardsX: ['nine_grid', 'erase'] })
    const next = applyNineGrid(state)
    expect(next.cardsX).not.toContain('nine_grid')
  })

  it('does nothing if already in ultimate mode', () => {
    const state = makeState({
      board: {
        mode: 'ultimate',
        metaBoard: Array(9).fill(null),
        boards: Array.from({ length: 9 }, () => ({ cells: empty9() })),
        forcedBoard: null,
      }
    })
    expect(applyNineGrid(state)).toBe(state)
  })
})

describe('applyMirrorStrike', () => {
  it('flips an opponent mark to current player in classic mode', () => {
    const cells: Mark[] = ['O', null, null, null, null, null, null, null, null]
    const state = makeState({ board: { mode: 'classic', cells }, turn: 'X', cardsX: ['mirror_strike'] })
    const next = applyMirrorStrike(state, 0, 0)
    expect((next.board as { mode: 'classic'; cells: Mark[] }).cells[0]).toBe('X')
  })

  it('does nothing if target is not an opponent mark', () => {
    const cells: Mark[] = ['X', null, null, null, null, null, null, null, null]
    const state = makeState({ board: { mode: 'classic', cells }, turn: 'X', cardsX: ['mirror_strike'] })
    expect(applyMirrorStrike(state, 0, 0)).toBe(state)
  })

  it('sets winner immediately if flipping creates a winning line', () => {
    const cells: Mark[] = ['X', 'X', null, null, null, null, null, null, 'O']
    // X has cells 0,1 — flipping cell 8 from O to X completes… no, cell 2 would win row
    const cells2: Mark[] = ['X', 'X', null, null, null, null, null, null, 'O']
    cells2[2] = null // will be flipped
    const state = makeState({
      board: { mode: 'classic', cells: ['X','X','O',null,null,null,null,null,null] },
      turn: 'X',
      cardsX: ['mirror_strike']
    })
    const next = applyMirrorStrike(state, 0, 2) // flip cell 2 from O to X → X wins row 0
    expect(next.winner).toBe('X')
  })

  it('removes mirror_strike card from hand', () => {
    const cells: Mark[] = ['O', null, null, null, null, null, null, null, null]
    const state = makeState({ board: { mode: 'classic', cells }, turn: 'X', cardsX: ['mirror_strike'] })
    const next = applyMirrorStrike(state, 0, 0)
    expect(next.cardsX).not.toContain('mirror_strike')
  })
})

describe('applyFreeze', () => {
  it('sets frozen state for a row', () => {
    const state = makeState({ cardsX: ['freeze'], turnNumber: 3 })
    const next = applyFreeze(state, { type: 'row', index: 1 })
    expect(next.frozen).toMatchObject({ type: 'row', index: 1 })
    expect((next.frozen as { expiresAfterTurn: number }).expiresAfterTurn).toBe(5)
  })

  it('sets frozen state for a column', () => {
    const state = makeState({ cardsX: ['freeze'], turnNumber: 1 })
    const next = applyFreeze(state, { type: 'col', index: 0 })
    expect(next.frozen).toMatchObject({ type: 'col', index: 0 })
  })

  it('removes freeze card from hand', () => {
    const state = makeState({ cardsX: ['freeze'] })
    const next = applyFreeze(state, { type: 'row', index: 0 })
    expect(next.cardsX).not.toContain('freeze')
  })
})

describe('applyDoubleDown', () => {
  it('removes double_down from hand', () => {
    const state = makeState({ cardsX: ['double_down'] })
    const next = applyDoubleDown(state)
    expect(next.cardsX).not.toContain('double_down')
  })
})

describe('applyTimeWarp', () => {
  it('reverts board to two turns ago', () => {
    const oldBoard = { mode: 'classic' as const, cells: ['X', null, null, null, null, null, null, null, null] as Mark[] }
    const state = makeState({ cardsX: ['time_warp'], turnNumber: 5 })
    const next = applyTimeWarp(state, oldBoard)
    expect(next.board).toEqual(oldBoard)
    expect(next.turnNumber).toBe(3)
  })

  it('does nothing if turnNumber < 3', () => {
    const state = makeState({ cardsX: ['time_warp'], turnNumber: 2 })
    expect(applyTimeWarp(state, { mode: 'classic', cells: empty9() })).toBe(state)
  })

  it('removes time_warp card from hand', () => {
    const state = makeState({ cardsX: ['time_warp'], turnNumber: 5 })
    const next = applyTimeWarp(state, { mode: 'classic', cells: empty9() })
    expect(next.cardsX).not.toContain('time_warp')
  })
})
