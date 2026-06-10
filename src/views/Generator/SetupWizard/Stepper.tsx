import { Flex, Text } from '@radix-ui/themes'
import { CheckIcon } from 'lucide-react'

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
      direction="column"
      flexShrink="0"
      css={{
        width: 248,
        borderRight: '1px solid var(--gray-4)',
        backgroundColor: 'var(--gray-2)',
        padding: '28px 20px',
      }}
    >
      <Text
        size="1"
        weight="bold"
        color="gray"
        mb="4"
        css={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        Guided setup
      </Text>
      <Flex direction="column" role="list">
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
            <Flex key={stepId} gap="3" role="listitem">
              <Flex direction="column" align="center">
                <button
                  type="button"
                  aria-label={`Step ${index + 1}: ${config.label}`}
                  aria-current={
                    stepId === state.activeStep ? 'step' : undefined
                  }
                  disabled={!isClickable}
                  onClick={() => dispatch({ type: 'goToStep', stepId })}
                  css={{
                    all: 'unset',
                    cursor: isClickable ? 'pointer' : 'default',
                  }}
                >
                  <StepCircle displayState={displayState} number={index + 1} />
                </button>
                {!isLast && (
                  <Flex
                    flexGrow="1"
                    css={{
                      width: 2,
                      minHeight: 28,
                      margin: '4px 0',
                      backgroundColor: isCompleted
                        ? 'var(--orange-8)'
                        : 'var(--gray-5)',
                    }}
                  />
                )}
              </Flex>
              <Flex
                direction="column"
                pt="1"
                pb={isLast ? '0' : '4'}
                css={{ minWidth: 0 }}
              >
                <Text
                  size="1"
                  weight={stepId === state.activeStep ? 'bold' : 'medium'}
                  color={displayState === 'todo' ? 'gray' : undefined}
                >
                  {config.label}
                </Text>
                <Text size="1" color="gray">
                  {config.hint}
                </Text>
              </Flex>
            </Flex>
          )
        })}
      </Flex>
    </Flex>
  )
}
