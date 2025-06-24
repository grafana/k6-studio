import { Arch, Platform } from '@/types/electron'

export enum UsageEventName {
  // General
  AppInstalled = 'app_installed',

  // Recorder
  RecordingCreated = 'recording_created',

  // Generator
  GeneratorSaved = 'generator_saved',

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

export interface GeneratorCreatedEvent {
  event: UsageEventName.GeneratorSaved
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
  | GeneratorCreatedEvent
  | ScriptExportedEvent
  | ScriptValidatedEvent
  | ScriptRunInCloudEvent

export type UsageEventWithMetadata = UsageEvent & UsageEventMetadata
