import { AnimatePresence, motion } from 'framer-motion'
import { spring } from '../../theme/motion'

const TOTAL = 4

/** Soft S-curve path, bottom → top (viewBox 0 0 24 24). */
const PATH_D = 'M 8 19.5 C 6 16, 17.5 15, 15.5 11.5 C 13.5 8, 7.5 7, 9.5 3.8'

/** Four progress nodes along the path (bottom → top). */
const NODES: { x: number; y: number }[] = [
  { x: 8.1, y: 18.2 },
  { x: 14.6, y: 14.2 },
  { x: 11.2, y: 9.2 },
  { x: 9.2, y: 5.1 },
]

const SUMMIT = { x: 10.4, y: 2.2 }

type MemoryPathButtonProps = {
  /** Displayed collected count (0–4). */
  count: number
  /** Land ceremony: pop newest node + ring pulse. */
  popping?: boolean
  /** Unread mint dot until Memory Path is opened. */
  unread?: boolean
  onClick: () => void
}

export function MemoryPathButton({
  count,
  popping = false,
  unread = false,
  onClick,
}: MemoryPathButtonProps) {
  const filled = Math.max(0, Math.min(TOTAL, count))
  const poppingIndex = popping && filled > 0 ? filled - 1 : null
  const complete = filled >= TOTAL

  return (
    <motion.button
      type="button"
      data-memory-path-entry
      onClick={onClick}
      aria-label={`Memory path, ${filled} of ${TOTAL} pieces`}
      whileTap={{ scale: 0.92 }}
      transition={spring}
      className="relative flex size-9 items-center justify-center rounded-full bg-transparent"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="overflow-visible">
        {/* Untraveled path */}
        <path
          d={PATH_D}
          stroke="var(--color-label-tertiary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Traveled path (mint), bottom → top by count */}
        <path
          d={PATH_D}
          stroke="var(--color-mint)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={TOTAL}
          strokeDasharray={`${filled} ${TOTAL}`}
          style={{ transition: 'stroke-dasharray 0.35s ease' }}
        />

        {/* Progress nodes */}
        {NODES.map((n, i) => {
          const isFilled = i < filled
          const isPopping = poppingIndex === i
          return (
            <motion.circle
              key={i}
              cx={n.x}
              cy={n.y}
              fill={isFilled ? 'var(--color-mint)' : 'var(--color-background)'}
              stroke={isFilled ? 'var(--color-mint)' : 'var(--color-label-tertiary)'}
              strokeWidth="1.5"
              initial={false}
              animate={isPopping ? { r: [2, 2.8, 2] } : { r: 2 }}
              transition={
                isPopping ? { ...spring, stiffness: 420, damping: 14 } : { duration: 0.25 }
              }
            />
          )
        })}

        {/* Summit: tiny flag */}
        <g>
          <path
            d={`M ${SUMMIT.x} ${SUMMIT.y + 1.4} L ${SUMMIT.x} ${SUMMIT.y - 2}`}
            stroke={complete ? 'var(--color-mint)' : 'var(--color-label-tertiary)'}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d={`M ${SUMMIT.x} ${SUMMIT.y - 2} L ${SUMMIT.x + 3} ${SUMMIT.y - 1.15} L ${SUMMIT.x} ${SUMMIT.y - 0.35} Z`}
            fill={complete ? 'var(--color-mint)' : 'none'}
            stroke={complete ? 'var(--color-mint)' : 'var(--color-label-tertiary)'}
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          {complete && (
            <circle
              cx={SUMMIT.x + 0.6}
              cy={SUMMIT.y - 1.15}
              r="3.6"
              fill="color-mix(in srgb, var(--color-mint) 28%, transparent)"
              style={{ filter: 'blur(1.2px)' }}
            />
          )}
        </g>
      </svg>

      <AnimatePresence>
        {popping && (
          <motion.span
            key="ring"
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.7, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              boxShadow: '0 0 0 1.5px color-mix(in srgb, var(--color-mint) 65%, white)',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {unread && (
          <motion.span
            key="dot"
            aria-hidden
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={spring}
            className="absolute right-1 top-1 size-[7px] rounded-full bg-mint"
            style={{
              boxShadow: '0 0 0 1.5px color-mix(in srgb, var(--color-background) 90%, white)',
            }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}
