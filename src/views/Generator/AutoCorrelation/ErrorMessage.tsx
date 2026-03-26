import { Button, Flex, Text } from '@radix-ui/themes'
import {
  ExternalLink as ExternalLinkIcon,
  KeyIcon,
  LinkIcon,
  RefreshCw,
  UserRoundIcon,
} from 'lucide-react'

import grotCrashed from '@/assets/grot-crashed.svg'
import { ExternalLink } from '@/components/ExternalLink'
import { useAssistantSignOut } from '@/hooks/useAssistantAuth'
import { useSettingsChanged } from '@/hooks/useSettings'
import { useFeaturesStore } from '@/store/features'
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
  const isGrafanaAssistant = useFeaturesStore(
    (state) => state.features['grafana-assistant']
  )

  if (isGrafanaAssistant) {
    return (
      <GrafanaAssistantError
        error={error}
        onRetry={onRetry}
        onReset={onReset}
      />
    )
  }

  return <OpenAiError error={error} onRetry={onRetry} />
}

function OpenAiError({
  error,
  onRetry,
}: Pick<AutoCorrelationErrorProps, 'error' | 'onRetry'>) {
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
      <ExternalLinkIcon />
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

  if (errorMessage.includes('insufficient_quota')) {
    return (
      <MessageContent
        title="Quota exceeded"
        message={
          <>
            You have exceeded your OpenAI API quota. Check your{' '}
            <ExternalLink href="https://platform.openai.com/account/billing">
              plan and billing details
            </ExternalLink>{' '}
            on the OpenAI platform.
          </>
        }
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
      message="An unexpected error occurred during autocorrelation. Click retry to try again or report an issue if problem persists."
    >
      {retryButton}
      {reportIssueButton}
    </MessageContent>
  )
}

function GrafanaAssistantError({
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
