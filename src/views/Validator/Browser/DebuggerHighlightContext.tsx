import { createContext, useContext, useState, ReactNode } from 'react'
import { Replayer } from 'rrweb'

import { NodeSelector } from '@/schemas/selectors'

interface DebuggerHighlightContextValue {
  highlightedSelector: NodeSelector | null
  setHighlightedSelector: (selector: NodeSelector | null) => void
  replayer: Replayer | null
  setReplayer: (replayer: Replayer | null) => void
}

const DebuggerHighlightContext = createContext<
  DebuggerHighlightContextValue | undefined
>(undefined)

export function useDebuggerHighlight() {
  const context = useContext(DebuggerHighlightContext)

  if (context === undefined) {
    throw new Error(
      'useDebuggerHighlight must be used within a DebuggerHighlightProvider'
    )
  }

  return context
}

interface DebuggerHighlightProviderProps {
  children: ReactNode
}

export function DebuggerHighlightProvider({
  children,
}: DebuggerHighlightProviderProps) {
  const [highlightedSelector, setHighlightedSelector] =
    useState<NodeSelector | null>(null)
  const [replayer, setReplayer] = useState<Replayer | null>(null)

  return (
    <DebuggerHighlightContext.Provider
      value={{
        highlightedSelector,
        setHighlightedSelector,
        replayer,
        setReplayer,
      }}
    >
      {children}
    </DebuggerHighlightContext.Provider>
  )
}
