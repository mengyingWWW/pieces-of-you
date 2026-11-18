import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import {
  gameReducer,
  initialGameState,
  isBusy,
  isStoryComplete,
  statusLine,
  type GameState,
  type Phase,
} from './gameReducer'

const PAUSE_BEFORE_TYPING_MS = 400

function typingDuration(text: string) {
  return Math.min(1800, Math.max(600, 400 + text.length * 22))
}

type Game = GameState & {
  busy: boolean
  storyComplete: boolean
  status: string | null
  startIntro: () => void
  sendText: (text: string) => void
  finishShimmer: () => void
  drawCard: () => void
  playRevealed: () => void
  finishBadge: () => void
  markBadgesSeen: () => void
  reset: () => void
}

const GameContext = createContext<Game | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)
  const head = state.queue[0]

  useEffect(() => {
    if (!head) return
    const timer = state.typing
      ? setTimeout(() => dispatch({ type: 'deliver' }), typingDuration(head.text))
      : setTimeout(() => dispatch({ type: 'startTyping' }), PAUSE_BEFORE_TYPING_MS)
    return () => clearTimeout(timer)
  }, [head?.id, state.typing])

  // Auto-advance shimmer after the sweep plays.
  useEffect(() => {
    if (state.phase !== 'shimmer') return
    const timer = window.setTimeout(() => dispatch({ type: 'finishShimmer' }), 900)
    return () => clearTimeout(timer)
  }, [state.phase])

  const actions = useMemo(
    () => ({
      startIntro: () => dispatch({ type: 'startIntro' }),
      sendText: (text: string) => dispatch({ type: 'sendText', text }),
      finishShimmer: () => dispatch({ type: 'finishShimmer' }),
      drawCard: () => dispatch({ type: 'drawCard' }),
      playRevealed: () => dispatch({ type: 'playRevealed' }),
      finishBadge: () => dispatch({ type: 'finishBadge' }),
      markBadgesSeen: () => dispatch({ type: 'markBadgesSeen' }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [],
  )

  const game = useMemo<Game>(
    () => ({
      ...state,
      busy: isBusy(state),
      storyComplete: isStoryComplete(state),
      status: statusLine(state),
      ...actions,
    }),
    [state, actions],
  )

  return <GameContext.Provider value={game}>{children}</GameContext.Provider>
}

export function useGame(): Game {
  const game = useContext(GameContext)
  if (!game) throw new Error('useGame must be used inside <GameProvider />')
  return game
}

export type { Phase }
