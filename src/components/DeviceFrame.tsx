import type { ReactNode } from 'react'

export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center framed:min-h-dvh framed:h-auto framed:py-10">
      <div className="relative isolate h-dvh w-full overflow-hidden bg-background framed:h-[844px] framed:w-[390px] framed:shrink-0 framed:rounded-device framed:shadow-device">
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-2 left-1/2 z-50 hidden h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-label/90 framed:block"
        />
      </div>
    </div>
  )
}
