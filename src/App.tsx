import { Global } from '@emotion/react'
import { Theme as RadixTheme } from '@radix-ui/themes'
import { QueryClientProvider } from '@tanstack/react-query'
import { enableMapSet } from 'immer'

import { DevToolsDialog } from '@/components/DevToolsDialog'
import { SettingsDialog } from '@/components/Settings/SettingsDialog'
import { Toasts } from '@/components/Toast/Toasts'
import { Theme as StudioTheme } from '@/components/primitives/Theme'
import { WorkspaceProvider, useWorkspace } from '@/contexts/WorkspaceContext'
import { useTheme } from '@/hooks/useTheme'
import { queryClient } from '@/utils/query'

import { AppRoutes } from './AppRoutes'
import { globalStyles } from './globalStyles'

enableMapSet()

function AppContent() {
  const theme = useTheme()
  const { workspacePath } = useWorkspace()

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

export function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  )
}
