import { z } from 'zod'

export const HighlightElementMessageSchema = z.object({
  type: z.literal('highlight-elements'),
  selector: z.string().nullable(),
})

export const NavigateToMessageSchema = z.object({
  type: z.literal('navigate-to'),
  url: z.string(),
})

export const ServerMessageSchema = z.discriminatedUnion('type', [
  HighlightElementMessageSchema,
  NavigateToMessageSchema,
])

export const ServerMessageEnvelopeSchema = z.object({
  messageId: z.string(),
  payload: ServerMessageSchema,
})

export type HighlightElementMessage = z.infer<
  typeof HighlightElementMessageSchema
>

export type NavigateToMessage = z.infer<typeof NavigateToMessageSchema>

export type ServerMessage = z.infer<typeof ServerMessageSchema>
export type ServerMessageEnvelope = z.infer<typeof ServerMessageEnvelopeSchema>
