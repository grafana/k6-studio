import { Checkbox, Flex, Text } from '@radix-ui/themes'

import { SuggestionListPanel } from '@/components/SuggestionList/SuggestionListPanel'
import { useGeneratorStore } from '@/store/generator'

import { useSetupWizard, useStepState } from '../../state/SetupWizardContext'
import { HostSuggestion, isStepDone } from '../../state/types'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'
import { AgentRunPanel } from '../AgentRunPanel'
import { CompletedStepSummary } from '../CompletedStepSummary'
import { useAutoStartAgent } from '../useAutoStartAgent'
import { invalidateDownstreamSteps } from '../withdrawStepArtifacts'

import { HostRow } from './HostRow'
import { useHostsAgent } from './useHostsAgent'

function FooterSummary({ totalHosts }: { totalHosts: number }) {
  const allowlist = useGeneratorStore((store) => store.allowlist)

  return (
    <Text size="1" color="gray">
      {allowlist.length} of {totalHosts} hosts included
    </Text>
  )
}

function HostList({ suggestions }: { suggestions: HostSuggestion[] }) {
  const { state, dispatch } = useSetupWizard()
  const allowlist = useGeneratorStore((store) => store.allowlist)
  const setAllowlist = useGeneratorStore((store) => store.setAllowlist)
  const includeStaticAssets = useGeneratorStore(
    (store) => store.includeStaticAssets
  )
  const setIncludeStaticAssets = useGeneratorStore(
    (store) => store.setIncludeStaticAssets
  )

  // The later analyses ran against the previous filtered request set; once it
  // changes their committed suggestions no longer apply. Withdraw them and
  // send the steps back to not-started so revisiting re-analyzes.
  const handleToggleHost = (host: string) => (checked: boolean) => {
    invalidateDownstreamSteps('hosts', state, dispatch)

    if (checked) {
      setAllowlist([...allowlist, host])
      return
    }

    setAllowlist(allowlist.filter((item) => item !== host))
  }

  const handleToggleStaticAssets = (checked: boolean) => {
    invalidateDownstreamSteps('hosts', state, dispatch)
    setIncludeStaticAssets(checked)
  }

  return (
    <Flex direction="column">
      <SuggestionListPanel>
        {suggestions.map((suggestion) => (
          <HostRow
            key={suggestion.host}
            suggestion={suggestion}
            checked={allowlist.includes(suggestion.host)}
            onCheckedChange={handleToggleHost(suggestion.host)}
          />
        ))}
      </SuggestionListPanel>
      <Flex mt="3" gap="2" align="center">
        <Checkbox
          checked={includeStaticAssets}
          onCheckedChange={(value) => handleToggleStaticAssets(value === true)}
        />
        <Text size="1" color="gray">
          Include requests for static assets (images, fonts, scripts)
        </Text>
      </Flex>
    </Flex>
  )
}

function CompletedHostsStep({ onRerun }: { onRerun: () => void }) {
  const stepState = useStepState('hosts')
  const allowlist = useGeneratorStore((store) => store.allowlist)
  const { goBack, goNext } = useWizardNavigation()

  if (!isStepDone(stepState) || stepState.result.step !== 'hosts') {
    return null
  }

  const { suggestions } = stepState.result

  return (
    <>
      <StepFrame stepId="hosts">
        <Flex direction="column" gap="3">
          <CompletedStepSummary
            summary={stepState.summary}
            log={stepState.log}
            onRerun={onRerun}
          />
          <HostList suggestions={suggestions} />
        </Flex>
      </StepFrame>
      <WizardFooter
        canContinue={allowlist.length > 0}
        onBack={goBack}
        onContinue={goNext}
      >
        <FooterSummary totalHosts={suggestions.length} />
      </WizardFooter>
    </>
  )
}

export function HostsStep() {
  const stepState = useStepState('hosts')
  const { goBack, goNext } = useWizardNavigation()
  const { start, restart, skip, stop, actionsLog, status } = useHostsAgent()

  useAutoStartAgent(stepState.status, start, stop)

  const handleSkip = () => {
    skip()
    goNext()
  }

  if (isStepDone(stepState)) {
    return <CompletedHostsStep onRerun={restart} />
  }

  return (
    <AgentRunPanel
      stepId="hosts"
      run={{
        state: stepState,
        status,
        logEntries: actionsLog.entries,
        errorMessage:
          'The Assistant could not analyze the hosts in this recording.',
        runningLabel: 'Analyzing hosts...',
        onRestart: restart,
      }}
      nav={{ onBack: goBack, onContinue: goNext, onSkip: handleSkip }}
    />
  )
}
