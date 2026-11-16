import { useState, type FormEvent } from 'react'

export function ChatInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Or type something…"
        aria-label="Message"
        enterKeyHint="send"
        autoComplete="off"
        className="h-9 w-full rounded-full border-[0.5px] border-hairline bg-surface/60 px-4 text-[16px] tracking-[-0.02em] text-label outline-none placeholder:text-label-tertiary focus:bg-surface"
      />
    </form>
  )
}
