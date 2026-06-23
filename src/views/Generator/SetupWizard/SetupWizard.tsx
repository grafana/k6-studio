import { Button, Text } from '@radix-ui/themes'
import { useEffect } from 'react'

import { View } from '@/components/Layout/View'
import { FileLocation } from '@/handlers/fs/types'
import { ScriptPreview } from '@/hooks/useScriptPreview'
import { UsageEventName } from '@/services/usageTracking/types'
import { useGeneratorStore } from '@/store/generator'
import { basename } from '@/utils/path'

import { ChoiceScreen } from './ChoiceScreen'
import { initialWizardState } from './state/reducer'
import { useSetupWizard, SetupWizardProvider } from './state/SetupWizardContext'
import { STEP_ORDER } from './state/types'
import { WizardShell } from './WizardShell'

export type SetupWizardOutcome = 'completed' | 'manual'

interface SetupWizardProps {
  isLoading: boolean
  /** Skip the choice screen and open directly on the first guided step. */
  startInGuidedSetup: boolean
  script: ScriptPreview
  scriptName: string
  onSaveGenerator: () => Promise<FileLocation | undefined>
  onExit: (outcome: SetupWizardOutcome) => void
}

export function SetupWizard({
  startInGuidedSetup,
  ...props
}: SetupWizardProps) {
  return (
    <SetupWizardProvider
      initialState={
        startInGuidedSetup
          ? { ...initialWizardState, screen: 'wizard', activeStep: 'hosts' }
          : undefined
      }
    >
      <SetupWizardView
        // Entering from the generator (guided) reconfigures an existing test;
        // entering from a recording sets up a new one.
        title={startInGuidedSetup ? 'Configure HTTP test' : 'New HTTP test'}
        {...props}
      />
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

function SetupWizardBody({
  script,
  scriptName,
  onSaveGenerator,
  onExit,
}: Omit<SetupWizardProps, 'isLoading' | 'startInGuidedSetup'>) {
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

  return (
    <WizardShell
      script={script}
      scriptName={scriptName}
      onSaveGenerator={onSaveGenerator}
      onComplete={handleComplete}
    />
  )
}

type SetupWizardViewProps = Omit<SetupWizardProps, 'startInGuidedSetup'> & {
  title: string
}

function SetupWizardView({
  isLoading,
  title,
  ...bodyProps
}: SetupWizardViewProps) {
  const recordingPath = useGeneratorStore((store) => store.recordingPath)

  useEffect(() => {
    window.studio.app.trackEvent({
      event: UsageEventName.TestSetupWizardOpened,
    })
  }, [])

  // Cancelling drops the wizard search param, landing on the generator the
  // wizard was configuring.
  const handleCancel = () => bodyProps.onExit('manual')

  return (
    <View
      title={title}
      subTitle={
        <Text size="1" color="gray">
          {basename(recordingPath)}
        </Text>
      }
      actions={
        <>
          <StepIndicator />
          <Button
            variant="ghost"
            color="gray"
            size="1"
            onClick={handleCancel}
            css={{ margin: 0 }}
          >
            Cancel
          </Button>
        </>
      }
      loading={isLoading}
    >
      <SetupWizardBody {...bodyProps} />
    </View>
  )
}
