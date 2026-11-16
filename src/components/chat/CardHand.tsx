import { AnimatePresence, motion } from 'framer-motion'
import { story } from '../../data/story'
import { useGame } from '../../state/GameContext'
import { spring } from '../../theme/motion'
import { CardIcon } from './CardIcon'

export function CardHand() {
  const { hand, busy, playCard } = useGame()
  const cards = story.cards.filter((c) => hand.includes(c.id))

  if (cards.length === 0) {
    return (
      <div className="flex h-[140px] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-outline">
        <span className="text-callout text-label-secondary">Your hand is empty</span>
        <span className="text-caption text-label-tertiary">Everything you brought has been shared</span>
      </div>
    )
  }

  return (
    <div className="flex h-[140px] items-center justify-center gap-2.5">
      <AnimatePresence mode="popLayout" initial={false}>
        {cards.map((card) => (
          <motion.button
            key={card.id}
            type="button"
            layout
            disabled={busy}
            onClick={() => playCard(card.id)}
            whileTap={{ scale: 0.96 }}
            animate={{ opacity: busy ? 0.5 : 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.92 }}
            transition={spring}
            aria-label={`Show ${card.title}`}
            className="flex h-[128px] w-[112px] flex-col items-start rounded-md bg-surface p-3 text-left shadow-soft disabled:cursor-default"
          >
            <CardIcon icon={card.icon} size={36} />
            <span className="mt-auto text-callout font-semibold text-label">{card.title}</span>
            <span className="line-clamp-2 text-caption text-label-secondary">{card.subtitle}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
