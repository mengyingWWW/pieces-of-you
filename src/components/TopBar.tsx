import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type TopBarProps = {
  backLabel?: string
  onBack?: () => void
  children?: ReactNode
  trailing?: ReactNode
  /** Reserve space for a status line under the title (fixed height). */
  tall?: boolean
}

export function TopBar({ backLabel = 'Back', onBack, children, trailing, tall = false }: TopBarProps) {
  return (
    <header className="glass absolute inset-x-0 top-0 z-10 border-x-0 border-t-0 pt-[var(--safe-top)]">
      <div className={`relative flex items-center justify-center px-2 ${tall ? 'h-[56px]' : 'h-11'}`}>
        {onBack && (
          <motion.button
            type="button"
            onClick={onBack}
            whileTap={{ opacity: 0.4 }}
            className="absolute left-1 flex h-11 items-center gap-0.5 pr-2 text-body text-mint"
          >
            <ChevronLeft />
            <span>{backLabel}</span>
          </motion.button>
        )}
        {children}
        {trailing && <div className="absolute right-3 flex items-center">{trailing}</div>}
      </div>
    </header>
  )
}

function ChevronLeft() {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden className="mx-1">
      <path
        d="M10 2L2 10l8 8"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
