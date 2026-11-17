import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { getCard } from '../../data/story'
import { useNavigation } from '../../navigation/navigation'
import { useGame } from '../../state/GameContext'
import { spring } from '../../theme/motion'
import { CardBack } from './CardBack'
import { MomentCard } from './MomentCard'

const HAND_W = 84
const HAND_H = 112
const DECK_W = 72
const DECK_H = 96

export function CardHand() {
  const { push } = useNavigation()
  const { hand, deck, canDraw, busy, storyComplete, revealing, drawCard, playCard } = useGame()
  const reduceMotion = useReducedMotion()
  const unlocked = canDraw && !busy && !revealing
  const stackCount = Math.min(3, deck.length)

  if (storyComplete) {
    return (
      <div className="flex h-[132px] flex-col items-center justify-center gap-2.5">
        <p className="text-callout text-label-tertiary">All four pieces shared.</p>
        <motion.button
          type="button"
          onClick={() => push('profile')}
          whileTap={{ opacity: 0.5 }}
          className="rounded-full px-3 py-1 text-caption font-medium text-mint-deep"
        >
          See Wren&apos;s pieces
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex h-[132px] items-end gap-3">
      {stackCount > 0 && (
        <div className="relative flex w-[88px] shrink-0 flex-col items-center">
          <motion.button
            type="button"
            disabled={!unlocked}
            onClick={drawCard}
            aria-label={unlocked ? 'Draw a moment' : 'Deck locked'}
            className="relative h-[104px] w-[80px] disabled:cursor-default"
          >
            {Array.from({ length: stackCount }, (_, i) => {
              const depth = stackCount - 1 - i
              const isTop = i === stackCount - 1
              return (
                <motion.div
                  key={i}
                  className="absolute bottom-1 left-1"
                  style={{ x: depth * 3, y: -depth * 3, zIndex: i }}
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
                  <div style={{ filter: unlocked ? undefined : 'saturate(0.5) brightness(0.97)' }}>
                    <CardBack width={DECK_W} height={DECK_H} glowing={unlocked && isTop} />
                  </div>
                </motion.div>
              )
            })}
          </motion.button>

          <div className="mt-1 h-3">
            <AnimatePresence>
              {unlocked && (
                <motion.span
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="block text-center text-[11px] leading-none text-mint-deep"
                >
                  Draw a moment
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="no-scrollbar flex min-w-0 flex-1 items-end justify-start gap-3 overflow-x-auto pb-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {hand.map((id) => {
            const card = getCard(id)
            return (
              <motion.button
                key={id}
                type="button"
                layout
                disabled={busy || !!revealing}
                onClick={() => playCard(id)}
                initial={{ opacity: 0, scale: 0.85, y: 16 }}
                animate={{ opacity: busy ? 0.55 : 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                whileTap={busy || revealing ? undefined : { y: -6 }}
                transition={spring}
                aria-label={`Show ${card.title}`}
                className="shrink-0 disabled:cursor-default"
              >
                <motion.div
                  whileHover={busy || revealing ? undefined : { y: -6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  style={{
                    borderRadius: 18,
                    boxShadow: '0 2px 8px rgb(0 0 0 / 0.06), 0 14px 32px rgb(0 0 0 / 0.12)',
                  }}
                >
                  <MomentCard card={card} width={HAND_W} height={HAND_H} />
                </motion.div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
