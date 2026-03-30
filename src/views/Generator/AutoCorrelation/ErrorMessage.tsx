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
import { classifyError } from '@/handlers/ai/a2a/classifyError'
import { useAssistantSignOut } from '@/hooks/useAssistantAuth'
import { useSettingsChanged } from '@/hooks/useSettings'
import { useFeaturesStore } from '@/store/features'
import { useStudioUIStore } from '@/store/ui'
import { AssistantErrorInfo, isRetryable } from '@/types/assistant'

interface AutoCorrelationErrorProps {
  error: Error
  onRetry: () => void
  onReset: () => void
  assistantErrorInfo?: AssistantErrorInfo
}

export function ErrorMessage({
  error,
  onRetry,
  onReset,
  assistantErrorInfo,
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
        assistantErrorInfo={assistantErrorInfo}
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
  assistantErrorInfo,
}: AutoCorrelationErrorProps) {
  const openProfileDialog = useStudioUIStore((s) => s.openProfileDialog)
  const { mutate: signOut } = useAssistantSignOut()

  const errorInfo = assistantErrorInfo ?? classifyError(error.message)

  return (
    <ClassifiedError
      errorInfo={errorInfo}
      onRetry={onRetry}
      onReset={onReset}
      onReconnect={() => {
        signOut()
        onReset()
      }}
      onSignIn={openProfileDialog}
    />
  )
}

const ERROR_CONTENT: Record<
  AssistantErrorInfo['category'],
  { title: string; message: string }
> = {
  'auth-expired': {
    title: 'Session expired',
    message:
      'Your Grafana Assistant session has expired. Please reconnect to continue.',
  },
  'no-stack': {
    title: 'Not signed in',
    message: 'Sign in to Grafana Cloud to use the Grafana Assistant.',
  },
  'rate-limit': {
    title: 'Too many requests',
    message:
      "You've sent too many requests. Please wait a moment and try again.",
  },
  'quota-exceeded': {
    title: 'Usage limit reached',
    message: "You've reached your monthly prompt limit.",
  },
  'context-window': {
    title: 'Recording too large',
    message:
      'The recording exceeds the token limit. Try reducing the number of allowed hosts or work with a smaller recording.',
  },
  'service-unavailable': {
    title: 'Service unavailable',
    message:
      'Grafana Assistant is temporarily unavailable. Please try again later.',
  },
  network: {
    title: 'Connection error',
    message:
      'Could not connect to Grafana Assistant. Check your internet connection and try again.',
  },
  unknown: {
    title: 'Something went wrong',
    message:
      'An unexpected error occurred. Click retry to try again or report an issue if the problem persists.',
  },
}

function ClassifiedError({
  errorInfo,
  onRetry,
  onReset,
  onReconnect,
  onSignIn,
}: {
  errorInfo: AssistantErrorInfo
  onRetry: () => void
  onReset: () => void
  onReconnect: () => void
  onSignIn: () => void
}) {
  const { category } = errorInfo
  const { title, message } = ERROR_CONTENT[category]

  if (category === 'auth-expired') {
    return (
      <MessageContent title={title} message={message}>
        <Button onClick={onReconnect}>
          <LinkIcon />
          Reconnect
        </Button>
      </MessageContent>
    )
  }

  if (category === 'no-stack') {
    return (
      <MessageContent title={title} message={message}>
        <Button onClick={onSignIn}>
          <UserRoundIcon />
          Sign in to Grafana Cloud
        </Button>
      </MessageContent>
    )
  }

  if (category === 'quota-exceeded') {
    return (
      <MessageContent title={title} message={message}>
        {errorInfo.upgradeUrl && (
          <ExternalLink href={errorInfo.upgradeUrl}>
            <Button variant="outline">
              <ExternalLinkIcon />
              Upgrade plan
            </Button>
          </ExternalLink>
        )}
        <Button onClick={onReset} variant="outline">
          Go back
        </Button>
      </MessageContent>
    )
  }

  if (category === 'context-window') {
    return (
      <MessageContent title={title} message={message}>
        <Button onClick={onReset} variant="outline">
          Go back
        </Button>
      </MessageContent>
    )
  }

  return (
    <MessageContent title={title} message={message}>
      {isRetryable(category) && (
        <Button onClick={onRetry}>
          <RefreshCw />
          Retry
        </Button>
      )}
      {category === 'unknown' && (
        <Button
          onClick={() => window.studio.ui.reportIssue()}
          variant="outline"
        >
          <ExternalLinkIcon />
          Report issue
        </Button>
      )}
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
