import { Callout, Flex } from '@radix-ui/themes'
import { UnplugIcon } from 'lucide-react'

import { useProxyStatus } from '@/hooks/useProxyStatus'
import { UsageEventName } from '@/services/usageTracking/types'
import { useGeneratorStore } from '@/store/generator'
import {
  AutoCorrelation,
  AutoCorrelationFooterContext,
} from '@/views/Generator/AutoCorrelation/AutoCorrelation'
import { CorrelationStatus } from '@/views/Generator/AutoCorrelation/types'

import { useSetupWizard, useStepState } from '../../state/SetupWizardContext'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame, StepHeader } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'
import { CompletedStepSummary } from '../CompletedStepSummary'

const TERMINAL_STATUSES: CorrelationStatus[] = [
  'success',
  'partial-success',
  'failure',
  'correlation-not-needed',
  'aborted',
]

function getSummary(context: AutoCorrelationFooterContext): string {
  if (context.correlationStatus === 'correlation-not-needed') {
    return 'No correlation rules needed'
  }

  const count = context.ruleEntries.length

  return `${count} correlation rule${count === 1 ? '' : 's'} added`
}

function CompletedStep() {
  const { dispatch } = useSetupWizard()
  const stepState = useStepState('autocorrelation')
  const { goBack, goNext } = useWizardNavigation()

  if (stepState.status !== 'completed') {
    return null
  }

  // Re-running withdraws the rules accepted by the previous run; the fresh
  // mount of AutoCorrelation auto-starts a new analysis.
  const handleRerun = () => {
    if (stepState.result.step === 'autocorrelation') {
      const committedIds = new Set(stepState.result.ruleIds)
      const { rules, setRules } = useGeneratorStore.getState()
      setRules(rules.filter((rule) => !committedIds.has(rule.id)))
    }

    dispatch({ type: 'stepRunReset', stepId: 'autocorrelation' })
  }

  return (
    <>
      <StepFrame stepId="autocorrelation">
        <CompletedStepSummary
          summary={stepState.summary}
          log={stepState.log}
          onRerun={handleRerun}
        />
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

function ProxyOfflineStep({ onSkip }: { onSkip: () => void }) {
  const { goBack, goNext } = useWizardNavigation()

  return (
    <>
      <StepFrame stepId="autocorrelation">
        <Callout.Root color="amber">
          <Callout.Icon>
            <UnplugIcon size={16} />
          </Callout.Icon>
          <Callout.Text>
            Autocorrelation validates rules by replaying the recording through
            the proxy, which is currently offline. Wait for the proxy to come
            back online or skip this step.
          </Callout.Text>
        </Callout.Root>
      </StepFrame>
      <WizardFooter
        isLastStep={false}
        canContinue={false}
        onBack={goBack}
        onContinue={goNext}
        onSkip={onSkip}
      />
    </>
  )
}

export function AutocorrelationStep() {
  const { dispatch } = useSetupWizard()
  const stepState = useStepState('autocorrelation')
  const { goBack, goNext } = useWizardNavigation()
  const proxyStatus = useProxyStatus()

  const handleStatusChange = (status: CorrelationStatus) => {
    if (status === 'not-started' || stepState.status === 'running') {
      return
    }

    if (!TERMINAL_STATUSES.includes(status)) {
      dispatch({ type: 'stepRunStarted', stepId: 'autocorrelation' })
    }
  }

  const handleSkip = () => {
    window.studio.app.trackEvent({
      event: UsageEventName.TestSetupWizardStepSkipped,
      payload: { step: 'autocorrelation' },
    })
    dispatch({
      type: 'stepRunCompleted',
      stepId: 'autocorrelation',
      result: { step: 'autocorrelation', ruleIds: [] },
      log: [],
      summary: 'Step skipped - no correlation rules added',
    })
    goNext()
  }

  const handleContinue = (context: AutoCorrelationFooterContext) => () => {
    context.accept()
    dispatch({
      type: 'stepRunCompleted',
      stepId: 'autocorrelation',
      result: {
        step: 'autocorrelation',
        ruleIds: context.ruleEntries.map((entry) => entry.rule.id),
      },
      log: context.logEntries,
      summary: getSummary(context),
    })
    goNext()
  }

  if (stepState.status === 'completed') {
    return <CompletedStep />
  }

  if (proxyStatus !== 'online') {
    return <ProxyOfflineStep onSkip={handleSkip} />
  }

  return (
    <Flex direction="column" flexGrow="1" css={{ minHeight: 0 }}>
      <Flex
        direction="column"
        width="100%"
        maxWidth="860px"
        mx="auto"
        px="5"
        pt="5"
      >
        <StepHeader stepId="autocorrelation" />
      </Flex>
      <AutoCorrelation
        skipIntroduction
        close={goBack}
        onStatusChange={handleStatusChange}
        footer={(context) => (
          <WizardFooter
            isLastStep={false}
            canContinue={
              !context.isLoading &&
              TERMINAL_STATUSES.includes(context.correlationStatus)
            }
            onBack={goBack}
            onContinue={handleContinue(context)}
            onSkip={handleSkip}
          />
        )}
      />
    </Flex>
  )
}
