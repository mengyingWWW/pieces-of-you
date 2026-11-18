import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type PresenceProps = {
  size?: number
  className?: string
  /** 0–4 evolution stage based on cards played / summit. */
  stage?: number
  /** Stronger pulse while Wren is waiting. */
  waiting?: boolean
  /** Increments to trigger a one-shot climax pulse. */
  pulseKey?: number
}

function clampStage(stage: number) {
  return Math.max(0, Math.min(4, Math.round(stage)))
}

export function Presence({
  size = 160,
  className = '',
  stage = 0,
  waiting = false,
  pulseKey = 0,
}: PresenceProps) {
  const reduceMotion = useReducedMotion()
  const s = clampStage(stage)
  const [pulsing, setPulsing] = useState(false)

  useEffect(() => {
    if (!pulseKey || reduceMotion) return
    setPulsing(true)
    const timer = window.setTimeout(() => setPulsing(false), 920)
    return () => clearTimeout(timer)
  }, [pulseKey, reduceMotion])

  // Fill grows more translucent as Wren becomes "line-figure".
  const fillOpacity = [1, 0.92, 0.78, 0.55, 0.22][s]!
  const outerRing = [0, 0.35, 0.55, 0.75, 0.95][s]!
  const innerRing = [0, 0, 0.28, 0.5, 0.7][s]!
  const breathDuration = s >= 4 ? 5.2 : waiting ? 2.1 : 4

  return (
    <motion.div
      aria-hidden
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      animate={
        reduceMotion
          ? undefined
          : pulsing
            ? { scale: [1, 1.18, 1] }
            : waiting
              ? { scale: [1, 1.1, 1] }
              : { scale: [1, s >= 4 ? 1.03 : 1.04, 1] }
      }
      transition={
        pulsing
          ? { duration: 0.9, ease: 'easeInOut' }
          : { duration: breathDuration, ease: 'easeInOut', repeat: Infinity }
      }
    >
      {/* Soft fill */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ opacity: fillOpacity }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #ffffff 0%, var(--color-mint-soft) 45%, color-mix(in srgb, var(--color-mint) 28%, var(--color-mint-soft)) 100%)',
          boxShadow: `0 1px 2px rgb(0 0 0 / 0.03), 0 ${size * 0.07}px ${size * 0.22}px color-mix(in srgb, var(--color-mint) 18%, transparent)`,
        }}
      />

      {/* Outer luminous ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ opacity: outerRing }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        style={{
          boxShadow: `
            0 0 0 ${Math.max(1.2, size * 0.015)}px color-mix(in srgb, var(--color-mint) 70%, white),
            0 0 ${size * 0.18}px color-mix(in srgb, var(--color-mint) 45%, transparent),
            inset 0 0 ${size * 0.08}px color-mix(in srgb, var(--color-mint) 20%, transparent)
          `,
        }}
      />

      {/* Inner fainter ring */}
      <motion.div
        className="absolute rounded-full"
        animate={{ opacity: innerRing }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        style={{
          inset: size * 0.18,
          boxShadow: `
            0 0 0 ${Math.max(1, size * 0.01)}px color-mix(in srgb, var(--color-mint) 50%, white),
            0 0 ${size * 0.1}px color-mix(in srgb, var(--color-mint) 30%, transparent)
          `,
        }}
      />

      {/* Stage 4: gentle inner light core */}
      <motion.div
        className="absolute rounded-full"
        animate={{ opacity: s >= 4 ? 0.85 : 0 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        style={{
          inset: size * 0.34,
          background:
            'radial-gradient(circle, rgb(255 255 255 / 0.95) 0%, color-mix(in srgb, var(--color-mint) 35%, white) 55%, transparent 100%)',
          filter: `blur(${size * 0.02}px)`,
        }}
      />
    </motion.div>
  )
}
