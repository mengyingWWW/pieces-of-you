import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'framer-motion'

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
    color: 'radial-gradient(circle, #5fd4b4 0%, #2ec4a0 42%, transparent 72%)',
    size: 0.8,
    x: -16,
    y: -10,
    duration: 6.5,
    delay: 0,
  },
  {
    color: 'radial-gradient(circle, #d4c8f0 0%, #c5b4e3 35%, #b8d4f0 55%, transparent 72%)',
    size: 0.58,
    x: -10,
    y: 22,
    duration: 7.5,
    delay: -2,
  },
  {
    color: 'radial-gradient(circle, #f8d5c4 0%, #f0c0a8 40%, transparent 70%)',
    size: 0.5,
    x: 18,
    y: -20,
    duration: 5.2,
    delay: -1,
  },
  {
    color: 'radial-gradient(circle, #a8e8d5 0%, #7ddbc4 40%, transparent 70%)',
    size: 0.64,
    x: 20,
    y: 12,
    duration: 4.8,
    delay: -1.6,
  },
] as const

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/** Irregular voice-like scale keyframes for one speaking phrase. */
function speakingKeyframes(durationSec: number) {
  const swellsPerSec = rand(2.2, 3.6)
  const count = Math.max(3, Math.round(durationSec * swellsPerSec))
  const scales: number[] = [1]
  const times: number[] = [0]
  for (let i = 1; i <= count; i++) {
    const peak = i % 2 === 1 ? rand(1.02, 1.05) : rand(1.005, 1.02)
    scales.push(peak)
    times.push(i / (count + 1))
  }
  scales.push(1)
  times.push(1)
  return { scales, times, durationSec }
}

function wait(ms: number) {
  return new Promise<void>((r) => window.setTimeout(r, ms))
}

