import { Button, Flex } from '@radix-ui/themes'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { ReactNode } from 'react'

import { isNavigationLocked } from './state/reducer'
import { useSetupWizard } from './state/SetupWizardContext'

interface WizardFooterProps {
  canContinue: boolean
  onBack: () => void
  onContinue: () => void
  /** Completes the step with no assistant results and moves on. */
  onSkip?: () => void
  children?: ReactNode
}

export function WizardFooter({
  canContinue,
  onBack,
  onContinue,
  onSkip,
  children,
}: WizardFooterProps) {
  const { state } = useSetupWizard()
  // Going back mid-run would unmount the step and kill the run; Skip stays
  // available since it settles the run deliberately.
  const backDisabled = isNavigationLocked(state)

  return (
    <Flex
      flexShrink="0"
      align="center"
      gap="3"
      p="2"
      css={{
        minHeight: 49,
        borderTop: '1px solid var(--gray-4)',
        backgroundColor: 'var(--color-panel)',
      }}
    >
      <Button
        variant="ghost"
        color="gray"
        disabled={backDisabled}
        onClick={onBack}
        css={{ marginLeft: 0 }}
      >
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
      <Button disabled={!canContinue} onClick={onContinue}>
        Continue <ArrowRightIcon size={16} />
      </Button>
    </Flex>
  )
}
