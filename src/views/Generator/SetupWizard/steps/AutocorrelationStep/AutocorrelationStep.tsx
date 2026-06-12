import { Box, Callout, Flex } from '@radix-ui/themes'
import { UnplugIcon } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { useProxyStatus } from '@/hooks/useProxyStatus'
import { UsageEventName } from '@/services/usageTracking/types'
import { useGeneratorStore } from '@/store/generator'
import {
  AutoCorrelation,
  AutoCorrelationFooterContext,
} from '@/views/Generator/AutoCorrelation/AutoCorrelation'
import { RuleCard } from '@/views/Generator/AutoCorrelation/RuleCard'
import {
  CorrelationStatus,
  SuggestedRuleEntry,
} from '@/views/Generator/AutoCorrelation/types'

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

function getSummary(status: CorrelationStatus, count: number): string {
  if (status === 'correlation-not-needed') {
    return 'No correlation rules needed'
  }

  return `${count} correlation rule${count === 1 ? '' : 's'} added`
}

function CompletedStep() {
  const { dispatch } = useSetupWizard()
  const stepState = useStepState('autocorrelation')
  const { goBack, goNext } = useWizardNavigation()
  const rules = useGeneratorStore((store) => store.rules)
  const setRules = useGeneratorStore((store) => store.setRules)

  if (
    stepState.status !== 'completed' ||
    stepState.result.step !== 'autocorrelation'
  ) {
    return null
  }

  const { entries } = stepState.result

  // Re-running withdraws the rules accepted by the previous run; the fresh
  // mount of AutoCorrelation auto-starts a new analysis.
  const handleRerun = () => {
    const committedIds = new Set(entries.map((entry) => entry.rule.id))
    setRules(rules.filter((rule) => !committedIds.has(rule.id)))
    dispatch({ type: 'stepRunReset', stepId: 'autocorrelation' })
  }

  const handleRemoveRule = (ruleId: string) => {
    const remaining = entries.filter((entry) => entry.rule.id !== ruleId)
    setRules(rules.filter((rule) => rule.id !== ruleId))
    dispatch({
      type: 'stepRunCompleted',
      stepId: 'autocorrelation',
      result: { step: 'autocorrelation', entries: remaining },
      log: stepState.log,
      summary: getSummary('success', remaining.length),
    })
  }

  return (
    <>
      <StepFrame stepId="autocorrelation">
        <Flex direction="column" gap="3">
          <CompletedStepSummary
            summary={stepState.summary}
            log={stepState.log}
            onRerun={handleRerun}
          />
          {entries.map((entry) => (
            <RuleCard
              key={entry.rule.id}
              entry={entry}
              onRemove={handleRemoveRule}
              disabled={false}
            />
          ))}
        </Flex>
      </StepFrame>
      <WizardFooter canContinue onBack={goBack} onContinue={goNext} />
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
  const [footerHost, setFooterHost] = useState<HTMLDivElement | null>(null)

  const handleStatusChange = (status: CorrelationStatus) => {
    if (status === 'not-started' || stepState.status === 'running') {
      return
    }

    if (!TERMINAL_STATUSES.includes(status)) {
      dispatch({ type: 'stepRunStarted', stepId: 'autocorrelation' })
    }
  }

  const completeStep = (
    entries: SuggestedRuleEntry[],
    context: Pick<
      AutoCorrelationFooterContext,
      'logEntries' | 'correlationStatus'
    >
  ) => {
    dispatch({
      type: 'stepRunCompleted',
      stepId: 'autocorrelation',
      result: { step: 'autocorrelation', entries },
      log: context.logEntries,
      summary: getSummary(context.correlationStatus, entries.length),
    })
  }

  const handleSkip = () => {
    window.studio.app.trackEvent({
      event: UsageEventName.TestSetupWizardStepSkipped,
      payload: { step: 'autocorrelation' },
    })
    dispatch({
      type: 'stepRunCompleted',
      stepId: 'autocorrelation',
      result: { step: 'autocorrelation', entries: [] },
      log: [],
      summary: 'Step skipped - no correlation rules added',
    })
    goNext()
  }

  // The finished run commits its rules right away; the step then switches to
  // the completed view (summary + rule cards) like the other agent steps.
  const handleSettled = (context: AutoCorrelationFooterContext) => {
    context.accept()
    completeStep(context.ruleEntries, context)
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
      <Flex
        direction="column"
        flexGrow="1"
        width="100%"
        maxWidth="860px"
        mx="auto"
        px="5"
        pb="3"
        css={{ minHeight: 0 }}
      >
        <Box
          css={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            minHeight: 0,
            border: '1px solid var(--gray-4)',
            borderRadius: 'var(--radius-3)',
            overflow: 'hidden',
          }}
        >
          <AutoCorrelation
            skipIntroduction
            hideRules
            close={goBack}
            onStatusChange={handleStatusChange}
            onSettled={handleSettled}
            // The footer renders through a portal so it spans the full step
            // width like every other step, while the analysis log stays in
            // the shared 860px column.
            footer={() =>
              footerHost &&
              createPortal(
                <WizardFooter
                  canContinue={false}
                  onBack={goBack}
                  onContinue={goNext}
                  onSkip={handleSkip}
                />,
                footerHost
              )
            }
          />
        </Box>
      </Flex>
      <Box ref={setFooterHost} />
    </Flex>
  )
}
