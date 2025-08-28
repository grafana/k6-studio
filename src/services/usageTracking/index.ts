import { app } from 'electron'
import log from 'electron-log/main'
import { writeFile, readFile } from 'fs/promises'

import { TRACKING_URL, INSTALLATION_ID_FILE } from '@/constants/usage'
import { getProfileData } from '@/handlers/auth/fs'
import { getArch, getPlatform } from '@/utils/electron'
import { uuid } from '@/utils/uuid'

import {
  UsageEvent,
  UsageEventMetadata,
  UsageEventName,
  UsageEventWithMetadata,
} from './types'

export async function initEventTracking() {
  if (process.env.NODE_ENV === 'development') {
    return
  }

  try {
    await trackInstallation()
  } catch (error) {
    log.error('Failed to track installation:', error)
  }
}

export function trackEvent(event: UsageEvent) {
  if (!k6StudioState.appSettings.telemetry.usageReport) {
    return
  }

  createEventWithMetadata(event)
    .then(sendEvent)
    .catch((error) => log.error('Failed to send usage statistic event:', error))
}

async function sendEvent(event: UsageEventWithMetadata) {
  if (!k6StudioState.appSettings.telemetry.usageReport) {
    return
  }

  const payloadWithLoginState = {
    isLoggedIn: await getLoginState(),
    ...('payload' in event && event.payload),
  }

  const serializedEvent = {
    ...event,
    payload: JSON.stringify(payloadWithLoginState),
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(serializedEvent)
    return
  }

  const response = await fetch(TRACKING_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serializedEvent),
  })

  if (!response.ok) {
    throw new Error(`Failed to send event: ${response.statusText}`)
  }
}

async function createEventWithMetadata(
  event: UsageEvent
): Promise<UsageEventWithMetadata> {
  const metadata: UsageEventMetadata = {
    usageStatsId: await getInstallationId(),
    timestamp: Date(),
    appVersion: app.getVersion(),
    os: getPlatform(),
    arch: getArch(),
  }

  return {
    ...event,
    ...metadata,
  }
}

async function getInstallationId(): Promise<string> {
  try {
    return await readFile(INSTALLATION_ID_FILE, 'utf-8')
  } catch {
    throw new Error('Installation ID file is missing')
  }
}

async function installationIdExists(): Promise<boolean> {
  try {
    await readFile(INSTALLATION_ID_FILE, 'utf-8')
    return true
  } catch {
    return false // File does not exist
  }
}

async function trackInstallation() {
  try {
    if (await installationIdExists()) {
      return
    }

    const installationId = uuid()
    await writeFile(INSTALLATION_ID_FILE, installationId)

    trackEvent({
      event: UsageEventName.AppInstalled,
    })
  } catch (error) {
    log.error('Error tracking installation:', error)
  }
}

async function getLoginState(): Promise<boolean> {
  try {
    const { profiles } = await getProfileData()
    return Object.keys(profiles.stacks).length !== 0
  } catch (error) {
    log.error('Error getting login state:', error)
    return false
  }
}
