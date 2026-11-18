import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getCard } from '../../data/story'
import { spring } from '../../theme/motion'

const BADGE = 56

type BadgeFlightProps = {
  cardId: string
  /** Index of the progress slot this badge will land in (0-based). */
  slotIndex: number
  onComplete: () => void
}

type Point = { x: number; y: number }

export function BadgeFlight({ cardId, slotIndex, onComplete }: BadgeFlightProps) {
  const card = getCard(cardId)
  const [from, setFrom] = useState<Point | null>(null)
  const [to, setTo] = useState<Point | null>(null)

  useEffect(() => {
    const cardEl = document.querySelector(`[data-played-card="${cardId}"]`)
    const slotEl = document.querySelector(`[data-progress-slot="${slotIndex}"]`)
    if (!cardEl || !slotEl) {
      onComplete()
      return
    }

    const cardRect = cardEl.getBoundingClientRect()
    const slotRect = slotEl.getBoundingClientRect()

    setFrom({
      x: cardRect.left + cardRect.width / 2 - BADGE / 2,
      y: cardRect.top + cardRect.height * 0.35 - BADGE / 2,
    })
    setTo({
      x: slotRect.left + slotRect.width / 2 - BADGE / 2,
      y: slotRect.top + slotRect.height / 2 - BADGE / 2,
    })
  }, [cardId, slotIndex, onComplete])

  if (!from || !to) return null

  const midX = from.x + (to.x - from.x) * 0.45
  const midY = Math.min(from.y, to.y) - 70

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-50 overflow-hidden rounded-full"
      style={{
        width: BADGE,
        height: BADGE,
        left: 0,
        top: 0,
        boxShadow: '0 0 0 3px #fff, 0 8px 24px rgb(0 0 0 / 0.14)',
      }}
      initial={{ x: from.x, y: from.y, scale: 0.7, opacity: 0.9 }}
      animate={{
        x: [from.x, midX, to.x],
        y: [from.y, midY, to.y],
        scale: [0.85, 1.05, 0.35],
        opacity: [0.95, 1, 1],
      }}
      transition={{ duration: 0.85, ease: [0.4, 0.1, 0.2, 1] }}
      onAnimationComplete={onComplete}
    >
      <img src={card.image} alt="" className="size-full object-cover" draggable={false} />
    </motion.div>
  )
}

export function BadgeToast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={spring}
      className="pointer-events-none absolute inset-x-0 top-[calc(var(--safe-top)+56px+6px)] z-30 flex justify-center"
    >
      <span className="rounded-full bg-surface/90 px-3 py-1 text-caption text-mint-deep shadow-soft backdrop-blur-md">
        +1 piece of Wren
      </span>
    </motion.div>
  )
}
