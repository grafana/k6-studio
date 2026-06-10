import { Box, Callout, Flex } from '@radix-ui/themes'
import { CheckIcon } from 'lucide-react'

import { ActionLogEntry } from '@/components/Assistant/types'

import { CollapsedLog } from '../CollapsedLog'
import { RerunButton } from '../RerunButton'

interface CompletedStepSummaryProps {
  summary: string
  log: ActionLogEntry[]
  onRerun: () => void
}

export function CompletedStepSummary({
  summary,
  log,
  onRerun,
}: CompletedStepSummaryProps) {
  return (
    <Flex direction="column" gap="3">
      <Flex gap="3" align="center">
        <Box flexGrow="1">
          <Callout.Root color="green">
            <Callout.Icon>
              <CheckIcon size={16} />
            </Callout.Icon>
            <Callout.Text>{summary}</Callout.Text>
          </Callout.Root>
        </Box>
        <RerunButton onRerun={onRerun} />
      </Flex>
      <CollapsedLog entries={log} />
    </Flex>
  )
}
