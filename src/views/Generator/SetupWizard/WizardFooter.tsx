import { Button, Flex } from '@radix-ui/themes'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface WizardFooterProps {
  isLastStep: boolean
  canContinue: boolean
  onBack: () => void
  onContinue: () => void
  /** Completes the step with no assistant results and moves on. */
  onSkip?: () => void
  children?: ReactNode
}

export function WizardFooter({
  isLastStep,
  canContinue,
  onBack,
  onContinue,
  onSkip,
  children,
}: WizardFooterProps) {
  return (
    <Flex
      flexShrink="0"
      align="center"
      gap="3"
      px="5"
      py="3"
      css={{
        borderTop: '1px solid var(--gray-4)',
        backgroundColor: 'var(--color-panel)',
      }}
    >
      <Button variant="ghost" color="gray" onClick={onBack}>
        <ArrowLeftIcon size={16} /> Back
      </Button>
      <Flex flexGrow="1" align="center" justify="center">
        {children}
      </Flex>
      {onSkip && (
        <Button variant="ghost" color="gray" onClick={onSkip}>
          Skip step
        </Button>
      )}
      <ContinueButton
        isLastStep={isLastStep}
        canContinue={canContinue}
        onContinue={onContinue}
      />
    </Flex>
  )
}

function ContinueButton({
  isLastStep,
  canContinue,
  onContinue,
}: Pick<WizardFooterProps, 'isLastStep' | 'canContinue' | 'onContinue'>) {
  if (isLastStep) {
    return (
      <Button disabled={!canContinue} onClick={onContinue}>
        Complete setup <CheckIcon size={16} />
      </Button>
    )
  }

  return (
    <Button disabled={!canContinue} onClick={onContinue}>
      Continue <ArrowRightIcon size={16} />
    </Button>
  )
}
