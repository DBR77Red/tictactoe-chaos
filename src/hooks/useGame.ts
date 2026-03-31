'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient, playerId } from '@/lib/supabase'
import {
  checkResult,
  applyClassicMove,
  applyMultiMove,
  applyUltimateMove,
  isCellFrozen,
} from '@/lib/game-logic'
import {
  applySpawnBoard,
  applyErase,
  applyNineGrid,
  applyMirrorStrike,
  applyFreeze,
  applyDoubleDown,
  applyTimeWarp,
} from '@/lib/cards'
import type { GameState, CardId, Board } from '@/lib/types'
import type { Json } from '@/lib/database.types'

type UseGameReturn = {
  gameState: GameState | null
  myMark: 'X' | 'O' | null
  myTurn: boolean
  myCards: CardId[]
  activeCard: CardId | null
  doubleDownActive: boolean
  setActiveCard: (card: CardId | null) => void
  playMove: (boardIndex: number, cellIndex: number) => Promise<void>
  playCard: (cardId: CardId, payload?: { boardIndex: number; cellIndex: number } | { type: 'row' | 'col'; index: number }) => Promise<void>
  isLoading: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
}

export function useGame(
  roomId: string,
  room: { player_x: string | null; player_o: string | null }
): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [activeCard, setActiveCard] = useState<CardId | null>(null)
  const [doubleDownActive, setDoubleDownActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  // Keep last 3 board snapshots for Time Warp (need board from 2 turns ago)
  const boardHistory = useRef<Board[]>([])

  const supabase = useMemo(() => createClient(), [])

  // Ref to the active Realtime channel so commitAndLog can broadcast on it
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const myMark = room.player_x === playerId ? 'X'
    : room.player_o === playerId ? 'O'
    : null

  const myTurn = gameState?.turn === myMark && gameState?.winner === null

  const myCards = myMark === 'X' ? (gameState?.cardsX ?? []) : (gameState?.cardsO ?? [])

  // Stable ref so broadcast handler always sees latest setter without re-subscribing
  const setGameStateRef = useRef(setGameState)
  setGameStateRef.current = setGameState

  // Subscribe via Broadcast (primary) + postgres_changes INSERT (game start fallback)
  useEffect(() => {
    const handleBroadcast = (payload: { payload: GameState }) => {
      const next = payload.payload
      setGameStateRef.current(prev => {
        if (prev) {
          boardHistory.current = [...boardHistory.current, prev.board].slice(-3)
        }
        return next
      })
    }

    const handleInsert = (payload: { new: Record<string, unknown> }) => {
      // Only use postgres_changes for the initial INSERT (game start).
      // Subsequent moves are synced via broadcast.
      setGameStateRef.current(prev => {
        if (prev) return prev // already have state, ignore
        boardHistory.current = []
        return deserializeGameState(payload.new)
      })
    }

    const channel = supabase
      .channel(`room:${roomId}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'game_state' }, handleBroadcast)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_states', filter: `room_id=eq.${roomId}` },
        handleInsert
      )
      .on('system', {}, (status: string) => {
        if (status === 'SUBSCRIBED') setConnectionStatus('connected')
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setConnectionStatus('disconnected')
      })
      .subscribe()

    // Initial fetch — covers joining a game already in progress
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

  const commitAndLog = useCallback(async (
    newState: GameState,
    actionType: string,
    payload: Json
  ) => {
    // Broadcast to opponent immediately — no RLS involved, sub-100ms delivery
    channelRef.current?.send({ type: 'broadcast', event: 'game_state', payload: newState })
    await commitGameState(supabase, roomId, newState)
    await logAction(supabase, roomId, myMark ?? '', actionType, payload)
  }, [supabase, roomId, myMark])

  const playMove = useCallback(async (boardIndex: number, cellIndex: number) => {
    if (!gameState || !myMark || !myTurn) return
    if (isCellFrozen(gameState.frozen, cellIndex, gameState.turnNumber)) return

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

    // If Double Down is active, place the mark but keep the turn
    if (doubleDownActive) {
      const newState: GameState = { ...gameState, board: newBoard }
      boardHistory.current = [...boardHistory.current, gameState.board].slice(-3)
      setDoubleDownActive(false)
      setGameState(newState) // optimistic update
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
    }

    boardHistory.current = [...boardHistory.current, gameState.board].slice(-3)
    setGameState(newState) // optimistic update — show mark immediately
    await commitAndLog(newState, 'move', { boardIndex, cellIndex } as unknown as Json)
    setIsLoading(false)
  }, [gameState, myMark, myTurn, doubleDownActive, commitAndLog])

  const playCard = useCallback(async (
    cardId: CardId,
    payload?: { boardIndex: number; cellIndex: number } | { type: 'row' | 'col'; index: number }
  ) => {
    if (!gameState || !myMark || !myTurn) return
    if (!myCards.includes(cardId)) return

    setIsLoading(true)

    let newState = gameState

    switch (cardId) {
      case 'spawn_board':
        newState = applySpawnBoard(gameState)
        break

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
        break
      }

      case 'double_down': {
        newState = applyDoubleDown(gameState)
        // Double Down does NOT pass the turn — it grants an extra move this turn
        setDoubleDownActive(true)
        boardHistory.current = [...boardHistory.current, gameState.board].slice(-3)
        setGameState(newState) // optimistic update
        await commitAndLog(newState, 'card', { cardId } as unknown as Json)
        setIsLoading(false)
        return
      }

      case 'time_warp': {
        const boardTwoTurnsAgo = boardHistory.current[boardHistory.current.length - 2]
        if (!boardTwoTurnsAgo) { setIsLoading(false); return }
        newState = applyTimeWarp(gameState, boardTwoTurnsAgo)
        break
      }
    }

    // All cards except double_down pass the turn
    const finalState: GameState = {
      ...newState,
      turn: myMark === 'X' ? 'O' : 'X',
      turnNumber: newState.turnNumber + 1,
      winner: checkResult(newState.board),
    }

    boardHistory.current = [...boardHistory.current, gameState.board].slice(-3)
    setGameState(finalState) // optimistic update
    await commitAndLog(finalState, 'card', { cardId, ...payload } as unknown as Json)
    setActiveCard(null)
    setIsLoading(false)
  }, [gameState, myMark, myTurn, myCards, commitAndLog])

  return {
    gameState,
    myMark,
    myTurn,
    myCards,
    activeCard,
    doubleDownActive,
    setActiveCard,
    playMove,
    playCard,
    isLoading,
    connectionStatus,
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
      spawn_board_used_x: state.spawnBoardUsedX,
      spawn_board_used_o: state.spawnBoardUsedO,
      winner: state.winner,
      turn_number: state.turnNumber,
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
    spawnBoardUsedX: (raw.spawn_board_used_x as boolean) ?? false,
    spawnBoardUsedO: (raw.spawn_board_used_o as boolean) ?? false,
    winner: (raw.winner as GameState['winner']) ?? null,
    turnNumber: (raw.turn_number as number) ?? 1,
  }
}
