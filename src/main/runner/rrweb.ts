import { EventType } from '@rrweb/types'
import { z } from 'zod'

import { BrowserReplayEvent } from './schema'

const RecordingEndEventSchema = z.object({
  tag: z.literal('recording-end'),
  payload: z.object({}),
})

const PageStartEventSchema = z.object({
  tag: z.literal('page-start'),
  payload: z.object({
    title: z.string(),
    href: z.string(),
    width: z.number(),
    height: z.number(),
  }),
})

const ActionBeginEventSchema = z.object({
  tag: z.literal('action-begin'),
  payload: z.object({
    actionId: z.string(),
  }),
})

const ActionEndEventSchema = z.object({
  tag: z.literal('action-end'),
  payload: z.object({
    actionId: z.string(),
  }),
})

const CustomReplayEventSchema = z.discriminatedUnion('tag', [
  RecordingEndEventSchema,
  PageStartEventSchema,
  ActionBeginEventSchema,
  ActionEndEventSchema,
])

const RrwebCustomEventSchema = z.object({
  type: z.nativeEnum(EventType),
  data: CustomReplayEventSchema,
  timestamp: z.number(),
})

export type RecordingEndEvent = z.infer<typeof RecordingEndEventSchema>
export type PageStartEvent = z.infer<typeof PageStartEventSchema>

export type CustomReplayEvent = z.infer<typeof CustomReplayEventSchema>

type CustomReplayEventMap = {
  [P in CustomReplayEvent['tag']]: Extract<CustomReplayEvent, { tag: P }>
}

export function parseReplayEvent(event: unknown) {
  return RrwebCustomEventSchema.parse(event)
}

interface CreateReplayEventOptions<T extends keyof CustomReplayEventMap> {
  tag: T
  payload: CustomReplayEventMap[T]['payload']
  timestamp?: number
}

export function createReplayEvent<T extends keyof CustomReplayEventMap>({
  tag,
  payload,
  timestamp,
}: CreateReplayEventOptions<T>): BrowserReplayEvent {
  return {
    type: EventType.Custom,
    timestamp: timestamp ?? Date.now(),
    data: {
      tag,
      payload,
    },
  }
}
