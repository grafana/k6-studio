import { HighlightSelector } from 'extension/src/messaging/types'
import { EventEmitter } from 'extension/src/utils/events'

export interface RecordingSessionEventMap {
  stop: void
}

export interface RecordingSession
  extends EventEmitter<RecordingSessionEventMap> {
  highlightElement(selector: HighlightSelector | null): void
  navigateTo(url: string): void
  stop(): void
}
