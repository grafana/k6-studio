import { Theme } from '@radix-ui/themes'
import { Global } from '@emotion/react'

import { useTheme } from './hooks/useTheme'
import { globalStyles } from './globalStyles'
import { AppRoutes } from './AppRoutes'
import { Toasts } from './components/Toast/Toasts'
import { ElectronToastListener } from './components/EletronToastListener'
import { DevTools } from './components/DevTools'

export function App() {
  const theme = useTheme()

  return (
    <Theme accentColor="orange" appearance={theme}>
      <Global styles={globalStyles} />
      <Toasts />
      <ElectronToastListener />
      <AppRoutes />
      <DevTools />
    </Theme>
  )
}
