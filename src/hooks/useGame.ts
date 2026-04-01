'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient, playerId } from '@/lib/supabase'
import {
  checkResult,
  applyClassicMove,
  applyMultiMove,
  applyUltimateMove,
  isCellFrozen,
  isCellErased,
  isCellVoided,
} from '@/lib/game-logic'
import {
  applySpawnBoard,
  applyErase,
  applyNineGrid,
  applyMirrorStrike,
  applyFreeze,
  applyDoubleDown,
  applyTimeWarp,
  applyShield,
  applyVoid,
  applyClone,
  createInitialGameState,
} from '@/lib/cards'
import type { GameState, CardId, Board, MultiBoard } from '@/lib/types'
import type { Json } from '@/lib/database.types'

type SpawnPayload  = { layout: MultiBoard['layout'] }
type CellPayload   = { boardIndex: number; cellIndex: number }
type FreezePayload = { type: 'row' | 'col'; index: number }
type CardPayload   = SpawnPayload | CellPayload | FreezePayload

type UseGameReturn = {
  gameState: GameState | null
  myMark: 'X' | 'O' | null
  myTurn: boolean
  myCards: CardId[]
  activeCard: CardId | null
  doubleDownActive: boolean
  cloneStep: 1 | 2 | null
  cloneSrc: { boardIndex: number; cellIndex: number } | null
  setActiveCard: (card: CardId | null) => void
  playMove: (boardIndex: number, cellIndex: number) => Promise<void>
  playCard: (cardId: CardId, payload?: CardPayload) => Promise<void>
  isLoading: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  myRematchVote: boolean
  opponentRematchVote: boolean
  requestRematch: () => void
}

