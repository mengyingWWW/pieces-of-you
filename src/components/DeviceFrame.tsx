import { useEffect, useState, type ReactNode } from 'react'

const FRAME_W = 390
const FRAME_H = 844
/** 24px breathing room on each side → 48 total. */
const PAD = 48
const DESKTOP_MQ = '(min-width: 500px)'

function useFrameScale() {
  const [scale, setScale] = useState(1)
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_MQ).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ)

    function update() {
      const desktop = mq.matches
      setIsDesktop(desktop)
      if (!desktop) {
        setScale(1)
        return
      }
      setScale(
        Math.min(1, (window.innerHeight - PAD) / FRAME_H, (window.innerWidth - PAD) / FRAME_W),
      )
    }

    update()
    mq.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      mq.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return { scale, isDesktop }
}

export function DeviceFrame({ children }: { children: ReactNode }) {
  const { scale, isDesktop } = useFrameScale()

  if (!isDesktop) {
    return (
      <div
        data-device-frame
        className="relative isolate h-dvh w-full overflow-hidden bg-background"
      >
        {children}
      </div>
    )
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center overflow-hidden">
      {/* Layout box matches the visual scaled size so flex centering doesn't overflow. */}
      <div className="relative" style={{ width: FRAME_W * scale, height: FRAME_H * scale }}>
        <div
          data-device-frame
          className="relative isolate overflow-hidden bg-background shadow-device rounded-device"
          style={{
            width: FRAME_W,
            height: FRAME_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-label/90"
          />
        </div>
      </div>
    </div>
  )
}
