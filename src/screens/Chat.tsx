import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeFlight, BadgeToast } from '../components/chat/BadgeFlight'
import { ChatInput } from '../components/chat/ChatInput'
import { ChatShimmer } from '../components/chat/ChatShimmer'
import { DeckPanel } from '../components/chat/DeckPanel'
import { DrawReveal } from '../components/chat/DrawReveal'
import { MessageList } from '../components/chat/MessageList'
import { ProgressSlots } from '../components/chat/ProgressSlots'
import { SuggestionChips } from '../components/chat/SuggestionChips'
import { Presence } from '../components/Presence'
import { TopBar } from '../components/TopBar'
import { story } from '../data/story'
import { useNavigation } from '../navigation/navigation'
import { useGame } from '../state/GameContext'
import { spring } from '../theme/motion'

export function Chat() {
  const { push, pop } = useNavigation()
  const {
    messages,
    typing,
    played,
    revealing,
    phase,
    stage,
    status,
    flyingBadge,
    storyComplete,
    busy,
    startIntro,
    sendText,
    playRevealed,
    finishBadge,
  } = useGame()

  const [badgeLanded, setBadgeLanded] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(startIntro, [startIntro])

  useEffect(() => {
    if (phase === 'badge' && flyingBadge) {
      setBadgeLanded(false)
      setShowToast(false)
    }
  }, [phase, flyingBadge])

  const handleFlightComplete = useCallback(() => {
    setBadgeLanded(true)
    setShowToast(true)
    window.setTimeout(() => {
      setShowToast(false)
      finishBadge()
    }, 1500)
  }, [finishBadge])

  const showDeck = phase === 'draw' || phase === 'shimmer' || !!revealing
  const showComposer = phase === 'talk'
  const displayPlayed = flyingBadge && !badgeLanded ? played.slice(0, -1) : played
  const poppingIndex = badgeLanded && flyingBadge ? played.length - 1 : null
  const currentStage = story.stages[stage]
  const pulse = status === 'Listening…' || phase === 'draw'

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <TopBar
        backLabel="Home"
        onBack={pop}
        tall
        trailing={<ProgressSlots played={displayPlayed} poppingIndex={poppingIndex} />}
      >
        <motion.button
          type="button"
          onClick={() => push('profile')}
          whileTap={{ opacity: 0.5 }}
          className="flex h-[44px] max-w-[210px] flex-col items-center justify-center gap-0.5 rounded-full px-2"
        >
          <span className="flex h-[26px] items-center gap-2">
            <span className="relative inline-flex size-[26px] shrink-0 items-center justify-center">
              <Presence size={26} waiting={pulse} />
            </span>
            <span className="text-body font-semibold text-label">{story.companionName}</span>
          </span>
          <span
            aria-hidden={!status}
            className={`h-[14px] max-w-[180px] truncate text-center text-caption leading-[14px] ${
              status ? 'text-label-tertiary' : 'invisible'
            }`}
          >
            {status ?? 'Listening…'}
          </span>
        </motion.button>
      </TopBar>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <MessageList
          messages={messages}
          typing={typing}
          className="flex-1 px-4 pt-[calc(var(--safe-top)+56px+16px)] pb-4"
        />
        <AnimatePresence>{phase === 'shimmer' && <ChatShimmer />}</AnimatePresence>
      </div>

      <footer className="relative shrink-0 overflow-hidden px-4 pb-[calc(var(--safe-bottom)+8px)]">
        <div className="relative min-h-[148px]">
          <AnimatePresence mode="wait">
            {storyComplete ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={spring}
                className="flex h-[148px] flex-col items-center justify-center gap-2.5"
              >
                <p className="text-callout text-label-tertiary">All four pieces shared.</p>
                <motion.button
                  type="button"
                  onClick={() => push('profile')}
                  whileTap={{ opacity: 0.5 }}
                  className="rounded-full px-3 py-1 text-caption font-medium text-mint-deep"
                >
                  See Wren&apos;s pieces
                </motion.button>
              </motion.div>
            ) : showDeck ? (
              <motion.div
                key="deck"
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 28 }}
                transition={spring}
                className="flex h-[148px] items-center justify-center"
              >
                <DeckPanel />
              </motion.div>
            ) : showComposer && currentStage ? (
              <motion.div
                key="talk"
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={spring}
                className="flex h-[148px] flex-col justify-end gap-3"
              >
                <SuggestionChips
                  chips={currentStage.chips}
                  disabled={busy}
                  onSelect={sendText}
                />
                <ChatInput onSend={sendText} disabled={busy} />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[148px]"
              />
            )}
          </AnimatePresence>
        </div>
      </footer>

      <AnimatePresence>
        {revealing && (
          <DrawReveal key={revealing} cardId={revealing} onShow={playRevealed} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'badge' && flyingBadge && !badgeLanded && (
          <BadgeFlight
            key={flyingBadge}
            cardId={flyingBadge}
            slotIndex={played.length - 1}
            onComplete={handleFlightComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{showToast && <BadgeToast key="toast" />}</AnimatePresence>
    </div>
  )
}
