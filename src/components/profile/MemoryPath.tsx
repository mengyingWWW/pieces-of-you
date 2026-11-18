import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { getCard, story } from '../../data/story'
import { PATH_NODE_LABELS, unlockedPathCount } from '../../state/gameReducer'
import { spring } from '../../theme/motion'
import { Presence } from '../Presence'

const VB_W = 320
const VB_H = 920
const NODE_R = 36

/** Bottom → top node centers in SVG space. */
const NODES: { x: number; y: number }[] = [
  { x: 160, y: 840 }, // start
  { x: 96, y: 700 }, // badge 1
  { x: 224, y: 560 }, // badge 2
  { x: 96, y: 420 }, // badge 3
  { x: 224, y: 280 }, // badge 4
  { x: 160, y: 120 }, // summit
]

/** Soft winding path through the nodes. */
const PATH_D = [
  `M ${NODES[0]!.x} ${NODES[0]!.y}`,
  `C 90 800, 70 740, ${NODES[1]!.x} ${NODES[1]!.y}`,
  `C 130 640, 250 620, ${NODES[2]!.x} ${NODES[2]!.y}`,
  `C 250 500, 70 480, ${NODES[3]!.x} ${NODES[3]!.y}`,
  `C 130 360, 250 340, ${NODES[4]!.x} ${NODES[4]!.y}`,
  `C 250 220, 160 180, ${NODES[5]!.x} ${NODES[5]!.y}`,
].join(' ')

type MemoryPathProps = {
  played: string[]
  storyComplete: boolean
  pathSeen: number
  onMarkSeen: (count: number) => void
  onCeremonyProgress?: (revealedNodes: number) => void
  onOpenBadge: (cardId: string) => void
}

