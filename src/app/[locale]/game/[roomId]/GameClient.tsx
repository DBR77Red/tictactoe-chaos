'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRoom } from '@/hooks/useRoom'
import { useGame } from '@/hooks/useGame'
import { Board } from '@/components/game/Board'
import { MultiBoard } from '@/components/game/MultiBoard'
import { UltimateBoard } from '@/components/game/UltimateBoard'
import { CardDeck } from '@/components/game/CardDeck'
import { GameStatus } from '@/components/game/GameStatus'
import { getWinningLine, isCellFrozen } from '@/lib/game-logic'
import type { CardId, ClassicBoard, MultiBoard as MultiBoardType, UltimateBoard as UltimateBoardType } from '@/lib/types'

type Props = { roomId: string }

function RoomCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-mono uppercase tracking-widest text-[#555]">Share this code</span>
      <button
        onClick={copy}
        className="px-8 py-4 font-mono text-3xl font-bold tracking-[0.3em] bg-[#12111a] border-2 border-[#7b2fff] text-[#ff2d7a] [filter:drop-shadow(0_0_10px_#ff2d7a)] [box-shadow:0_0_20px_#7b2fff40] hover:border-[#ff2d7a] transition-all rounded-lg cursor-pointer"
      >
        {code}
      </button>
      <span className="text-xs font-mono text-[#7b2fff]">
        {copied ? '✓ Copied!' : 'Click to copy'}
      </span>
    </div>
  )
}

// Cards that need a cell target selected on the board
const CELL_TARGET_CARDS = new Set<CardId>(['erase', 'mirror_strike'])
// Cards played immediately with no target
const INSTANT_CARDS = new Set<CardId>(['spawn_board', 'nine_grid', 'double_down', 'time_warp'])

export function GameClient({ roomId }: Props) {
  const router = useRouter()
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const t = useTranslations('game')

  const { room, isLoading: roomLoading } = useRoom(roomId)

  const { gameState, myMark, myTurn, myCards, activeCard, doubleDownActive,
    setActiveCard, playMove, playCard, connectionStatus } = useGame(
    roomId,
    room ?? { player_x: null, player_o: null }
  )

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <span className="text-sm font-mono uppercase tracking-widest text-[#7b2fff] animate-pulse">
          Loading...
        </span>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-4">
        <span className="text-sm font-mono text-[#ff2d7a]">Room not found.</span>
        <button
          onClick={() => router.push(`/${locale}`)}
          className="text-xs font-mono uppercase tracking-widest text-[#7b2fff] underline"
        >
          {t('goHome')}
        </button>
      </div>
    )
  }

  const board = gameState?.board
  const isGameOver = !!gameState?.winner

  // Compute winning line for classic boards
  const winningLine = board?.mode === 'classic'
    ? getWinningLine((board as ClassicBoard).cells)
    : null

  // Compute frozen cells for the current turn
  const frozenCells: number[] = []
  if (gameState?.frozen && 'type' in gameState.frozen) {
    for (let i = 0; i < 9; i++) {
      if (isCellFrozen(gameState.frozen, i, gameState.turnNumber)) {
        frozenCells.push(i)
      }
    }
  }

  // Handle card activation
  const handleCardClick = async (cardId: CardId) => {
    if (!myTurn) return

    // Toggle off
    if (activeCard === cardId) {
      setActiveCard(null)
      return
    }

    // Instant-play cards (no target needed)
    if (INSTANT_CARDS.has(cardId)) {
      await playCard(cardId)
      return
    }

    // Target cards: enter selection mode
    setActiveCard(cardId)
  }

  // Handle a cell click — either a normal move or a card target
  const handleCellClick = async (boardIndex: number, cellIndex: number) => {
    if (!myTurn || isGameOver) return

    if (activeCard && CELL_TARGET_CARDS.has(activeCard)) {
      await playCard(activeCard, { boardIndex, cellIndex })
      setActiveCard(null)
    } else if (!activeCard) {
      await playMove(boardIndex, cellIndex)
    }
  }

  const selectionMode = activeCard && CELL_TARGET_CARDS.has(activeCard)
    ? (activeCard === 'erase' ? 'erase' : 'mirror')
    : undefined
  const selectionFilter = selectionMode ? (myMark === 'X' ? 'O' : 'X') : undefined

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-[#7b2fff30]">
        <span className="text-sm font-black font-mono uppercase tracking-widest text-[#ff2d7a] [filter:drop-shadow(0_0_8px_#ff2d7a60)]">
          TTC
        </span>
        <button
          onClick={() => router.push(`/${locale}`)}
          className="text-xs font-mono uppercase tracking-widest text-[#555] hover:text-[#7b2fff] transition-colors"
        >
          {t('goHome')}
        </button>
      </nav>

      {/* Status banner */}
      {gameState && (
        <GameStatus
          turn={gameState.turn}
          myMark={myMark}
          winner={gameState.winner}
          connectionStatus={connectionStatus}
          doubleDownActive={doubleDownActive}
        />
      )}

      {/* Waiting for opponent — show whenever game hasn't started yet */}
      {!gameState && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* Room code — big and copyable */}
          <RoomCodeDisplay code={room.code} />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7b2fff] animate-pulse [box-shadow:0_0_8px_#7b2fff]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#555]">
              Waiting for opponent...
            </span>
          </div>
        </div>
      )}

      {/* Board area */}
      {gameState && board && (
        <div className="flex-1 flex items-center justify-center p-4">
          {board.mode === 'classic' && (
            <Board
              cells={(board as ClassicBoard).cells}
              onCellClick={(cellIndex) => handleCellClick(0, cellIndex)}
              winningLine={winningLine}
              frozenCells={frozenCells}
              selectionMode={selectionMode}
              selectionFilter={selectionFilter}
              disabled={isGameOver || !myTurn}
            />
          )}

          {board.mode === 'multi' && (
            <MultiBoard
              boards={(board as MultiBoardType).boards}
              onCellClick={handleCellClick}
              frozenCells={frozenCells}
              selectionMode={selectionMode}
              selectionFilter={selectionFilter}
              disabled={isGameOver || !myTurn}
            />
          )}

          {board.mode === 'ultimate' && (
            <UltimateBoard
              board={board as UltimateBoardType}
              onCellClick={handleCellClick}
              myMark={myMark}
              frozenCells={frozenCells}
              selectionMode={selectionMode}
              disabled={isGameOver || !myTurn}
            />
          )}
        </div>
      )}

      {/* Card deck — shown during active game only */}
      {gameState && !isGameOver && (
        <div className="pb-6 pt-2 flex justify-center border-t border-[#7b2fff20]">
          <CardDeck
            cards={myCards}
            activeCard={activeCard}
            onCardClick={handleCardClick}
            myTurn={myTurn}
          />
        </div>
      )}

      {/* Game over — go home */}
      {isGameOver && (
        <div className="pb-8 flex justify-center">
          <button
            onClick={() => router.push(`/${locale}`)}
            className="text-xs font-mono uppercase tracking-widest text-[#7b2fff] border border-[#7b2fff30] px-4 py-2 hover:border-[#7b2fff] hover:[box-shadow:0_0_8px_#7b2fff40] transition-all"
          >
            {t('goHome')}
          </button>
        </div>
      )}
    </div>
  )
}
