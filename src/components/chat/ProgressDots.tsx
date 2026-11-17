const TOTAL = 4

export function ProgressDots({ played }: { played: number }) {
  const filled = Math.min(TOTAL, Math.max(0, played))

  return (
    <div
      role="status"
      aria-label={`${filled} of ${TOTAL} pieces`}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: TOTAL }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className="size-1.5 rounded-full transition-colors duration-300"
          style={{
            background: i < filled ? 'var(--color-mint)' : 'rgb(0 0 0 / 0.12)',
          }}
        />
      ))}
    </div>
  )
}
