import { app } from 'electron'
import log from 'electron-log/main'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'

import { getArch, getPlatform } from '@/utils/electron'
import { uuid } from '@/utils/uuid'

import {
  UsageTrackingEvent,
  UsageTrackingEventMetadata,
  UsageTrackingEvents,
  UsageTrackingEventWithMetadata,
} from './types'

// const TRACKING_URL = 'https://stats.grafana.org/k6-studio-usage-report'
const TRACKING_URL = '127.0.0.1'
const INSTALLATION_ID_FILE = path.join(
  app.getPath('userData'),
  '.installation_id'
)
const EVENT_QUEUE_FILE = path.join(app.getPath('userData'), 'event_queue.json')

export class UsageTracker {
  static #instance: UsageTracker

  private constructor() {
    if (process.env.NODE_ENV === 'development') {
      return
    }

    // Flush the event queue on service initialization
    this.flushQueue().catch((error) => {
      log.error('Failed to flush event queue on startup:', error)
    })

    // Track installation on service initialization
    this.#trackInstallation().catch((error) => {
      log.error('Failed to track installation:', error)
    })
  }

  static getInstance() {
    if (!UsageTracker.#instance) {
      UsageTracker.#instance = new UsageTracker()
    }
    return UsageTracker.#instance
  }

  async trackEvent(event: UsageTrackingEvent) {
    if (!k6StudioState.appSettings.telemetry.usageReport) {
      return
    }

    const metadata: UsageTrackingEventMetadata = {
      usageStatsId: await this.#getInstallationId(),
      timestamp: Date(),
      appVersion: app.getVersion(),
      os: getPlatform(),
      arch: getArch(),
    }

    const eventWithMetadata = {
      ...event,
      metadata,
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(eventWithMetadata)
      return
    }

    try {
      await this.#sendEvent(eventWithMetadata)
    } catch (error) {
      log.error('Failed to send event, saving to queue:', error)
      await this.#saveEventToQueue(eventWithMetadata)
    }
  }

  async #sendEvent(event: UsageTrackingEventWithMetadata) {
    if (!k6StudioState.appSettings.telemetry.usageReport) {
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

  async #saveEventToQueue(event: Record<string, unknown>) {
    let queue: Record<string, unknown>[] = []
    try {
      const data = await readFile(EVENT_QUEUE_FILE, 'utf-8')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      queue = JSON.parse(data)
    } catch {
      // File doesn't exist or is invalid, start with an empty queue
    }

    queue.push(event)
    await writeFile(EVENT_QUEUE_FILE, JSON.stringify(queue, null, 2))
  }

  async #trackInstallation() {
    try {
      if (await this.#installationIdExists()) {
        return // Installation already tracked
      }

      const installationId = uuid()
      await writeFile(INSTALLATION_ID_FILE, installationId)

      const event: UsageTrackingEvent = {
        type: UsageTrackingEvents.AppInstalled,
      }

      await this.trackEvent(event)
    } catch (error) {
      log.error('Error tracking installation:', error)
    }
  }

  async #installationIdExists(): Promise<boolean> {
    try {
      await readFile(INSTALLATION_ID_FILE, 'utf-8')
      return true
    } catch {
      return false // File does not exist
    }
  }

  async #getInstallationId(): Promise<string> {
    try {
      return await readFile(INSTALLATION_ID_FILE, 'utf-8')
    } catch {
      throw new Error('Installation ID file is missing')
    }
  }

  async flushQueue() {
    let queue: UsageTrackingEventWithMetadata[] = []
    try {
      const data = await readFile(EVENT_QUEUE_FILE, 'utf-8')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      queue = JSON.parse(data)
    } catch {
      return // No queue to flush
    }

    for (const event of queue) {
      try {
        await this.#sendEvent(event)
      } catch (error) {
        log.error('Failed to flush event:', error)
        return // Stop flushing on first failure
      }
    }

    // Clear the queue if all events were sent successfully
    await writeFile(EVENT_QUEUE_FILE, JSON.stringify([], null, 2))
  }
}
