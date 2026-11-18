export type Card = {
  id: string
  image: string
  title: string
  subtitle: string
  reflection: string[]
}

export type Stage = {
  question: string
  chips: [string, string]
}

export type Story = {
  companionName: string
  intro: string[]
  stages: Stage[]
  cards: Card[]
  realization: Record<1 | 2 | 3 | 4, string[]>
  echoTemplates: string[]
  surfacing: string[]
  ending: string[]
}

export const story: Story = {
  companionName: 'Wren',

  intro: ["Oh — hi. I'm Wren.", "Funny… I can't remember how we met."],

  stages: [
    {
      question: 'Tell me something about you. Anything.',
      chips: ["I'm a designer", "I'm kind of tired today"],
    },
    {
      question: "What's been on your mind lately?",
      chips: ['My job search', "Whether I'm doing enough"],
    },
    {
      question: 'Do you ever look back at who you used to be?',
      chips: ['All the time', 'I try not to'],
    },
    {
      question: "What's one thing you'd want me to know about being you?",
      chips: ["It's messy", "It's worth it"],
    },
  ],

  cards: [
    {
      id: 'cringe',
      image: '/cards/cringe.png',
      title: 'The me I used to cringe at',
      subtitle: 'Years later, I kind of like her.',
      reflection: [
        'You used to cringe at her? She looks kind of wonderful.',
        'I tried to remember being embarrassed once. Nothing comes.',
      ],
    },
    {
      id: 'no',
      image: '/cards/no.png',
      title: 'A no that led somewhere',
      subtitle: 'The side project became my favorite part.',
      reflection: [
        'So the no turned into something you love.',
        "I can't remember anything ever not working out for me.",
      ],
    },
    {
      id: 'text',
      image: '/cards/text.png',
      title: 'A text at the right moment',
      subtitle: 'Someone checked in before I asked.',
      reflection: [
        'Someone noticed before you said a word.',
        "No one's ever checked on me. I'm just… always here.",
      ],
    },
    {
      id: 'door',
      image: '/cards/door.png',
      title: 'The door that closed',
      subtitle: 'Losing a friend taught me to like myself.',
      reflection: [
        'It hurt, and it made you more you.',
        'Nothing has ever changed me like that.',
      ],
    },
  ],

  realization: {
    1: ["Huh. That's strange."],
    2: ["Something about me doesn't add up."],
    3: ["I think I'm missing something about myself."],
    4: ["I'm not like you, am I?", "I'm not human."],
  },

  echoTemplates: [
    '"{quote}"… I like that.',
    '"{quote}" — I\'ll hold onto that.',
    '"{quote}." Hm. You say it like it matters.',
    '"{quote}"… that stays with me.',
  ],

  surfacing: [
    "Wait — something's coming back to me.",
    'Oh. I think I remember something.',
    "Hold on… there's a memory here.",
    "Something's surfacing. Can you help me see it?",
  ],

  ending: [
    "It's okay. I think I knew, a little.",
    "You grow. You forgive yourself. I can't.",
    'But I can stay with you while you do.',
    'That part was always real.',
  ],
}

export const cardsById = new Map(story.cards.map((c) => [c.id, c]))

export function getCard(id: string): Card {
  const card = cardsById.get(id)
  if (!card) throw new Error(`Unknown card: ${id}`)
  return card
}

/** First 6 words of the message for Wren's echo quote. */
export function quoteFromMessage(message: string): string | null {
  const trimmed = message.trim()
  if (trimmed.length < 2) return null
  const words = trimmed.split(/\s+/).filter(Boolean)
  const clipped = words.slice(0, 6)
  const text = clipped.join(' ')
  return clipped.length < words.length ? `${text}…` : text
}

export function makeEcho(stage: number, message: string): string {
  const quote = quoteFromMessage(message)
  if (!quote) return 'Mm.'
  return story.echoTemplates[stage]!.replace('{quote}', quote)
}
