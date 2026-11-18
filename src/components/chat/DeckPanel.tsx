import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useGame } from '../../state/GameContext'
import { CardBack } from './CardBack'

const DECK_W = 78
const DECK_H = 104

export function DeckPanel() {
  const { deck, phase, busy, revealing, drawCard } = useGame()
  const reduceMotion = useReducedMotion()
  const unlocked = phase === 'draw' && !busy && !revealing
  const visibleCount = deck.length
  const [lockedHint, setLockedHint] = useState(false)

  useEffect(() => {
    if (!lockedHint) return
    const timer = window.setTimeout(() => setLockedHint(false), 1500)
    return () => clearTimeout(timer)
  }, [lockedHint])

  function handleTap() {
    if (unlocked) {
      drawCard()
      return
    }
    setLockedHint(true)
  }

  const layers = Math.max(visibleCount, visibleCount === 0 ? 0 : 1)

  return (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        onClick={handleTap}
        aria-label={unlocked ? 'Draw a moment' : 'Deck locked'}
        animate={lockedHint ? { x: [0, -7, 7, -5, 5, -2, 0] } : { x: 0 }}
        transition={lockedHint ? { duration: 0.42 } : undefined}
        className="relative h-[112px] w-[90px]"
        style={{ pointerEvents: revealing ? 'none' : 'auto' }}
      >
        {Array.from({ length: layers }, (_, i) => {
          const depth = layers - 1 - i
          const isTop = i === layers - 1
          return (
            <motion.div
              key={`${layers}-${i}`}
              className="absolute bottom-1 left-1/2"
              style={{
                marginLeft: -DECK_W / 2 + depth * 2.5,
                y: -depth * 2.5,
                zIndex: i,
              }}
              animate={
                unlocked && !reduceMotion && isTop ? { scale: [1, 1.035, 1] } : { scale: 1 }
              }
              transition={
                unlocked && isTop
                  ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                  : undefined
              }
            >
              <div style={{ filter: unlocked ? undefined : 'saturate(0.55) brightness(0.97)' }}>
                <CardBack width={DECK_W} height={DECK_H} glowing={unlocked && isTop} />
              </div>
            </motion.div>
          )
        })}
      </motion.button>

      <div className="mt-1.5 h-4">
        <AnimatePresence mode="wait">
          {lockedHint ? (
            <motion.span
              key="locked"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="block text-center text-[11px] leading-none text-label-tertiary"
            >
              Wren is still talking…
            </motion.span>
          ) : (
            <motion.span
              key="draw"
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="block max-w-[220px] text-center text-[11px] leading-tight text-mint-deep"
            >
              A memory is surfacing — draw it
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
