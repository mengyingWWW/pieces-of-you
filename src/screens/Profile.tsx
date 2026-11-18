import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeSheet } from '../components/profile/BadgeSheet'
import { MemoryPath } from '../components/profile/MemoryPath'
import { Presence } from '../components/Presence'
import { TopBar } from '../components/TopBar'
import { getCard, story } from '../data/story'
import { useNavigation } from '../navigation/navigation'
import { useGame } from '../state/GameContext'
import { profileStatus, unlockedPathCount } from '../state/gameReducer'

export function Profile() {
  const { pop, resetTo } = useNavigation()
  const { played, storyComplete, pathSeen, orbStage, markPathSeen, markBadgesSeen, reset } =
    useGame()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [displayUnlock, setDisplayUnlock] = useState(() =>
    Math.max(0, Math.min(pathSeen, unlockedPathCount(played.length, storyComplete)) - 1),
  )

  // Clear the Chat pill unread dot when Memory Path is opened.
  useEffect(() => {
    markBadgesSeen()
  }, [markBadgesSeen])

  const selected = selectedId ? getCard(selectedId) : null
  const status = profileStatus(Math.min(displayUnlock, played.length), storyComplete && displayUnlock >= 5)

  const handleMarkSeen = useCallback(
    (count: number) => {
      markPathSeen(count)
    },
    [markPathSeen],
  )

  const handleCeremonyProgress = useCallback((revealedNodes: number) => {
    // revealedNodes is 1-based count of unlocked nodes; badges = nodes 1..4 → played count
    setDisplayUnlock(Math.max(0, revealedNodes - 1))
  }, [])

  function handleStartOver() {
    reset()
    resetTo('home')
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <TopBar backLabel="Chat" onBack={pop} />

      <header className="relative z-[1] flex shrink-0 flex-col items-center px-5 pt-[calc(var(--safe-top)+44px+12px)] pb-3 text-center">
        <Presence size={56} stage={Math.min(orbStage, Math.max(0, displayUnlock))} />
        <h1 className="mt-2 text-title text-label">{story.companionName}</h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="mt-1 max-w-[280px] text-callout text-label-secondary"
          >
            {status}
          </motion.p>
        </AnimatePresence>
      </header>

      <div className="relative min-h-0 flex-1">
        <MemoryPath
          played={played}
          storyComplete={storyComplete}
          pathSeen={pathSeen}
          onMarkSeen={handleMarkSeen}
          onCeremonyProgress={handleCeremonyProgress}
          onOpenBadge={(id) => setSelectedId(id)}
        />
      </div>

      <div className="relative z-[1] flex shrink-0 justify-center pb-[calc(var(--safe-bottom)+16px)] pt-2">
        <motion.button
          type="button"
          onClick={handleStartOver}
          whileTap={{ opacity: 0.45 }}
          className="text-caption text-label-tertiary"
        >
          Start over
        </motion.button>
      </div>

      <AnimatePresence>
        {selected && (
          <BadgeSheet key={selected.id} card={selected} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
