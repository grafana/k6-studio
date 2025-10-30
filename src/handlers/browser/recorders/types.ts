import { BrowserEvent } from '@/schemas/recording'
import { HighlightSelector } from 'extension/src/messaging/types'
import { EventEmitter } from 'extension/src/utils/events'

import { LaunchBrowserErrorReason } from '../types'

export interface RecordingSessionEventMap {
  error: { error: unknown }
  record: { events: BrowserEvent[] }
  stop: void
}

export interface RecordingSession
  extends EventEmitter<RecordingSessionEventMap> {
  highlightElement(selector: HighlightSelector | null): void
  navigateTo(url: string): void
  stop(): void
}

export class BrowserLaunchError extends Error {
  source: LaunchBrowserErrorReason

  constructor(source: LaunchBrowserErrorReason, cause: unknown) {
    super(
      typeof cause === 'string'
        ? cause
        : cause instanceof Error
          ? cause.message
          : 'An unknown error occurred'
    )

    this.cause = cause
    this.source = source
  }
}
