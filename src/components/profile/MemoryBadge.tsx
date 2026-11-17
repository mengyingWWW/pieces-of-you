import { motion, useReducedMotion } from 'framer-motion'
import type { Card } from '../../data/story'

const SIZE = 96

type MemoryBadgeProps = {
  card: Card | null
  shimmer?: boolean
  onClick?: () => void
}

export function MemoryBadge({ card, shimmer = false, onClick }: MemoryBadgeProps) {
  const reduceMotion = useReducedMotion()

  if (!card) {
    return (
      <div className="flex w-[112px] flex-col items-center text-center">
        <div
          aria-label="Not yet shared"
          className="flex size-24 items-center justify-center rounded-full border-[1.5px] border-dashed border-outline"
        >
          <span className="text-title text-label-tertiary">?</span>
        </div>
        <p className="mt-2.5 line-clamp-2 text-caption text-label-tertiary">Not yet shared</p>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={card.title}
      className="flex w-[112px] flex-col items-center text-center"
    >
      <div
        className="relative overflow-hidden rounded-full"
        style={{
          width: SIZE,
          height: SIZE,
          boxShadow:
            '0 0 0 3px #fff, 0 1px 2px rgb(0 0 0 / 0.04), 0 6px 16px rgb(0 0 0 / 0.08), 0 14px 32px rgb(0 0 0 / 0.06)',
        }}
      >
        <img src={card.image} alt="" className="size-full object-cover" draggable={false} />
        {shimmer && !reduceMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '120%', opacity: [0, 0.55, 0] }}
            transition={{ duration: 0.95, ease: 'easeInOut', delay: 0.15 }}
            style={{
              background:
                'linear-gradient(105deg, transparent 30%, rgb(255 255 255 / 0.7) 50%, transparent 70%)',
            }}
          />
        )}
      </div>
      <p className="mt-2.5 line-clamp-2 text-caption text-label">{card.title}</p>
    </button>
  )
}
