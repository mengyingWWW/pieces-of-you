import { motion } from 'framer-motion'
import { Presence } from '../components/Presence'
import { TopBar } from '../components/TopBar'
import { useNavigation } from '../navigation/navigation'

export function Chat() {
  const { push, pop } = useNavigation()

  return (
    <div className="relative flex h-full flex-col">
      <TopBar backLabel="Home" onBack={pop}>
        <motion.button
          type="button"
          onClick={() => push('profile')}
          whileTap={{ opacity: 0.5 }}
          className="flex items-center gap-2 rounded-full px-2 py-1"
        >
          <Presence size={26} />
          <span className="text-body font-semibold text-label">Companion</span>
        </motion.button>
      </TopBar>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 pt-[calc(var(--safe-top)+44px+16px)] pb-4">
        <p className="m-auto text-caption text-label-tertiary">No messages yet</p>
      </main>

      <footer className="shrink-0 px-4 pb-[calc(var(--safe-bottom)+8px)]">
        <div className="flex h-[140px] items-center justify-center rounded-lg border border-dashed border-outline">
          <span className="text-caption text-label-tertiary">Card hand</span>
        </div>
        <input
          type="text"
          placeholder="Or type something…"
          aria-label="Message"
          className="mt-3 h-9 w-full rounded-full border-[0.5px] border-hairline bg-surface/60 px-4 text-callout text-label outline-none placeholder:text-label-tertiary focus:bg-surface"
        />
      </footer>
    </div>
  )
}
