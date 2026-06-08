import { createContext, ReactNode, useContext } from 'react'

import { BrowserActionStates } from './types'

const ValidationContext = createContext<boolean | undefined>(undefined)

const ActionStateContext = createContext<BrowserActionStates | undefined>(
  undefined
)

interface ValidationProviderProps {
  states: BrowserActionStates
  isValidating: boolean
  children: ReactNode
}

export function ValidationProvider({
  states,
  isValidating,
  children,
}: ValidationProviderProps) {
  return (
    <ValidationContext.Provider value={isValidating}>
      <ActionStateContext.Provider value={states}>
        {children}
      </ActionStateContext.Provider>
    </ValidationContext.Provider>
  )
}

export function useIsValidating() {
  const isValidating = useContext(ValidationContext)

  if (isValidating === undefined) {
    throw new Error('useIsValidating must be used within ValidationProvider')
  }

  return isValidating
}

export function useBrowserActionState(eventId: string) {
  const isValidating = useContext(ValidationContext)
  const states = useContext(ActionStateContext)

  if (isValidating === undefined) {
    throw new Error(
      'useBrowserActionState must be used within ValidationProvider'
    )
  }

  const events = states?.[eventId]
  const state = events?.[events.length - 1]

  return { isValidating, state }
}
