import { createContext, ReactNode, useContext } from 'react'

const context = createContext<Element | null>(null)

/**
 * Returns the element inside the shadow root that React was mounted to.
 * This must be used by components that uses portals, otherwise they mount
 * elements outside of the shadow DOM meaning styles won't be applied correctly.
 */
export function useContainerElement() {
  const container = useContext(context)

  if (!container) {
    throw new Error('No container element found')
  }

  return container
}

interface ContainerProviderProps {
  container: Element
  children: ReactNode
}

export function ContainerProvider({
  container,
  children,
}: ContainerProviderProps) {
  return <context.Provider value={container}>{children}</context.Provider>
}
