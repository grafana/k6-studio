import { Arch, Platform } from '@/types/electron'

const PREFIX = 'grafana_k6_studio'

export const UsageEventName = {
  // General
  AppInstalled: `${PREFIX}_app_installed`,

  // Recorder
  RecordingCreated: `${PREFIX}_recording_created`,

  // Generator
  GeneratorSaved: `${PREFIX}_generator_saved`,

  // Script
  ScriptExported: `${PREFIX}_script_exported`,
  ScriptValidated: `${PREFIX}_script_validated`,
  ScriptRunInCloud: `${PREFIX}_script_run_in_cloud`,
} as const

export interface UsageEventMetadata {
  usageStatsId: string
  timestamp: string
  appVersion: string
  os: Platform
  arch: Arch
}

export interface AppInstalledEvent {
  event: typeof UsageEventName.AppInstalled
}

export interface RecordingCreatedEvent {
  event: typeof UsageEventName.RecordingCreated
}

export interface GeneratorCreatedEvent {
  event: typeof UsageEventName.GeneratorSaved
}

export interface ScriptExportedEvent {
  event: typeof UsageEventName.ScriptExported
}

export interface ScriptValidatedEvent {
  event: typeof UsageEventName.ScriptValidated
}

export interface ScriptRunInCloudEvent {
  event: typeof UsageEventName.ScriptRunInCloud
}

export type UsageEvent =
  | AppInstalledEvent
  | RecordingCreatedEvent
  | GeneratorCreatedEvent
  | ScriptExportedEvent
  | ScriptValidatedEvent
  | ScriptRunInCloudEvent

export type UsageEventWithMetadata = UsageEvent & UsageEventMetadata
