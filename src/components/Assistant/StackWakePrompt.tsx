import { Button, Flex, Text } from '@radix-ui/themes'
import { ExternalLinkIcon } from 'lucide-react'

interface StackWakePromptProps {
  url: string
}

/**
 * Grafana Cloud guards hibernating instances with a captcha, so k6 Studio can't
 * wake them on its own. Send the user to their instance to click it instead.
 */
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
