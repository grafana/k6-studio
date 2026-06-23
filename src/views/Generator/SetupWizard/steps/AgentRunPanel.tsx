import { Box, Button, Callout, Flex, Text } from '@radix-ui/themes'
import { AlertTriangleIcon } from 'lucide-react'

import { ActionsLog } from '@/components/Assistant/ActionsLog'
import { ActionLogEntry } from '@/components/Assistant/types'
import { AgentRunStatus } from '@/utils/assistant/useAssistantAgent'

import { StepId, StepState } from '../state/types'
import { StepFrame } from '../StepFrame'
import { WizardFooter } from '../WizardFooter'

interface AgentRun {
  state: StepState
  status: AgentRunStatus
  logEntries: ActionLogEntry[]
  errorMessage: string
  runningLabel: string
  onRestart: () => void
}

interface AgentRunNav {
  onBack: () => void
  onContinue: () => void
  onSkip: () => void
}

interface AgentRunPanelProps {
  stepId: StepId
  run: AgentRun
  nav: AgentRunNav
}

export function AgentRunPanel({ stepId, run, nav }: AgentRunPanelProps) {
  return (
    <>
      <StepFrame stepId={stepId}>
        <Flex direction="column" gap="3" flexGrow="1" css={{ minHeight: 0 }}>
          <RunFailure stepState={run.state} errorMessage={run.errorMessage} />
          <RestartButton stepState={run.state} onRestart={run.onRestart} />
          <Box
            css={{
              border: '1px solid var(--gray-4)',
              borderRadius: 'var(--radius-3)',
              minHeight: 200,
              flexGrow: 1,
            }}
          >
            <ActionsLog
              entries={run.logEntries}
              pending={run.status === 'running'}
            />
          </Box>
        </Flex>
      </StepFrame>
      <WizardFooter
        canContinue={false}
        onBack={nav.onBack}
        onContinue={nav.onContinue}
        onSkip={nav.onSkip}
      >
        <RunningLabel status={run.status} runningLabel={run.runningLabel} />
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
