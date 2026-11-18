import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CardHand } from '../components/chat/CardHand'
import { ChatInput } from '../components/chat/ChatInput'
import { DrawReveal } from '../components/chat/DrawReveal'
import { MessageList } from '../components/chat/MessageList'
import { ProgressDots } from '../components/chat/ProgressDots'
import { Presence } from '../components/Presence'
import { TopBar } from '../components/TopBar'
import { story } from '../data/story'
import { useNavigation } from '../navigation/navigation'
import { useGame } from '../state/GameContext'

export function Chat() {
  const { push, pop } = useNavigation()
  const {
    messages,
    typing,
    played,
    revealing,
    waitingForPlayer,
    startIntro,
    playRevealed,
    sendText,
  } = useGame()

  useEffect(startIntro, [startIntro])

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <TopBar
        backLabel="Home"
        onBack={pop}
        tall
        trailing={<ProgressDots played={played.length} />}
      >
        <motion.button
          type="button"
          onClick={() => push('profile')}
          whileTap={{ opacity: 0.5 }}
          className="flex h-[44px] max-w-[210px] flex-col items-center justify-center gap-0.5 rounded-full px-2"
        >
          <span className="flex h-[26px] items-center gap-2">
            <span className="relative inline-flex size-[26px] shrink-0 items-center justify-center">
              <Presence size={26} waiting={waitingForPlayer} />
            </span>
            <span className="text-body font-semibold text-label">{story.companionName}</span>
          </span>
          <span
            aria-hidden={!waitingForPlayer}
            className={`h-[14px] max-w-[180px] truncate text-center text-caption leading-[14px] ${
              waitingForPlayer ? 'text-label-tertiary' : 'invisible'
            }`}
          >
            Waiting for a moment…
          </span>
        </motion.button>
      </TopBar>

      <MessageList
        messages={messages}
        typing={typing}
        className="flex-1 px-4 pt-[calc(var(--safe-top)+56px+16px)] pb-4"
      />

      <footer className="shrink-0 px-4 pb-[calc(var(--safe-bottom)+8px)]">
        <CardHand />
        <div className="mt-3">
          <ChatInput onSend={sendText} />
        </div>
      </footer>

      <AnimatePresence>
        {revealing && (
          <DrawReveal key={revealing} cardId={revealing} onShow={playRevealed} />
        )}
      </AnimatePresence>
    </div>
  )
}
