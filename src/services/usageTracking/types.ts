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

  // Script
  ScriptExported = 'script_exported',
  ScriptValidated = 'script_validated',
  ScriptRunInCloud = 'script_run_in_cloud',
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
}

interface ScriptExportedEvent {
  event: UsageEventName.ScriptExported
}

interface ScriptValidatedEvent {
  event: UsageEventName.ScriptValidated
}

interface ScriptRunInCloudEvent {
  event: UsageEventName.ScriptRunInCloud
}

export type UsageEvent =
  | AppInstalledEvent
  | UserLoggedInEvent
  | RecordingCreatedEvent
  | RecordingImportedEvent
  | GeneratorCreatedEvent
  | GeneratorUpdatedEvent
  | ScriptExportedEvent
  | ScriptValidatedEvent
  | ScriptRunInCloudEvent

export type UsageEventWithMetadata = UsageEvent & UsageEventMetadata
