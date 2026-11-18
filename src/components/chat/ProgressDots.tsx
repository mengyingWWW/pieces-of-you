const TOTAL = 4

export function ProgressDots({ played }: { played: number }) {
  const filled = Math.min(TOTAL, Math.max(0, played))

  return (
    <div
      role="status"
      aria-label={`${filled} of ${TOTAL} pieces`}
      className="flex items-center"
      style={{ gap: 5 }}
    >
      {Array.from({ length: TOTAL }, (_, i) => {
        const isFilled = i < filled
        return (
          <span
            key={i}
            aria-hidden
            className="rounded-full transition-[background,box-shadow] duration-300"
            style={{
              width: 6,
              height: 6,
              background: isFilled ? 'var(--color-mint)' : 'var(--color-label-tertiary)',
              boxShadow: isFilled ? 'none' : '0 0 0 1px var(--color-hairline)',
            }}
          />
        )
      })}
    </div>
  )
}
