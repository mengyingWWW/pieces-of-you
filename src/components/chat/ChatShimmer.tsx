import { motion } from 'framer-motion'

/** Soft mint light sweep across the chat (~800ms). */
export function ChatShimmer() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-y-0 w-1/2"
        initial={{ x: '-80%', opacity: 0 }}
        animate={{ x: '180%', opacity: [0, 0.85, 0] }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(100deg, transparent 0%, rgb(46 196 160 / 0.14) 45%, rgb(255 255 255 / 0.35) 50%, rgb(46 196 160 / 0.12) 55%, transparent 100%)',
        }}
      />
    </motion.div>
  )
}