export function useGame(
  roomId: string,
  room: { player_x: string | null; player_o: string | null }
): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [activeCardState, setActiveCardState] = useState<CardId | null>(null)
  const [doubleDownActive, setDoubleDownActive] = useState(false)
  const [cloneStep, setCloneStep] = useState<1 | 2 | null>(null)
  const [cloneSrc, setCloneSrc] = useState<{ boardIndex: number; cellIndex: number } | null>(null)
  const [myRematchVote, setMyRematchVote] = useState(false)
  const [opponentRematchVote, setOpponentRematchVote] = useState(false)

  const setActiveCard = useCallback((card: CardId | null) => {
    setActiveCardState(card)
    if (card === 'clone') {
      setCloneStep(1)
      setCloneSrc(null)
    } else {
      setCloneStep(null)
      setCloneSrc(null)
    }
  }, [])

  const activeCard = activeCardState
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const supabase = useMemo(() => createClient(), [])
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const myMark = room.player_x === playerId ? 'X'
    : room.player_o === playerId ? 'O'
    : null

  const myTurn = gameState?.turn === myMark && gameState?.winner === null

  const myCards = myMark === 'X' ? (gameState?.cardsX ?? []) : (gameState?.cardsO ?? [])

  const setGameStateRef = useRef(setGameState)
  setGameStateRef.current = setGameState

  useEffect(() => {
    const handleBroadcast = (payload: { payload: GameState }) => {
      setGameStateRef.current(() => payload.payload)
    }

    const handleInsert = (payload: { new: Record<string, unknown> }) => {
      setGameStateRef.current(prev => {
        if (prev) return prev
        return deserializeGameState(payload.new)
      })
    }

    const handleUpdate = (payload: { new: Record<string, unknown> }) => {
      setGameStateRef.current(() => deserializeGameState(payload.new))
    }

    const channel = supabase
      .channel(`room:${roomId}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'game_state' }, handleBroadcast)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_states', filter: `room_id=eq.${roomId}` },
        handleInsert
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_states', filter: `room_id=eq.${roomId}` },
        handleUpdate
      )
      .on('broadcast', { event: 'rematch_vote' }, () => setOpponentRematchVote(true))
      .on('system', {}, (status: string) => {
        if (status === 'SUBSCRIBED') setConnectionStatus('connected')
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setConnectionStatus('disconnected')
      })
      .subscribe()

    supabase
      .from('game_states')
      .select('*')
      .eq('room_id', roomId)
      .single()
      .then(({ data }) => {
        if (data) setGameStateRef.current(prev => prev ?? deserializeGameState(data as Record<string, unknown>))
        setConnectionStatus('connected')
      })

    channelRef.current = channel
    return () => {
      channelRef.current = null
      supabase.removeChannel(channel)
    }
  }, [roomId, supabase])

  const requestRematch = useCallback(() => {
    setMyRematchVote(true)
    channelRef.current?.send({ type: 'broadcast', event: 'rematch_vote', payload: {} })
  }, [])

  // Reset votes when a new game starts (winner becomes null)
  useEffect(() => {
    if (gameState?.winner === null) {
      setMyRematchVote(false)
      setOpponentRematchVote(false)
    }
  }, [gameState?.winner])

  // When both have voted and game is still over, the player with write permission resets
  useEffect(() => {
    if (!myRematchVote || !opponentRematchVote || !gameState || !myMark) return
    if (gameState.winner === null) return  // already reset, guard against double-reset
    if (gameState.turn !== myMark) return  // only the player with RLS write permission resets
    const newState = createInitialGameState()
    setGameState(newState)
    channelRef.current?.send({ type: 'broadcast', event: 'game_state', payload: newState })
    commitGameState(supabase, roomId, newState)
  }, [myRematchVote, opponentRematchVote, gameState, myMark, supabase, roomId])

  const commitAndLog = useCallback(async (
    newState: GameState,
    actionType: string,
    payload: Json
  ) => {
    channelRef.current?.send({ type: 'broadcast', event: 'game_state', payload: newState })
    await commitGameState(supabase, roomId, newState)
    await logAction(supabase, roomId, myMark ?? '', actionType, payload)
  }, [supabase, roomId, myMark])

  const playMove = useCallback(async (boardIndex: number, cellIndex: number) => {
    if (!gameState || !myMark || !myTurn) return
    if (isCellFrozen(gameState.frozen, cellIndex, gameState.turnNumber)) return
    if (isCellErased(gameState.erasedCell, boardIndex, cellIndex, gameState.turnNumber)) return
    if (isCellVoided(gameState.voidedCells ?? [], boardIndex, cellIndex)) return

    setIsLoading(true)

    let newBoard: Board

    if (gameState.board.mode === 'classic') {
      if (gameState.board.cells[cellIndex] !== null) { setIsLoading(false); return }
      newBoard = applyClassicMove(gameState.board, cellIndex, myMark)
    } else if (gameState.board.mode === 'multi') {
      if (gameState.board.boards[boardIndex]?.cells[cellIndex] !== null) { setIsLoading(false); return }
      newBoard = applyMultiMove(gameState.board, boardIndex, cellIndex, myMark)
    } else {
      const forced = gameState.board.forcedBoard
      if (forced !== null && boardIndex !== forced) { setIsLoading(false); return }
      if (gameState.board.boards[boardIndex]?.cells[cellIndex] !== null) { setIsLoading(false); return }
      newBoard = applyUltimateMove(gameState.board, boardIndex, cellIndex, myMark)
    }

    // Double Down: place the mark but keep the turn (second move)
    if (doubleDownActive) {
      const newState: GameState = {
        ...gameState,
        board: newBoard,
        boardHistory: [...(gameState.boardHistory ?? []), gameState.board].slice(-3),
      }
      setDoubleDownActive(false)
      setGameState(newState)
      await commitAndLog(newState, 'move', { boardIndex, cellIndex, doubleDown: true } as unknown as Json)
      setIsLoading(false)
      return
    }

    const newState: GameState = {
      ...gameState,
      board: newBoard,
      turn: myMark === 'X' ? 'O' : 'X',
      turnNumber: gameState.turnNumber + 1,
      winner: checkResult(newBoard),
      boardHistory: [...(gameState.boardHistory ?? []), gameState.board].slice(-3),
    }

    setGameState(newState)
    await commitAndLog(newState, 'move', { boardIndex, cellIndex } as unknown as Json)
    setIsLoading(false)
  }, [gameState, myMark, myTurn, doubleDownActive, commitAndLog])

  const playCard = useCallback(async (cardId: CardId, payload?: CardPayload) => {
    if (!gameState || !myMark || !myTurn) return
    if (!myCards.includes(cardId)) return

    setIsLoading(true)

    let newState = gameState

    switch (cardId) {
      case 'spawn_board': {
        if (!payload || !('layout' in payload)) { setIsLoading(false); return }
        newState = applySpawnBoard(gameState, payload.layout)
        // Spawn Board does NOT advance the turn — player moves immediately after
        const spawnState: GameState = {
          ...newState,
          boardHistory: [...(gameState.boardHistory ?? []), gameState.board].slice(-3),
        }
        setGameState(spawnState)
        await commitAndLog(spawnState, 'card', { cardId, layout: payload.layout } as unknown as Json)
        setActiveCard(null)
        setIsLoading(false)
        return
      }

      case 'nine_grid':
        newState = applyNineGrid(gameState)
        break

      case 'erase': {
        if (!payload || !('boardIndex' in payload)) { setIsLoading(false); return }
        newState = applyErase(gameState, payload.boardIndex, payload.cellIndex)
        break
      }

      case 'mirror_strike': {
        if (!payload || !('boardIndex' in payload)) { setIsLoading(false); return }
        newState = applyMirrorStrike(gameState, payload.boardIndex, payload.cellIndex)
        break
      }

      case 'freeze': {
        if (!payload || !('type' in payload)) { setIsLoading(false); return }
        newState = applyFreeze(gameState, payload)
        // Freeze does NOT advance the turn — player gets a free move immediately after
        const freezeState: GameState = {
          ...newState,
          boardHistory: [...(gameState.boardHistory ?? []), gameState.board].slice(-3),
        }
        setGameState(freezeState)
        await commitAndLog(freezeState, 'card', { cardId, ...payload } as unknown as Json)
        setActiveCard(null)
        setIsLoading(false)
        return
      }

      case 'double_down': {
        newState = applyDoubleDown(gameState)
        if (newState === gameState) { setIsLoading(false); return } // rejected (classic mode)
        setDoubleDownActive(true)
        const ddState: GameState = {
          ...newState,
          boardHistory: [...(gameState.boardHistory ?? []), gameState.board].slice(-3),
        }
        setGameState(ddState)
        await commitAndLog(ddState, 'card', { cardId } as unknown as Json)
        setIsLoading(false)
        return
      }

      case 'time_warp': {
        newState = applyTimeWarp(gameState)
        if (newState === gameState) { setIsLoading(false); return } // not enough history
        // Time Warp does NOT advance the turn — player gets to move on the reverted board
        // (applyTimeWarp already manages boardHistory internally, so don't push here)
        setGameState(newState)
        await commitAndLog(newState, 'card', { cardId } as unknown as Json)
        setActiveCard(null)
        setIsLoading(false)
        return
      }

      case 'shield': {
        if (!payload || !('boardIndex' in payload)) { setIsLoading(false); return }
        newState = applyShield(gameState, payload.boardIndex, payload.cellIndex)
        // Shield does NOT advance the turn — player gets a free move immediately after
        const shieldState: GameState = {
          ...newState,
          boardHistory: [...(gameState.boardHistory ?? []), gameState.board].slice(-3),
        }
        setGameState(shieldState)
        await commitAndLog(shieldState, 'card', { cardId, ...payload } as unknown as Json)
        setActiveCard(null)
        setIsLoading(false)
        return
      }

      case 'void': {
        if (!payload || !('boardIndex' in payload)) { setIsLoading(false); return }
        newState = applyVoid(gameState, payload.boardIndex, payload.cellIndex)
        // Void does NOT advance the turn — player gets a free move immediately after
        const voidState: GameState = {
          ...newState,
          boardHistory: [...(gameState.boardHistory ?? []), gameState.board].slice(-3),
        }
        setGameState(voidState)
        await commitAndLog(voidState, 'card', { cardId, ...payload } as unknown as Json)
        setActiveCard(null)
        setIsLoading(false)
        return
      }

      case 'clone': {
        if (!payload || !('boardIndex' in payload)) { setIsLoading(false); return }
        if (cloneStep === 1) {
          // Step 1: store source, wait for destination
          setCloneSrc({ boardIndex: payload.boardIndex, cellIndex: payload.cellIndex })
          setCloneStep(2)
          setIsLoading(false)
          return
        }
        // Step 2: apply clone
        if (!cloneSrc) { setIsLoading(false); return }
        newState = applyClone(gameState, cloneSrc.boardIndex, cloneSrc.cellIndex, payload.boardIndex, payload.cellIndex)
        if (newState === gameState) { setIsLoading(false); return } // invalid target
        setCloneStep(null)
        setCloneSrc(null)
        break
      }
    }

    // All remaining cards advance the turn
    const finalState: GameState = {
      ...newState,
      turn: myMark === 'X' ? 'O' : 'X',
      turnNumber: newState.turnNumber + 1,
      winner: checkResult(newState.board),
      boardHistory: [...(gameState.boardHistory ?? []), gameState.board].slice(-3),
    }

    setGameState(finalState)
    await commitAndLog(finalState, 'card', { cardId, ...payload } as unknown as Json)
    setActiveCard(null)
    setIsLoading(false)
  }, [gameState, myMark, myTurn, myCards, cloneStep, cloneSrc, commitAndLog])

  return {
    gameState,
    myMark,
    myTurn,
    myCards,
    activeCard,
    doubleDownActive,
    cloneStep,
    cloneSrc,
    setActiveCard,
    playMove,
    playCard,
    isLoading,
    connectionStatus,
    myRematchVote,
    opponentRematchVote,
    requestRematch,
  }
}

// ---- Helpers ----

async function commitGameState(
  supabase: ReturnType<typeof createClient>,
  roomId: string,
  state: GameState
) {
  await supabase
    .from('game_states')
    .update({
      board: state.board as unknown as Json,
      game_mode: state.board.mode,
      turn: state.turn,
      cards_x: state.cardsX as unknown as Json,
      cards_o: state.cardsO as unknown as Json,
      frozen: state.frozen as unknown as Json,
      erased_cell: (state.erasedCell ?? null) as unknown as Json,
      shielded_cell: (state.shieldedCell ?? null) as unknown as Json,
      voided_cells: (state.voidedCells ?? []) as unknown as Json,
      spawn_board_used_x: state.spawnBoardUsedX,
      spawn_board_used_o: state.spawnBoardUsedO,
      winner: state.winner,
      turn_number: state.turnNumber,
      board_history: (state.boardHistory ?? []) as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq('room_id', roomId)
}

async function logAction(
  supabase: ReturnType<typeof createClient>,
  roomId: string,
  player: string,
  actionType: string,
  payload: Json
) {
  await supabase
    .from('game_actions')
    .insert({ room_id: roomId, player, action_type: actionType, payload })
}

function deserializeGameState(raw: Record<string, unknown>): GameState {
  return {
    board: raw.board as Board,
    turn: raw.turn as 'X' | 'O',
    cardsX: (raw.cards_x as CardId[]) ?? [],
    cardsO: (raw.cards_o as CardId[]) ?? [],
    frozen: (raw.frozen as GameState['frozen']) ?? {},
    erasedCell: (raw.erased_cell as GameState['erasedCell']) ?? null,
    shieldedCell: (raw.shielded_cell as GameState['shieldedCell']) ?? null,
    voidedCells: (raw.voided_cells as GameState['voidedCells']) ?? [],
    spawnBoardUsedX: (raw.spawn_board_used_x as boolean) ?? false,
    spawnBoardUsedO: (raw.spawn_board_used_o as boolean) ?? false,
    winner: (raw.winner as GameState['winner']) ?? null,
    turnNumber: (raw.turn_number as number) ?? 1,
    boardHistory: (raw.board_history as Board[]) ?? [],
  }
}
