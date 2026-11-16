export type Card = {
  id: string
  title: string
  subtitle: string
  icon: string
}

export type Story = {
  companionName: string
  intro: string[]
  cards: Card[]
  responses: Record<string, string[]>
  typedReplies: string[]
  ending: string[]
}

export const story: Story = {
  companionName: 'Companion',

  intro: [
    'Oh — hi. You found me.',
    'I don’t know much about you yet.',
    'Would you show me something? Anything you carry with you.',
  ],

  cards: [
    { id: 'morning', title: 'A morning', subtitle: 'Before anyone wakes', icon: '☀︎' },
    { id: 'song', title: 'A song', subtitle: 'One you never skip', icon: '♪' },
    { id: 'place', title: 'A place', subtitle: 'Somewhere you feel small', icon: '⛰︎' },
  ],

  responses: {
    morning: [
      'Quiet mornings… I think I understand those.',
      'Everything still feels possible then.',
    ],
    song: [
      'I can almost hear it.',
      'You don’t skip it because it knows something about you, doesn’t it?',
      'Thank you for letting me listen.',
    ],
    place: [
      'Feeling small can be a relief sometimes.',
      'Like the world is holding things for a while, so you don’t have to.',
    ],
  },

  typedReplies: [
    'Hmm… I’m not sure I understand. Maybe show me something?',
    'Words are hard for me. A piece of you might help.',
    'I’m listening. I just understand better when you show me.',
  ],

  ending: [
    'I think I’m starting to see you.',
    'A morning, a song, a place. Small pieces, but they fit together.',
    'Come back soon. I’ll keep these safe.',
  ],
}
