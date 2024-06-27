import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { HashRouter, Route, Routes } from 'react-router-dom'
import 'allotment/dist/style.css'
import './index.css'

import { Layout } from '@/components/Layout/Layout'
import { Recorder } from '@/views/Recorder'
import { Validator } from '@/views/Validator'
import { Home } from '@/views/Home'
import { Generator } from './views/Generator/Generator'

export function App() {
  return (
    <Theme accentColor="violet">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="recorder" element={<Recorder />} />
            <Route path="validator" element={<Validator />} />
            <Route path="generator" element={<Generator />} />
          </Route>
        </Routes>
      </HashRouter>
    </Theme>
  )
}
