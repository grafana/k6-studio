import { createContext, ReactNode, useContext } from 'react'

import { BrowserExtensionClient } from 'extension/src/messaging'

const context = createContext<BrowserExtensionClient | null>(null)

export function useStudioClient() {
  const client = useContext(context)

  if (client === null) {
    throw new Error(
      'useStudioClient must be used within a StudioClientProvider'
    )
  }

  return client
}

interface StudioClientProviderProps {
  client: BrowserExtensionClient
  children: ReactNode
}

export function StudioClientProvider({
  client,
  children,
}: StudioClientProviderProps) {
  return <context.Provider value={client}>{children}</context.Provider>
}
