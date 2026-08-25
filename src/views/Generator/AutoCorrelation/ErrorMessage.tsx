import { Button } from '@radix-ui/themes'
import {
  ExternalLink as ExternalLinkIcon,
  LinkIcon,
  RefreshCw,
} from 'lucide-react'

import { CONNECT_COPY } from '@/components/Assistant/connectCopy'
import { ErrorMessage as MessageContent } from '@/components/ErrorMessage'
import { ExternalLink } from '@/components/ExternalLink'
import { endRejectedAssistantSession } from '@/hooks/useAssistantAuth'
import {
  AssistantErrorInfo,
  classifyError,
} from '@/utils/assistant/classifyError'

interface AutoCorrelationErrorProps {
  error: Error
  onRetry: () => void
  onReset: () => void
  onClose: () => void
}

export function ErrorMessage({
  error,
  onRetry,
  onReset,
  onClose,
}: AutoCorrelationErrorProps) {
  return (
    <ClassifiedError
      errorInfo={classifyError(error.message)}
      handlers={{
        onRetry,
        onReset,
        onClose,
        // Ending the session sends the user to the same reconnect prompt the
        // wizard shows, whether the tokens lapsed or the server refused them.
        onReconnect: () => {
          void endRejectedAssistantSession()
          onReset()
        },
      }}
    />
  )
}

interface ErrorActionHandlers {
  onRetry: () => void
  onReset: () => void
  onClose: () => void
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
    title: CONNECT_COPY.expired.title,
    message: CONNECT_COPY.expired.description,
    renderActions: ({ onReconnect }) => (
      <Button onClick={onReconnect}>
        <LinkIcon />
        {CONNECT_COPY.expired.action}
      </Button>
    ),
  },
  'context-exceeded': {
    title: 'Recording too large',
    message:
      'This recording has too many requests for AI analysis. Try filtering out unnecessary requests or splitting your recording into smaller sessions.',
    renderActions: ({ onClose }) => (
      <Button onClick={onClose} variant="outline">
        Close
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
