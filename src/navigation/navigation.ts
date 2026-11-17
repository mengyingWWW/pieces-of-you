import { createContext, useContext } from 'react'

export type ScreenName = 'home' | 'chat' | 'profile'

export type Direction = 'push' | 'pop'

export type Navigation = {
  push: (screen: ScreenName) => void
  pop: () => void
  /** Clear the stack and show a single screen (used by Start over). */
  resetTo: (screen: ScreenName) => void
}

export const NavigationContext = createContext<Navigation | null>(null)

export function useNavigation(): Navigation {
  const nav = useContext(NavigationContext)
  if (!nav) throw new Error('useNavigation must be used inside <Navigator />')
  return nav
}
