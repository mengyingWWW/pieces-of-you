import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CardHand } from '../components/chat/CardHand'
import { ChatInput } from '../components/chat/ChatInput'
import { MessageList } from '../components/chat/MessageList'
import { Presence } from '../components/Presence'
import { TopBar } from '../components/TopBar'
import { story } from '../data/story'
import { useNavigation } from '../navigation/navigation'
import { useGame } from '../state/GameContext'

export function Chat() {
  const { push, pop } = useNavigation()
  const { messages, typing, startIntro, sendText } = useGame()

  useEffect(startIntro, [startIntro])

  return (
    <div className="relative flex h-full flex-col">
      <TopBar backLabel="Home" onBack={pop}>
        <motion.button
          type="button"
          onClick={() => push('profile')}
          whileTap={{ opacity: 0.5 }}
          className="flex items-center gap-2 rounded-full px-2 py-1"
        >
          <Presence size={26} />
          <span className="text-body font-semibold text-label">{story.companionName}</span>
        </motion.button>
      </TopBar>

      <MessageList
        messages={messages}
        typing={typing}
        className="flex-1 px-4 pt-[calc(var(--safe-top)+44px+16px)] pb-4"
      />

      <footer className="shrink-0 px-4 pb-[calc(var(--safe-bottom)+8px)]">
        <CardHand />
        <div className="mt-3">
          <ChatInput onSend={sendText} />
        </div>
      </footer>
    </div>
  )
}