export const LivingOrb = forwardRef<LivingOrbHandle, LivingOrbProps>(function LivingOrb(
  { size = 180, className = '' },
  ref,
) {
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [engaged, setEngaged] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const wakeTimer = useRef<number | null>(null)
  const pulsingRef = useRef(false)

  // Inner: continuous breath / speaking rhythm.
  const voiceScale = useMotionValue(1)
  const glowOpacity = useMotionValue(0.7)
  const coreOpacity = useMotionValue(0.72)
  // Outer: hover/hold awaken + start-talking wake boost.
  const boostScale = useMotionValue(1)

  useImperativeHandle(
    ref,
    () => ({
      wake: () =>
        new Promise<void>((resolve) => {
          if (reduceMotion) {
            resolve()
            return
          }
          pulsingRef.current = true
          setPulsing(true)
          setEngaged(true)
          animate(boostScale, [1, 1.08, 1.04], { duration: 0.42, ease: 'easeInOut' })
          if (wakeTimer.current) window.clearTimeout(wakeTimer.current)
          wakeTimer.current = window.setTimeout(() => {
            pulsingRef.current = false
            setPulsing(false)
            setEngaged(false)
            animate(boostScale, 1, { type: 'spring', stiffness: 240, damping: 20 })
            resolve()
          }, 420)
        }),
    }),
    [reduceMotion, boostScale],
  )

  // Idle breath + randomized speaking phrases (never a fixed loop).
  useEffect(() => {
    if (reduceMotion) {
      voiceScale.set(1)
      glowOpacity.set(0.65)
      coreOpacity.set(0.7)
      return
    }

    let cancelled = false
    let breathCtrl: { stop: () => void } | null = null

    function startBreath() {
      breathCtrl?.stop()
      breathCtrl = animate(voiceScale, [1, 1.03, 1], {
        duration: 4,
        ease: 'easeInOut',
        repeat: Infinity,
      })
      animate(glowOpacity, 0.7, { duration: 0.55 })
      animate(coreOpacity, 0.72, { duration: 0.55 })
    }

    async function loop() {
      while (!cancelled) {
        const calm = rand(2.2, 4.2)
        startBreath()
        setSpeaking(false)
        await wait(calm * 1000)
        if (cancelled) return
        if (pulsingRef.current) {
          await wait(400)
          continue
        }

        breathCtrl?.stop()
        setSpeaking(true)
        const phrase = speakingKeyframes(rand(1.5, 2.5))
        animate(glowOpacity, [0.7, 0.92, 0.78, 0.9, 0.72], {
          duration: phrase.durationSec,
          ease: 'easeInOut',
        })
        animate(coreOpacity, [0.72, 0.95, 0.8, 0.92, 0.75], {
          duration: phrase.durationSec,
          ease: 'easeInOut',
        })

        await new Promise<void>((resolve) => {
          animate(voiceScale, phrase.scales, {
            duration: phrase.durationSec,
            times: phrase.times,
            ease: 'easeInOut',
            onComplete: () => resolve(),
          })
        })
        if (cancelled) return
        setSpeaking(false)
      }
    }

    loop()
    return () => {
      cancelled = true
      breathCtrl?.stop()
      if (wakeTimer.current) window.clearTimeout(wakeTimer.current)
    }
  }, [reduceMotion, voiceScale, glowOpacity, coreOpacity])

  // Hover / hold awakening boost (composes with voice scale).
  useEffect(() => {
    if (reduceMotion || pulsing) return
    animate(boostScale, engaged ? 1.06 : 1, {
      type: 'spring',
      stiffness: 220,
      damping: 18,
    })
  }, [engaged, pulsing, reduceMotion, boostScale])

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
  const blobSpeed = awake ? 0.4 : speaking ? 0.55 : 1
  const sat = awake ? 1.22 : speaking ? 1.1 : 1
  const glowStrength = pulsing ? 0.42 : awake ? 0.36 : speaking ? 0.3 : 0.22

  return (
    <motion.div
      ref={rootRef}
      aria-hidden
      className={`relative shrink-0 touch-manipulation select-none ${className}`}
      style={{
        width: size,
        height: size,
        scale: boostScale,
        ['--orb-speed' as string]: blobSpeed,
        ['--orb-sat' as string]: sat,
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerMove={onPointerMove}
    >
      <motion.div className="absolute inset-0" style={{ scale: voiceScale }}>
        {/* Soft outer glow */}
        <motion.div
          className="pointer-events-none absolute inset-[-14%] rounded-full"
          style={{
            opacity: glowOpacity,
            background: `radial-gradient(circle, color-mix(in srgb, var(--color-mint) ${glowStrength * 100}%, transparent) 0%, transparent 68%)`,
            transform: `scale(${pulsing ? 1.12 : awake ? 1.08 : speaking ? 1.05 : 1})`,
            transition: 'transform 0.5s ease',
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
          <motion.div
            className="absolute inset-0"
            animate={reduceMotion ? { x: 0, y: 0 } : { x: parallax.x, y: parallax.y }}
            transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.6 }}
            style={{
              filter: `saturate(var(--orb-sat)) ${
                pulsing
                  ? 'brightness(1.14)'
                  : awake
                    ? 'brightness(1.08)'
                    : speaking
                      ? 'brightness(1.05)'
                      : 'brightness(1)'
              }`,
              transition: 'filter 0.45s ease',
            }}
          >
            {BLOBS.map((blob, i) => {
              const dim = size * blob.size
              return (
                <div
                  key={i}
                  className={
                    reduceMotion ? 'absolute rounded-full' : 'absolute rounded-full living-orb-blob'
                  }
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

          <motion.div
            className="pointer-events-none absolute inset-[28%] rounded-full"
            style={{
              opacity: coreOpacity,
              background:
                'radial-gradient(circle, rgb(255 255 255 / 0.85) 0%, rgb(255 255 255 / 0.25) 45%, transparent 75%)',
            }}
          />

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
    </motion.div>
  )
})
