import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

function getPlayerId(): string {
  if (typeof window === 'undefined') return ''
  const existing = localStorage.getItem('ttt_player_id')
  if (existing) return existing
  const id = crypto.randomUUID()
  localStorage.setItem('ttt_player_id', id)
  return id
}

export const playerId = getPlayerId()

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { 'x-player-id': playerId }
      }
    }
  )
}
