import { Button, Flex, Text } from '@radix-ui/themes'
import { ExternalLink, KeyIcon, RefreshCw } from 'lucide-react'

import grotCrashed from '@/assets/grot-crashed.svg'
import { useSettingsChanged } from '@/hooks/useSettings'
import { useStudioUIStore } from '@/store/ui'

interface AutoCorrelationErrorProps {
  error: Error
  onRetry: () => void
}

export function ErrorMessage({ error, onRetry }: AutoCorrelationErrorProps) {
  const errorMessage = error.message.toLowerCase()
  const openSettingsDialog = useStudioUIStore(
    (state) => state.openSettingsDialog
  )

  useSettingsChanged(() => {
    onRetry()
  })

  const retryButton = (
    <Button onClick={onRetry}>
      <RefreshCw />
      Retry
    </Button>
  )

  const openSettingsButton = (
    <Button onClick={() => openSettingsDialog('ai')}>
      <KeyIcon />
      Settings
    </Button>
  )

  const reportIssueButton = (
    <Button onClick={() => window.studio.ui.reportIssue()} variant="outline">
      <ExternalLink />
      Report issue
    </Button>
  )

  if (errorMessage.includes('incorrect api key')) {
    return (
      <MessageContent
        title="Incorrect API key"
        message="The OpenAI API key is incorrect or has been revoked. Check your API key in settings."
      >
        {openSettingsButton}
      </MessageContent>
    )
  }

  if (errorMessage.includes('context window')) {
    return (
      <MessageContent
        title="Token usage limit exceeded"
        message="The recording exceeds the token limit. Try reducing the number of allowed hosts in your recording or work with a smaller recording."
      />
    )
  }

  if (errorMessage.includes('rate limit')) {
    return (
      <MessageContent
        title="Too many requests"
        message="You have exceeded the API rate limit. Wait a moment and try again."
      >
        {retryButton}
      </MessageContent>
    )
  }

  return (
    <MessageContent
      title="Something went wrong"
      message="An unexpected error occurred during auto-correlation. Click retry to try again or report an issue if problem persists."
    >
      {retryButton}
      {reportIssueButton}
    </MessageContent>
  )
}

function MessageContent({
  title,
  message,
  children,
}: {
  title: string
  message: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <Flex
      direction="column"
      align="center"
      gap="6"
      justify="center"
      height="100%"
      p="6"
    >
      <img
        css={{
          maxWidth: '200px',
          transform: 'scaleX(-1)',
        }}
        src={grotCrashed}
        aria-label="Error illustration"
      />

      <Flex direction="column" align="center" gap="3" maxWidth="400px">
        <Text size="4" weight="medium" align="center">
          {title}
        </Text>

        <Text size="2" color="gray" align="center">
          {message}
        </Text>

        <Flex gap="3" mt="4">
          {children}
        </Flex>
      </Flex>
    </Flex>
  )
}
