import { PageStartEvent } from '@/main/runner/rrweb'

export type PlaybackState = 'playing' | 'paused' | 'ended'

export type Page = PageStartEvent['payload']

export interface Time {
  /**
   * The starting timestamp of the session.
   */
  start: number

  /**
   * The end timestamp of the session
   */
  end: number

  /**
   * The current time in milliseconds relative to the session start
   */
  current: number

  /**
   * The total duration in milliseconds relative to the session start
   */
  total: number
}
