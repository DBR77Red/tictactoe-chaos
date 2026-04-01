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

  const [tab, setTab] = useState<'create' | 'join'>('create')
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

  const tabCls = (active: boolean) => cn(
    'flex-1 py-2.5 text-sm font-bold tracking-[.08em] uppercase transition-all duration-150 border-0 bg-transparent cursor-pointer',
    active
      ? 'text-[#FF2D6B] bg-[rgba(255,45,107,.08)] shadow-[inset_0_-2px_0_#FF2D6B]'
      : 'text-[#7B7FAA] hover:text-[#E8EAFF]',
  )

  return (
    <div
      className="relative w-full max-w-[480px] mx-auto rounded-2xl overflow-hidden"
      style={{
        background: '#0D0D2B',
        border: '1px solid #1E1E5A',
        boxShadow: '0 0 0 1px rgba(155,92,246,.1), 0 32px 64px rgba(0,0,0,.5)',
      }}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#9B5CF6] to-[#FF2D6B] [box-shadow:0_0_12px_#9B5CF6]" />

      <div className="p-10">

        {/* Tabs */}
        <div className="flex border border-[#1E1E5A] rounded-lg overflow-hidden mb-7">
          <button className={tabCls(tab === 'create')} onClick={() => { setTab('create'); setError(null) }}
            style={{ fontFamily: 'var(--font-rajdhani)' }}>
            {t('create')}
          </button>
          <button className={tabCls(tab === 'join')} onClick={() => { setTab('join'); setError(null) }}
            style={{ fontFamily: 'var(--font-rajdhani)' }}>
            {t('join')}
          </button>
        </div>

        {/* Create panel */}
        {tab === 'create' && (
          <div className="flex flex-col gap-4">
            {!createdCode ? (
              <Button
                onClick={handleCreate}
                disabled={creating}
                className={cn(
                  'w-full font-mono uppercase tracking-widest text-sm h-12',
                  'bg-transparent border border-[#FF2D6B] text-[#FF2D6B]',
                  '[box-shadow:0_0_4px_#FF2D6B,0_0_14px_#FF2D6B,0_0_40px_rgba(255,45,107,.5)]',
                  'hover:bg-[rgba(255,45,107,.12)] hover:[box-shadow:0_0_10px_#FF2D6B,0_0_30px_rgba(255,45,107,.65)]',
                  'disabled:opacity-50 transition-all duration-150',
                )}
              >
                {creating ? <span className="animate-pulse">{t('create')}...</span> : t('create')}
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Room code display */}
                <div
                  className="rounded-[10px] py-4 px-5 text-center cursor-pointer select-all"
                  onClick={handleCopy}
                  style={{
                    background: '#080818',
                    border: '1px solid rgba(0,229,255,.35)',
                    boxShadow: '0 0 16px rgba(0,229,255,.12)',
                  }}
                >
                  <p className="font-mono text-[10px] tracking-[.18em] uppercase text-[#5E6390] mb-1.5">
                    {t('codePlaceholder')}
                  </p>
                  <p
                    className="font-mono text-3xl font-bold tracking-[.15em] text-[#00E5FF]"
                    style={{ textShadow: '0 0 4px #00E5FF, 0 0 14px #00E5FF, 0 0 40px rgba(0,229,255,.5)' }}
                  >
                    {createdCode}
                  </p>
                </div>

                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className={cn(
                    'w-full font-mono uppercase tracking-widest text-xs h-9',
                    'bg-transparent border border-[#1E1E5A] text-[#7B7FAA]',
                    'hover:border-[#9B5CF6] hover:text-[#E8EAFF] hover:[box-shadow:0_0_8px_rgba(155,92,246,.4)]',
                    'transition-all duration-150',
                  )}
                >
                  {copied ? `✓ ${t('copied' as Parameters<typeof t>[0])}` : t('copy' as Parameters<typeof t>[0])}
                </Button>

                <div className="flex items-center justify-center gap-2 py-1">
                  <span className="w-2 h-2 rounded-full bg-[#9B5CF6] animate-pulse [box-shadow:0_0_8px_#9B5CF6]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#5E6390]">
                    {t('waitingForOpponent')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Join panel */}
        {tab === 'join' && (
          <div className="flex flex-col gap-3">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder={t('codePlaceholder')}
              maxLength={7}
              className={cn(
                'w-full font-mono text-center text-lg tracking-[0.2em] h-12',
                'bg-[#080818] border border-[#1E1E5A] text-[#00E5FF]',
                'placeholder:text-[#5E6390] placeholder:tracking-widest',
                'focus:border-[#00E5FF] focus:[box-shadow:0_0_12px_rgba(0,229,255,.4)]',
                'transition-all duration-150',
              )}
            />
            <Button
              onClick={handleJoin}
              disabled={joining || joinCode.length < 7}
              className={cn(
                'w-full font-mono uppercase tracking-widest text-sm h-12',
                'bg-transparent border border-[#00E5FF] text-[#00E5FF]',
                '[box-shadow:0_0_4px_#00E5FF,0_0_14px_#00E5FF,0_0_40px_rgba(0,229,255,.5)]',
                'hover:bg-[rgba(0,229,255,.10)] hover:[box-shadow:0_0_10px_#00E5FF,0_0_30px_rgba(0,229,255,.65)]',
                'disabled:opacity-50 transition-all duration-150',
              )}
            >
              {joining ? <span className="animate-pulse">{t('join')}...</span> : t('join')}
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-4 text-center text-xs font-mono text-[#FF2D6B] [filter:drop-shadow(0_0_6px_rgba(255,45,107,.6))] animate-pulse">
            {error}
          </p>
        )}

      </div>
    </div>
  )
}
