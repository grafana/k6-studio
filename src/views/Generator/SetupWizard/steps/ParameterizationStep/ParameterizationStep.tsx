import { Callout } from '@radix-ui/themes'
import { InfoIcon } from 'lucide-react'

import { useWizardNavigation } from '../../state/useWizardNavigation'
import { StepFrame } from '../../StepFrame'
import { WizardFooter } from '../../WizardFooter'

export function ParameterizationStep() {
  const { isStepCompleted, goBack, goNext } = useWizardNavigation()

  return (
    <>
      <StepFrame stepId="parameterization">
        <Callout.Root color="gray">
          <Callout.Icon>
            <InfoIcon size={16} />
          </Callout.Icon>
          <Callout.Text>Parameterization is not available yet.</Callout.Text>
        </Callout.Root>
      </StepFrame>
      <WizardFooter
        isLastStep={false}
        canContinue={isStepCompleted}
        onBack={goBack}
        onContinue={goNext}
      />
    </>
  )
}
