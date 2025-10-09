import { createContext, useContext } from 'react'

import { BrowserExtensionClient } from 'extension/src/messaging'

const context = createContext<BrowserExtensionClient | null>(null)

export function useBrowserExtensionClient() {
  const client = useContext(context)

  if (!client) {
    throw new Error(
      'useBrowserExtensionClient must be used within a BrowserExtensionClientProvider'
    )
  }

  return client
}

interface BrowserExtensionClientProviderProps {
  client: BrowserExtensionClient
  children: React.ReactNode
}

export function BrowserExtensionClientProvider({
  client,
  children,
}: BrowserExtensionClientProviderProps) {
  return <context.Provider value={client}>{children}</context.Provider>
}
