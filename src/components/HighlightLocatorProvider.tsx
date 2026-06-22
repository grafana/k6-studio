import { createContext, ReactNode, useContext, useState } from 'react'

import { ElementLocator, LocatorOptions } from '@/schemas/locator'

interface HighlightedLocator {
  locator: ElementLocator
  // Chain of iframe locators (outermost first) the element lives in. Absent for
  // top-frame elements.
  frames?: LocatorOptions[]
}

type SetHighlightedLocator = (locator: HighlightTarget) => void
export type HighlightTarget = HighlightedLocator | Element | null

const stateContext = createContext<HighlightTarget | undefined>(undefined)

const dispatchContext = createContext<SetHighlightedLocator | undefined>(
  undefined
)

interface HighlightLocatorProviderProps {
  children: ReactNode
}

export function HighlightLocatorProvider({
  children,
}: HighlightLocatorProviderProps) {
  const [highlightedLocator, setHighlightedLocator] =
    useState<HighlightTarget>(null)

  return (
    <stateContext.Provider value={highlightedLocator}>
      <dispatchContext.Provider value={setHighlightedLocator}>
        {children}
      </dispatchContext.Provider>
    </stateContext.Provider>
  )
}

export function useHighlightedLocator() {
  const locator = useContext(stateContext)

  if (locator === undefined) {
    throw new Error(
      'useHighlightedLocator must be used within HighlightLocatorProvider'
    )
  }

  return locator
}

export function useHighlightLocator() {
  const setHighlightedLocator = useContext(dispatchContext)

  if (setHighlightedLocator === undefined) {
    throw new Error(
      'useHighlightLocator must be used within HighlightLocatorProvider'
    )
  }

  return setHighlightedLocator
}
