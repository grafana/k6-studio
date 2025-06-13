import { Arch, Platform } from '@/types/electron'

export enum UsageTrackingEvents {
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

export interface UsageTrackingEventMetadata {
  usageStatsId: string
  timestamp: string
  appVersion: string
  os: Platform
  arch: Arch
}

export interface AppInstalledEvent {
  type: UsageTrackingEvents.AppInstalled
}

export interface RecordingCreatedEvent {
  type: UsageTrackingEvents.RecordingCreated
}

export interface GeneratorCreatedEvent {
  type: UsageTrackingEvents.GeneratorSaved
}

export interface ScriptExportedEvent {
  type: UsageTrackingEvents.ScriptExported
}

export interface ScriptValidatedEvent {
  type: UsageTrackingEvents.ScriptValidated
}

export interface ScriptRunInCloudEvent {
  type: UsageTrackingEvents.ScriptRunInCloud
}

export type UsageTrackingEvent =
  | AppInstalledEvent
  | RecordingCreatedEvent
  | GeneratorCreatedEvent
  | ScriptExportedEvent
  | ScriptValidatedEvent
  | ScriptRunInCloudEvent

export type UsageTrackingEventWithMetadata = UsageTrackingEvent &
  UsageTrackingEventMetadata
