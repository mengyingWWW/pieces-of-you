import { motion, useReducedMotion } from 'framer-motion'
import { breathing } from '../theme/motion'

type PresenceProps = {
  size?: number
  className?: string
}

export function Presence({ size = 160, className = '' }: PresenceProps) {
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
        boxShadow: `0 1px 2px rgb(0 0 0 / 0.03), 0 ${size * 0.07}px ${size * 0.22}px color-mix(in srgb, var(--color-mint) 18%, transparent)`,
      }}
      animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
      transition={breathing}
    />
  )
}
