'use client'

import { useRouter, useParams } from 'next/navigation'
import { RoomLobby } from '@/components/game/RoomLobby'
import { createRoom, joinRoom } from '@/hooks/useRoom'

export function HomeClient() {
  const router = useRouter()
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'

  const handleNavigate = (roomId: string) => {
    router.push(`/${locale}/game/${roomId}`)
  }

  return (
    <div className="relative z-[2] min-h-screen flex flex-col items-center px-6 pb-20">

      {/* Hero */}
      <div className="text-center pt-20 pb-14">
        <p className="font-mono text-[11px] tracking-[.25em] uppercase text-[#5E6390] mb-6">
          Multiplayer · Power Cards · No accounts
        </p>
        <h1
          className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-none tracking-[.04em]"
          style={{ fontFamily: 'var(--font-orbitron)' }}
        >
          <span
            className="block text-[#FF2D6B]"
            style={{
              textShadow: '0 0 4px #FF2D6B, 0 0 14px #FF2D6B, 0 0 40px rgba(255,45,107,.5), 0 0 80px rgba(255,45,107,.15)',
              animation: 'neon-flicker-pink 6s ease-in-out infinite',
            }}
          >
            TIC-TAC-TOE
          </span>
          <span
            className="block text-[#00E5FF]"
            style={{
              textShadow: '0 0 4px #00E5FF, 0 0 14px #00E5FF, 0 0 40px rgba(0,229,255,.5), 0 0 80px rgba(0,229,255,.15)',
              animation: 'neon-flicker-cyan 8s ease-in-out infinite 1s',
            }}
          >
            CHAOS
          </span>
        </h1>
        <p
          className="text-lg font-medium tracking-[.08em] uppercase text-[#7B7FAA] mt-6"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          7 power cards · 3 game modes · Real-time
        </p>
        {/* Violet divider */}
        <div
          className="w-[120px] h-px mx-auto mt-8 bg-gradient-to-r from-transparent via-[#9B5CF6] to-transparent"
          style={{ boxShadow: '0 0 4px #9B5CF6, 0 0 14px #9B5CF6, 0 0 40px rgba(155,92,246,.5)' }}
        />
      </div>

      {/* Lobby */}
      <RoomLobby
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onNavigateToRoom={handleNavigate}
      />
    </div>
  )
}