export function MemoryPath({
  played,
  storyComplete,
  pathSeen,
  onMarkSeen,
  onCeremonyProgress,
  onOpenBadge,
}: MemoryPathProps) {
  const reduceMotion = useReducedMotion()
  const scrollRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<SVGPathElement>(null)
  const onMarkSeenRef = useRef(onMarkSeen)
  const onProgressRef = useRef(onCeremonyProgress)
  onMarkSeenRef.current = onMarkSeen
  onProgressRef.current = onCeremonyProgress

  const unlocked = unlockedPathCount(played.length, storyComplete)

  const [revealedThrough, setRevealedThrough] = useState(pathSeen)
  const [popping, setPopping] = useState<number | null>(null)
  const [pathLen, setPathLen] = useState(1)
  const [segEnds, setSegEnds] = useState<number[]>([])
  const [shakeId, setShakeId] = useState<number | null>(null)
  const [glowProgress, setGlowProgress] = useState(0)
  const ceremonyKeyRef = useRef<string | null>(null)

  const teasers = useMemo(() => {
    const remaining = story.cards.filter((c) => !played.includes(c.id))
    const pool = remaining.length > 0 ? remaining : story.cards
    return Array.from({ length: 4 }, (_, i) => pool[i % pool.length]!)
  }, [played])

  // Measure path + cumulative lengths at each node.
  useEffect(() => {
    const path = measureRef.current
    if (!path) return
    const total = path.getTotalLength()
    setPathLen(total)
    const ends = NODES.map((n) => {
      let best = 0
      let bestDist = Infinity
      for (let i = 0; i <= 240; i++) {
        const pt = path.getPointAtLength((total * i) / 240)
        const d = (pt.x - n.x) ** 2 + (pt.y - n.y) ** 2
        if (d < bestDist) {
          bestDist = d
          best = (total * i) / 240
        }
      }
      return best
    })
    setSegEnds(ends)
    const seenIdx = Math.max(0, Math.min(pathSeen, ends.length) - 1)
    setGlowProgress(ends[seenIdx]! / total)
  }, [pathSeen])

  // Auto-scroll so newest unlocked node is in view.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.max(0, unlocked - 1)
    const timer = window.setTimeout(() => {
      const node = el.querySelector(`[data-path-node="${idx}"]`)
      node?.scrollIntoView({ block: 'center', behavior: 'smooth', inline: 'nearest' })
    }, 100)
    return () => clearTimeout(timer)
  }, [unlocked])

  // Unlock ceremonies for newly unlocked nodes.
  useEffect(() => {
    if (segEnds.length < 6) return

    if (reduceMotion) {
      setRevealedThrough(unlocked)
      setGlowProgress(segEnds[unlocked - 1]! / pathLen)
      onProgressRef.current?.(unlocked)
      onMarkSeenRef.current(unlocked)
      return
    }

    if (unlocked <= pathSeen) {
      setRevealedThrough(pathSeen)
      onProgressRef.current?.(pathSeen)
      return
    }

    const key = `${pathSeen}->${unlocked}`
    if (ceremonyKeyRef.current === key) return
    ceremonyKeyRef.current = key

    // Already-seen nodes should appear unlocked before the light travels further.
    setRevealedThrough(pathSeen)
    onProgressRef.current?.(pathSeen)

    let cancelled = false
    let finished = false

    async function run() {
      await wait(300)
      if (cancelled) return

      for (let node = pathSeen; node < unlocked; node++) {
        if (cancelled) return
        const fromLen = segEnds[node - 1] ?? 0
        const toLen = segEnds[node] ?? pathLen
        const start = performance.now()
        await new Promise<void>((resolve) => {
          const step = (now: number) => {
            if (cancelled) return resolve()
            const t = Math.min(1, (now - start) / 900)
            const eased = 1 - (1 - t) ** 3
            setGlowProgress((fromLen + (toLen - fromLen) * eased) / pathLen)
            if (t < 1) requestAnimationFrame(step)
            else resolve()
          }
          requestAnimationFrame(step)
        })
        if (cancelled) return
        const current = node + 1
        setRevealedThrough(current)
        onProgressRef.current?.(current)
        setPopping(node)
        await wait(700)
        setPopping(null)
        await wait(180)
      }
      if (!cancelled) {
        finished = true
        onMarkSeenRef.current(unlocked)
      }
    }

    run()
    return () => {
      cancelled = true
      if (!finished) ceremonyKeyRef.current = null
    }
  }, [unlocked, pathSeen, reduceMotion, segEnds, pathLen])

  function handleNodeTap(index: number) {
    if (index === 0 || index === 5) return
    const badgeIndex = index - 1
    if (badgeIndex < played.length) {
      onOpenBadge(played[badgeIndex]!)
      return
    }
    setShakeId(index)
    window.setTimeout(() => setShakeId(null), 420)
  }

  const traveledLen = glowProgress * pathLen

  return (
    <div ref={scrollRef} className="relative no-scrollbar h-full overflow-y-auto">
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: 360, height: VB_H }}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          {/* Measurement path (invisible) */}
          <path ref={measureRef} d={PATH_D} fill="none" stroke="transparent" strokeWidth="1" />

          {/* Untraveled dashed */}
          <path
            d={PATH_D}
            fill="none"
            stroke="var(--color-label-tertiary)"
            strokeWidth="2"
            strokeDasharray="5 8"
            strokeLinecap="round"
            opacity="0.55"
          />
          {/* Traveled glow bloom */}
          <path
            d={PATH_D}
            fill="none"
            stroke="color-mix(in srgb, var(--color-mint) 55%, white)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.22"
            style={{
              strokeDasharray: pathLen,
              strokeDashoffset: pathLen - traveledLen,
            }}
          />
          {/* Traveled core */}
          <path
            d={PATH_D}
            fill="none"
            stroke="var(--color-mint)"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: pathLen,
              strokeDashoffset: pathLen - traveledLen,
              filter: 'drop-shadow(0 0 4px color-mix(in srgb, var(--color-mint) 50%, transparent))',
            }}
          />
        </svg>

        {NODES.map((n, i) => {
          const unlockedNode = i < revealedThrough
          const isBadge = i >= 1 && i <= 4
          const isSummit = i === 5
          const isStart = i === 0
          const cardId = isBadge ? played[i - 1] : null
          const card = cardId ? getCard(cardId) : null
          const teaser = isBadge ? teasers[i - 1] : null
          const left = `${(n.x / VB_W) * 100}%`
          const top = `${(n.y / VB_H) * 100}%`

          return (
            <motion.button
              key={i}
              type="button"
              data-path-node={i}
              onClick={() => handleNodeTap(i)}
              className="absolute flex w-[120px] -translate-x-1/2 -translate-y-1/2 flex-col items-center bg-transparent"
              style={{ left, top }}
              animate={
                shakeId === i
                  ? { x: [0, -6, 6, -4, 4, 0] }
                  : popping === i
                    ? { scale: [1, 1.15, 1] }
                    : { scale: 1, x: 0 }
              }
              transition={
                shakeId === i
                  ? { duration: 0.4 }
                  : popping === i
                    ? { ...spring, stiffness: 380, damping: 14 }
                    : spring
              }
            >
              {isStart && (
                <div className="relative flex size-[52px] items-center justify-center">
                  <Presence size={48} stage={0} />
                </div>
              )}

              {isBadge && (
                <div className="relative">
                  <div
                    className="relative overflow-hidden rounded-full"
                    style={{
                      width: NODE_R * 2,
                      height: NODE_R * 2,
                      boxShadow: unlockedNode
                        ? '0 0 0 3px #fff, 0 4px 16px rgb(0 0 0 / 0.1)'
                        : '0 0 0 3px rgb(255 255 255 / 0.7), 0 4px 12px rgb(0 0 0 / 0.06)',
                    }}
                  >
                    {teaser && (
                      <img
                        src={teaser.image}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                        style={{
                          filter: 'blur(7px) saturate(0.55) brightness(0.95)',
                          opacity: unlockedNode ? 0 : 1,
                          transition: 'opacity 0.55s ease',
                        }}
                        draggable={false}
                      />
                    )}
                    {card && (
                      <img
                        src={card.image}
                        alt=""
                        className="absolute inset-0 size-full object-cover"
                        style={{
                          opacity: unlockedNode ? 1 : 0,
                          transition: 'opacity 0.55s ease',
                        }}
                        draggable={false}
                      />
                    )}
                    {!unlockedNode && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <LockIcon />
                      </span>
                    )}
                  </div>
                  <AnimatePresence>
                    {popping === i && (
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-full"
                        initial={{ scale: 1, opacity: 0.45 }}
                        animate={{ scale: 1.7, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        style={{
                          boxShadow: '0 0 0 2px color-mix(in srgb, var(--color-mint) 60%, white)',
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              {isSummit && (
                <div className="relative flex size-[72px] items-center justify-center">
                  <Presence size={64} stage={unlockedNode ? 4 : 0} />
                  {!unlockedNode && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/40">
                      <LockIcon />
                    </span>
                  )}
                  <AnimatePresence>
                    {popping === i && (
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-full"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.85, opacity: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          boxShadow: '0 0 0 2px color-mix(in srgb, var(--color-mint) 65%, white)',
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}

              <p
                className={`mt-2 text-center text-caption font-medium ${
                  unlockedNode || isStart ? 'text-label' : 'text-label-tertiary'
                }`}
                style={
                  isSummit && unlockedNode
                    ? { animation: 'none' }
                    : isSummit && !unlockedNode
                      ? { opacity: 0.55 }
                      : undefined
                }
              >
                {isSummit ? (
                  <motion.span
                    initial={false}
                    animate={{ opacity: unlockedNode ? 1 : 0.55 }}
                    transition={{ duration: 0.55 }}
                  >
                    {PATH_NODE_LABELS[i]}
                  </motion.span>
                ) : (
                  PATH_NODE_LABELS[i]
                )}
              </p>
              {isBadge && card && unlockedNode && (
                <p className="mt-0.5 line-clamp-2 max-w-[110px] text-center text-[11px] leading-[14px] text-label-secondary">
                  {card.title}
                </p>
              )}
            </motion.button>
          )
        })}

        {storyComplete && revealedThrough >= 6 && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="absolute left-1/2 w-[240px] -translate-x-1/2 text-center text-callout text-label-secondary"
            style={{ top: `${((NODES[5]!.y + 78) / VB_H) * 100}%` }}
          >
            That part was always real.
          </motion.p>
        )}
      </div>
    </div>
  )
}

function wait(ms: number) {
  return new Promise<void>((r) => window.setTimeout(r, ms))
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="8"
        height="6"
        rx="1.5"
        fill="rgb(255 255 255 / 0.85)"
        stroke="var(--color-label-tertiary)"
        strokeWidth="1"
      />
      <path
        d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6"
        stroke="var(--color-label-tertiary)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
