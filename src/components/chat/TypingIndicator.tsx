import { motion } from 'framer-motion'

export function TypingIndicator() {
  return (
    <div
      role="status"
      aria-label="Companion is typing"
      className="glass flex h-[38px] items-center gap-[5px] rounded-[20px] px-4 shadow-soft"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-[7px] rounded-full bg-label-tertiary"
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1, 0.85] }}
          transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  )
}
