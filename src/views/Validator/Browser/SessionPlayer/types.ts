import { PageStartEvent } from '@/main/runner/rrweb'

export type PlaybackState = 'playing' | 'paused' | 'ended'

export type Page = PageStartEvent['payload']
