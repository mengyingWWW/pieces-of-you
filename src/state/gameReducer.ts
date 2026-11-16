import { story } from '../data/story'

export type Message =
  | { id: number; sender: 'companion'; kind: 'text'; text: string }
  | { id: number; sender: 'user'; kind: 'text'; text: string }
  | { id: number; sender: 'user'; kind: 'card'; cardId: string }

export type QueuedLine = { id: number; text: string }

export type GameState = {
  messages: Message[]
  hand: string[]
  played: string[]
  introPlayed: boolean
  /** Companion lines waiting to be "typed" and delivered, in order. */
  queue: QueuedLine[]
  typing: boolean
  typedReplyIndex: number
  nextId: number
}

export type GameAction =
  | { type: 'startIntro' }
  | { type: 'playCard'; cardId: string }
  | { type: 'sendText'; text: string }
  | { type: 'startTyping' }
  | { type: 'deliver' }

export const initialGameState: GameState = {
  messages: [],
  hand: story.cards.map((c) => c.id),
  played: [],
  introPlayed: false,
  queue: [],
  typing: false,
  typedReplyIndex: 0,
  nextId: 1,
}

export function isBusy(state: GameState) {
  return state.typing || state.queue.length > 0
}

function enqueue(state: GameState, lines: string[]): GameState {
  const queued = lines.map((text, i) => ({ id: state.nextId + i, text }))
  return { ...state, queue: [...state.queue, ...queued], nextId: state.nextId + lines.length }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'startIntro': {
      if (state.introPlayed) return state
      return enqueue({ ...state, introPlayed: true }, story.intro)
    }

    case 'playCard': {
      if (isBusy(state) || !state.hand.includes(action.cardId)) return state
      const hand = state.hand.filter((id) => id !== action.cardId)
      const message: Message = { id: state.nextId, sender: 'user', kind: 'card', cardId: action.cardId }
      const next: GameState = {
        ...state,
        hand,
        played: [...state.played, action.cardId],
        messages: [...state.messages, message],
        nextId: state.nextId + 1,
      }
      const lines = [...(story.responses[action.cardId] ?? []), ...(hand.length === 0 ? story.ending : [])]
      return enqueue(next, lines)
    }

    case 'sendText': {
      const text = action.text.trim()
      if (!text) return state
      const message: Message = { id: state.nextId, sender: 'user', kind: 'text', text }
      const reply = story.typedReplies[state.typedReplyIndex % story.typedReplies.length]
      return enqueue(
        {
          ...state,
          messages: [...state.messages, message],
          typedReplyIndex: state.typedReplyIndex + 1,
          nextId: state.nextId + 1,
        },
        [reply],
      )
    }

    case 'startTyping':
      return state.queue.length > 0 ? { ...state, typing: true } : state

    case 'deliver': {
      const [line, ...rest] = state.queue
      if (!line) return { ...state, typing: false }
      return {
        ...state,
        queue: rest,
        typing: false,
        messages: [...state.messages, { id: line.id, sender: 'companion', kind: 'text', text: line.text }],
      }
    }
  }
}
