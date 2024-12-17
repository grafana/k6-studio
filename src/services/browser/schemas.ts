import { BrowserEventSchema } from '@/schemas/recording'
import { z } from 'zod'

export const EventsCapturedMessage = z.object({
  type: z.literal('events-captured'),
  events: z.array(BrowserEventSchema),
})

export const MessagePayload = EventsCapturedMessage

export const MessageEnvelope = z.object({
  messageId: z.string(),
  payload: MessagePayload,
})

export type EventsCapturedMessage = z.infer<typeof EventsCapturedMessage>
export type MessagePayload = z.infer<typeof MessagePayload>
export type MessageEnvelope = z.infer<typeof MessageEnvelope>
