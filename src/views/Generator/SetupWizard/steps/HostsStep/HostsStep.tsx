import { Callout, Text } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'

import { useGeneratorStore } from '@/store/generator'

import { useStepState } from '../../state/SetupWizardContext'
import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'

function FooterSummary() {
  const allowlist = useGeneratorStore((store) => store.allowlist)
  const stepState = useStepState('hosts')

  if (stepState.status !== 'completed' || stepState.result.step !== 'hosts') {
    return null
  }

  return (
    <Text size="1" color="gray">
      {allowlist.length} of {stepState.result.suggestions.length} hosts included
    </Text>
  )
}

export function HostsStep() {
  const { isStepCompleted, goBack, goNext } = useWizardNavigation()
  const allowlist = useGeneratorStore((store) => store.allowlist)

  return (
    <>
      <StepFrame stepId="hosts">
        <Callout.Root color="gray">
          <Callout.Icon>
            <InfoIcon size={16} />
          </Callout.Icon>
          <Callout.Text>Host analysis is not available yet.</Callout.Text>
        </Callout.Root>
      </StepFrame>
      <WizardFooter
        isLastStep={false}
        canContinue={isStepCompleted && allowlist.length > 0}
        onBack={goBack}
        onContinue={goNext}
      >
        <FooterSummary />
      </WizardFooter>
    </>
  )
}
