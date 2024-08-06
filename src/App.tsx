import { Theme } from '@radix-ui/themes'
import { Global } from '@emotion/react'

import { useTheme } from './hooks/useTheme'
import { globalStyles } from './globalStyles'
import { AppRoutes } from './AppRoutes'

export function App() {
  const theme = useTheme()

  return (
    <Theme accentColor="violet" appearance={theme}>
      <Global styles={globalStyles} />
      <AppRoutes />
    </Theme>
  )
}
