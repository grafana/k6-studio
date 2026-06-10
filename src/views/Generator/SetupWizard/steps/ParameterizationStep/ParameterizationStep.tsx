import { Box, Button, Callout, Flex, Text } from '@radix-ui/themes'
import { AlertTriangleIcon, CheckIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { ActionsLog } from '@/components/Assistant/ActionsLog'
import { useGeneratorStore } from '@/store/generator'

import { useStepState } from '../../state/SetupWizardContext'
import { ParamSuggestionMeta } from '../../state/types'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'

import { ParamCard } from './ParamCard'
import { useParameterizationAgent } from './useParameterizationAgent'

function ParamCardList({
  suggestions,
}: {
  suggestions: ParamSuggestionMeta[]
}) {
  const rules = useGeneratorStore((store) => store.rules)

  const cards = suggestions.flatMap((meta) => {
    const rule = rules.find((candidate) => candidate.id === meta.ruleId)

    // Removed rules drop out of the list; the store is the source of truth.
    if (rule === undefined || rule.type !== 'parameterization') {
      return []
    }

    return [<ParamCard key={meta.ruleId} meta={meta} rule={rule} />]
  })

  if (cards.length === 0) {
    return (
      <Text size="2" color="gray">
        No parameterization rules left. Continue to the next step.
      </Text>
    )
  }

  return (
    <Flex direction="column" gap="3">
      {cards}
    </Flex>
  )
}

function CompletedParameterizationStep() {
  const stepState = useStepState('parameterization')
  const { goBack, goNext } = useWizardNavigation()

  if (
    stepState.status !== 'completed' ||
    stepState.result.step !== 'parameterization'
  ) {
    return null
  }

  return (
    <>
      <StepFrame stepId="parameterization">
        <Flex direction="column" gap="3">
          <Callout.Root color="amber">
            <Callout.Icon>
              <CheckIcon size={16} />
            </Callout.Icon>
            <Callout.Text>{stepState.summary}</Callout.Text>
          </Callout.Root>
          <ParamCardList suggestions={stepState.result.suggestions} />
        </Flex>
      </StepFrame>
      <WizardFooter
        isLastStep={false}
        canContinue
        onBack={goBack}
        onContinue={goNext}
      />
    </>
  )
}

export function ParameterizationStep() {
  const stepState = useStepState('parameterization')
  const { goBack, goNext } = useWizardNavigation()
  const { start, restart, stop, logEntries, status } =
    useParameterizationAgent()

  const hasAutoStarted = useRef(false)

  useEffect(() => {
    if (hasAutoStarted.current || stepState.status !== 'not-started') {
      return
    }

    hasAutoStarted.current = true
    start()
    // The ref guard makes this a mount-only auto-start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepState.status])

  useEffect(() => {
    return () => {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (stepState.status === 'completed') {
    return <CompletedParameterizationStep />
  }

  return (
    <>
      <StepFrame stepId="parameterization">
        <Flex direction="column" gap="3" flexGrow="1" css={{ minHeight: 0 }}>
          {(stepState.status === 'error' || stepState.status === 'aborted') && (
            <>
              <Callout.Root color="amber">
                <Callout.Icon>
                  <AlertTriangleIcon size={16} />
                </Callout.Icon>
                <Callout.Text>
                  {stepState.status === 'error'
                    ? 'The Assistant could not analyze this recording for parameterization.'
                    : 'The analysis was stopped.'}
                </Callout.Text>
              </Callout.Root>
              <Flex>
                <Button variant="outline" color="gray" onClick={restart}>
                  Run analysis again
                </Button>
              </Flex>
            </>
          )}
          <Box
            css={{
              border: '1px solid var(--gray-4)',
              borderRadius: 'var(--radius-3)',
              minHeight: 200,
              flexGrow: 1,
            }}
          >
            <ActionsLog entries={logEntries} />
          </Box>
        </Flex>
      </StepFrame>
      <WizardFooter
        isLastStep={false}
        canContinue={false}
        onBack={goBack}
        onContinue={goNext}
      >
        {status === 'running' && (
          <Text size="1" color="gray">
            Finding values to parameterize...
          </Text>
        )}
      </WizardFooter>
    </>
  )
}
