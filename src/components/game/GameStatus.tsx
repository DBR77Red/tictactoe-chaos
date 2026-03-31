'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type Props = {
  turn: 'X' | 'O'
  myMark: 'X' | 'O' | null
  winner: 'X' | 'O' | 'draw' | null
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  doubleDownActive?: boolean
}

export function GameStatus({ turn, myMark, winner, connectionStatus, doubleDownActive }: Props) {
  const t = useTranslations('game')

  const isMyTurn = turn === myMark
  const iWon = winner === myMark
  const iLost = winner !== null && winner !== 'draw' && winner !== myMark

  // Disconnected banner — highest priority
  if (connectionStatus !== 'connected') {
    return (
      <div className="w-full px-4 py-2 flex items-center justify-center gap-2 bg-[#ff2d2d]/10 border border-[#ff2d2d] animate-pulse">
        <span className="w-2 h-2 rounded-full bg-[#ff2d2d] animate-pulse" />
        <span className="text-sm font-mono uppercase tracking-widest text-[#ff2d2d]">
          {t('reconnecting' as Parameters<typeof t>[0])}
        </span>
      </div>
    )
  }

  // Win / lose / draw banner
  if (winner !== null) {
    const text = winner === 'draw'
      ? t('draw')
      : iWon
        ? t('youWin')
        : t('youLose')

    return (
      <div
        className={cn(
          'w-full px-4 py-3 flex items-center justify-center',
          'border text-base font-mono uppercase tracking-widest font-bold',
          winner === 'draw'
            ? 'bg-[#7b2fff]/10 border-[#7b2fff] text-[#c026d3] [box-shadow:0_0_20px_#7b2fff40]'
            : iWon
              ? 'bg-[#ffd700]/10 border-[#ffd700] text-[#ffd700] [box-shadow:0_0_20px_#ffd70040]'
              : 'bg-[#ff2d7a]/10 border-[#ff2d7a] text-[#ff2d7a] [box-shadow:0_0_20px_#ff2d7a40]',
        )}
      >
        {text}
      </div>
    )
  }

  // Double Down banner
  if (doubleDownActive) {
    return (
      <div className="w-full px-4 py-2 flex items-center justify-center gap-2 bg-[#ffd700]/10 border border-[#ffd700]">
        <span className="text-sm font-mono uppercase tracking-widest text-[#ffd700] [filter:drop-shadow(0_0_6px_#ffd700)]">
          {t('doubleDown' as Parameters<typeof t>[0])}
        </span>
      </div>
    )
  }

  // Normal turn indicator
  return (
    <div className="w-full px-4 py-2 flex items-center justify-center">
      {isMyTurn ? (
        <span className="text-sm font-mono uppercase tracking-widest text-[#ff2d7a] [filter:drop-shadow(0_0_8px_#ff2d7a)] animate-pulse">
          {t('yourTurn')}
        </span>
      ) : (
        <span className="text-sm font-mono uppercase tracking-widest text-[#555]">
          {t('opponentTurn')}
        </span>
      )}
    </div>
  )
}
