import { PageStartEvent } from '@/main/runner/rrweb'

export type PlaybackState = 'playing' | 'paused' | 'ended'

export type Page = PageStartEvent['payload']

export interface Time {
  start: number
  end: number
  current: number
  total: number
}
