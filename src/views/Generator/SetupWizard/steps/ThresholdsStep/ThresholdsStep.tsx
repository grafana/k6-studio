import { Callout } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'

import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'

interface ThresholdsStepProps {
  onComplete: () => void
}

export function ThresholdsStep({ onComplete }: ThresholdsStepProps) {
  const { isStepCompleted, goBack } = useWizardNavigation()

  return (
    <>
      <StepFrame stepId="thresholds">
        <Callout.Root color="gray">
          <Callout.Icon>
            <InfoIcon size={16} />
          </Callout.Icon>
          <Callout.Text>
            Threshold suggestions are not available yet.
          </Callout.Text>
        </Callout.Root>
      </StepFrame>
      <WizardFooter
        isLastStep
        canContinue={isStepCompleted}
        onBack={goBack}
        onContinue={onComplete}
      />
    </>
  )
}
