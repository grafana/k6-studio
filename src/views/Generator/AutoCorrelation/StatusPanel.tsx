import { Box, Flex, Spinner, Text } from '@radix-ui/themes'
import {
  AlertCircleIcon,
  CircleAlert,
  CircleCheckIcon,
  CircleX,
} from 'lucide-react'

import { fadeIn, scaleUp } from '@/utils/animations'

import { CorrelationStatus } from './types'

interface StatusPanelProps {
  correlationStatus: CorrelationStatus
  isSuccess: boolean
  error?: string
  isLoading: boolean
  outcomeReason?: string
}

const LOADING_MESSAGES: Partial<Record<CorrelationStatus, string>> = {
  validating: 'Validating...',
  analyzing: 'Analyzing requests...',
  'creating-rules': 'Creating rules...',
  finalizing: 'Finalizing...',
}

export function StatusPanel({
  correlationStatus,
  isSuccess,
  error,
  outcomeReason,
}: StatusPanelProps) {
  return (
    <Flex
      align="center"
      justify="center"
      height="100%"
      gap="2"
      css={{ animation: fadeIn }}
    >
      <Status
        error={error}
        success={isSuccess}
        correlationStatus={correlationStatus}
        outcomeReason={outcomeReason}
      />
    </Flex>
  )
}

function Status({
  error,
  correlationStatus,
  outcomeReason,
}: {
  error?: string
  success: boolean
  correlationStatus: CorrelationStatus
  outcomeReason?: string
}) {
  if (error) {
    return (
      <>
        <Text color="red" size="7" asChild>
          <AlertCircleIcon />
        </Text>
        <Text size="5" color="red" weight="medium">
          {error}
        </Text>
      </>
    )
  }

  if (correlationStatus === 'success') {
    return (
      <Flex css={{ animation: scaleUp }} gap="2">
        <Text color="grass" asChild size="7">
          <CircleCheckIcon />
        </Text>
        <Text size="5" color="grass" weight="medium">
          Auto correlation completed
        </Text>
      </Flex>
    )
  }

  if (correlationStatus === 'partial-success') {
    return (
      <Flex direction="column" align="center" gap="2" p="4">
        <Flex gap="2">
          <Text color="yellow" size="7">
            <CircleAlert />
          </Text>
          <Text size="5" color="yellow" weight="medium">
            Partially correlated
          </Text>
        </Flex>
        <Box>
          <Text color="gray" size="2">
            {outcomeReason}
          </Text>
        </Box>
      </Flex>
    )
  }

  if (correlationStatus === 'failure') {
    return (
      <Flex direction="column" align="center" gap="2" p="4">
        <Flex gap="2">
          <Text color="red" size="7">
            <CircleX />
          </Text>
          <Text size="5" color="red" weight="medium">
            Auto correlation failed
          </Text>
        </Flex>
        <Box>
          <Text color="gray" size="2">
            {outcomeReason}
          </Text>
        </Box>
      </Flex>
    )
  }

  return (
    <>
      <Spinner size="3" />
      <Text size="5" color="gray">
        {LOADING_MESSAGES[correlationStatus]}
      </Text>
    </>
  )
}
