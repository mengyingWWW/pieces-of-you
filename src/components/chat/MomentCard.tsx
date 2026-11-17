import type { CSSProperties } from 'react'
import type { Card } from '../../data/story'

export const CARD_RADIUS = 18

type MomentCardProps = {
  card: Card
  width: number
  height: number
  showTitle?: boolean
  /** Subtitle only in the reveal overlay. */
  showSubtitle?: boolean
  className?: string
  style?: CSSProperties
}

export function MomentCard({
  card,
  width,
  height,
  showTitle = true,
  showSubtitle = false,
  className = '',
  style,
}: MomentCardProps) {
  return (
    <div
      className={`relative overflow-hidden bg-surface ${className}`}
      style={{
        width,
        height,
        borderRadius: CARD_RADIUS,
        boxShadow:
          '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.1), 0 20px 48px rgb(0 0 0 / 0.08)',
        ...style,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          borderRadius: CARD_RADIUS,
          boxShadow: 'inset 0 0 0 4px rgb(255 255 255 / 0.92)',
        }}
      />

      <img
        src={card.image}
        alt=""
        draggable={false}
        className="absolute inset-0 size-full object-cover"
      />

      {(showTitle || showSubtitle) && (
        <div
          className="absolute inset-x-0 bottom-0 z-10 pt-6"
          style={{
            paddingLeft: width < 100 ? 6 : 10,
            paddingRight: width < 100 ? 6 : 10,
            paddingBottom: width < 100 ? 6 : 10,
            background: 'linear-gradient(to top, rgb(255 255 255 / 0.55) 35%, transparent)',
          }}
        >
          <div
            className="rounded-[10px]"
            style={{
              padding: width < 100 ? '6px 7px' : '8px 10px',
              background: 'rgb(255 255 255 / 0.7)',
              backdropFilter: 'blur(12px) saturate(160%)',
              WebkitBackdropFilter: 'blur(12px) saturate(160%)',
            }}
          >
            {showTitle && (
              <p
                className="line-clamp-2 text-left font-medium text-label"
                style={{
                  fontSize: width < 100 ? 10 : 13,
                  lineHeight: width < 100 ? '12px' : '16px',
                }}
              >
                {card.title}
              </p>
            )}
            {showSubtitle && (
              <p
                className={`line-clamp-2 text-left text-label-secondary ${showTitle ? 'mt-0.5' : ''}`}
                style={{ fontSize: 11, lineHeight: '14px' }}
              >
                {card.subtitle}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
