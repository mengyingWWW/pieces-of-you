type CardIconProps = {
  icon: string
  size?: number
}

export function CardIcon({ icon, size = 40 }: CardIconProps) {
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-sm bg-mint-soft text-mint-deep"
      style={{ width: size, height: size, fontSize: size * 0.48 }}
    >
      {icon}
    </div>
  )
}
