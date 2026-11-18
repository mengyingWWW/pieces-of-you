import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getCard } from '../../data/story'
import { spring } from '../../theme/motion'

const BADGE = 56
const FRAME_W = 390

type BadgeFlightProps = {
  cardId: string
  onComplete: () => void
}

type Point = { x: number; y: number }

/** Convert a viewport rect into unscaled coordinates inside the device frame. */
function toFrameLocal(rect: DOMRect, frameRect: DOMRect, scale: number) {
  return {
    left: (rect.left - frameRect.left) / scale,
    top: (rect.top - frameRect.top) / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  }
}

export function BadgeFlight({ cardId, onComplete }: BadgeFlightProps) {
  const card = getCard(cardId)
  const [from, setFrom] = useState<Point | null>(null)
  const [to, setTo] = useState<Point | null>(null)

  useEffect(() => {
    const cardEl = document.querySelector(`[data-played-card="${cardId}"]`)
    const pillEl = document.querySelector('[data-memory-path-pill]')
    const frameEl = document.querySelector('[data-device-frame]') ?? document.querySelector('#root')
    if (!cardEl || !pillEl || !frameEl) {
      onComplete()
      return
    }

    const frameRect = frameEl.getBoundingClientRect()
    const scale = frameRect.width / FRAME_W || 1
    const cardLocal = toFrameLocal(cardEl.getBoundingClientRect(), frameRect, scale)
    const pillLocal = toFrameLocal(pillEl.getBoundingClientRect(), frameRect, scale)

    setFrom({
      x: cardLocal.left + cardLocal.width / 2 - BADGE / 2,
      y: cardLocal.top + cardLocal.height * 0.35 - BADGE / 2,
    })
    setTo({
      x: pillLocal.left + pillLocal.width / 2 - BADGE / 2,
      y: pillLocal.top + pillLocal.height / 2 - BADGE / 2,
    })
  }, [cardId, onComplete])

  if (!from || !to) return null

  const midX = from.x + (to.x - from.x) * 0.45
  const midY = Math.min(from.y, to.y) - 70

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute z-50 overflow-hidden rounded-full"
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
