'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { CardId } from '@/lib/types'

type Props = {
  cardId: CardId
  disabled?: boolean
  active?: boolean
  used?: boolean
  onClick: () => void
}

const CARD_META: Record<CardId, { icon: string; labelKey: string }> = {
  spawn_board:   { icon: '➕', labelKey: 'spawn_board' },
  erase:         { icon: '🧹', labelKey: 'erase' },
  nine_grid:     { icon: '🔲', labelKey: 'nine_grid' },
  mirror_strike: { icon: '🪞', labelKey: 'mirror_strike' },
  freeze:        { icon: '❄️', labelKey: 'freeze' },
  double_down:   { icon: '✌️', labelKey: 'double_down' },
  time_warp:     { icon: '⏪', labelKey: 'time_warp' },
}

export function Card({ cardId, disabled, active, used, onClick }: Props) {
  const t = useTranslations('cards')
  const { icon, labelKey } = CARD_META[cardId]

  // messages shape: cards.spawn_board.name, cards.erase.name, etc.
  const label = t(`${labelKey}.name` as Parameters<typeof t>[0])

  return (
    <button
      onClick={!disabled && !used ? onClick : undefined}
      disabled={disabled || used}
      className={cn(
        'relative flex flex-col items-center justify-center gap-1',
        'w-20 h-28 rounded-lg px-2',
        'bg-[#12111a] border transition-all duration-150',
        'select-none',

        /* base border */
        !active && !used && 'border-[#7b2fff]',

        /* active state */
        active && [
          'border-[#ff2d7a]',
          '-translate-y-1.5',
          '[box-shadow:0_0_16px_#ff2d7a,0_0_32px_#ff2d7a60,0_8px_20px_#00000080]',
        ],

        /* used state */
        used && 'opacity-30 border-[#333] cursor-not-allowed',

        /* disabled state */
        !used && disabled && 'opacity-50 cursor-not-allowed',

        /* hover — only when interactive */
        !disabled && !used && !active && [
          'hover:border-[#c026d3]',
          'hover:[box-shadow:0_0_10px_#7b2fff60]',
          'hover:-translate-y-0.5',
        ],
      )}
    >
      <span className="text-3xl leading-none">{icon}</span>
      <span
        className={cn(
          'text-[10px] font-mono uppercase tracking-wide leading-tight text-center',
          !used ? 'text-[#c026d3]' : 'text-[#555]',
          active && '[filter:drop-shadow(0_0_6px_#ff2d7a)] text-[#ff2d7a]',
        )}
      >
        {label}
      </span>

      {used && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#444] rotate-[-20deg]">
            USED
          </span>
        </span>
      )}
    </button>
  )
}
