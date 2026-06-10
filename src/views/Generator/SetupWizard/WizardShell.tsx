import { Flex, Text } from '@radix-ui/themes'

import { useGeneratorStore } from '@/store/generator'

import { useSetupWizard } from './state/SetupWizardContext'
import { STEP_ORDER, StepId } from './state/types'
import { StepFrame } from './StepFrame'
import { Stepper } from './Stepper'
import { AutocorrelationStep } from './steps/AutocorrelationStep/AutocorrelationStep'
import { HostsStep } from './steps/HostsStep/HostsStep'
import { ParameterizationStep } from './steps/ParameterizationStep/ParameterizationStep'
import { ThresholdsStep } from './steps/ThresholdsStep/ThresholdsStep'
import { WizardFooter } from './WizardFooter'

function ActiveStep({ stepId }: { stepId: StepId }) {
  switch (stepId) {
    case 'hosts':
      return <HostsStep />
    case 'autocorrelation':
      return <AutocorrelationStep />
    case 'parameterization':
      return <ParameterizationStep />
    case 'thresholds':
      return <ThresholdsStep />
  }
}

interface WizardShellProps {
  onComplete: () => void
}

export function WizardShell({ onComplete }: WizardShellProps) {
  const { state, dispatch } = useSetupWizard()
  const allowlist = useGeneratorStore((store) => store.allowlist)

  const activeIndex = STEP_ORDER.indexOf(state.activeStep)
  const isLastStep = activeIndex === STEP_ORDER.length - 1
  const isStepCompleted = state.steps[state.activeStep].status === 'completed'
  const canContinue =
    isStepCompleted && (state.activeStep !== 'hosts' || allowlist.length > 0)

  const handleBack = () => {
    dispatch({ type: 'back' })
  }

  const handleContinue = () => {
    if (isLastStep) {
      onComplete()
      return
    }

    dispatch({ type: 'continue' })
  }

  return (
    <Flex flexGrow="1" css={{ minHeight: 0 }}>
      <Stepper />
      <Flex direction="column" flexGrow="1" css={{ minWidth: 0 }}>
        <StepFrame stepId={state.activeStep}>
          <ActiveStep stepId={state.activeStep} />
        </StepFrame>
        <WizardFooter
          isLastStep={isLastStep}
          canContinue={canContinue}
          onBack={handleBack}
          onContinue={handleContinue}
        >
          {state.activeStep === 'hosts' && <HostsFooterSummary />}
        </WizardFooter>
      </Flex>
    </Flex>
  )
}

function HostsFooterSummary() {
  const allowlist = useGeneratorStore((store) => store.allowlist)
  const hostsState = useSetupWizard().state.steps.hosts

  if (hostsState.status !== 'completed') {
    return null
  }

  const totalHosts =
    hostsState.result.step === 'hosts' ? hostsState.result.suggestions.length : 0

  return (
    <Text size="1" color="gray">
      {allowlist.length} of {totalHosts} hosts included
    </Text>
  )
}
