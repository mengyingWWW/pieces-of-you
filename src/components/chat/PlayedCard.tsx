import type { Card } from '../../data/story'
import { CardIcon } from './CardIcon'

export function PlayedCard({ card }: { card: Card }) {
  return (
    <div className="flex w-[230px] items-center gap-3 rounded-md bg-surface p-3 shadow-raised">
      <CardIcon icon={card.icon} size={44} />
      <div className="min-w-0">
        <p className="text-callout font-semibold text-label">{card.title}</p>
        <p className="text-caption text-label-secondary">{card.subtitle}</p>
      </div>
    </div>
  )
}
