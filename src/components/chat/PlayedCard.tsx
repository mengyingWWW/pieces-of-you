import { motion } from 'framer-motion'
import type { Card } from '../../data/story'
import { spring } from '../../theme/motion'
import { MomentCard } from './MomentCard'

const W = 160
const H = 213

export function PlayedCard({ card }: { card: Card }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.86, rotate: -8 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: -3 }}
      transition={{ ...spring, stiffness: 320, damping: 18 }}
      style={{ originX: 1, originY: 1 }}
    >
      <MomentCard card={card} width={W} height={H} />
    </motion.div>
  )
}
