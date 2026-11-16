import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { spring } from '../theme/motion'

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97, opacity: 0.9 }}
      transition={spring}
      className="h-[52px] w-full rounded-sm bg-mint text-body font-semibold text-white shadow-soft"
    >
      {children}
    </motion.button>
  )
}
