import { Box, Theme } from '@radix-ui/themes'
import { Recorder } from '@/views/Recorder'
import '@radix-ui/themes/styles.css'
import './index.css'

export function App() {
  return (
    <Theme>
      <Box p="5">
        <h1>💖 Welcome to k6 studio!</h1>
        <Recorder />
      </Box>
    </Theme>
  )
}
