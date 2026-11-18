import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export type LivingOrbHandle = {
  /** Brighten + pulse once, resolves after ~400ms. */
  wake: () => Promise<void>
}

type LivingOrbProps = {
  size?: number
  className?: string
}

const BLOBS = [
  {
    // Dominant mint
    color: 'radial-gradient(circle, #5fd4b4 0%, #2ec4a0 42%, transparent 72%)',
    size: 0.8,
    x: -16,
    y: -10,
    duration: 11,
    delay: 0,
  },
  {
    // Soft lavender + pale sky blend
    color: 'radial-gradient(circle, #d4c8f0 0%, #c5b4e3 35%, #b8d4f0 55%, transparent 72%)',
    size: 0.58,
    x: -10,
    y: 22,
    duration: 12,
    delay: -3.5,
  },
  {
    // Light peach
    color: 'radial-gradient(circle, #f8d5c4 0%, #f0c0a8 40%, transparent 70%)',
    size: 0.5,
    x: 18,
    y: -20,
    duration: 8.5,
    delay: -1.5,
  },
  {
    // Lighter mint
    color: 'radial-gradient(circle, #a8e8d5 0%, #7ddbc4 40%, transparent 70%)',
    size: 0.64,
    x: 20,
    y: 12,
    duration: 9.5,
    delay: -2.2,
  },
] as const

