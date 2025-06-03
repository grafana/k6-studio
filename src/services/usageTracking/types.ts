import { Arch, Platform } from '@/types/electron'

export enum UsageTrackingEvents {
  // General
  AppInstalled = 'app_installed',

  // Recorder
  RecordingCreated = 'recording_created',
  RecordingImported = 'recording_imported',

  // Generator
  GeneratorSaved = 'generator_saved',

  // Script
  ScriptExported = 'script_exported',
  ScriptOpened = 'script_opened',
  ScriptValidated = 'script_validated',
  ScriptRunInCloud = 'script_run_in_cloud',

  // User
  UserAuthenticated = 'user_authenticated',
}

export interface UsageTrackingEventMetadata {
  usageStatsId: string
  timestamp: string
  appVersion: string
  os: Platform
  arch: Arch
  userId?: string
  orgId?: string
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

export interface ScriptOpenedEvent {
  type: UsageTrackingEvents.ScriptOpened
}

export interface ScriptValidatedEvent {
  type: UsageTrackingEvents.ScriptValidated
}

export interface ScriptRunInCloudEvent {
  type: UsageTrackingEvents.ScriptRunInCloud
}

export interface UserAuthenticatedEvent {
  type: UsageTrackingEvents.UserAuthenticated
}

export type UsageTrackingEvent =
  | AppInstalledEvent
  | RecordingCreatedEvent
  | GeneratorCreatedEvent
  | ScriptExportedEvent
  | ScriptOpenedEvent
  | ScriptValidatedEvent
  | ScriptRunInCloudEvent
  | UserAuthenticatedEvent

export type UsageTrackingEventWithMetadata = UsageTrackingEvent & {
  metadata: UsageTrackingEventMetadata
}
