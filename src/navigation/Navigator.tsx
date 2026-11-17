import { useCallback, useMemo, useState, type ComponentType } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { spring } from '../theme/motion'
import { NavigationContext, type Direction, type ScreenName } from './navigation'

type NavigatorProps = {
  initial: ScreenName
  screens: Record<ScreenName, ComponentType>
}

const variants: Variants = {
  initial: (direction: Direction) =>
    direction === 'push' ? { x: '100%', zIndex: 1 } : { x: '-30%', zIndex: 0 },
  animate: { x: 0 },
  exit: (direction: Direction) =>
    direction === 'push' ? { x: '-30%', zIndex: 0 } : { x: '100%', zIndex: 1 },
}

export function Navigator({ initial, screens }: NavigatorProps) {
  const [stack, setStack] = useState<ScreenName[]>([initial])
  const [direction, setDirection] = useState<Direction>('push')

  const push = useCallback((screen: ScreenName) => {
    setDirection('push')
    setStack((s) => [...s, screen])
  }, [])

  const pop = useCallback(() => {
    setDirection('pop')
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
  }, [])

  const resetTo = useCallback((screen: ScreenName) => {
    setDirection('pop')
    setStack([screen])
  }, [])

  const nav = useMemo(() => ({ push, pop, resetTo }), [push, pop, resetTo])

  const depth = stack.length
  const current = stack[depth - 1]!
  const Screen = screens[current]

  return (
    <NavigationContext.Provider value={nav}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={`${depth}-${current}`}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={spring}
          className="absolute inset-0 bg-background shadow-edge"
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
    </NavigationContext.Provider>
  )
}
