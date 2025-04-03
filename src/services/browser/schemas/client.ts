import { z } from 'zod'

import { BrowserEventSchema } from '@/schemas/recording'

// Client messages
export const EventsCapturedMessageSchema = z.object({
  type: z.literal('events-captured'),
  events: z.array(BrowserEventSchema),
})

export const ClientMessageSchema = EventsCapturedMessageSchema

export const ClientMessageEnvelopeSchema = z.object({
  messageId: z.string(),
  payload: ClientMessageSchema,
})

export type EventsCapturedMessage = z.infer<typeof EventsCapturedMessageSchema>

export type ClientMessage = z.infer<typeof ClientMessageSchema>
export type ClientMessageEnvelope = z.infer<typeof ClientMessageEnvelopeSchema>
