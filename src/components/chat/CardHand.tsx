import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useNavigation } from '../../navigation/navigation'
import { useGame } from '../../state/GameContext'
import { CardBack } from './CardBack'

const DECK_W = 78
const DECK_H = 104

export function CardHand() {
  const { push } = useNavigation()
  const { deck, canDraw, busy, storyComplete, revealing, drawCard } = useGame()
  const reduceMotion = useReducedMotion()
  const unlocked = canDraw && !busy && !revealing
  const locked = !unlocked && deck.length > 0 && !storyComplete
  const stackCount = deck.length
  const [lockedHint, setLockedHint] = useState(false)

  useEffect(() => {
    if (!lockedHint) return
    const timer = window.setTimeout(() => setLockedHint(false), 1500)
    return () => clearTimeout(timer)
  }, [lockedHint])

  function handleDeckTap() {
    if (unlocked) {
      drawCard()
      return
    }
    if (locked) setLockedHint(true)
  }

  return (
    <div className="relative flex h-[132px] items-center justify-center">
      <AnimatePresence mode="wait">
        {storyComplete ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-2.5"
          >
            <p className="text-callout text-label-tertiary">All four pieces shared.</p>
            <motion.button
              type="button"
              onClick={() => push('profile')}
              whileTap={{ opacity: 0.5 }}
              className="rounded-full px-3 py-1 text-caption font-medium text-mint-deep"
            >
              See Wren&apos;s pieces
            </motion.button>
          </motion.div>
        ) : stackCount > 0 ? (
          <motion.div
            key="deck"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="flex flex-col items-center"
          >
            <motion.button
              type="button"
              onClick={handleDeckTap}
              aria-label={unlocked ? 'Draw a moment' : 'Deck locked'}
              animate={lockedHint ? { x: [0, -7, 7, -5, 5, -2, 0] } : { x: 0 }}
              transition={lockedHint ? { duration: 0.42 } : undefined}
              className="relative h-[112px] w-[90px]"
              style={{ pointerEvents: revealing ? 'none' : 'auto' }}
            >
              {Array.from({ length: stackCount }, (_, i) => {
                const depth = stackCount - 1 - i
                const isTop = i === stackCount - 1
                return (
                  <motion.div
                    key={`${stackCount}-${i}`}
                    className="absolute bottom-1 left-1/2"
                    style={{
                      marginLeft: -DECK_W / 2 + depth * 2.5,
                      y: -depth * 2.5,
                      zIndex: i,
                    }}
                    animate={
                      unlocked && !reduceMotion && isTop
                        ? { scale: [1, 1.03, 1] }
                        : { scale: 1 }
                    }
                    transition={
                      unlocked && isTop
                        ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
                        : undefined
                    }
                  >
                    <div
                      style={{
                        filter: unlocked ? undefined : 'saturate(0.5) brightness(0.97)',
                      }}
                    >
                      <CardBack width={DECK_W} height={DECK_H} glowing={unlocked && isTop} />
                    </div>
                  </motion.div>
                )
              })}
            </motion.button>

            <div className="mt-1 h-4">
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
                ) : unlocked ? (
                  <motion.span
                    key="draw"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="block text-center text-[11px] leading-none text-mint-deep"
                  >
                    Draw a moment
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" className="h-[112px]" aria-hidden />
        )}
      </AnimatePresence>
    </div>
  )
}
