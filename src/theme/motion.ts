import type { Transition } from 'framer-motion'

export const spring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

export const breathing: Transition = {
  duration: 4,
  ease: 'easeInOut',
  repeat: Infinity,
}
