import { story } from '../data/story'

export type Message =
  | { id: number; sender: 'companion'; kind: 'text'; text: string }
  | { id: number; sender: 'user'; kind: 'text'; text: string }
  | { id: number; sender: 'user'; kind: 'card'; cardId: string }

export type QueuedLine = { id: number; text: string }

export type GameState = {
  messages: Message[]
  /** Undrawn card ids, shuffled once at start. */
  deck: string[]
  played: string[]
  /** Badge ids already seen on the Profile screen (for shimmer). */
  seenBadges: string[]
  introPlayed: boolean
  /** Deck may be drawn from once while true. */
  canDraw: boolean
  /** Card currently in the reveal overlay. */
  revealing: string | null
  queue: QueuedLine[]
  typing: boolean
  typedReplyIndex: number
  nextId: number
}

export type GameAction =
  | { type: 'startIntro' }
  | { type: 'drawCard' }
  | { type: 'playRevealed' }
  | { type: 'sendText'; text: string }
  | { type: 'startTyping' }
  | { type: 'deliver' }
  | { type: 'markBadgesSeen' }
  | { type: 'reset' }

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j]!, next[i]!]
  }
  return next
}

export function createInitialGameState(): GameState {
  return {
    messages: [],
    deck: shuffle(story.cards.map((c) => c.id)),
    played: [],
    seenBadges: [],
    introPlayed: false,
    canDraw: false,
    revealing: null,
    queue: [],
    typing: false,
    typedReplyIndex: 0,
    nextId: 1,
  }
}

export const initialGameState: GameState = createInitialGameState()

export function isBusy(state: GameState) {
  return state.typing || state.queue.length > 0
}

export function isWaitingForPlayer(state: GameState) {
  if (isBusy(state) || state.revealing || state.played.length >= 4) return false
  return state.canDraw
}

export function isStoryComplete(state: GameState) {
  return state.played.length >= 4 && !isBusy(state) && !state.revealing
}

export function profileStatus(played: number, storyComplete: boolean): string {
  if (storyComplete) return "Knows she's an AI, and stayed anyway"
  if (played >= 3) return 'Almost knows'
  if (played >= 1) return 'Noticing something is different'
  return "Thinks she's just like you"
}

function enqueue(state: GameState, lines: string[]): GameState {
  const queued = lines.map((text, i) => ({ id: state.nextId + i, text }))
  return { ...state, queue: [...state.queue, ...queued], nextId: state.nextId + lines.length }
}

function unlockAfterTalk(state: GameState): GameState {
  if (state.played.length >= 4) return state
  if (state.deck.length === 0) return state
  return { ...state, canDraw: true }
}

function playCardId(state: GameState, cardId: string): GameState {
  const card = story.cards.find((c) => c.id === cardId)
  if (!card) return state

  const played = [...state.played, cardId]
  const stage = played.length as 1 | 2 | 3 | 4
  const message: Message = { id: state.nextId, sender: 'user', kind: 'card', cardId }

  const lines = [...card.reflection, ...story.realization[stage]]
  if (stage === 4) lines.push(...story.ending)

  return enqueue(
    {
      ...state,
      revealing: null,
      played,
      canDraw: false,
      messages: [...state.messages, message],
      nextId: state.nextId + 1,
    },
    lines,
  )
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'startIntro': {
      if (state.introPlayed) return state
      return enqueue({ ...state, introPlayed: true, canDraw: false }, story.intro)
    }

    case 'drawCard': {
      if (!state.canDraw || state.deck.length === 0 || isBusy(state) || state.revealing) return state
      const [cardId, ...deck] = state.deck
      return { ...state, deck, revealing: cardId!, canDraw: false }
    }

    case 'playRevealed': {
      if (!state.revealing || isBusy(state)) return state
      return playCardId(state, state.revealing)
    }

    case 'sendText': {
      const text = action.text.trim()
      if (!text) return state
      const message: Message = { id: state.nextId, sender: 'user', kind: 'text', text }
      const reply = story.typedReplies[state.typedReplyIndex % story.typedReplies.length]!
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
      const next: GameState = {
        ...state,
        queue: rest,
        typing: false,
        messages: [...state.messages, { id: line.id, sender: 'companion', kind: 'text', text: line.text }],
      }
      if (rest.length === 0) return unlockAfterTalk(next)
      return next
    }

    case 'markBadgesSeen':
      return { ...state, seenBadges: [...state.played] }

    case 'reset':
      return createInitialGameState()
  }
}
