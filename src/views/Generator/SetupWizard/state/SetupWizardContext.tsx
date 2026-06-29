import {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useReducer,
} from 'react'
import invariant from 'tiny-invariant'

import { initialWizardState, wizardReducer } from './reducer'
import { StepId, StepState, WizardAction, WizardState } from './types'

interface SetupWizardContextValue {
  state: WizardState
  dispatch: Dispatch<WizardAction>
}

const SetupWizardContext = createContext<SetupWizardContextValue | null>(null)

interface SetupWizardProviderProps {
  initialState?: WizardState
}

export function SetupWizardProvider({
  children,
  initialState = initialWizardState,
}: PropsWithChildren<SetupWizardProviderProps>) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  return (
    <SetupWizardContext.Provider value={{ state, dispatch }}>
      {children}
    </SetupWizardContext.Provider>
  )
}

export function useSetupWizard() {
  const context = useContext(SetupWizardContext)
  invariant(context, 'useSetupWizard must be used within SetupWizardProvider')

  return context
}

export function useStepState(stepId: StepId): StepState {
  const { state } = useSetupWizard()

  return state.steps[stepId]
}
