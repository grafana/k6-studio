import { Button, Flex, Text } from '@radix-ui/themes'
import {
  ExternalLink as ExternalLinkIcon,
  LinkIcon,
  RefreshCw,
} from 'lucide-react'

import grotCrashed from '@/assets/grot-crashed.svg'
import { ExternalLink } from '@/components/ExternalLink'
import { useAssistantSignOut } from '@/hooks/useAssistantAuth'

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
