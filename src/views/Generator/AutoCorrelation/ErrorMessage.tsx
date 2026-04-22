import { Button, Flex, Text } from '@radix-ui/themes'
import {
  ExternalLink as ExternalLinkIcon,
  KeyIcon,
  LinkIcon,
  RefreshCw,
} from 'lucide-react'

import grotCrashed from '@/assets/grot-crashed.svg'
import { ExternalLink } from '@/components/ExternalLink'
import { useAssistantSignOut } from '@/hooks/useAssistantAuth'
import { useSettingsChanged } from '@/hooks/useSettings'
import { useFeaturesStore } from '@/store/features'
import { useStudioUIStore } from '@/store/ui'

import { AssistantErrorInfo, classifyError } from './utils/classifyError'

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

  const openSettingsButton = (
    <Button onClick={() => openSettingsDialog('ai')}>
      <KeyIcon />
      Settings
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
        {retryButton(onRetry)}
      </MessageContent>
    )
  }

  return (
    <MessageContent
      title="Something went wrong"
      message="An unexpected error occurred during autocorrelation. Click retry to try again or report an issue if problem persists."
    >
      {retryButton(onRetry)}
      {reportIssueButton}
    </MessageContent>
  )
}

function GrafanaAssistantError({
  error,
  onRetry,
  onReset,
}: AutoCorrelationErrorProps) {
  const { mutate: signOut } = useAssistantSignOut()

  return (
    <ClassifiedError
      errorInfo={classifyError(error.message)}
      handlers={{
        onRetry,
        onReset,
        onReconnect: () => {
          signOut()
          onReset()
        },
      }}
    />
  )
}

interface ErrorActionHandlers {
  onRetry: () => void
  onReset: () => void
  onReconnect: () => void
}

type ErrorContent = {
  title: string
  message: string
  renderActions: (handlers: ErrorActionHandlers) => React.ReactNode
}

const retryButton = (onRetry: () => void) => (
  <Button onClick={onRetry}>
    <RefreshCw />
    Retry
  </Button>
)

const reportIssueButton = (
  <Button onClick={() => window.studio.ui.reportIssue()} variant="outline">
    <ExternalLinkIcon />
    Report issue
  </Button>
)

const ERROR_CONTENT: Record<AssistantErrorInfo['category'], ErrorContent> = {
  'auth-expired': {
    title: 'Session expired',
    message:
      'Your Grafana Assistant session has expired. Please reconnect to continue.',
    renderActions: ({ onReconnect }) => (
      <Button onClick={onReconnect}>
        <LinkIcon />
        Reconnect
      </Button>
    ),
  },
  'quota-exceeded': {
    title: 'Usage limit reached',
    message: "You've reached your monthly prompt limit.",
    renderActions: ({ onReset }) => (
      <>
        <ExternalLink href="https://grafana.com/pricing/">
          <Button variant="outline">
            <ExternalLinkIcon />
            Upgrade plan
          </Button>
        </ExternalLink>
        <Button onClick={onReset} variant="outline">
          Go back
        </Button>
      </>
    ),
  },
  network: {
    title: 'Connection error',
    message:
      'Could not connect to Grafana Assistant. Check your internet connection and try again.',
    renderActions: ({ onRetry }) => retryButton(onRetry),
  },
  unknown: {
    title: 'Something went wrong',
    message:
      'An unexpected error occurred. Click retry to try again or report an issue if the problem persists.',
    renderActions: ({ onRetry }) => (
      <>
        {retryButton(onRetry)}
        {reportIssueButton}
      </>
    ),
  },
}

interface ClassifiedErrorProps {
  errorInfo: AssistantErrorInfo
  handlers: ErrorActionHandlers
}

function ClassifiedError({ errorInfo, handlers }: ClassifiedErrorProps) {
  const { title, message, renderActions } = ERROR_CONTENT[errorInfo.category]

  return (
    <MessageContent title={title} message={message}>
      {renderActions(handlers)}
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
