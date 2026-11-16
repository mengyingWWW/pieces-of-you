import { Button } from '../components/Button'
import { Presence } from '../components/Presence'
import { useNavigation } from '../navigation/navigation'

export function Home() {
  const { push } = useNavigation()

  return (
    <div className="flex h-full flex-col px-6 pt-[calc(var(--safe-top)+16px)] pb-[calc(var(--safe-bottom)+16px)]">
      <header>
        <p className="text-caption font-medium uppercase tracking-wide text-label-tertiary">Today</p>
        <h1 className="mt-0.5 text-large-title text-label">Pieces of You</h1>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8">
        <Presence size={180} />
        <p className="max-w-[260px] text-center text-callout text-label-secondary">
          Someone is here, quietly waiting to get to know you.
        </p>
      </main>

      <Button onClick={() => push('chat')}>Start talking</Button>
    </div>
  )
}
