import { Box, Button, Callout, Flex, Text } from '@radix-ui/themes'
import { AlertTriangleIcon } from 'lucide-react'

import { ActionsLog } from '@/components/Assistant/ActionsLog'
import { ActionLogEntry } from '@/components/Assistant/types'
import { AgentRunStatus } from '@/utils/assistant/useAssistantAgent'

import { StepId, StepState } from '../state/types'
import { StepFrame } from '../StepFrame'
import { WizardFooter } from '../WizardFooter'

interface AgentRunPanelProps {
  stepId: StepId
  stepState: StepState
  logEntries: ActionLogEntry[]
  status: AgentRunStatus
  onRestart: () => void
  errorMessage: string
  runningLabel: string
  onBack: () => void
  onContinue: () => void
  onSkip: () => void
}

export function AgentRunPanel({
  stepId,
  stepState,
  logEntries,
  status,
  onRestart,
  errorMessage,
  runningLabel,
  onBack,
  onContinue,
  onSkip,
}: AgentRunPanelProps) {
  return (
    <>
      <StepFrame stepId={stepId}>
        <Flex direction="column" gap="3" flexGrow="1" css={{ minHeight: 0 }}>
          <RunFailure stepState={stepState} errorMessage={errorMessage} />
          <RestartButton stepState={stepState} onRestart={onRestart} />
          <Box
            css={{
              border: '1px solid var(--gray-4)',
              borderRadius: 'var(--radius-3)',
              minHeight: 200,
              flexGrow: 1,
            }}
          >
            <ActionsLog entries={logEntries} pending={status === 'running'} />
          </Box>
        </Flex>
      </StepFrame>
      <WizardFooter
        canContinue={false}
        onBack={onBack}
        onContinue={onContinue}
        onSkip={onSkip}
      >
        <RunningLabel status={status} runningLabel={runningLabel} />
      </WizardFooter>
    </>
  )
}

interface RunFailureProps {
  stepState: StepState
  errorMessage: string
}

function RunFailure({ stepState, errorMessage }: RunFailureProps) {
  if (stepState.status !== 'error' && stepState.status !== 'aborted') {
    return null
  }

  const text =
    stepState.status === 'error' ? errorMessage : 'The analysis was stopped.'

  return (
    <Callout.Root color="amber">
      <Callout.Icon>
        <AlertTriangleIcon size={16} />
      </Callout.Icon>
      <Callout.Text>{text}</Callout.Text>
    </Callout.Root>
  )
}

interface RestartButtonProps {
  stepState: StepState
  onRestart: () => void
}

function RestartButton({ stepState, onRestart }: RestartButtonProps) {
  if (stepState.status !== 'error' && stepState.status !== 'aborted') {
    return null
  }

  return (
    <Flex>
      <Button variant="outline" color="gray" onClick={onRestart}>
        Run analysis again
      </Button>
    </Flex>
  )
}

interface RunningLabelProps {
  status: AgentRunStatus
  runningLabel: string
}

function RunningLabel({ status, runningLabel }: RunningLabelProps) {
  if (status !== 'running') {
    return null
  }

  return (
    <Text size="1" color="gray">
      {runningLabel}
    </Text>
  )
}
