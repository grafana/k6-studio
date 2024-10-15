import { Theme } from '@radix-ui/themes'
import { Global } from '@emotion/react'

import { useTheme } from './hooks/useTheme'
import { globalStyles } from './globalStyles'
import { AppRoutes } from './AppRoutes'
import { Toasts } from './components/Toast/Toasts'
import { DevTools } from './components/DevTools'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './utils/query'
import { useCloseSplashScreen } from './hooks/useCloseSplashScreen'

export function App() {
  const theme = useTheme()
  useCloseSplashScreen()

  return (
    <QueryClientProvider client={queryClient}>
      <Theme accentColor="orange" appearance={theme}>
        <Global styles={globalStyles} />
        <Toasts />
        <AppRoutes />
        <DevTools />
      </Theme>
    </QueryClientProvider>
  )
}
