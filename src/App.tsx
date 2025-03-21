import { Global } from '@emotion/react'
import { Theme } from '@radix-ui/themes'
import { QueryClientProvider } from '@tanstack/react-query'
import { enableMapSet } from 'immer'

import { DevToolsDialog } from '@/components/DevToolsDialog'
import { SettingsDialog } from '@/components/Settings/SettingsDialog'
import { Toasts } from '@/components/Toast/Toasts'
import { useCloseSplashScreen } from '@/hooks/useCloseSplashScreen'
import { useTheme } from '@/hooks/useTheme'
import { queryClient } from '@/utils/query'

import { AppRoutes } from './AppRoutes'
import { globalStyles } from './globalStyles'

enableMapSet()

export function App() {
  const theme = useTheme()
  useCloseSplashScreen()

  return (
    <QueryClientProvider client={queryClient}>
      <Theme accentColor="orange" appearance={theme}>
        <Global styles={globalStyles} />
        <Toasts />
        <AppRoutes />
        <DevToolsDialog />
        <SettingsDialog />
      </Theme>
    </QueryClientProvider>
  )
}
