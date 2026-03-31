export type Mark = 'X' | 'O' | null

export type ClassicBoard = {
  mode: 'classic'
  cells: Mark[]           // length 9
}

export type MultiBoard = {
  mode: 'multi'
  boards: { cells: Mark[] }[]   // 2 boards
  layout: 'right' | 'left' | 'below' | 'above'   // where boards[1] sits relative to boards[0]
}

export type UltimateBoard = {
  mode: 'ultimate'
  metaBoard: (Mark | 'draw')[]       // length 9 — won mini-boards
  boards: { cells: Mark[] }[]        // length 9 — the mini-boards
  forcedBoard: number | null         // which mini-board opponent must play in
}

export type Board = ClassicBoard | MultiBoard | UltimateBoard

export type CardId =
  | 'spawn_board'
  | 'erase'
  | 'nine_grid'
  | 'mirror_strike'
  | 'freeze'
  | 'double_down'
  | 'time_warp'
  | 'shield'
  | 'void'
  | 'clone'

export type FrozenState =
  | { type: 'row'; index: number; expiresAfterTurn: number }
  | { type: 'col'; index: number; expiresAfterTurn: number }
  | Record<string, never>   // empty = no freeze

export type ErasedCell = {
  boardIndex: number
  cellIndex: number
  expiresAfterTurn: number
}

export type ShieldedCell = {
  boardIndex: number
  cellIndex: number
  expiresAfterTurn: number
}

export type VoidedCell = {
  boardIndex: number
  cellIndex: number
}

export type GameState = {
  board: Board
  turn: 'X' | 'O'
  cardsX: CardId[]
  cardsO: CardId[]
  frozen: FrozenState
  erasedCell: ErasedCell | null
  shieldedCell: ShieldedCell | null
  voidedCells: VoidedCell[]
  spawnBoardUsedX: boolean
  spawnBoardUsedO: boolean
  winner: 'X' | 'O' | 'draw' | null
  turnNumber: number
  boardHistory: Board[]   // last 3 boards, used by Time Warp
}
