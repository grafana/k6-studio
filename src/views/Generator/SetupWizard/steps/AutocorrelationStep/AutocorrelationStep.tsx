import { Box, Button, Callout, Flex } from '@radix-ui/themes'
import { RotateCcwIcon, UnplugIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { SuggestionListPanel } from '@/components/SuggestionList/SuggestionListPanel'
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
  const toggleEnableRule = useGeneratorStore((store) => store.toggleEnableRule)

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

  return (
    <>
      <StepFrame stepId="autocorrelation">
        <Flex direction="column" gap="3">
          <CompletedStepSummary
            summary={stepState.summary}
            log={stepState.log}
            onRerun={handleRerun}
          />
          <SuggestionListPanel>
            {entries.map((entry, index) => (
              <RuleCard
                key={entry.rule.id}
                entry={entry}
                action={{
                  type: 'toggle',
                  enabled:
                    rules.find((rule) => rule.id === entry.rule.id)?.enabled ??
                    true,
                  onToggle: toggleEnableRule,
                }}
                isLast={index === entries.length - 1}
              />
            ))}
          </SuggestionListPanel>
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

function InterruptedStep({
  onRun,
  onSkip,
}: {
  onRun: () => void
  onSkip: () => void
}) {
  const { goBack, goNext } = useWizardNavigation()

  return (
    <>
      <StepFrame stepId="autocorrelation">
        <Flex direction="column" gap="3" align="start">
          <Callout.Root color="gray">
            <Callout.Icon>
              <RotateCcwIcon size={16} />
            </Callout.Icon>
            <Callout.Text>
              Correlation analysis was interrupted before it finished. Run it
              again or skip this step.
            </Callout.Text>
          </Callout.Root>
          <Button onClick={onRun}>Run analysis</Button>
        </Flex>
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

  // This step embeds the standalone AutoCorrelation flow rather than useStepAgent,
  // so it reconciles the reducer on unmount itself: a run left mid-flight comes
  // back 'aborted' (recoverable) instead of stuck 'running' and silently re-run.
  const stepStatusRef = useRef(stepState.status)
  useEffect(() => {
    stepStatusRef.current = stepState.status
  })
  const terminatedRef = useRef(false)
  useEffect(() => {
    return () => {
      if (stepStatusRef.current === 'running' && !terminatedRef.current) {
        dispatch({ type: 'stepRunAborted', stepId: 'autocorrelation' })
      }
    }
  }, [dispatch])

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
    // Skip completes the step and navigates away in one commit; mark it so the
    // unmount cleanup does not clobber the just-completed step back to aborted.
    terminatedRef.current = true
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

  // Re-running an interrupted run is user-initiated: reset to not-started so the
  // live AutoCorrelation mounts and auto-starts only on this explicit action.
  const handleRun = () => {
    dispatch({ type: 'stepRunReset', stepId: 'autocorrelation' })
  }

  if (stepState.status === 'completed') {
    return <CompletedStep />
  }

  if (proxyStatus !== 'online') {
    return <ProxyOfflineStep onSkip={handleSkip} />
  }

  // A step left mid-run (e.g. navigating away) comes back 'aborted'. Show a
  // recovery prompt instead of silently auto-restarting a full proxy replay.
  if (stepState.status === 'aborted' || stepState.status === 'error') {
    return <InterruptedStep onRun={handleRun} onSkip={handleSkip} />
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
