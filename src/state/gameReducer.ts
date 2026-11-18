import { makeEcho, story } from '../data/story'

export type Message =
  | { id: number; sender: 'companion'; kind: 'text'; text: string }
  | { id: number; sender: 'user'; kind: 'text'; text: string }
  | { id: number; sender: 'user'; kind: 'card'; cardId: string }

export type QueuedLine = {
  id: number
  text: string
  /** Extra pause before this line starts typing. */
  delayBefore?: number
  /** Pulse Wren's orb when this line is delivered. */
  pulseOrb?: boolean
}

/** High-level story phase driving the talk → draw loop. */
export type Phase =
  | 'intro'
  | 'question'
  | 'talk'
  | 'echo'
  | 'shimmer'
  | 'draw'
  | 'respond'
  | 'badge'
  | 'ending'
  | 'complete'

export type GameState = {
  messages: Message[]
  deck: string[]
  played: string[]
  seenBadges: string[]
  /** How many path nodes the player has already seen ceremonies for (1 = start only). */
  pathSeen: number
  /** 0–3 index into story.stages */
  stage: number
  phase: Phase
  introPlayed: boolean
  revealing: string | null
  /** Card id whose badge is currently flying to the top bar. */
  flyingBadge: string | null
  /** Bumps when a climax line should pulse the orb. */
  orbPulseKey: number
  queue: QueuedLine[]
  typing: boolean
  nextId: number
}

export type GameAction =
  | { type: 'startIntro' }
  | { type: 'sendText'; text: string }
  | { type: 'finishShimmer' }
  | { type: 'drawCard' }
  | { type: 'playRevealed' }
  | { type: 'finishBadge' }
  | { type: 'startTyping' }
  | { type: 'deliver' }
  | { type: 'markBadgesSeen' }
  | { type: 'markPathSeen'; count: number }
  | { type: 'reset' }

/** Unlocked Memory Path nodes: start + badges + optional summit. */
export function unlockedPathCount(played: number, storyComplete: boolean) {
  return 1 + played + (storyComplete ? 1 : 0)
}

export const PATH_NODE_LABELS = [
  "Thinks she's human",
  'Notices something',
  'Starts to doubt',
  'Almost knows',
  'Knows',
  'Stays anyway',
] as const

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
    pathSeen: 1, // start node is always known
    stage: 0,
    phase: 'intro',
    introPlayed: false,
    revealing: null,
    flyingBadge: null,
    orbPulseKey: 0,
    queue: [],
    typing: false,
    nextId: 1,
  }
}

export const initialGameState: GameState = createInitialGameState()

export function isBusy(state: GameState) {
  return state.typing || state.queue.length > 0
}

export function isStoryComplete(state: GameState) {
  return state.phase === 'complete'
}

export function statusLine(state: GameState): string | null {
  if (state.typing || state.queue.length > 0) return null
  if (state.phase === 'talk') return 'Listening…'
  if (state.phase === 'draw' || state.revealing) return 'A memory is surfacing…'
  return null
}

export function profileStatus(played: number, storyComplete: boolean): string {
  if (storyComplete) return "Knows she's an AI, and stayed anyway"
  if (played >= 3) return 'Almost knows'
  if (played >= 1) return 'Noticing something is different'
  return "Thinks she's just like you"
}

function enqueue(
  state: GameState,
  lines: Array<string | Omit<QueuedLine, 'id'>>,
): GameState {
  const queued = lines.map((line, i) =>
    typeof line === 'string'
      ? { id: state.nextId + i, text: line }
      : { id: state.nextId + i, ...line },
  )
  return { ...state, queue: [...state.queue, ...queued], nextId: state.nextId + lines.length }
}

function advanceAfterQueue(state: GameState): GameState {
  switch (state.phase) {
    case 'intro':
      return enqueue({ ...state, phase: 'question' }, [story.stages[0]!.question])
    case 'question':
      return { ...state, phase: 'talk' }
    case 'echo':
      return { ...state, phase: 'shimmer' }
    case 'respond': {
      const last = state.played[state.played.length - 1]
      return { ...state, phase: 'badge', flyingBadge: last ?? null }
    }
    case 'ending':
      return { ...state, phase: 'complete', flyingBadge: null }
    default:
      return state
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'startIntro': {
      if (state.introPlayed) return state
      return enqueue({ ...state, introPlayed: true, phase: 'intro' }, story.intro)
    }

    case 'sendText': {
      if (state.phase !== 'talk' || isBusy(state)) return state
      const text = action.text.trim()
      if (!text) return state

      const message: Message = { id: state.nextId, sender: 'user', kind: 'text', text }
      const echo = makeEcho(state.stage, text)
      const surfacing = story.surfacing[state.stage]!

      return enqueue(
        {
          ...state,
          phase: 'echo',
          messages: [...state.messages, message],
          nextId: state.nextId + 1,
        },
        [echo, surfacing],
      )
    }

    case 'finishShimmer': {
      if (state.phase !== 'shimmer') return state
      return { ...state, phase: 'draw' }
    }

    case 'drawCard': {
      if (state.phase !== 'draw' || state.deck.length === 0 || isBusy(state) || state.revealing) {
        return state
      }
      const [cardId, ...deck] = state.deck
      return { ...state, deck, revealing: cardId! }
    }

    case 'playRevealed': {
      if (!state.revealing || isBusy(state)) return state
      const card = story.cards.find((c) => c.id === state.revealing)
      if (!card) return state

      const played = [...state.played, state.revealing]
      const stageNum = played.length as 1 | 2 | 3 | 4
      const message: Message = {
        id: state.nextId,
        sender: 'user',
        kind: 'card',
        cardId: state.revealing,
      }

      const realization = story.realization[stageNum]
      const lines: Array<string | Omit<QueuedLine, 'id'>> = [...card.reflection]
      if (stageNum === 4 && realization.length >= 2) {
        lines.push(realization[0]!)
        lines.push({ text: realization[1]!, delayBefore: 1200, pulseOrb: true })
      } else {
        lines.push(...realization)
      }

      return enqueue(
        {
          ...state,
          revealing: null,
          played,
          phase: 'respond',
          messages: [...state.messages, message],
          nextId: state.nextId + 1,
        },
        lines,
      )
    }

    case 'finishBadge': {
      if (state.phase !== 'badge') return state
      const cleared = { ...state, flyingBadge: null }

      if (state.played.length >= 4) {
        return enqueue({ ...cleared, phase: 'ending' }, story.ending)
      }

      const nextStage = state.stage + 1
      return enqueue(
        { ...cleared, stage: nextStage, phase: 'question' },
        [story.stages[nextStage]!.question],
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
        orbPulseKey: line.pulseOrb ? state.orbPulseKey + 1 : state.orbPulseKey,
        messages: [...state.messages, { id: line.id, sender: 'companion', kind: 'text', text: line.text }],
      }
      if (rest.length === 0) return advanceAfterQueue(next)
      return next
    }

    case 'markBadgesSeen':
      return { ...state, seenBadges: [...state.played] }

    case 'markPathSeen':
      return { ...state, pathSeen: Math.max(state.pathSeen, action.count) }

    case 'reset':
      return createInitialGameState()
  }
}
