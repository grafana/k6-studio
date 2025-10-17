import { createContext, useContext } from 'react'

import { BrowserToStudioClient } from 'extension/src/core/clients/browserToStudio'

const context = createContext<BrowserToStudioClient | null>(null)

export function useStudioClient() {
  const client = useContext(context)

  if (!client) {
    throw new Error(
      'useStudioClient must be used within a StudioClientProvider'
    )
  }

  return client
}

interface StudioClientProviderProps {
  client: BrowserToStudioClient
  children: React.ReactNode
}

export function StudioClientProvider({
  client,
  children,
}: StudioClientProviderProps) {
  return <context.Provider value={client}>{children}</context.Provider>
}
