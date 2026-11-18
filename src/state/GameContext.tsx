import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import {
  gameReducer,
  initialGameState,
  isBusy,
  isStoryComplete,
  isWaitingForPlayer,
  type GameState,
} from './gameReducer'

const PAUSE_BEFORE_TYPING_MS = 400

function typingDuration(text: string) {
  return Math.min(1800, Math.max(600, 400 + text.length * 22))
}

type Game = GameState & {
  busy: boolean
  waitingForPlayer: boolean
  storyComplete: boolean
  startIntro: () => void
  drawCard: () => void
  playRevealed: () => void
  sendText: (text: string) => void
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

  const actions = useMemo(
    () => ({
      startIntro: () => dispatch({ type: 'startIntro' }),
      drawCard: () => dispatch({ type: 'drawCard' }),
      playRevealed: () => dispatch({ type: 'playRevealed' }),
      sendText: (text: string) => dispatch({ type: 'sendText', text }),
      markBadgesSeen: () => dispatch({ type: 'markBadgesSeen' }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [],
  )

  const game = useMemo<Game>(
    () => ({
      ...state,
      busy: isBusy(state),
      waitingForPlayer: isWaitingForPlayer(state),
      storyComplete: isStoryComplete(state),
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
