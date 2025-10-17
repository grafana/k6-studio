import { HighlightSelector } from 'extension/src/messaging/types'

export interface RecordingSession {
  highlightElement(selector: HighlightSelector | null): void
  navigateTo(url: string): void
  stop(): void
}
