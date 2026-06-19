import { Flex, Text } from '@radix-ui/themes'
import { CheckIcon } from 'lucide-react'
import { Fragment } from 'react'

import { STEP_CONFIG } from './constants'
import { isStepReachable } from './state/reducer'
import { useSetupWizard } from './state/SetupWizardContext'
import { STEP_ORDER, StepId } from './state/types'

type StepDisplayState = 'done' | 'active' | 'todo'

function getStepDisplayState(
  stepId: StepId,
  activeStep: StepId,
  isCompleted: boolean
): StepDisplayState {
  if (isCompleted) return 'done'
  if (stepId === activeStep) return 'active'

  return 'todo'
}

const circleStyles: Record<StepDisplayState, Record<string, string>> = {
  done: {
    backgroundColor: 'var(--orange-9)',
    border: '2px solid var(--orange-9)',
    color: 'white',
  },
  active: {
    backgroundColor: 'var(--color-panel)',
    border: '2px solid var(--orange-9)',
    color: 'var(--orange-11)',
  },
  todo: {
    backgroundColor: 'var(--gray-3)',
    border: '2px solid var(--gray-6)',
    color: 'var(--gray-10)',
  },
}

function StepCircle({
  displayState,
  number,
}: {
  displayState: StepDisplayState
  number: number
}) {
  return (
    <Flex
      align="center"
      justify="center"
      flexShrink="0"
      css={{
        width: 28,
        height: 28,
        borderRadius: '100%',
        fontSize: 13,
        fontWeight: 700,
        ...circleStyles[displayState],
      }}
    >
      {displayState === 'done' ? <CheckIcon size={15} /> : number}
    </Flex>
  )
}

export function Stepper() {
  const { state, dispatch } = useSetupWizard()

  return (
    <Flex
      flexShrink="0"
      align="center"
      css={{
        height: 64,
        borderBottom: '1px solid var(--gray-4)',
        backgroundColor: 'var(--gray-2)',
        padding: '0 24px',
      }}
    >
      <Flex align="center" width="100%" maxWidth="860px" mx="auto">
        {STEP_ORDER.map((stepId, index) => {
          const config = STEP_CONFIG[stepId]
          const isCompleted = state.steps[stepId].status === 'completed'
          const displayState = getStepDisplayState(
            stepId,
            state.activeStep,
            isCompleted
          )
          const isClickable = isStepReachable(state, stepId)
          const isLast = index === STEP_ORDER.length - 1

          return (
            <Fragment key={stepId}>
              <button
                type="button"
                aria-label={`Step ${index + 1}: ${config.label}`}
                aria-current={stepId === state.activeStep ? 'step' : undefined}
                disabled={!isClickable}
                onClick={() => dispatch({ type: 'goToStep', stepId })}
                css={{
                  all: 'unset',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  flexShrink: 0,
                  cursor: isClickable ? 'pointer' : 'default',
                }}
              >
                <StepCircle displayState={displayState} number={index + 1} />
                <Text
                  size="1"
                  weight={stepId === state.activeStep ? 'bold' : 'medium'}
                  color={displayState === 'todo' ? 'gray' : undefined}
                  css={{ whiteSpace: 'nowrap' }}
                >
                  {config.label}
                </Text>
              </button>
              {!isLast && (
                <Flex
                  flexGrow="1"
                  css={{
                    height: 2,
                    minWidth: 24,
                    margin: '0 14px',
                    backgroundColor: isCompleted
                      ? 'var(--orange-8)'
                      : 'var(--gray-5)',
                  }}
                />
              )}
            </Fragment>
          )
        })}
      </Flex>
    </Flex>
  )
}
