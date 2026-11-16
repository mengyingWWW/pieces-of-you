import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { gameReducer, initialGameState, isBusy, type GameState } from './gameReducer'

const PAUSE_BEFORE_TYPING_MS = 400

function typingDuration(text: string) {
  return Math.min(1800, Math.max(600, 400 + text.length * 22))
}

type Game = GameState & {
  busy: boolean
  startIntro: () => void
  playCard: (cardId: string) => void
  sendText: (text: string) => void
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
    // Keyed on the head line's id so appending to the queue doesn't restart the current line.
  }, [head?.id, state.typing])

  const actions = useMemo(
    () => ({
      startIntro: () => dispatch({ type: 'startIntro' }),
      playCard: (cardId: string) => dispatch({ type: 'playCard', cardId }),
      sendText: (text: string) => dispatch({ type: 'sendText', text }),
    }),
    [],
  )

  const game = useMemo<Game>(() => ({ ...state, busy: isBusy(state), ...actions }), [state, actions])

  return <GameContext.Provider value={game}>{children}</GameContext.Provider>
}

export function useGame(): Game {
  const game = useContext(GameContext)
  if (!game) throw new Error('useGame must be used inside <GameProvider />')
  return game
}
