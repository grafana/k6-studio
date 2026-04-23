import { createContext, ReactNode, useContext, useState } from 'react'

import { NodeSelector } from '@/schemas/selectors'

type SetHighlightedSelector = (selector: NodeSelector | null) => void

const stateContext = createContext<NodeSelector | null | undefined>(undefined)
const dispatchContext = createContext<SetHighlightedSelector | undefined>(
  undefined
)

interface HighlightSelectorProviderProps {
  children: ReactNode
}

export function HighlightSelectorProvider({
  children,
}: HighlightSelectorProviderProps) {
  const [highlightedSelector, setHighlightedSelector] =
    useState<NodeSelector | null>(null)

  return (
    <stateContext.Provider value={highlightedSelector}>
      <dispatchContext.Provider value={setHighlightedSelector}>
        {children}
      </dispatchContext.Provider>
    </stateContext.Provider>
  )
}

export function useHighlightedSelector() {
  const selector = useContext(stateContext)

  if (selector === undefined) {
    throw new Error(
      'useHighlightedSelector must be used within HighlightSelectorProvider'
    )
  }

  return selector
}

export function useHighlightSelector() {
  const setHighlightedSelector = useContext(dispatchContext)

  if (setHighlightedSelector === undefined) {
    throw new Error(
      'useHighlightSelector must be used within HighlightSelectorProvider'
    )
  }

  return setHighlightedSelector
}
