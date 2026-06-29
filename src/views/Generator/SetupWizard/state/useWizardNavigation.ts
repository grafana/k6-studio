import { useSetupWizard } from './SetupWizardContext'
import { STEP_ORDER } from './types'

export function useWizardNavigation() {
  const { state, dispatch } = useSetupWizard()
  const activeIndex = STEP_ORDER.indexOf(state.activeStep)

  return {
    activeStep: state.activeStep,
    isLastStep: activeIndex === STEP_ORDER.length - 1,
    isStepCompleted: state.steps[state.activeStep].status === 'completed',
    goBack: () => dispatch({ type: 'back' }),
    goNext: () => dispatch({ type: 'continue' }),
  }
}
