import { z } from 'zod'

export const PingEnvelopeSchema = z.object({
  type: z.literal('ping'),
})

export const EventEnvelopeSchema = z.object({
  type: z.literal('event'),
  event: z.unknown(),
})

export const CallEnvelopeSchema = z.object({
  type: z.literal('call'),
  id: z.string(),
  method: z.string(),
  params: z.array(z.unknown()),
})

export const ReturnEnvelopeSchema = z.object({
  type: z.literal('return'),
  id: z.string(),
  result: z.unknown(),
})

export const ErrorEnvelopeSchema = z.object({
  type: z.literal('error'),
  id: z.string(),
  message: z.string(),
})

export const MessageEnvelopeSchema = z.discriminatedUnion('type', [
  PingEnvelopeSchema,
  CallEnvelopeSchema,
  ReturnEnvelopeSchema,
  ErrorEnvelopeSchema,
  EventEnvelopeSchema,
])

export type PingEnvelope = z.infer<typeof PingEnvelopeSchema>
export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>
export type CallEnvelope = z.infer<typeof CallEnvelopeSchema>
export type ReturnEnvelope = z.infer<typeof ReturnEnvelopeSchema>
export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>
