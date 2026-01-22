import { EventType } from '@rrweb/types'
import { z } from 'zod'

import { BrowserReplayEvent } from './schema'

const RecordingStartEventSchema = z.object({
  tag: z.literal('recording-start'),
  payload: z.object({}),
})

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

const CustomReplayEventSchema = z.discriminatedUnion('tag', [
  RecordingStartEventSchema,
  RecordingEndEventSchema,
  PageStartEventSchema,
])

const RrwebCustomEventSchema = z.object({
  type: z.nativeEnum(EventType),
  data: CustomReplayEventSchema,
  timestamp: z.number(),
})

export type RecordingStartEvent = z.infer<typeof RecordingStartEventSchema>
export type RecordingEndEvent = z.infer<typeof RecordingEndEventSchema>
export type PageStartEvent = z.infer<typeof PageStartEventSchema>

export type CustomReplayEvent = z.infer<typeof CustomReplayEventSchema>

type CustomReplayEventMap = {
  [P in CustomReplayEvent['tag']]: Extract<CustomReplayEvent, { tag: P }>
}

export function parseReplayEvent(event: unknown) {
  return RrwebCustomEventSchema.parse(event)
}

export function createReplayEvent<T extends CustomReplayEvent['tag']>(
  tag: T,
  payload: CustomReplayEventMap[T]['payload']
): BrowserReplayEvent {
  return {
    type: EventType.Custom,
    timestamp: Date.now(),
    data: {
      tag,
      payload,
    },
  }
}
