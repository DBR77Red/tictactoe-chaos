'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Card } from './Card'
import type { CardId } from '@/lib/types'

type Props = {
  cards: CardId[]
  activeCard: CardId | null
  onCardClick: (cardId: CardId) => void
  myTurn: boolean
}

export function CardDeck({ cards, activeCard, onCardClick, myTurn }: Props) {
  const t = useTranslations('cards')

  const handleClick = (cardId: CardId) => {
    // Toggle: clicking active card again cancels
    onCardClick(activeCard === cardId ? (null as unknown as CardId) : cardId)
  }

  // Always render 3 slots
  const slots = Array.from({ length: 3 }, (_, i) => cards[i] ?? null)

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#7b2fff] [filter:drop-shadow(0_0_6px_#7b2fff)]">
        {t('yourHand')}
      </span>

      <div className="flex items-end gap-3">
        {slots.map((cardId, i) =>
          cardId ? (
            <Card
              key={cardId}
              cardId={cardId}
              active={activeCard === cardId}
              disabled={!myTurn}
              onClick={() => handleClick(cardId)}
            />
          ) : (
            <div
              key={`empty-${i}`}
              className={cn(
                'w-20 h-28 rounded-lg',
                'border border-dashed border-[#7b2fff30]',
                'bg-[#12111a]/40',
              )}
            />
          )
        )}
      </div>
    </div>
  )
}
