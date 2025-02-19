import { createContext, ReactNode, useContext } from 'react'

const context = createContext<Element | null>(null)

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
