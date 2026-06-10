import { Flex } from '@radix-ui/themes'

import { useSetupWizard } from './state/SetupWizardContext'
import { StepId } from './state/types'
import { Stepper } from './Stepper'
import { AutocorrelationStep } from './steps/AutocorrelationStep/AutocorrelationStep'
import { HostsStep } from './steps/HostsStep/HostsStep'
import { ParameterizationStep } from './steps/ParameterizationStep/ParameterizationStep'
import { ThresholdsStep } from './steps/ThresholdsStep/ThresholdsStep'

interface ActiveStepProps {
  stepId: StepId
  onComplete: () => void
}

function ActiveStep({ stepId, onComplete }: ActiveStepProps) {
  switch (stepId) {
    case 'hosts':
      return <HostsStep />
    case 'autocorrelation':
      return <AutocorrelationStep />
    case 'parameterization':
      return <ParameterizationStep />
    case 'thresholds':
      return <ThresholdsStep onComplete={onComplete} />
  }
}

interface WizardShellProps {
  onComplete: () => void
}

export function WizardShell({ onComplete }: WizardShellProps) {
  const { state } = useSetupWizard()

  return (
    <Flex flexGrow="1" css={{ minHeight: 0 }}>
      <Stepper />
      <Flex direction="column" flexGrow="1" css={{ minWidth: 0 }}>
        <ActiveStep stepId={state.activeStep} onComplete={onComplete} />
      </Flex>
    </Flex>
  )
}
