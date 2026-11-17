export type Card = {
  id: string
  image: string
  title: string
  subtitle: string
  reflection: string[]
}

export type Story = {
  companionName: string
  intro: string[]
  cards: Card[]
  realization: Record<1 | 2 | 3 | 4, string[]>
  typedReplies: string[]
  ending: string[]
}

export const story: Story = {
  companionName: 'Wren',

  intro: [
    "Oh — hi. I'm Wren.",
    "Funny… I can't remember how we met.",
    'Show me something real about you?',
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

  typedReplies: [
    'Hmm… maybe show me instead?',
    'I think a moment would help me understand.',
    'Words are hard for me right now. Show me?',
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
