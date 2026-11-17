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
    keepCard,
    sendText,
  } = useGame()

  useEffect(startIntro, [startIntro])

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <TopBar
        backLabel="Home"
        onBack={pop}
        tall={waitingForPlayer}
        trailing={<ProgressDots played={played.length} />}
      >
        <motion.button
          type="button"
          onClick={() => push('profile')}
          whileTap={{ opacity: 0.5 }}
          className="flex max-w-[200px] items-center gap-2 rounded-full px-2 py-1"
        >
          <Presence size={26} waiting={waitingForPlayer} />
          <span className="flex min-w-0 flex-col items-start text-left">
            <span className="text-body font-semibold text-label">{story.companionName}</span>
            <AnimatePresence>
              {waitingForPlayer && (
                <motion.span
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[11px] leading-[14px] font-normal text-label-tertiary"
                >
                  Waiting for you to show something…
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </motion.button>
      </TopBar>

      <MessageList
        messages={messages}
        typing={typing}
        className={`flex-1 px-4 pb-4 ${
          waitingForPlayer
            ? 'pt-[calc(var(--safe-top)+56px+16px)]'
            : 'pt-[calc(var(--safe-top)+44px+16px)]'
        }`}
      />

      <footer className="shrink-0 px-4 pb-[calc(var(--safe-bottom)+8px)]">
        <CardHand />
        <div className="mt-3">
          <ChatInput onSend={sendText} />
        </div>
      </footer>

      <AnimatePresence>
        {revealing && <DrawReveal key={revealing} cardId={revealing} onKeep={keepCard} />}
      </AnimatePresence>
    </div>
  )
}
