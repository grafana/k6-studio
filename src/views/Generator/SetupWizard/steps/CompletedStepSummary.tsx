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
      <Callout.Root
        color="green"
        css={{ position: 'relative', paddingRight: 'calc(var(--space-9) * 2)' }}
      >
        <Callout.Icon>
          <CheckIcon size={16} />
        </Callout.Icon>
        <Callout.Text>{summary}</Callout.Text>
        <Box
          css={{
            position: 'absolute',
            top: '50%',
            right: 'var(--space-3)',
            transform: 'translateY(-50%)',
          }}
        >
          <RerunButton onRerun={onRerun} />
        </Box>
      </Callout.Root>
      <CollapsedLog entries={log} />
    </Flex>
  )
}
