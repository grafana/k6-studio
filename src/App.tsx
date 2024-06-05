import { Container, Theme } from '@radix-ui/themes'
import { Recorder } from '@/views/Recorder'
import '@radix-ui/themes/styles.css'

export function App() {
  return (
    <Theme>
      <Container p="5">
        <h1>💖 Welcome to k6 studio!</h1>
        <p>🎉🎉🎉🎉🎉🎉</p>
        <Recorder />
      </Container>
    </Theme>
  )
}
