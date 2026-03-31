'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutGrid,
  Eraser,
  Grid2X2,
  ArrowLeftRight,
  Snowflake,
  Zap,
  RotateCcw,
  ShieldCheck,
  Minus,
  Copy,
} from 'lucide-react'
import type { CardId } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

type Props = {
  cardId: CardId
  disabled?: boolean
  active?: boolean
  used?: boolean
  restricted?: boolean   // card is not playable in the current board mode
  onClick: () => void
}

type CardMeta = {
  icon: LucideIcon
  labelKey: string
  color: string
  colorRgb: string
  flavor: string
}

const CARD_META: Record<CardId, CardMeta> = {
  spawn_board: {
    icon: LayoutGrid,
    labelKey: 'spawn_board',
    color: '#00E5FF',
    colorRgb: '0,229,255',
    flavor: 'Expand the battlefield.',
  },
  erase: {
    icon: Eraser,
    labelKey: 'erase',
    color: '#FF2D6B',
    colorRgb: '255,45,107',
    flavor: 'Clean the slate.',
  },
  nine_grid: {
    icon: Grid2X2,
    labelKey: 'nine_grid',
    color: '#9B5CF6',
    colorRgb: '155,92,246',
    flavor: 'Win the board to win the board.',
  },
  mirror_strike: {
    icon: ArrowLeftRight,
    labelKey: 'mirror_strike',
    color: '#FF6B35',
    colorRgb: '255,107,53',
    flavor: 'Their move becomes your weapon.',
  },
  freeze: {
    icon: Snowflake,
    labelKey: 'freeze',
    color: '#00AAFF',
    colorRgb: '0,170,255',
    flavor: 'Time stops — for them.',
  },
  double_down: {
    icon: Zap,
    labelKey: 'double_down',
    color: '#00FF9F',
    colorRgb: '0,255,159',
    flavor: 'One move wasn\'t enough.',
  },
  time_warp: {
    icon: RotateCcw,
    labelKey: 'time_warp',
    color: '#FFD600',
    colorRgb: '255,214,0',
    flavor: 'Rewrite history.',
  },
  shield: {
    icon: ShieldCheck,
    labelKey: 'shield',
    color: '#FFA500',
    colorRgb: '255,165,0',
    flavor: 'Some things cannot be taken.',
  },
  void: {
    icon: Minus,
    labelKey: 'void',
    color: '#6B6B99',
    colorRgb: '107,107,153',
    flavor: 'Some squares stop existing.',
  },
  clone: {
    icon: Copy,
    labelKey: 'clone',
    color: '#00E5CC',
    colorRgb: '0,229,204',
    flavor: 'One becomes two.',
  },
}

export function Card({ cardId, disabled, active, used, restricted, onClick }: Props) {
  const t = useTranslations('cards')
  const { icon: Icon, labelKey, color, colorRgb, flavor } = CARD_META[cardId]

  const name = t(`${labelKey}.name` as Parameters<typeof t>[0])
  const description = t(`${labelKey}.description` as Parameters<typeof t>[0])

  const isInteractive = !disabled && !used && !restricted

  const borderWidth = active ? 3 : 2
  const boxShadow = used
    ? 'none'
    : active
      ? `0 0 12px ${color}, 0 0 36px rgba(${colorRgb},0.5), 0 12px 30px rgba(0,0,0,0.5)`
      : `0 0 8px ${color}, 0 0 20px rgba(${colorRgb},0.3), inset 0 1px 0 rgba(255,255,255,0.05)`

  return (
    <button
      onClick={isInteractive ? onClick : undefined}
      disabled={!isInteractive}
      aria-pressed={active}
      aria-label={name}
      className={cn(
        'relative flex flex-col gap-2 rounded-xl text-left select-none',
        'transition-all duration-200 ease-out',
        'overflow-hidden cursor-pointer',
        used && 'opacity-30 cursor-not-allowed grayscale',
        restricted && 'opacity-40 cursor-not-allowed saturate-50',
        !used && !restricted && disabled && 'opacity-50 cursor-not-allowed',
        isInteractive && !active && 'hover:-translate-y-1.5 hover:scale-[1.03]',
        active && '-translate-y-2.5 scale-[1.05]',
      )}
      style={{
        width: 140,
        minHeight: 200,
        padding: 12,
        background: 'linear-gradient(145deg, #12123A, #0D0D2B)',
        border: `${borderWidth}px solid ${used ? '#333' : color}`,
        borderRadius: 12,
        boxShadow,
      }}
    >
      {/* Inner top glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(${colorRgb},0.06), transparent 40%)`,
        }}
      />

      {/* Zone 1 — Icon + Name */}
      <div className="flex items-start gap-2 relative">
        <span
          className="flex items-center justify-center shrink-0 rounded-lg"
          style={{
            width: 40,
            height: 40,
            border: `1.5px solid rgba(${colorRgb},0.6)`,
            background: `rgba(${colorRgb},0.08)`,
          }}
        >
          <Icon
            size={20}
            style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </span>
        <span
          className="mt-0.5 leading-tight"
          style={{
            fontFamily: 'var(--font-orbitron)',
            fontSize: 11,
            fontWeight: 700,
            color,
            textShadow: `0 0 8px rgba(${colorRgb},0.8)`,
            wordBreak: 'break-word',
          }}
        >
          {name}
        </span>
      </div>

      {/* Zone 2 — Divider */}
      <span
        aria-hidden
        className="block w-full"
        style={{ height: 1, background: `rgba(${colorRgb},0.3)` }}
      />

      {/* Zone 3 — Description */}
      <span
        className="flex-1 relative"
        style={{
          fontFamily: 'var(--font-rajdhani)',
          fontSize: 12,
          fontWeight: 500,
          color: '#9CA3C8',
          lineHeight: 1.4,
        }}
      >
        {description}
      </span>

      {/* Zone 4 — Flavor */}
      <span
        className="relative"
        style={{
          fontFamily: 'var(--font-nunito)',
          fontSize: 11,
          fontStyle: 'italic',
          color: '#5E6390',
          lineHeight: 1.3,
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: 6,
        }}
      >
        {flavor}
      </span>

      {/* Restricted badge */}
      {restricted && !used && (
        <span
          className="absolute bottom-2 inset-x-2 flex items-center justify-center rounded"
          style={{
            background: 'rgba(255,107,53,0.15)',
            border: '1px solid rgba(255,107,53,0.4)',
            padding: '2px 4px',
          }}
        >
          <span
            className="uppercase tracking-widest text-center"
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: 8,
              color: '#FF6B35',
            }}
          >
            MULTI ONLY
          </span>
        </span>
      )}

      {/* Used stamp */}
      {used && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className="rotate-[-20deg] uppercase tracking-widest"
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: 9,
              color: '#444',
            }}
          >
            USED
          </span>
        </span>
      )}
    </button>
  )
}
