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
    <RoomLobby
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
      onNavigateToRoom={handleNavigate}
    />
  )
}
