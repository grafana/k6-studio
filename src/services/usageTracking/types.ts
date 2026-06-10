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

  HostSelectionStarted = 'host_selection_started',
  HostSelectionSucceeded = 'host_selection_succeeded',
  HostSelectionFailed = 'host_selection_failed',
  HostSelectionAborted = 'host_selection_aborted',
  HostSelectionErrored = 'host_selection_errored',

  ParameterizationStarted = 'parameterization_started',
  ParameterizationSucceeded = 'parameterization_succeeded',
  ParameterizationPartiallySucceeded = 'parameterization_partially_succeeded',
  ParameterizationFailed = 'parameterization_failed',
  ParameterizationAborted = 'parameterization_aborted',
  ParameterizationErrored = 'parameterization_errored',

  ThresholdSuggestionStarted = 'threshold_suggestion_started',
  ThresholdSuggestionSucceeded = 'threshold_suggestion_succeeded',
  ThresholdSuggestionFailed = 'threshold_suggestion_failed',
  ThresholdSuggestionAborted = 'threshold_suggestion_aborted',
  ThresholdSuggestionErrored = 'threshold_suggestion_errored',
}

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

interface HostSelectionStartedEvent {
  event: UsageEventName.HostSelectionStarted
}

interface HostSelectionSucceededEvent {
  event: UsageEventName.HostSelectionSucceeded
}

interface HostSelectionFailedEvent {
  event: UsageEventName.HostSelectionFailed
}

interface HostSelectionAbortedEvent {
  event: UsageEventName.HostSelectionAborted
}

interface HostSelectionErroredEvent {
  event: UsageEventName.HostSelectionErrored
}

interface ParameterizationStartedEvent {
  event: UsageEventName.ParameterizationStarted
}

interface ParameterizationSucceededEvent {
  event: UsageEventName.ParameterizationSucceeded
}

interface ParameterizationPartiallySucceededEvent {
  event: UsageEventName.ParameterizationPartiallySucceeded
}

interface ParameterizationFailedEvent {
  event: UsageEventName.ParameterizationFailed
}

interface ParameterizationAbortedEvent {
  event: UsageEventName.ParameterizationAborted
}

interface ParameterizationErroredEvent {
  event: UsageEventName.ParameterizationErrored
}

interface ThresholdSuggestionStartedEvent {
  event: UsageEventName.ThresholdSuggestionStarted
}

interface ThresholdSuggestionSucceededEvent {
  event: UsageEventName.ThresholdSuggestionSucceeded
}

interface ThresholdSuggestionFailedEvent {
  event: UsageEventName.ThresholdSuggestionFailed
}

interface ThresholdSuggestionAbortedEvent {
  event: UsageEventName.ThresholdSuggestionAborted
}

interface ThresholdSuggestionErroredEvent {
  event: UsageEventName.ThresholdSuggestionErrored
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
  | HostSelectionStartedEvent
  | HostSelectionSucceededEvent
  | HostSelectionFailedEvent
  | HostSelectionAbortedEvent
  | HostSelectionErroredEvent
  | ParameterizationStartedEvent
  | ParameterizationSucceededEvent
  | ParameterizationPartiallySucceededEvent
  | ParameterizationFailedEvent
  | ParameterizationAbortedEvent
  | ParameterizationErroredEvent
  | ThresholdSuggestionStartedEvent
  | ThresholdSuggestionSucceededEvent
  | ThresholdSuggestionFailedEvent
  | ThresholdSuggestionAbortedEvent
  | ThresholdSuggestionErroredEvent

export type UsageEventWithMetadata = UsageEvent & UsageEventMetadata
