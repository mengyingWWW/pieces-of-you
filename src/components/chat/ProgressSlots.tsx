import { motion } from 'framer-motion'
import { getCard } from '../../data/story'
import { spring } from '../../theme/motion'

const TOTAL = 4
const SIZE = 16

type ProgressSlotsProps = {
  played: string[]
  /** Slot index currently receiving a badge pop (0-based). */
  poppingIndex?: number | null
}

export function ProgressSlots({ played, poppingIndex = null }: ProgressSlotsProps) {
  return (
    <div
      role="status"
      aria-label={`${played.length} of ${TOTAL} pieces`}
      className="flex items-center"
      style={{ gap: 6 }}
      data-progress-slots
    >
      {Array.from({ length: TOTAL }, (_, i) => {
        const cardId = played[i]
        const card = cardId ? getCard(cardId) : null
        const popping = poppingIndex === i

        return (
          <motion.span
            key={i}
            data-progress-slot={i}
            aria-hidden
            className="relative block overflow-hidden rounded-full"
            style={{
              width: SIZE,
              height: SIZE,
              boxShadow: card
                ? '0 0 0 1.5px #fff, 0 1px 3px rgb(0 0 0 / 0.12)'
                : 'inset 0 0 0 1px var(--color-label-tertiary)',
              background: card ? undefined : 'transparent',
            }}
            animate={popping ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={popping ? { ...spring, stiffness: 420, damping: 14 } : undefined}
          >
            {card && (
              <img src={card.image} alt="" className="size-full object-cover" draggable={false} />
            )}
          </motion.span>
        )
      })}
    </div>
  )
}
