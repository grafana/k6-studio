import { Arch, Platform } from '@/types/electron'

export enum UsageEventName {
  // General
  AppInstalled = 'app_installed',
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

export type UsageEvent = AppInstalledEvent

export type UsageEventWithMetadata = UsageEvent & UsageEventMetadata
