import { Button, Flex, Text } from '@radix-ui/themes'
import { ExternalLinkIcon } from 'lucide-react'

interface StackWakePromptProps {
  url: string
}

/** Only a browser can solve the captcha guarding a hibernating instance. */
export function StackWakePrompt({ url }: StackWakePromptProps) {
  const handleOpen = () => window.studio.browser.openExternalLink(url)

  return (
    <Flex direction="column" align="center" gap="3">
      <Text size="2" color="gray">
        Your Grafana instance is hibernating. Open it in your browser to confirm
        you&apos;re not a robot, then come back here.
      </Text>
      <Button size="3" onClick={handleOpen}>
        <ExternalLinkIcon />
        Open my instance
      </Button>
    </Flex>
  )
}
