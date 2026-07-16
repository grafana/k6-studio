import { Flex, Text } from '@radix-ui/themes'
import { CheckIcon, MinusIcon } from 'lucide-react'
import { ComponentProps, CSSProperties, Fragment } from 'react'

import { STEP_CONFIG } from './constants'
import { isStepReachable } from './state/reducer'
import { useSetupWizard } from './state/SetupWizardContext'
import { isStepDone, StepState, WIZARD_STEPS, WizardStep } from './state/types'

type StepDisplayState = 'done' | 'skipped' | 'active' | 'todo'

function getStepDisplayState(
  stepId: WizardStep,
  activeStep: WizardStep,
  stepState: StepState
): StepDisplayState {
  if (stepState.status === 'completed') return 'done'
  if (stepState.status === 'skipped') return 'skipped'
  if (stepId === activeStep) return 'active'

  return 'todo'
}

type TextColor = ComponentProps<typeof Text>['color']

// Emphasis keys off the active step, not the display state: a completed step
// the user navigates back to is both active and "done", and must stay
// highlighted.
function getLabelColor(
  isActive: boolean,
  displayState: StepDisplayState
): TextColor {
  if (isActive) return 'orange'
  if (displayState === 'todo' || displayState === 'skipped') return 'gray'

  return undefined
}

// Skipped and todo circles share the muted look; the circle content (minus
// icon vs step number) is what tells them apart.
const mutedCircleStyle: CSSProperties = {
  backgroundColor: 'var(--gray-3)',
  border: '2px solid var(--gray-6)',
  color: 'var(--gray-10)',
}

const circleStyles: Record<StepDisplayState, CSSProperties> = {
  done: {
    backgroundColor: 'var(--orange-9)',
    border: '2px solid var(--orange-9)',
    color: 'white',
  },
  skipped: mutedCircleStyle,
  active: {
    backgroundColor: 'var(--color-panel)',
    border: '2px solid var(--orange-9)',
    color: 'var(--orange-11)',
  },
  todo: mutedCircleStyle,
}

function getCircleContent(displayState: StepDisplayState, number: number) {
  if (displayState === 'done') return <CheckIcon size={15} />
  if (displayState === 'skipped') return <MinusIcon size={15} />

  return number
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
      {getCircleContent(displayState, number)}
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
        {WIZARD_STEPS.map((stepId, index) => {
          const config = STEP_CONFIG[stepId]
          const displayState = getStepDisplayState(
            stepId,
            state.activeStep,
            state.steps[stepId]
          )
          const isClickable = isStepReachable(state, stepId)
          const isLast = index === WIZARD_STEPS.length - 1

          return (
            <Fragment key={stepId}>
              <button
                type="button"
                aria-label={`Step ${index + 1}: ${config.label}${displayState === 'skipped' ? ' (skipped)' : ''}`}
                aria-current={stepId === state.activeStep ? 'step' : undefined}
                disabled={!isClickable}
                onClick={() => dispatch({ type: 'goToStep', stepId })}
                css={{
                  all: 'unset',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                  cursor: isClickable ? 'pointer' : 'default',
                }}
              >
                <StepCircle displayState={displayState} number={index + 1} />
                <Text
                  size="1"
                  weight="medium"
                  color={getLabelColor(
                    stepId === state.activeStep,
                    displayState
                  )}
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
                    minWidth: 8,
                    margin: '0 8px',
                    // Skipped counts as progress too, so the rail stays
                    // continuous past a skipped step.
                    backgroundColor: isStepDone(state.steps[stepId])
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
