import { motion, useReducedMotion } from 'framer-motion'
import { breathing } from '../theme/motion'

type PresenceProps = {
  size?: number
  className?: string
  /** Stronger pulse while Wren is waiting for a moment. */
  waiting?: boolean
}

export function Presence({ size = 160, className = '', waiting = false }: PresenceProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      aria-hidden
      className={`shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 35% 30%, #ffffff 0%, var(--color-mint-soft) 45%, color-mix(in srgb, var(--color-mint) 28%, var(--color-mint-soft)) 100%)',
        boxShadow: waiting
          ? `0 0 0 0 rgb(46 196 160 / 0.35), 0 1px 2px rgb(0 0 0 / 0.03), 0 ${size * 0.07}px ${size * 0.22}px color-mix(in srgb, var(--color-mint) 22%, transparent)`
          : `0 1px 2px rgb(0 0 0 / 0.03), 0 ${size * 0.07}px ${size * 0.22}px color-mix(in srgb, var(--color-mint) 18%, transparent)`,
      }}
      animate={
        reduceMotion
          ? undefined
          : waiting
            ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  `0 0 0 0 rgb(46 196 160 / 0.35), 0 ${size * 0.07}px ${size * 0.22}px color-mix(in srgb, var(--color-mint) 22%, transparent)`,
                  `0 0 0 10px rgb(46 196 160 / 0), 0 ${size * 0.07}px ${size * 0.22}px color-mix(in srgb, var(--color-mint) 28%, transparent)`,
                  `0 0 0 0 rgb(46 196 160 / 0.35), 0 ${size * 0.07}px ${size * 0.22}px color-mix(in srgb, var(--color-mint) 22%, transparent)`,
                ],
              }
            : { scale: [1, 1.04, 1] }
      }
      transition={
        waiting
          ? { duration: 2.1, ease: 'easeInOut', repeat: Infinity }
          : breathing
      }
    />
  )
}
