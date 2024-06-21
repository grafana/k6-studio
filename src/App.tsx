import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import './index.css'
import { Layout } from './components/Layout/Layout'

export function App() {
  return (
    <Theme accentColor="violet">
      <Layout />
    </Theme>
  )
}
