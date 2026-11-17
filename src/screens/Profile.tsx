import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeSheet } from '../components/profile/BadgeSheet'
import { MemoryBadge } from '../components/profile/MemoryBadge'
import { Presence } from '../components/Presence'
import { TopBar } from '../components/TopBar'
import { getCard, story } from '../data/story'
import { useNavigation } from '../navigation/navigation'
import { useGame } from '../state/GameContext'
import { profileStatus } from '../state/gameReducer'

export function Profile() {
  const { pop, resetTo } = useNavigation()
  const { played, seenBadges, storyComplete, markBadgesSeen, reset } = useGame()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [shimmerIds, setShimmerIds] = useState<string[]>([])
  const openedRef = useRef(false)

  useEffect(() => {
    if (openedRef.current) return
    openedRef.current = true
    const fresh = played.filter((id) => !seenBadges.includes(id))
    setShimmerIds(fresh)
    const timer = window.setTimeout(() => {
      markBadgesSeen()
      setShimmerIds([])
    }, 1400)
    return () => clearTimeout(timer)
  }, [played, seenBadges, markBadgesSeen])

  const status = profileStatus(played.length, storyComplete)
  const selected = selectedId ? getCard(selectedId) : null

  function handleStartOver() {
    reset()
    resetTo('home')
  }

  return (
    <div className="relative h-full overflow-hidden">
      <TopBar backLabel="Chat" onBack={pop} />

      <main className="h-full overflow-y-auto px-5 pt-[calc(var(--safe-top)+44px+28px)] pb-[calc(var(--safe-bottom)+24px)]">
        <section className="flex flex-col items-center text-center">
          <Presence size={128} />
          <h1 className="mt-5 text-title text-label">{story.companionName}</h1>
          <p className="mt-1 max-w-[260px] text-callout text-label-secondary">{status}</p>
          <p className="mt-2 text-caption text-label-secondary">
            {played.length} of 4 pieces
          </p>
        </section>

        <section className="mt-10">
          <h2 className="px-1 pb-3 text-caption uppercase tracking-wide text-label-secondary">
            Memory book
          </h2>
          <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-8 rounded-lg bg-surface px-4 py-8 shadow-soft">
            {story.cards.map((card) => {
              const collected = played.includes(card.id)
              return (
                <MemoryBadge
                  key={card.id}
                  card={collected ? card : null}
                  shimmer={shimmerIds.includes(card.id)}
                  onClick={collected ? () => setSelectedId(card.id) : undefined}
                />
              )
            })}
          </div>
        </section>

        <div className="mt-12 flex justify-center pb-2">
          <motion.button
            type="button"
            onClick={handleStartOver}
            whileTap={{ opacity: 0.45 }}
            className="text-caption text-label-tertiary"
          >
            Start over
          </motion.button>
        </div>
      </main>

      <AnimatePresence>
        {selected && (
          <BadgeSheet key={selected.id} card={selected} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
