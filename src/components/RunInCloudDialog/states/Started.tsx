import { Button, Flex } from '@radix-ui/themes'
import { StartedState } from './types'

interface StartedStateProps {
  state: StartedState
}

export function Started({ state }: StartedStateProps) {
  const handleOpenClick = () => {
    window.studio.browser.openExternalLink(state.testRunUrl).catch((error) => {
      console.error('Failed to open test run:', error)
    })
  }

  return (
    <Flex direction="column" align="center" gap="2">
      <h1>Test run started</h1>
      <Button onClick={handleOpenClick}>Open test run</Button>
    </Flex>
  )
}
