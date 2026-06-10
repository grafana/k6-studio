import { Button, Text } from '@radix-ui/themes'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { View } from '@/components/Layout/View'
import { getRoutePath, getViewPath } from '@/routeMap'
import { UsageEventName } from '@/services/usageTracking/types'
import { useGeneratorStore } from '@/store/generator'
import { basename } from '@/utils/path'

import { ChoiceScreen } from './ChoiceScreen'
import { useSetupWizard, SetupWizardProvider } from './state/SetupWizardContext'
import { STEP_ORDER } from './state/types'
import { WizardShell } from './WizardShell'

export type SetupWizardOutcome = 'completed' | 'manual'

interface SetupWizardProps {
  isLoading: boolean
  onExit: (outcome: SetupWizardOutcome) => void
}

export function SetupWizard(props: SetupWizardProps) {
  return (
    <SetupWizardProvider>
      <SetupWizardView {...props} />
    </SetupWizardProvider>
  )
}

function StepIndicator() {
  const { state } = useSetupWizard()

  if (state.screen !== 'wizard') {
    return null
  }

  return (
    <Text size="1" color="gray">
      Step {STEP_ORDER.indexOf(state.activeStep) + 1} of {STEP_ORDER.length}
    </Text>
  )
}

function SetupWizardBody({ onExit }: Pick<SetupWizardProps, 'onExit'>) {
  const { state, dispatch } = useSetupWizard()
  const setShowAllowlistDialog = useGeneratorStore(
    (store) => store.setShowAllowlistDialog
  )

  const handleComplete = () => {
    window.studio.app.trackEvent({
      event: UsageEventName.TestSetupWizardCompleted,
    })
    // Step 1 already committed an allowlist, so the generator should not
    // pop the host-selection dialog it shows for fresh recordings.
    setShowAllowlistDialog(false)
    onExit('completed')
  }

  const handleConfigureManually = () => {
    window.studio.app.trackEvent({
      event: UsageEventName.TestSetupWizardDismissed,
    })
    onExit('manual')
  }

  if (state.screen === 'choice') {
    return (
      <ChoiceScreen
        onStartGuidedSetup={() => dispatch({ type: 'startWizard' })}
        onConfigureManually={handleConfigureManually}
      />
    )
  }

  return <WizardShell onComplete={handleComplete} />
}

function SetupWizardView({ isLoading, onExit }: SetupWizardProps) {
  const navigate = useNavigate()
  const recordingPath = useGeneratorStore((store) => store.recordingPath)

  useEffect(() => {
    window.studio.app.trackEvent({
      event: UsageEventName.TestSetupWizardOpened,
    })
  }, [])

  const handleCancel = () => {
    if (recordingPath === '') {
      navigate(getRoutePath('home'))
      return
    }

    navigate(getViewPath(recordingPath))
  }

  return (
    <View
      title="New HTTP test"
      subTitle={
        <Text size="1" color="gray">
          {basename(recordingPath)}
        </Text>
      }
      actions={
        <>
          <StepIndicator />
          <Button variant="ghost" color="gray" onClick={handleCancel}>
            Cancel
          </Button>
        </>
      }
      loading={isLoading}
    >
      <SetupWizardBody onExit={onExit} />
    </View>
  )
}
