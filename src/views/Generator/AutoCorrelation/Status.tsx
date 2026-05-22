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

interface StatusProps {
  correlationStatus: CorrelationStatus
}

export function Status({ correlationStatus }: StatusProps) {
  switch (correlationStatus) {
    case 'not-started':
      return null

    case 'correlation-not-needed':
      return (
        <StatusContent
          text="Correlation not needed"
          icon={<CircleCheckIcon />}
          color="grass"
        />
      )

    case 'validating':
    case 'analyzing':
    case 'creating-rules':
    case 'finalizing':
      return (
        <StatusContent
          text="Analyzing requests"
          icon={<Spinner />}
          color="gray"
        />
      )

    case 'success':
      return (
        <StatusContent
          text="Completed"
          icon={<CircleCheckIcon />}
          color="grass"
        />
      )

    case 'partial-success':
      return (
        <StatusContent
          text="Partially correlated"
          icon={<CircleAlert />}
          color="yellow"
        />
      )

    case 'failure':
      return <StatusContent text="Failed" icon={<CircleX />} color="red" />

    case 'error':
      return (
        <StatusContent text="Error" icon={<AlertCircleIcon />} color="red" />
      )

    case 'aborted':
      return <StatusContent text="Stopped" icon={<CircleX />} color="gray" />

    default:
      return exhaustive(correlationStatus)
  }
}

function StatusContent({
  color,
  text,
  icon,
}: {
  text: string
  icon: ReactNode
  color: ComponentProps<typeof Text>['color']
}) {
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
