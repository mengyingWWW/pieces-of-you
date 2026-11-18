import { motion } from 'framer-motion'

type SuggestionChipsProps = {
  chips: readonly [string, string]
  disabled?: boolean
  onSelect: (text: string) => void
}

export function SuggestionChips({ chips, disabled, onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <motion.button
          key={chip}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(chip)}
          whileTap={disabled ? undefined : { scale: 0.97 }}
          className="rounded-full border-[0.5px] border-hairline bg-surface px-3 py-1.5 text-caption text-label shadow-soft disabled:opacity-45"
        >
          {chip}
        </motion.button>
      ))}
    </div>
  )
}
