import { Arch, Platform } from '@/types/electron'

export enum UsageEventName {
  // General
  AppInstalled = 'app_installed',

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

export interface AppInstalledEvent {
  event: UsageEventName.AppInstalled
}

export interface RecordingCreatedEvent {
  event: UsageEventName.RecordingCreated
}

export interface RecordingImportedEvent {
  event: UsageEventName.RecordingImported
}

export interface GeneratorCreatedEvent {
  event: UsageEventName.GeneratorCreated
}

export interface GeneratorUpdatedEvent {
  event: UsageEventName.GeneratorUpdated
}

export interface ScriptExportedEvent {
  event: UsageEventName.ScriptExported
}

export interface ScriptValidatedEvent {
  event: UsageEventName.ScriptValidated
}

export interface ScriptRunInCloudEvent {
  event: UsageEventName.ScriptRunInCloud
}

export type UsageEvent =
  | AppInstalledEvent
  | RecordingCreatedEvent
  | RecordingImportedEvent
  | GeneratorCreatedEvent
  | GeneratorUpdatedEvent
  | ScriptExportedEvent
  | ScriptValidatedEvent
  | ScriptRunInCloudEvent

export type UsageEventWithMetadata = UsageEvent & UsageEventMetadata
