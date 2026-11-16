import { Presence } from '../components/Presence'
import { TopBar } from '../components/TopBar'
import { useNavigation } from '../navigation/navigation'

const BADGE_SLOTS = 6

export function Profile() {
  const { pop } = useNavigation()

  return (
    <div className="relative h-full">
      <TopBar backLabel="Chat" onBack={pop} />

      <main className="h-full overflow-y-auto px-5 pt-[calc(var(--safe-top)+44px+32px)] pb-[calc(var(--safe-bottom)+24px)]">
        <section className="flex flex-col items-center text-center">
          <Presence size={128} />
          <h1 className="mt-5 text-title text-label">Companion</h1>
          <p className="mt-1 text-callout text-label-secondary">Just getting to know you</p>
        </section>

        <section className="mt-10">
          <h2 className="px-4 pb-2 text-caption uppercase tracking-wide text-label-secondary">Badges</h2>
          <div className="grid grid-cols-3 gap-y-6 rounded-lg bg-surface px-4 py-6 shadow-soft">
            {Array.from({ length: BADGE_SLOTS }, (_, i) => (
              <div
                key={i}
                aria-label="Empty badge slot"
                className="mx-auto size-16 rounded-full border-[1.5px] border-dashed border-outline"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
