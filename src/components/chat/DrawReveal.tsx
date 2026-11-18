import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion'
import { getCard } from '../../data/story'
import { spring } from '../../theme/motion'
import { CardBack } from './CardBack'
import { MomentCard } from './MomentCard'

const REVEAL_W = 260
const REVEAL_H = 347
const SWIPE_THRESHOLD = 120
const FLICK_VELOCITY = -700

type Phase = 'enter' | 'anticipate' | 'flip' | 'settle' | 'ready' | 'exit'

type DrawRevealProps = {
  cardId: string
  onShow: () => void
}

export function DrawReveal({ cardId, onShow }: DrawRevealProps) {
  const card = getCard(cardId)
  const reduceMotion = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(reduceMotion ? 'ready' : 'enter')
  const shownRef = useRef(false)

  useEffect(() => {
    shownRef.current = false
    if (reduceMotion) {
      setPhase('ready')
      return
    }

    setPhase('enter')
    const timers = [
      window.setTimeout(() => setPhase('anticipate'), 520),
      window.setTimeout(() => setPhase('flip'), 520 + 420),
      window.setTimeout(() => setPhase('settle'), 520 + 420 + 620),
      window.setTimeout(() => setPhase('ready'), 520 + 420 + 620 + 380),
    ]
    return () => timers.forEach(clearTimeout)
  }, [reduceMotion, cardId])

  const flipped = phase === 'flip' || phase === 'settle' || phase === 'ready' || phase === 'exit'
  const settled = phase === 'settle' || phase === 'ready' || phase === 'exit'
  const canShow = phase === 'ready'

  function commitShow() {
    if (!canShow || shownRef.current) return
    shownRef.current = true
    setPhase('exit')
    // Play immediately so the next draw can't race a delayed handoff.
    onShow()
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (!canShow || shownRef.current) return
    const farEnough = info.offset.y < -SWIPE_THRESHOLD
    const flicked = info.velocity.y < FLICK_VELOCITY
    if (farEnough || flicked) commitShow()
  }

  return (
    <motion.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgb(255 255 255 / 0)' }}
        animate={{
          backdropFilter: phase === 'exit' ? 'blur(0px)' : 'blur(18px)',
          backgroundColor: phase === 'exit' ? 'rgb(255 255 255 / 0)' : 'rgb(255 255 255 / 0.55)',
        }}
        transition={{ duration: 0.4 }}
      />

      <div className="relative z-10" style={{ perspective: 1400 }}>
        <motion.div
          drag={canShow ? 'y' : false}
          dragConstraints={{ top: -220, bottom: 40 }}
          dragElastic={0.18}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          initial={{ y: 180, scale: 0.42, rotateY: 0, rotateZ: 0 }}
          animate={
            phase === 'exit'
              ? { y: -280, scale: 0.42, opacity: 0, rotateY: 180, rotateZ: -8 }
              : {
                  y: 0,
                  scale: settled ? 1.02 : 1,
                  rotateY: flipped ? 180 : 0,
                  rotateZ: phase === 'anticipate' ? [0, -2.4, 2.2, -1, 0] : 0,
                  opacity: 1,
                }
          }
          whileDrag={canShow ? { scale: 1.03, rotateZ: -5 } : undefined}
          transition={
            phase === 'enter'
              ? { ...spring, stiffness: 260, damping: 22 }
              : phase === 'anticipate'
                ? { duration: 0.4, ease: 'easeInOut' }
                : phase === 'flip'
                  ? { duration: 0.6, ease: [0.4, 0.1, 0.2, 1] }
                  : phase === 'settle'
                    ? { type: 'spring', stiffness: 380, damping: 16 }
                    : phase === 'exit'
                      ? { duration: 0.38, ease: [0.4, 0, 0.7, 1] }
                      : spring
          }
          style={{
            transformStyle: 'preserve-3d',
            width: REVEAL_W,
            height: REVEAL_H,
            touchAction: canShow ? 'none' : undefined,
            cursor: canShow ? 'grab' : 'default',
          }}
          className="relative"
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: 18 }}
          >
            <CardBack width={REVEAL_W} height={REVEAL_H} glowing />
            <AnimatePresence>
              {phase === 'anticipate' && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  initial={{ x: '-120%', opacity: 0 }}
                  animate={{ x: '120%', opacity: [0, 0.7, 0] }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  style={{
                    background:
                      'linear-gradient(105deg, transparent 35%, rgb(255 255 255 / 0.55) 50%, transparent 65%)',
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: 18,
            }}
          >
            <motion.div
              className="size-full"
              initial={{ opacity: 0.3, filter: 'brightness(0.8)' }}
              animate={
                flipped
                  ? { opacity: 1, filter: settled ? 'brightness(1)' : 'brightness(0.92)' }
                  : { opacity: 0.3, filter: 'brightness(0.8)' }
              }
              transition={{ duration: 0.4 }}
            >
              <MomentCard card={card} width={REVEAL_W} height={REVEAL_H} showTitle={false} />
            </motion.div>

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-2.5 pb-2.5 pt-10"
              style={{
                background: settled
                  ? 'linear-gradient(to top, rgb(255 255 255 / 0.5) 40%, transparent)'
                  : 'transparent',
              }}
            >
              <div
                className="rounded-[12px] px-2.5 py-2"
                style={{
                  background: 'rgb(255 255 255 / 0.72)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  opacity: settled ? 1 : 0,
                }}
              >
                <motion.p
                  className="text-left text-[13px] leading-[16px] font-medium text-label"
                  initial={{ opacity: 0, y: 8 }}
                  animate={settled ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  transition={{ delay: settled ? 0.08 : 0, duration: 0.32 }}
                >
                  {card.title}
                </motion.p>
                <motion.p
                  className="mt-0.5 text-left text-[11px] leading-[14px] text-label-secondary"
                  initial={{ opacity: 0, y: 8 }}
                  animate={settled ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  transition={{ delay: settled ? 0.24 : 0, duration: 0.32 }}
                >
                  {card.subtitle}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 mt-5 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: canShow ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center gap-1" aria-hidden={!canShow}>
          <motion.span
            animate={canShow && !reduceMotion ? { y: [0, -5, 0] } : { y: 0 }}
            transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
            className="text-label-tertiary"
          >
            <ChevronUp />
          </motion.span>
          <p className="text-caption text-label-secondary">Swipe up to show Wren</p>
        </div>
        <button
          type="button"
          disabled={!canShow}
          onClick={commitShow}
          className="mt-1 text-caption font-medium text-mint-deep disabled:opacity-0"
        >
          Show Wren
        </button>
      </motion.div>
    </motion.div>
  )
}

function ChevronUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M4 11.5L9 6.5l5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
