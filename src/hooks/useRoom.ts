'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient, playerId } from '@/lib/supabase'
import { dealCards } from '@/lib/cards'
import type { CardId } from '@/lib/types'

type Room = {
  id: string
  code: string
  status: string
  player_x: string | null
  player_o: string | null
}

type UseRoomReturn = {
  room: Room | null
  isLoading: boolean
  error: string | null
}

export function useRoom(roomId: string): UseRoomReturn {
  const [room, setRoom] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Initial fetch
    supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setIsLoading(false); return }
        if (data) {
          setRoom(data as Room)
          // If second player just joined and game_states row doesn't exist yet, create it
          maybeInitGameState(supabase, data as Room)
        }
        setIsLoading(false)
      })

    // Subscribe to room updates (e.g. second player joining)
    const channel = supabase
      .channel(`room-meta:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const updated = payload.new as Room
          setRoom(updated)
          maybeInitGameState(supabase, updated)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId, supabase])

  return { room, isLoading, error }
}

// Creates the initial game_states row once both players are in the room.
// Safe to call multiple times — only inserts if row doesn't exist.
async function maybeInitGameState(
  supabase: ReturnType<typeof createClient>,
  room: Room
) {
  if (!room.player_x || !room.player_o) return

  const { data: existing } = await supabase
    .from('game_states')
    .select('id')
    .eq('room_id', room.id)
    .single()

  if (existing) return // already initialized

  const { cardsX, cardsO } = dealCards()

  const initialBoard = { mode: 'classic', cells: Array(9).fill(null) }

  await supabase.from('game_states').insert({
    room_id: room.id,
    board: initialBoard,
    game_mode: 'classic',
    turn: 'X',
    cards_x: cardsX as CardId[],
    cards_o: cardsO as CardId[],
    frozen: {},
    spawn_board_used_x: false,
    spawn_board_used_o: false,
    winner: null,
    turn_number: 1,
  })
}

// ---- Room creation helpers (used by the home page) ----

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = () => Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${seg()}-${seg()}`
}

export async function createRoom(): Promise<{ roomId: string; code: string } | { error: string }> {
  const supabase = createClient()
  const code = generateRoomCode()

  const { data, error } = await supabase
    .from('rooms')
    .insert({ code, player_x: playerId, status: 'waiting' })
    .select('id, code')
    .single()

  if (error) return { error: error.message }
  return { roomId: data.id, code: data.code }
}

export async function joinRoom(code: string): Promise<{ roomId: string } | { error: string }> {
  const supabase = createClient()

  const { data: room, error: findError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()

  if (findError || !room) return { error: 'Room not found' }
  if (room.status !== 'waiting') return { error: 'Room is already full or finished' }
  if (room.player_x === playerId) return { roomId: room.id } // rejoining own room

  const { error: joinError } = await supabase
    .from('rooms')
    .update({ player_o: playerId, status: 'playing' })
    .eq('id', room.id)

  if (joinError) return { error: joinError.message }

  // Initialize game state now (before navigation) so it exists when the game page loads.
  // This avoids a race condition where useGame fetches game_states before the row is created.
  await maybeInitGameState(supabase, { ...room, player_o: playerId, status: 'playing' })

  return { roomId: room.id }
}
