import { Arch, Platform } from '@/types/electron'

export enum UsageEventName {
  // General
  AppInstalled = 'app_installed',
  UserLoggedIn = 'user_logged_in',

  // Recorder
  RecordingCreated = 'recording_created',
  RecordingImported = 'recording_imported',

  // Generator
  GeneratorCreated = 'generator_created',
  GeneratorUpdated = 'generator_updated',

  // Browser test
  BrowserTestCreated = 'browser_test_created',
  BrowserTestUpdated = 'browser_test_updated',

  // Script
  ScriptCopied = 'script_copied',
  ScriptExported = 'script_exported',
  ScriptValidated = 'script_validated',
  ScriptOpenedExternal = 'script_opened_external',
  ScriptRunInCloud = 'script_run_in_cloud',

  // Grafana Assistant
  AssistantSignInSucceeded = 'assistant_sign_in_succeeded',

  AutocorrelationDialogOpened = 'autocorrelation_dialog_opened',
  AutocorrelationStarted = 'autocorrelation_started',
  AutocorrelationSucceeded = 'autocorrelation_succeeded',
  AutocorrelationPartiallySucceeded = 'autocorrelation_partially_succeeded',
  AutocorrelationFailed = 'autocorrelation_failed',
  AutocorrelationAborted = 'autocorrelation_aborted',
  AutocorrelationErrored = 'autocorrelation_errored',

  TestSetupWizardOpened = 'test_setup_wizard_opened',
  TestSetupWizardCompleted = 'test_setup_wizard_completed',
  TestSetupWizardDismissed = 'test_setup_wizard_dismissed',
  TestSetupWizardStepStarted = 'test_setup_wizard_step_started',
  TestSetupWizardStepFinished = 'test_setup_wizard_step_finished',
  TestSetupWizardSignUpClicked = 'test_setup_wizard_sign_up_clicked',
}

/**
 * The wizard steps as reported in usage events. The wizard's STEP_ORDER derives
 * its StepId from this list, so a new step extends it here first.
 */
export const WIZARD_STEPS = [
  'hosts',
  'autocorrelation',
  'parameterization',
  'thresholds',
  'runTest',
] as const

export type WizardStep = (typeof WIZARD_STEPS)[number]

/** How a wizard step run ended; one step_finished event fires per run. */
export type WizardStepOutcome =
  | 'success'
  | 'partial-success'
  | 'failure'
  | 'error'
  | 'aborted'
  | 'skipped'

export interface UsageEventMetadata {
  usageStatsId: string
  timestamp: string
  appVersion: string
  os: Platform
  arch: Arch
}

interface AppInstalledEvent {
  event: UsageEventName.AppInstalled
}

interface UserLoggedInEvent {
  event: UsageEventName.UserLoggedIn
}

interface RecordingCreatedEvent {
  event: UsageEventName.RecordingCreated
}

interface RecordingImportedEvent {
  event: UsageEventName.RecordingImported
}

interface GeneratorCreatedEvent {
  event: UsageEventName.GeneratorCreated
}

interface GeneratorUpdatedEvent {
  event: UsageEventName.GeneratorUpdated
  payload: {
    rules: {
      // Total number of rules per type
      correlation: number
      parameterization: number
      verification: number
      customCode: number
      // Total number of disabled rules
      disabled: number
    }
  }
}

interface BrowserTestCreatedEvent {
  event: UsageEventName.BrowserTestCreated
}

interface BrowserTestUpdatedEvent {
  event: UsageEventName.BrowserTestUpdated
}

interface ScriptCopiedEvent {
  event: UsageEventName.ScriptCopied
  payload: {
    source: 'generator' | 'debugger'
  }
}

interface ScriptExportedEvent {
  event: UsageEventName.ScriptExported
  payload: {
    isExternal: boolean
  }
}

interface ScriptValidatedEvent {
  event: UsageEventName.ScriptValidated
  payload: {
    isExternal: boolean
  }
}

interface ScriptOpenedExternalEvent {
  event: UsageEventName.ScriptOpenedExternal
}

interface ScriptRunInCloudEvent {
  event: UsageEventName.ScriptRunInCloud
}

interface AssistantSignInSucceededEvent {
  event: UsageEventName.AssistantSignInSucceeded
}

interface AutocorrelationDialogOpenedEvent {
  event: UsageEventName.AutocorrelationDialogOpened
}

interface AutocorrelationStartedEvent {
  event: UsageEventName.AutocorrelationStarted
}

interface AutocorrelationSucceededEvent {
  event: UsageEventName.AutocorrelationSucceeded
}

interface AutocorrelationPartiallySucceededEvent {
  event: UsageEventName.AutocorrelationPartiallySucceeded
}

interface AutocorrelationFailedEvent {
  event: UsageEventName.AutocorrelationFailed
}

interface AutocorrelationAbortedEvent {
  event: UsageEventName.AutocorrelationAborted
  payload: {
    status: string
  }
}

interface AutocorrelationErroredEvent {
  event: UsageEventName.AutocorrelationErrored
}

interface TestSetupWizardOpenedEvent {
  event: UsageEventName.TestSetupWizardOpened
}

interface TestSetupWizardCompletedEvent {
  event: UsageEventName.TestSetupWizardCompleted
}

/** The user chose the manual path instead of the guided setup. */
interface TestSetupWizardDismissedEvent {
  event: UsageEventName.TestSetupWizardDismissed
}

interface TestSetupWizardStepStartedEvent {
  event: UsageEventName.TestSetupWizardStepStarted
  payload: {
    step: WizardStep
  }
}

interface TestSetupWizardStepFinishedEvent {
  event: UsageEventName.TestSetupWizardStepFinished
  payload: {
    step: WizardStep
    outcome: WizardStepOutcome
    /** Omitted when the run is reconciled outside the step (e.g. unmount). */
    durationMs?: number
  }
}

/** The user followed the wizard's sign-up link to create a Grafana Cloud account. */
interface TestSetupWizardSignUpClickedEvent {
  event: UsageEventName.TestSetupWizardSignUpClicked
}

export type UsageEvent =
  | AppInstalledEvent
  | UserLoggedInEvent
  | RecordingCreatedEvent
  | RecordingImportedEvent
  | GeneratorCreatedEvent
  | GeneratorUpdatedEvent
  | BrowserTestCreatedEvent
  | BrowserTestUpdatedEvent
  | ScriptCopiedEvent
  | ScriptExportedEvent
  | ScriptValidatedEvent
  | ScriptOpenedExternalEvent
  | ScriptRunInCloudEvent
  | AssistantSignInSucceededEvent
  | AutocorrelationDialogOpenedEvent
  | AutocorrelationStartedEvent
  | AutocorrelationSucceededEvent
  | AutocorrelationPartiallySucceededEvent
  | AutocorrelationFailedEvent
  | AutocorrelationAbortedEvent
  | AutocorrelationErroredEvent
  | TestSetupWizardOpenedEvent
  | TestSetupWizardCompletedEvent
  | TestSetupWizardDismissedEvent
  | TestSetupWizardStepStartedEvent
  | TestSetupWizardStepFinishedEvent
  | TestSetupWizardSignUpClickedEvent

export type UsageEventWithMetadata = UsageEvent & UsageEventMetadata
