'use client'

import { useTranslations } from 'next-intl'
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
    onCardClick(activeCard === cardId ? (null as unknown as CardId) : cardId)
  }

  // Always render 3 slots
  const slots = Array.from({ length: 3 }, (_, i) => cards[i] ?? null)

  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="uppercase tracking-[0.25em]"
        style={{
          fontFamily: 'var(--font-rajdhani)',
          fontSize: 11,
          fontWeight: 600,
          color: '#9B5CF6',
          filter: 'drop-shadow(0 0 6px #9B5CF6)',
        }}
      >
        {t('yourHand')}
      </span>

      <div className="flex items-end gap-3 px-4">
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
              style={{
                width: 140,
                minHeight: 200,
                borderRadius: 12,
                border: '2px dashed rgba(155,92,246,0.2)',
                background: 'rgba(13,13,43,0.4)',
              }}
            />
          )
        )}
      </div>
    </div>
  )
}
