import type { CSSProperties } from 'react'
import { CARD_RADIUS } from './MomentCard'

type CardBackProps = {
  width: number
  height: number
  className?: string
  style?: CSSProperties
  glowing?: boolean
}

export function CardBack({ width, height, className = '', style, glowing = false }: CardBackProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        borderRadius: CARD_RADIUS,
        background:
          'linear-gradient(145deg, rgb(255 255 255 / 0.82) 0%, rgb(228 247 241 / 0.9) 42%, rgb(232 224 245 / 0.88) 100%)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        boxShadow: glowing
          ? '0 0 0 1px rgb(46 196 160 / 0.28), 0 0 28px rgb(46 196 160 / 0.38), 0 8px 24px rgb(0 0 0 / 0.08)'
          : '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 20px rgb(0 0 0 / 0.08)',
        ...style,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: CARD_RADIUS,
          boxShadow: 'inset 0 0 0 4px rgb(255 255 255 / 0.85)',
        }}
      />

      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: Math.min(width, height) * 0.38,
          height: Math.min(width, height) * 0.38,
          boxShadow:
            '0 0 0 1.5px rgb(46 196 160 / 0.45), 0 0 18px rgb(46 196 160 / 0.25), inset 0 0 12px rgb(46 196 160 / 0.12)',
        }}
      />
    </div>
  )
}
