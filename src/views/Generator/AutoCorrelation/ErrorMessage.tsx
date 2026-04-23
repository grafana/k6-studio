import { Button, Flex, Text } from '@radix-ui/themes'
import {
  ExternalLink as ExternalLinkIcon,
  LinkIcon,
  RefreshCw,
  UserRoundIcon,
} from 'lucide-react'

import grotCrashed from '@/assets/grot-crashed.svg'
import { useAssistantSignOut } from '@/hooks/useAssistantAuth'
import { useStudioUIStore } from '@/store/ui'

interface AutoCorrelationErrorProps {
  error: Error
  onRetry: () => void
  onReset: () => void
}

export function ErrorMessage({
  error,
  onRetry,
  onReset,
}: AutoCorrelationErrorProps) {
  const errorMessage = error.message.toLowerCase()
  const openProfileDialog = useStudioUIStore((s) => s.openProfileDialog)
  const { mutate: signOut } = useAssistantSignOut()

  const isAuthError =
    errorMessage.includes('not authenticated') ||
    errorMessage.includes('refresh token') ||
    errorMessage.includes('token refresh failed')

  const isNotSignedIn = errorMessage.includes('no grafana cloud stack')

  if (isAuthError) {
    return (
      <MessageContent
        title="Session expired"
        message="Your Grafana Assistant session has expired. Please reconnect to continue."
      >
        <Button
          onClick={() => {
            signOut()
            onReset()
          }}
        >
          <LinkIcon />
          Reconnect
        </Button>
      </MessageContent>
    )
  }

  if (isNotSignedIn) {
    return (
      <MessageContent
        title="Not signed in"
        message="Sign in to Grafana Cloud to use the Grafana Assistant."
      >
        <Button onClick={openProfileDialog}>
          <UserRoundIcon />
          Sign in to Grafana Cloud
        </Button>
      </MessageContent>
    )
  }

  return (
    <MessageContent
      title="Something went wrong"
      message="An unexpected error occurred during autocorrelation. Click retry to try again or report an issue if problem persists."
    >
      <Button onClick={onRetry}>
        <RefreshCw />
        Retry
      </Button>
      <Button onClick={() => window.studio.ui.reportIssue()} variant="outline">
        <ExternalLinkIcon />
        Report issue
      </Button>
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
