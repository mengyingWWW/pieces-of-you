import { Ellipsis } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { spring } from '../../theme/motion'

type MemoryPathButtonProps = {
  /** Kept for Chat API compatibility; unused visually. */
  count?: number
  /** Land ceremony: button pop + mint ring. */
  popping?: boolean
  /** Unread mint dot until Memory Path is opened. */
  unread?: boolean
  onClick: () => void
}

export function MemoryPathButton({
  popping = false,
  unread = false,
  onClick,
}: MemoryPathButtonProps) {
  return (
    <motion.button
      type="button"
      data-memory-path-entry
      onClick={onClick}
      aria-label="Wren's memory path"
      whileTap={{ scale: 0.92 }}
      animate={popping ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={popping ? { ...spring, stiffness: 420, damping: 14 } : spring}
      className="relative flex size-9 items-center justify-center rounded-full bg-transparent text-label-secondary"
    >
      <Ellipsis size={20} strokeWidth={1.75} absoluteStrokeWidth aria-hidden />

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
