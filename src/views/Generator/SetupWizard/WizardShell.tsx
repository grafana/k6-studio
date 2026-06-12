import { Flex } from '@radix-ui/themes'

import { FileLocation } from '@/handlers/fs/types'
import { ScriptPreview } from '@/hooks/useScriptPreview'

import { useSetupWizard } from './state/SetupWizardContext'
import { StepId } from './state/types'
import { Stepper } from './Stepper'
import { AutocorrelationStep } from './steps/AutocorrelationStep/AutocorrelationStep'
import { HostsStep } from './steps/HostsStep/HostsStep'
import { ParameterizationStep } from './steps/ParameterizationStep/ParameterizationStep'
import { RunTestStep } from './steps/RunTestStep/RunTestStep'
import { ThresholdsStep } from './steps/ThresholdsStep/ThresholdsStep'

interface ActiveStepProps extends Omit<WizardShellProps, 'onComplete'> {
  stepId: StepId
  onComplete: () => void
}

function ActiveStep({
  stepId,
  script,
  scriptName,
  onSaveGenerator,
  onComplete,
}: ActiveStepProps) {
  switch (stepId) {
    case 'hosts':
      return <HostsStep />
    case 'autocorrelation':
      return <AutocorrelationStep />
    case 'parameterization':
      return <ParameterizationStep />
    case 'thresholds':
      return <ThresholdsStep />
    case 'runTest':
      return (
        <RunTestStep
          script={script}
          scriptName={scriptName}
          onSave={onSaveGenerator}
          onComplete={onComplete}
        />
      )
  }
}

interface WizardShellProps {
  script: ScriptPreview
  scriptName: string
  onSaveGenerator: () => Promise<FileLocation | undefined>
  onComplete: () => void
}

export function WizardShell(props: WizardShellProps) {
  const { state } = useSetupWizard()

  return (
    <Flex flexGrow="1" css={{ minHeight: 0 }}>
      <Stepper />
      <Flex direction="column" flexGrow="1" css={{ minWidth: 0, minHeight: 0 }}>
        <ActiveStep stepId={state.activeStep} {...props} />
      </Flex>
    </Flex>
  )
}
