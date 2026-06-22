import { Box, Code, Flex, Text } from '@radix-ui/themes'

import { useGeneratorStore } from '@/store/generator'
import { ParameterizationRule } from '@/types/rules'

import { useStepState } from '../../state/SetupWizardContext'
import { ParamSuggestionMeta } from '../../state/types'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'
import { AgentRunPanel } from '../AgentRunPanel'
import { CompletedStepSummary } from '../CompletedStepSummary'
import { useAutoStartAgent } from '../useAutoStartAgent'

import { ParamRow } from './ParamRow'
import { useParameterizationAgent } from './useParameterizationAgent'

interface ResolvedParam {
  meta: ParamSuggestionMeta
  rule: ParameterizationRule
}

interface EndpointGroup {
  method: string
  path: string
  params: ResolvedParam[]
}

/** Groups parameters by endpoint, preserving the order they were suggested. */
function groupByEndpoint(params: ResolvedParam[]): EndpointGroup[] {
  const groups: EndpointGroup[] = []

  for (const param of params) {
    const { method, path } = param.meta.location
    const group = groups.find(
      (candidate) => candidate.method === method && candidate.path === path
    )

    if (group === undefined) {
      groups.push({ method, path, params: [param] })
    } else {
      group.params.push(param)
    }
  }

  return groups
}

function ParamCardList({
  suggestions,
}: {
  suggestions: ParamSuggestionMeta[]
}) {
  const rules = useGeneratorStore((store) => store.rules)

  const resolved = suggestions.flatMap<ResolvedParam>((meta) => {
    const rule = rules.find((candidate) => candidate.id === meta.ruleId)

    // Removed rules drop out of the list; the store is the source of truth.
    if (rule === undefined || rule.type !== 'parameterization') {
      return []
    }

    return [{ meta, rule }]
  })

  if (resolved.length === 0) {
    return (
      <Text size="2" color="gray">
        No parameterization rules left. Continue to the next step.
      </Text>
    )
  }

  return (
    <Flex direction="column" gap="6">
      {groupByEndpoint(resolved).map((group) => (
        <EndpointGroupSection
          key={`${group.method} ${group.path}`}
          group={group}
        />
      ))}
    </Flex>
  )
}

function EndpointGroupSection({ group }: { group: EndpointGroup }) {
  const ruleCount = group.params.length

  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" align="center" css={{ padding: '0 4px' }}>
        <Text
          weight="bold"
          css={{
            fontFamily: 'var(--code-font-family)',
            fontSize: 11,
            color: 'var(--orange-11)',
          }}
        >
          {group.method}
        </Text>
        <Code size="1" variant="ghost" color="gray">
          {group.path}
        </Code>
        <Text size="1" color="gray" css={{ marginLeft: 'auto' }}>
          {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
        </Text>
      </Flex>
      <Box
        css={{
          border: '1px solid var(--gray-4)',
          borderRadius: 'var(--radius-3)',
          overflow: 'hidden',
        }}
      >
        {group.params.map(({ meta, rule }, index) => (
          <ParamRow
            key={meta.ruleId}
            meta={meta}
            rule={rule}
            isLast={index === group.params.length - 1}
          />
        ))}
      </Box>
    </Flex>
  )
}

function CompletedParameterizationStep({ onRerun }: { onRerun: () => void }) {
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
          <CompletedStepSummary
            summary={stepState.summary}
            log={stepState.log}
            onRerun={onRerun}
          />
          <ParamCardList suggestions={stepState.result.suggestions} />
        </Flex>
      </StepFrame>
      <WizardFooter canContinue onBack={goBack} onContinue={goNext} />
    </>
  )
}

export function ParameterizationStep() {
  const stepState = useStepState('parameterization')
  const { goBack, goNext } = useWizardNavigation()
  const { start, restart, skip, stop, logEntries, status } =
    useParameterizationAgent()

  useAutoStartAgent(stepState.status, start, stop)

  const handleSkip = () => {
    skip()
    goNext()
  }

  if (stepState.status === 'completed') {
    return <CompletedParameterizationStep onRerun={restart} />
  }

  return (
    <AgentRunPanel
      stepId="parameterization"
      stepState={stepState}
      logEntries={logEntries}
      status={status}
      onRestart={restart}
      errorMessage="The Assistant could not analyze this recording for parameterization."
      runningLabel="Finding values to parameterize..."
      onBack={goBack}
      onContinue={goNext}
      onSkip={handleSkip}
    />
  )
}
