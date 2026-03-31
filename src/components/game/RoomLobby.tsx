'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Props = {
  onCreateRoom: () => Promise<{ code: string; roomId: string } | { error: string }>
  onJoinRoom: (code: string) => Promise<{ roomId: string } | { error: string }>
  onNavigateToRoom: (roomId: string) => void
}

export function RoomLobby({ onCreateRoom, onJoinRoom, onNavigateToRoom }: Props) {
  const t = useTranslations('room')

  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    setError(null)
    setCreating(true)
    const result = await onCreateRoom()
    setCreating(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      setCreatedCode(result.code)
      onNavigateToRoom(result.roomId)
    }
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setError(null)
    setJoining(true)
    const result = await onJoinRoom(joinCode.trim().toUpperCase())
    setJoining(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      onNavigateToRoom(result.roomId)
    }
  }

  const handleCopy = async () => {
    if (!createdCode) return
    await navigator.clipboard.writeText(createdCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-6">

      {/* Create Room */}
      <div className="flex flex-col gap-3">
        {!createdCode ? (
          <Button
            onClick={handleCreate}
            disabled={creating}
            className={cn(
              'w-full font-mono uppercase tracking-widest text-sm h-12',
              'bg-[#12111a] border border-[#7b2fff] text-[#c026d3]',
              'hover:border-[#ff2d7a] hover:text-[#ff2d7a]',
              'hover:[box-shadow:0_0_16px_#ff2d7a60]',
              'disabled:opacity-50 transition-all duration-150',
            )}
          >
            {creating ? (
              <span className="animate-pulse">{t('create')}...</span>
            ) : (
              t('create')
            )}
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Room code display */}
            <button
              onClick={handleCopy}
              className={cn(
                'w-full py-4 rounded-lg font-mono text-2xl font-bold tracking-[0.3em]',
                'bg-[#12111a] border-2 border-[#7b2fff]',
                'text-[#ff2d7a] [filter:drop-shadow(0_0_10px_#ff2d7a)]',
                '[box-shadow:0_0_20px_#7b2fff40,inset_0_0_20px_#7b2fff10]',
                'hover:border-[#ff2d7a] transition-all duration-150',
                'cursor-pointer select-all',
              )}
            >
              {createdCode}
            </button>

            {/* Copy button */}
            <Button
              onClick={handleCopy}
              variant="outline"
              className={cn(
                'w-full font-mono uppercase tracking-widest text-xs h-9',
                'bg-transparent border border-[#7b2fff30] text-[#7b2fff]',
                'hover:border-[#7b2fff] hover:[box-shadow:0_0_8px_#7b2fff40]',
                'transition-all duration-150',
              )}
            >
              {copied ? `✓ ${t('copied' as Parameters<typeof t>[0])}` : t('copy' as Parameters<typeof t>[0])}
            </Button>

            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-2 py-1">
              <span className="w-2 h-2 rounded-full bg-[#7b2fff] animate-pulse [box-shadow:0_0_8px_#7b2fff]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#555]">
                {t('waitingForOpponent')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* OR divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#7b2fff30]" />
        <span className="text-xs font-mono text-[#7b2fff] [filter:drop-shadow(0_0_6px_#7b2fff)] uppercase tracking-widest">
          or
        </span>
        <div className="flex-1 h-px bg-[#7b2fff30]" />
      </div>

      {/* Join Room */}
      <div className="flex flex-col gap-3">
        <Input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder={t('codePlaceholder')}
          maxLength={7}
          className={cn(
            'w-full font-mono text-center text-lg tracking-[0.2em] h-12',
            'bg-[#12111a] border border-[#7b2fff40] text-[#00d4ff]',
            'placeholder:text-[#333] placeholder:tracking-widest',
            'focus:border-[#00d4ff] focus:[box-shadow:0_0_12px_#00d4ff40]',
            'transition-all duration-150',
          )}
        />
        <Button
          onClick={handleJoin}
          disabled={joining || joinCode.length < 7}
          className={cn(
            'w-full font-mono uppercase tracking-widest text-sm h-12',
            'bg-[#12111a] border border-[#00d4ff40] text-[#00d4ff]',
            'hover:border-[#00d4ff] hover:[box-shadow:0_0_16px_#00d4ff60]',
            'disabled:opacity-50 transition-all duration-150',
          )}
        >
          {joining ? (
            <span className="animate-pulse">{t('join')}...</span>
          ) : (
            t('join')
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-center text-xs font-mono text-[#ff2d7a] [filter:drop-shadow(0_0_6px_#ff2d7a60)] animate-pulse">
          {error}
        </p>
      )}
    </div>
  )
}
