import { AnimatePresence, motion } from 'framer-motion'
import { spring } from '../../theme/motion'

const TOTAL = 4

type MemoryPathPillProps = {
  /** Displayed collected count (0–4). */
  count: number
  /** Pop + count roll + ring pulse after a badge lands. */
  popping?: boolean
  /** Unread mint dot until Memory Path is opened. */
  unread?: boolean
  onClick: () => void
}

export function MemoryPathPill({
  count,
  popping = false,
  unread = false,
  onClick,
}: MemoryPathPillProps) {
  const empty = count <= 0

  return (
    <motion.button
      type="button"
      data-memory-path-pill
      onClick={onClick}
      aria-label={`${count} of ${TOTAL} pieces. Open Memory Path.`}
      whileTap={{ opacity: 0.55 }}
      animate={popping ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={popping ? { ...spring, stiffness: 420, damping: 14 } : spring}
      className="relative flex h-[30px] min-w-[58px] items-center justify-center gap-1.5 rounded-full border-[0.5px] border-hairline px-2.5 glass shadow-soft"
    >
      <StackedCardsIcon />

      <span
        className={`relative inline-flex h-[18px] min-w-[26px] items-center justify-center overflow-hidden text-caption tabular-nums ${
          empty ? 'text-label-tertiary' : 'text-label-secondary'
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={popping ? { y: 10, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {count}/{TOTAL}
          </motion.span>
        </AnimatePresence>
        {/* Reserve layout width so the bar never shifts. */}
        <span className="invisible">{count}/{TOTAL}</span>
      </span>

      <AnimatePresence>
        {popping && (
          <motion.span
            key="ring"
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.65, opacity: 0 }}
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
            className="absolute -right-0.5 -top-0.5 size-[7px] rounded-full bg-mint"
            style={{
              boxShadow: '0 0 0 1.5px color-mix(in srgb, var(--color-background) 90%, white)',
            }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function StackedCardsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0">
      {/* Back card */}
      <rect
        x="3.2"
        y="1.6"
        width="7.2"
        height="9.2"
        rx="1.4"
        stroke="var(--color-mint)"
        strokeWidth="1.15"
        opacity="0.45"
        transform="rotate(12 7 7)"
      />
      {/* Front card */}
      <rect
        x="2.4"
        y="2.8"
        width="7.2"
        height="9.2"
        rx="1.4"
        stroke="var(--color-mint)"
        strokeWidth="1.2"
      />
    </svg>
  )
}
