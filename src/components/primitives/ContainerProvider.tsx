import { createContext, ReactNode, useContext } from 'react'

const context = createContext<HTMLElement>(document.body)

interface ContainerProviderProps {
  container: HTMLElement
  children: ReactNode
}

export function ContainerProvider({
  container,
  children,
}: ContainerProviderProps) {
  return <context.Provider value={container}>{children}</context.Provider>
}

export function useContainerElement() {
  return useContext(context)
}
