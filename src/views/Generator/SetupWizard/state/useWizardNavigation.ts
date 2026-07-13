import { useSetupWizard } from './SetupWizardContext'
import { WIZARD_STEPS } from './types'

export function useWizardNavigation() {
  const { state, dispatch } = useSetupWizard()
  const activeIndex = WIZARD_STEPS.indexOf(state.activeStep)

  return {
    activeStep: state.activeStep,
    isLastStep: activeIndex === WIZARD_STEPS.length - 1,
    isStepCompleted: state.steps[state.activeStep].status === 'completed',
    goBack: () => dispatch({ type: 'back' }),
    goNext: () => dispatch({ type: 'continue' }),
  }
}
