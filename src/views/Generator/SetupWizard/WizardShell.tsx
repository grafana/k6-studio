import { Flex } from '@radix-ui/themes'

import { AssistantAuthGate } from '@/components/Assistant/AssistantAuthGate'
import { OnSaveEvent } from '@/hooks/useSaveFile'
import { ScriptPreview } from '@/hooks/useScriptPreview'

import { useSetupWizard } from './state/SetupWizardContext'
import { WizardStep } from './state/types'
import { Stepper } from './Stepper'
import { AutocorrelationStep } from './steps/AutocorrelationStep/AutocorrelationStep'
import { HostsStep } from './steps/HostsStep/HostsStep'
import { ParameterizationStep } from './steps/ParameterizationStep/ParameterizationStep'
import { RunTestStep } from './steps/RunTestStep/RunTestStep'
import { ThresholdsStep } from './steps/ThresholdsStep/ThresholdsStep'

interface ActiveStepProps extends Omit<WizardShellProps, 'onComplete'> {
  stepId: WizardStep
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
  onSaveGenerator: () => Promise<OnSaveEvent | undefined>
  onComplete: () => void
}

export function WizardShell(props: WizardShellProps) {
  const { state } = useSetupWizard()

  const step = <ActiveStep stepId={state.activeStep} {...props} />

  return (
    <Flex direction="column" flexGrow="1" css={{ minHeight: 0 }}>
      <Stepper />
      <Flex direction="column" flexGrow="1" css={{ minWidth: 0, minHeight: 0 }}>
        {/* The agent steps need the assistant; the gate (cloud sign-in,
            assistant connection, stack health) runs here so it is only hit
            after the user commits to guided setup. The run-test step talks to
            the cloud directly and does not need it. */}
        {state.activeStep === 'runTest' ? (
          step
        ) : (
          <AssistantAuthGate>{step}</AssistantAuthGate>
        )}
      </Flex>
    </Flex>
  )
}
