import { createContext, ReactNode, useContext, useState } from 'react'
import { Replayer } from 'rrweb'

interface PlayerContextValue {
  player: Replayer | null
  setPlayer: (player: Replayer | null) => void
}

const PlayerContext = createContext<PlayerContextValue>({
  player: null,
  setPlayer: () => {},
})

export function usePlayerContext() {
  return useContext(PlayerContext)
}

export function PlayerContextProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Replayer | null>(null)

  return (
    <PlayerContext.Provider value={{ player, setPlayer }}>
      {children}
    </PlayerContext.Provider>
  )
}
