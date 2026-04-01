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
import { getWinningLine, isCellFrozen, isCellVoided } from '@/lib/game-logic'
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
const CELL_TARGET_CARDS = new Set<CardId>(['erase', 'mirror_strike', 'shield', 'void', 'clone'])
// Cards played immediately with no target
const INSTANT_CARDS = new Set<CardId>(['nine_grid', 'double_down', 'time_warp'])
// Cards that need a row/col picker
const ROW_COL_CARDS = new Set<CardId>(['freeze'])
// Cards that need a board direction picker
const LAYOUT_CARDS = new Set<CardId>(['spawn_board'])

const LAYOUT_OPTIONS: { label: string; value: MultiBoardType['layout'] }[] = [
  { label: '↑ Above', value: 'above' },
  { label: '↓ Below', value: 'below' },
  { label: '← Left',  value: 'left'  },
  { label: '→ Right', value: 'right' },
]

export function GameClient({ roomId }: Props) {
  const router = useRouter()
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const t = useTranslations('game')

  const { room, isLoading: roomLoading } = useRoom(roomId)

  const { gameState, myMark, myTurn, myCards, activeCard, doubleDownActive,
    cloneStep, cloneSrc, setActiveCard, playMove, playCard, connectionStatus } = useGame(
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

  const winningLine = board?.mode === 'classic'
    ? getWinningLine((board as ClassicBoard).cells)
    : null

  const frozenCells: number[] = []
  if (gameState?.frozen && 'type' in gameState.frozen) {
    for (let i = 0; i < 9; i++) {
      if (isCellFrozen(gameState.frozen, i, gameState.turnNumber)) {
        frozenCells.push(i)
      }
    }
  }

  // Cards restricted by current board mode
  const restrictedCards = new Set<CardId>()
  if (gameState?.board.mode === 'classic') {
    restrictedCards.add('double_down')   // needs multiple boards
  }
  if (gameState?.board.mode !== 'classic') {
    restrictedCards.add('spawn_board')   // already in multi/ultimate mode
  }

  const handleCardClick = async (cardId: CardId) => {
    if (!myTurn) return
    if (restrictedCards.has(cardId)) return

    // Toggle off
    if (activeCard === cardId) {
      setActiveCard(null)
      return
    }

    if (INSTANT_CARDS.has(cardId)) {
      await playCard(cardId)
      return
    }

    // Enter selection mode (cell, row/col, or layout picker)
    setActiveCard(cardId)
  }

  const handleCellClick = async (boardIndex: number, cellIndex: number) => {
    if (!myTurn || isGameOver) return

    if (activeCard && CELL_TARGET_CARDS.has(activeCard)) {
      await playCard(activeCard, { boardIndex, cellIndex })
      // Clone step 1 keeps activeCard active for step 2; all others dismiss
      if (activeCard !== 'clone' || cloneStep !== 1) {
        setActiveCard(null)
      }
    } else if (!activeCard) {
      await playMove(boardIndex, cellIndex)
    }
  }

  // Compute selection mode and filter based on active card and clone step
  const selectionMode = (() => {
    if (!activeCard || !CELL_TARGET_CARDS.has(activeCard)) return undefined
    if (activeCard === 'erase') return 'erase' as const
    if (activeCard === 'mirror_strike') return 'mirror' as const
    if (activeCard === 'shield') return 'shield' as const
    if (activeCard === 'void') return 'void' as const
    if (activeCard === 'clone') return cloneStep === 2 ? 'clone_dst' as const : 'clone_src' as const
    return undefined
  })()

  const selectionFilter = (() => {
    if (selectionMode === 'erase' || selectionMode === 'mirror') return (myMark === 'X' ? 'O' : 'X') as 'X' | 'O'
    if (selectionMode === 'shield' || selectionMode === 'clone_src') return myMark ?? undefined
    if (selectionMode === 'void') return null
    return undefined
  })()

  // Compute valid destination cells for Clone step 2
  const cloneSelectableCells = (() => {
    if (selectionMode !== 'clone_dst' || !cloneSrc || !gameState) return undefined
    const { boardIndex: srcBoard, cellIndex: srcCell } = cloneSrc
    const srcRow = Math.floor(srcCell / 3)
    const srcCol = srcCell % 3
    const board = gameState.board
    const getCells = (bi: number) => {
      if (board.mode === 'classic') return board.cells
      return board.boards[bi]?.cells ?? null
    }
    const cells = getCells(srcBoard)
    if (!cells) return undefined
    const valid = Array.from({ length: 9 }, (_, i) => i).filter(i => {
      const row = Math.floor(i / 3)
      const col = i % 3
      return (
        i !== srcCell &&
        Math.abs(row - srcRow) <= 1 &&
        Math.abs(col - srcCol) <= 1 &&
        cells[i] === null &&
        !isCellVoided(gameState.voidedCells ?? [], srcBoard, i)
      )
    })
    return { boardIndex: srcBoard, cells: valid }
  })()

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-[#7b2fff30]">
        <span className="text-sm font-black font-mono uppercase tracking-widest text-[#ff2d7a] [filter:drop-shadow(0_0_8px_#ff2d7a60)]">
          TTC
        </span>
        {myMark && (
          <div className="flex items-center gap-2 px-3 py-1 rounded border"
            style={myMark === 'X'
              ? { borderColor: '#ff2d7a60', backgroundColor: '#ff2d7a10' }
              : { borderColor: '#00d4ff60', backgroundColor: '#00d4ff10' }
            }
          >
            <span className="text-[10px] font-mono uppercase tracking-widest"
              style={{ color: myMark === 'X' ? '#ff2d7a99' : '#00d4ff99' }}
            >
              You are
            </span>
            <span className="text-base font-black font-mono"
              style={myMark === 'X'
                ? { color: '#ff2d7a', filter: 'drop-shadow(0 0 6px #ff2d7a)' }
                : { color: '#00d4ff', filter: 'drop-shadow(0 0 6px #00d4ff)' }
              }
            >
              {myMark}
            </span>
          </div>
        )}
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

      {/* Waiting for opponent */}
      {!gameState && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
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
              erasedCells={
                gameState.erasedCell?.boardIndex === 0 &&
                (gameState.erasedCell.expiresAfterTurn ?? 0) > gameState.turnNumber
                  ? [gameState.erasedCell.cellIndex]
                  : []
              }
              shieldedCells={
                gameState.shieldedCell?.boardIndex === 0 &&
                (gameState.shieldedCell.expiresAfterTurn ?? 0) > gameState.turnNumber
                  ? [gameState.shieldedCell.cellIndex]
                  : []
              }
              voidedCells={(gameState.voidedCells ?? []).filter(v => v.boardIndex === 0).map(v => v.cellIndex)}
              selectionMode={selectionMode}
              selectionFilter={selectionFilter}
              selectableCells={cloneSelectableCells?.boardIndex === 0 ? cloneSelectableCells.cells : undefined}
              disabled={isGameOver || !myTurn}
            />
          )}

          {board.mode === 'multi' && (
            <MultiBoard
              boards={(board as MultiBoardType).boards}
              layout={(board as MultiBoardType).layout}
              onCellClick={handleCellClick}
              frozenCells={frozenCells}
              erasedCell={gameState.erasedCell}
              shieldedCell={gameState.shieldedCell}
              voidedCells={gameState.voidedCells ?? []}
              turnNumber={gameState.turnNumber}
              selectionMode={selectionMode}
              selectionFilter={selectionFilter}
              cloneSelectableCells={cloneSelectableCells}
              disabled={isGameOver || !myTurn}
            />
          )}

          {board.mode === 'ultimate' && (
            <UltimateBoard
              board={board as UltimateBoardType}
              onCellClick={handleCellClick}
              myMark={myMark}
              frozenCells={frozenCells}
              shieldedCell={gameState.shieldedCell}
              voidedCells={gameState.voidedCells ?? []}
              turnNumber={gameState.turnNumber}
              selectionMode={selectionMode}
              selectionFilter={selectionFilter}
              cloneSelectableCells={cloneSelectableCells}
              disabled={isGameOver || !myTurn}
            />
          )}
        </div>
      )}

      {/* Spawn Board direction picker */}
      {gameState && !isGameOver && activeCard === 'spawn_board' && myTurn && (
        <div className="flex flex-col items-center gap-3 py-3 border-t border-[#00e5ff30] bg-[#00e5ff08]">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00e5ff]">
            Choose where to place the new board
          </span>
          <div className="flex gap-2">
            {LAYOUT_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { playCard('spawn_board', { layout: value }); setActiveCard(null) }}
                className="px-3 py-2 text-xs font-mono font-bold border border-[#00e5ff60] text-[#00e5ff] hover:bg-[#00e5ff20] hover:border-[#00e5ff] transition-all rounded"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Freeze row/col picker */}
      {gameState && !isGameOver && activeCard === 'freeze' && myTurn && (
        <div className="flex flex-col items-center gap-2 py-3 border-t border-[#00d4ff30] bg-[#00d4ff08]">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00d4ff]">
            Select row or column to freeze
          </span>
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#555]">Row</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => { playCard('freeze', { type: 'row', index: i }); setActiveCard(null) }}
                    className="w-8 h-8 text-xs font-mono font-bold border border-[#00d4ff60] text-[#00d4ff] hover:bg-[#00d4ff20] hover:border-[#00d4ff] transition-all rounded"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#555]">Col</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <button
                    key={i}
                    onClick={() => { playCard('freeze', { type: 'col', index: i }); setActiveCard(null) }}
                    className="w-8 h-8 text-xs font-mono font-bold border border-[#00d4ff60] text-[#00d4ff] hover:bg-[#00d4ff20] hover:border-[#00d4ff] transition-all rounded"
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card deck */}
      {gameState && !isGameOver && (
        <div className="pb-6 pt-2 flex justify-center border-t border-[#7b2fff20]">
          <CardDeck
            cards={myCards}
            activeCard={activeCard}
            onCardClick={handleCardClick}
            myTurn={myTurn}
            restrictedCards={restrictedCards}
          />
        </div>
      )}

      {/* Game over */}
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
