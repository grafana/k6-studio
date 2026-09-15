import { useSetupWizard } from './SetupWizardContext'
import { isStepDone, WIZARD_STEPS } from './types'

export function useWizardNavigation() {
  const { state, dispatch } = useSetupWizard()
  const activeIndex = WIZARD_STEPS.indexOf(state.activeStep)

  return {
    activeStep: state.activeStep,
    isLastStep: activeIndex === WIZARD_STEPS.length - 1,
    isStepDone: isStepDone(state.steps[state.activeStep]),
    goBack: () => dispatch({ type: 'back' }),
    goNext: () => dispatch({ type: 'continue' }),
  }
}