export const LivingOrb = forwardRef<LivingOrbHandle, LivingOrbProps>(function LivingOrb(
  { size = 180, className = '' },
  ref,
) {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [engaged, setEngaged] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const wakeTimer = useRef<number | null>(null)

  useImperativeHandle(
    ref,
    () => ({
      wake: () =>
        new Promise<void>((resolve) => {
          if (reduceMotion) {
            resolve()
            return
          }
          setPulsing(true)
          setEngaged(true)
          if (wakeTimer.current) window.clearTimeout(wakeTimer.current)
          wakeTimer.current = window.setTimeout(() => {
            setPulsing(false)
            setEngaged(false)
            resolve()
          }, 420)
        }),
    }),
    [reduceMotion],
  )

  useEffect(() => {
    return () => {
      if (wakeTimer.current) window.clearTimeout(wakeTimer.current)
    }
  }, [])

  const updateParallax = useCallback(
    (clientX: number, clientY: number) => {
      if (reduceMotion) return
      const el = rootRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const nx = Math.max(-1, Math.min(1, (clientX - cx) / (rect.width / 2)))
      const ny = Math.max(-1, Math.min(1, (clientY - cy) / (rect.height / 2)))
      setParallax({ x: nx * 8, y: ny * 8 })
    },
    [reduceMotion],
  )

  function clearParallax() {
    setParallax({ x: 0, y: 0 })
  }

  function onPointerEnter(e: ReactPointerEvent) {
    if (e.pointerType === 'mouse') {
      setEngaged(true)
      updateParallax(e.clientX, e.clientY)
    }
  }

  function onPointerLeave() {
    if (!pulsing) setEngaged(false)
    clearParallax()
  }

  function onPointerDown(e: ReactPointerEvent) {
    if (e.pointerType !== 'mouse') {
      setEngaged(true)
      updateParallax(e.clientX, e.clientY)
      rootRef.current?.setPointerCapture(e.pointerId)
    }
  }

  function onPointerUp(e: ReactPointerEvent) {
    if (e.pointerType !== 'mouse' && !pulsing) {
      setEngaged(false)
      clearParallax()
    }
  }

  function onPointerMove(e: ReactPointerEvent) {
    if (e.pointerType === 'mouse' || engaged) {
      updateParallax(e.clientX, e.clientY)
    }
  }

  const awake = engaged || pulsing
  const breathScale = reduceMotion ? 1 : pulsing ? 1.08 : awake ? 1.06 : undefined

  return (
    <motion.div
      ref={rootRef}
      aria-hidden
      className={`relative shrink-0 touch-manipulation select-none ${className}`}
      style={{
        width: size,
        height: size,
        ['--orb-speed' as string]: awake ? 0.5 : 1,
        ['--orb-sat' as string]: awake ? 1.2 : 1,
        ['--orb-glow' as string]: pulsing ? '0.42' : awake ? '0.34' : '0.22',
      }}
      animate={
        reduceMotion
          ? { scale: 1 }
          : breathScale != null
            ? { scale: breathScale }
            : { scale: [1, 1.03, 1] }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : breathScale != null
            ? { type: 'spring', stiffness: 220, damping: 18 }
            : { duration: 4, ease: 'easeInOut', repeat: Infinity }
      }
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerMove={onPointerMove}
    >
      {/* Soft outer glow */}
      <div
        className="pointer-events-none absolute inset-[-12%] rounded-full transition-[opacity,transform] duration-700 ease-out"
        style={{
          opacity: pulsing ? 0.95 : awake ? 0.85 : 0.7,
          transform: `scale(${pulsing ? 1.12 : awake ? 1.06 : 1})`,
          background: `radial-gradient(circle, color-mix(in srgb, var(--color-mint) calc(var(--orb-glow) * 100%), transparent) 0%, transparent 68%)`,
        }}
      />

      {/* Glass sphere shell */}
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          boxShadow: `
            0 1px 2px rgb(0 0 0 / 0.04),
            0 ${size * 0.06}px ${size * 0.2}px color-mix(in srgb, var(--color-mint) 16%, transparent),
            inset 0 0 0 1px rgb(255 255 255 / 0.55),
            inset 0 ${-size * 0.02}px ${size * 0.12}px rgb(255 255 255 / 0.35),
            inset 0 ${size * 0.08}px ${size * 0.18}px rgb(46 196 160 / 0.08)
          `,
          background:
            'radial-gradient(circle at 50% 55%, rgb(255 255 255 / 0.55) 0%, rgb(245 246 245 / 0.35) 45%, rgb(228 247 241 / 0.5) 100%)',
        }}
      >
        {/* Liquid light blobs */}
        <motion.div
          className="absolute inset-0"
          animate={
            reduceMotion
              ? { x: 0, y: 0 }
              : { x: parallax.x, y: parallax.y }
          }
          transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.6 }}
          style={{
            filter: `saturate(var(--orb-sat)) ${pulsing ? 'brightness(1.12)' : awake ? 'brightness(1.06)' : 'brightness(1)'}`,
            transition: 'filter 0.7s ease',
          }}
        >
          {BLOBS.map((blob, i) => {
            const dim = size * blob.size
            return (
              <div
                key={i}
                className={reduceMotion ? 'absolute rounded-full' : 'absolute rounded-full living-orb-blob'}
                style={{
                  width: dim,
                  height: dim,
                  left: `calc(50% + ${blob.x}% - ${dim / 2}px)`,
                  top: `calc(50% + ${blob.y}% - ${dim / 2}px)`,
                  background: blob.color,
                  filter: `blur(${size * 0.09}px)`,
                  opacity: reduceMotion ? 0.85 : undefined,
                  ...(reduceMotion
                    ? {}
                    : {
                        animationDuration: `calc(${blob.duration}s * var(--orb-speed))`,
                        animationDelay: `${blob.delay}s`,
                      }),
                }}
              />
            )
          })}
        </motion.div>

        {/* Soft core light */}
        <div
          className="pointer-events-none absolute inset-[28%] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgb(255 255 255 / 0.85) 0%, rgb(255 255 255 / 0.25) 45%, transparent 75%)',
            opacity: pulsing ? 0.95 : 0.7,
            transition: 'opacity 0.4s ease',
          }}
        />

        {/* Specular highlight (top-left) */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: '42%',
            height: '28%',
            left: '14%',
            top: '10%',
            background:
              'radial-gradient(ellipse at center, rgb(255 255 255 / 0.95) 0%, rgb(255 255 255 / 0.35) 40%, transparent 70%)',
            filter: `blur(${size * 0.015}px)`,
          }}
        />

        {/* Faint rim light */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow: `
              inset 0 0 0 1px rgb(255 255 255 / 0.4),
              inset 0 ${size * 0.02}px ${size * 0.06}px rgb(255 255 255 / 0.5),
              inset ${-size * 0.01}px ${-size * 0.02}px ${size * 0.08}px rgb(46 196 160 / 0.15)
            `,
          }}
        />
      </div>
    </motion.div>
  )
})
