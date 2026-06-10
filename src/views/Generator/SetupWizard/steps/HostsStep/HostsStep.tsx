import { Box, Button, Callout, Checkbox, Flex, Text } from '@radix-ui/themes'
import { AlertTriangleIcon, CheckIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { ActionsLog } from '@/components/Assistant/ActionsLog'
import { useGeneratorStore } from '@/store/generator'

import { useStepState } from '../../state/SetupWizardContext'
import { HostSuggestion } from '../../state/types'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'

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
  const allowlist = useGeneratorStore((store) => store.allowlist)
  const setAllowlist = useGeneratorStore((store) => store.setAllowlist)
  const includeStaticAssets = useGeneratorStore(
    (store) => store.includeStaticAssets
  )
  const setIncludeStaticAssets = useGeneratorStore(
    (store) => store.setIncludeStaticAssets
  )

  const handleToggleHost = (host: string) => (checked: boolean) => {
    if (checked) {
      setAllowlist([...allowlist, host])
      return
    }

    setAllowlist(allowlist.filter((item) => item !== host))
  }

  return (
    <Flex direction="column">
      <Box
        css={{
          border: '1px solid var(--gray-4)',
          borderRadius: 'var(--radius-3)',
          overflow: 'hidden',
        }}
      >
        {suggestions.map((suggestion) => (
          <HostRow
            key={suggestion.host}
            suggestion={suggestion}
            checked={allowlist.includes(suggestion.host)}
            onCheckedChange={handleToggleHost(suggestion.host)}
          />
        ))}
      </Box>
      <Flex mt="3" gap="2" align="center">
        <Checkbox
          checked={includeStaticAssets}
          onCheckedChange={(value) => setIncludeStaticAssets(value === true)}
        />
        <Text size="1" color="gray">
          Include requests for static assets (images, fonts, scripts)
        </Text>
      </Flex>
    </Flex>
  )
}

function CompletedHostsStep() {
  const stepState = useStepState('hosts')
  const allowlist = useGeneratorStore((store) => store.allowlist)
  const { goBack, goNext } = useWizardNavigation()

  if (stepState.status !== 'completed' || stepState.result.step !== 'hosts') {
    return null
  }

  const { suggestions } = stepState.result

  return (
    <>
      <StepFrame stepId="hosts">
        <Flex direction="column" gap="3">
          <Callout.Root color="green">
            <Callout.Icon>
              <CheckIcon size={16} />
            </Callout.Icon>
            <Callout.Text>{stepState.summary}</Callout.Text>
          </Callout.Root>
          <HostList suggestions={suggestions} />
        </Flex>
      </StepFrame>
      <WizardFooter
        isLastStep={false}
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
  const { start, restart, stop, logEntries, status } = useHostsAgent()

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
    return <CompletedHostsStep />
  }

  return (
    <>
      <StepFrame stepId="hosts">
        <Flex direction="column" gap="3" flexGrow="1" css={{ minHeight: 0 }}>
          {(stepState.status === 'error' || stepState.status === 'aborted') && (
            <Callout.Root color="amber">
              <Callout.Icon>
                <AlertTriangleIcon size={16} />
              </Callout.Icon>
              <Callout.Text>
                {stepState.status === 'error'
                  ? 'The Assistant could not analyze the hosts in this recording.'
                  : 'The analysis was stopped.'}
              </Callout.Text>
            </Callout.Root>
          )}
          {(stepState.status === 'error' || stepState.status === 'aborted') && (
            <Flex>
              <Button variant="outline" color="gray" onClick={restart}>
                Run analysis again
              </Button>
            </Flex>
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
            Analyzing hosts...
          </Text>
        )}
      </WizardFooter>
    </>
  )
}
