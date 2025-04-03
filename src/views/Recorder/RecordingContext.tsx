import { createContext, ReactNode, useContext } from 'react'

const context = createContext(false)

export function useIsRecording() {
  return useContext(context)
}

interface RecordingContextProps {
  recording: boolean
  children: ReactNode
}

export function RecordingContext({
  recording,
  children,
}: RecordingContextProps) {
  return <context.Provider value={recording}>{children}</context.Provider>
}
