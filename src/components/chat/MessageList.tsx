import { useEffect, useLayoutEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { story } from '../../data/story'
import type { Message } from '../../state/gameReducer'
import { spring } from '../../theme/motion'
import { PlayedCard } from './PlayedCard'
import { TextBubble } from './TextBubble'
import { TypingIndicator } from './TypingIndicator'

type MessageListProps = {
  messages: Message[]
  typing: boolean
  className?: string
}

type Item = Message | { id: 'typing'; sender: 'companion'; kind: 'typing' }

const cardsById = new Map(story.cards.map((c) => [c.id, c]))

export function MessageList({ messages, typing, className = '' }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const items: Item[] = typing ? [...messages, { id: 'typing', sender: 'companion', kind: 'typing' }] : messages

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, typing])

  return (
    <div ref={scrollRef} className={`no-scrollbar overflow-y-auto ${className}`}>
      <div className="flex min-h-full flex-col justify-end">
        <AnimatePresence initial={false}>
          {items.map((item, i) => {
            const prev = items[i - 1]
            const next = items[i + 1]
            const joinedAbove = prev?.sender === item.sender
            const joinedBelow = next?.sender === item.sender
            const isCompanion = item.sender === 'companion'

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={spring}
                style={{ originX: isCompanion ? 0 : 1, originY: 1 }}
                className={`flex ${isCompanion ? 'justify-start' : 'justify-end'} ${
                  i === 0 ? '' : joinedAbove ? 'mt-1' : 'mt-3'
                }`}
              >
                {item.kind === 'typing' ? (
                  <TypingIndicator />
                ) : item.kind === 'card' ? (
                  <PlayedCard card={cardsById.get(item.cardId)!} />
                ) : (
                  <TextBubble
                    text={item.text}
                    sender={item.sender}
                    joinedAbove={joinedAbove}
                    joinedBelow={joinedBelow}
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
