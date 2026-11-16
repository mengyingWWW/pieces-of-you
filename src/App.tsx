import { DeviceFrame } from './components/DeviceFrame'
import { Navigator } from './navigation/Navigator'
import { Chat } from './screens/Chat'
import { Home } from './screens/Home'
import { Profile } from './screens/Profile'
import { GameProvider } from './state/GameContext'

const screens = { home: Home, chat: Chat, profile: Profile }

export default function App() {
  return (
    <GameProvider>
      <DeviceFrame>
        <Navigator initial="home" screens={screens} />
      </DeviceFrame>
    </GameProvider>
  )
}
