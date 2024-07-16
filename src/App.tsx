import { Theme } from '@radix-ui/themes'
import { Global } from '@emotion/react'
import { HashRouter, Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/Layout/Layout'
import { Recorder } from '@/views/Recorder'
import { Validator } from '@/views/Validator'
import { Home } from '@/views/Home'
import { Generator } from './views/Generator/Generator'
import { useTheme } from './hooks/useTheme'
import { globalStyles } from './globalStyles'

export function App() {
  const theme = useTheme()

  return (
    <Theme accentColor="violet" appearance={theme}>
      <Global styles={globalStyles} />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="recorder" element={<Recorder />} />
            <Route path="validator" element={<Validator />} />
            <Route path="generator/*" element={<Generator />} />
          </Route>
        </Routes>
      </HashRouter>
    </Theme>
  )
}
