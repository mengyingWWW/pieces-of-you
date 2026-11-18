import { useState, type FormEvent } from 'react'

type ChatInputProps = {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Say something…',
}: ChatInputProps) {
  const [text, setText] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (disabled || !text.trim()) return
    onSend(text)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label="Message"
        enterKeyHint="send"
        autoComplete="off"
        disabled={disabled}
        className="h-11 w-full rounded-full border-[0.5px] border-hairline bg-surface px-4 text-[16px] tracking-[-0.02em] text-label shadow-soft outline-none placeholder:text-label-tertiary focus:bg-surface disabled:opacity-55"
      />
    </form>
  )
}
