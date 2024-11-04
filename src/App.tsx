import { Theme } from '@radix-ui/themes'
import { Global } from '@emotion/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { enableMapSet } from 'immer'

import { useTheme } from './hooks/useTheme'
import { globalStyles } from './globalStyles'
import { AppRoutes } from './AppRoutes'
import { Toasts } from './components/Toast/Toasts'
import { queryClient } from './utils/query'
import { useCloseSplashScreen } from './hooks/useCloseSplashScreen'

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
      </Theme>
    </QueryClientProvider>
  )
}
