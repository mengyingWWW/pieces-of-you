type TextBubbleProps = {
  text: string
  sender: 'companion' | 'user'
  joinedAbove: boolean
  joinedBelow: boolean
}

const FULL = 20
const JOINED = 6

export function TextBubble({ text, sender, joinedAbove, joinedBelow }: TextBubbleProps) {
  const top = joinedAbove ? JOINED : FULL
  const bottom = joinedBelow ? JOINED : FULL
  const radius =
    sender === 'companion'
      ? `${top}px ${FULL}px ${FULL}px ${bottom}px`
      : `${FULL}px ${top}px ${bottom}px ${FULL}px`

  return (
    <div
      style={{ borderRadius: radius }}
      className={`max-w-[78%] px-3.5 py-2 text-body ${
        sender === 'companion' ? 'glass text-label shadow-soft' : 'bg-mint text-white'
      }`}
    >
      {text}
    </div>
  )
}
