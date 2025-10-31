import { Flex, Spinner, Text } from '@radix-ui/themes'
import {
  AlertCircleIcon,
  CircleAlert,
  CircleCheckIcon,
  CircleX,
} from 'lucide-react'
import { ComponentProps, ReactNode } from 'react'

import { exhaustive } from '@/utils/typescript'

import { CorrelationStatus } from './types'

const LOADING_MESSAGES: Partial<Record<CorrelationStatus, string>> = {
  validating: 'Validating...',
  analyzing: 'Analyzing requests...',
  'creating-rules': 'Creating rules...',
  finalizing: 'Finalizing...',
}

export function Status({
  correlationStatus,
}: {
  correlationStatus: CorrelationStatus
}) {
  const { icon, text, color } = statusContent(correlationStatus)
  return (
    <Flex align="center" gap="2">
      <Text size="5" color={color} asChild>
        {icon}
      </Text>
      <Text size="3" weight="medium" color={color}>
        {text}
      </Text>
    </Flex>
  )
}

function statusContent(correlationStatus: CorrelationStatus): {
  text: string
  icon: ReactNode
  color: ComponentProps<typeof Text>['color']
} {
  switch (correlationStatus) {
    case 'not-started':
      return { text: '', icon: null, color: 'gray' }
    case 'correlation-not-needed':
      return {
        text: 'Correlation not needed',
        icon: <CircleCheckIcon />,
        color: 'grass',
      }
    case 'validating':
    case 'analyzing':
    case 'creating-rules':
    case 'finalizing':
      return {
        text: LOADING_MESSAGES[correlationStatus] || 'Loading...',
        icon: <Spinner />,
        color: 'gray',
      }
    case 'success':
      return {
        text: 'Autocorrelation completed',
        icon: <CircleCheckIcon />,
        color: 'grass',
      }

    case 'partial-success':
      return {
        text: 'Partially correlated',
        icon: <CircleAlert />,
        color: 'yellow',
      }

    case 'failure':
      return {
        text: 'Autocorrelation failed',
        icon: <CircleX />,
        color: 'red',
      }

    case 'error':
      return {
        text: 'An error occurred during autocorrelation',
        icon: <AlertCircleIcon />,
        color: 'red',
      }

    default:
      return exhaustive(correlationStatus)
  }
}
