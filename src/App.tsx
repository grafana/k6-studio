import { Global } from '@emotion/react'
import { Theme as RadixTheme } from '@radix-ui/themes'
import { QueryClientProvider } from '@tanstack/react-query'
import { enableMapSet } from 'immer'
import { useEffect, useState } from 'react'

import { DevToolsDialog } from '@/components/DevToolsDialog'
import { SettingsDialog } from '@/components/Settings/SettingsDialog'
import { Toasts } from '@/components/Toast/Toasts'
import { Theme as StudioTheme } from '@/components/primitives/Theme'
import { useTheme } from '@/hooks/useTheme'
import { queryClient } from '@/utils/query'

import { AppRoutes } from './AppRoutes'
import { globalStyles } from './globalStyles'

enableMapSet()

export function App() {
  const theme = useTheme()

  const [workspacePath, setWorkspacePath] = useState<string | null>(null)

  useEffect(() => {
    window.studio.workspace
      .getWorkspacePath()
      .then(setWorkspacePath)
      .then(() => window.studio.app.closeSplashscreen())
      .catch(console.error)
  }, [])

  useEffect(() => {
    return window.studio.workspace.onChangeWorkspace((path) => {
      setWorkspacePath(path)
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <StudioTheme />
      <RadixTheme accentColor="orange" appearance={theme}>
        <Global styles={globalStyles} />
        <Toasts />
        <AppRoutes key={workspacePath} />
        <DevToolsDialog />
        <SettingsDialog />
      </RadixTheme>
    </QueryClientProvider>
  )
}
