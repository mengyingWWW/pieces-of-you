import { useEffect } from 'react'
import { motion, useDragControls, type PanInfo } from 'framer-motion'
import type { Card } from '../../data/story'
import { spring } from '../../theme/motion'
import { MomentCard } from '../chat/MomentCard'

const CARD_W = 200
const CARD_H = 267

type BadgeSheetProps = {
  card: Card
  onClose: () => void
}

export function BadgeSheet({ card, onClose }: BadgeSheetProps) {
  const dragControls = useDragControls()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 80 || info.velocity.y > 600) onClose()
  }

  return (
    <motion.div className="absolute inset-0 z-40 flex flex-col justify-end" initial={false}>
      <motion.button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-label/15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />

      <motion.div
        role="dialog"
        aria-modal
        aria-label={card.title}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.55 }}
        onDragEnd={handleDragEnd}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={spring}
        className="relative z-10 max-h-[86%] overflow-y-auto rounded-t-[28px] px-6 pt-3 pb-[calc(var(--safe-bottom)+28px)]"
        style={{
          background: 'rgb(255 255 255 / 0.78)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 -8px 40px rgb(0 0 0 / 0.08)',
        }}
      >
        <button
          type="button"
          aria-label="Drag to close"
          className="mx-auto flex h-7 w-full items-center justify-center"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <span className="h-1 w-10 rounded-full bg-label/20" />
        </button>

        <div className="mt-3 flex flex-col items-center">
          <MomentCard card={card} width={CARD_W} height={CARD_H} />
          <p className="mt-4 max-w-[260px] text-center text-callout text-label-secondary">
            {card.subtitle}
          </p>
          <p className="mt-5 max-w-[280px] text-center text-callout text-label-secondary italic">
            “{card.reflection[0]}”
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
