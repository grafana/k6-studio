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

  AutocorrelationDialogOpened = 'autocorrelation_dialog_opened',
  AutocorrelationStarted = 'autocorrelation_started',
  AutocorrelationSucceeded = 'autocorrelation_succeeded',
  AutocorrelationPartiallySucceeded = 'autocorrelation_partially_succeeded',
  AutocorrelationFailed = 'autocorrelation_failed',
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
  | AutocorrelationDialogOpenedEvent
  | AutocorrelationStartedEvent
  | AutocorrelationSucceededEvent
  | AutocorrelationPartiallySucceededEvent
  | AutocorrelationFailedEvent

export type UsageEventWithMetadata = UsageEvent & UsageEventMetadata
