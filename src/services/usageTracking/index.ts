import { app } from 'electron'
import log from 'electron-log/main'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'

import { getArch, getPlatform } from '@/utils/electron'
import { uuid } from '@/utils/uuid'

import {
  UsageEvent,
  UsageEventMetadata,
  UsageEventName,
  UsageEventWithMetadata,
} from './types'

const TRACKING_URL = 'https://stats.grafana.org/k6-studio-usage-report'
const INSTALLATION_ID_FILE = path.join(
  app.getPath('userData'),
  '.installation_id'
)

export class UsageTracker {
  static async init() {
    if (process.env.NODE_ENV === 'development') {
      return
    }

    try {
      await this.trackInstallation()
    } catch (error) {
      log.error('Failed to track installation:', error)
    }
  }

  static track(event: UsageEvent) {
    ;(async () => {
      if (!k6StudioState.appSettings.telemetry.usageReport) {
        return
      }

      const eventWithMetadata = await this.createEventWithMetadata(event)

      try {
        await this.sendEvent(eventWithMetadata)
      } catch (error) {
        log.error('Failed to send usage statistic event:', error)
      }
    })()
  }

  private static async sendEvent(event: UsageEventWithMetadata) {
    if (!k6StudioState.appSettings.telemetry.usageReport) {
      return
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(event)
      return
    }

    const response = await fetch(TRACKING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error(`Failed to send event: ${response.statusText}`)
    }
  }

  private static async trackInstallation() {
    try {
      if (await this.installationIdExists()) {
        return // Installation already tracked
      }

      const installationId = uuid()
      await writeFile(INSTALLATION_ID_FILE, installationId)

      this.track({
        event: UsageEventName.AppInstalled,
      })
    } catch (error) {
      log.error('Error tracking installation:', error)
    }
  }

  private static async installationIdExists(): Promise<boolean> {
    try {
      await readFile(INSTALLATION_ID_FILE, 'utf-8')
      return true
    } catch {
      return false // File does not exist
    }
  }

  private static async getInstallationId(): Promise<string> {
    try {
      return await readFile(INSTALLATION_ID_FILE, 'utf-8')
    } catch {
      throw new Error('Installation ID file is missing')
    }
  }

  private static async createEventWithMetadata(
    event: UsageEvent
  ): Promise<UsageEventWithMetadata> {
    const metadata: UsageEventMetadata = {
      usageStatsId: await this.getInstallationId(),
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
}
