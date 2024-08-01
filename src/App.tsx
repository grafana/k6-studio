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
import { RecordingPreviewer } from './views/RecordingPreviewer'

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
            <Route
              path="recording-previewer/:path"
              element={<RecordingPreviewer />}
            />
            <Route path="generator/:path/*" element={<Generator />} />
            <Route path="validator/:path?" element={<Validator />} />
          </Route>
        </Routes>
      </HashRouter>
    </Theme>
  )
}
