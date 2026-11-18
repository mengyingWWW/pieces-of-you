import { useRef, useState } from 'react'
import { Button } from '../components/Button'
import { LivingOrb, type LivingOrbHandle } from '../components/LivingOrb'
import { useNavigation } from '../navigation/navigation'

export function Home() {
  const { push } = useNavigation()
  const orbRef = useRef<LivingOrbHandle>(null)
  const [starting, setStarting] = useState(false)

  async function handleStart() {
    if (starting) return
    setStarting(true)
    try {
      await orbRef.current?.wake()
      push('chat')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="flex h-full flex-col px-6 pt-[calc(var(--safe-top)+16px)] pb-[calc(var(--safe-bottom)+16px)]">
      <header>
        <p className="text-caption font-medium text-label-tertiary">
          A small game about being human
        </p>
        <h1 className="mt-0.5 text-large-title text-label">Pieces of You</h1>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-5">
        <LivingOrb ref={orbRef} size={180} />
        <div className="max-w-[280px] text-center">
          <p className="text-callout text-label-secondary">Wren is waiting to get to know you.</p>
          <p className="mt-2 text-caption text-label-secondary">
            Talk to Wren. Draw moments from your life.
          </p>
        </div>
      </main>

      <Button onClick={handleStart}>Start talking</Button>
    </div>
  )
}
