import { z } from 'zod'

export const GotoActionSchema = z.object({
  type: z.literal('goto'),
  url: z.string(),
})

export const ClickActionSchema = z.object({
  type: z.literal('click'),
  selector: z.string(),
})

export const BrowserActionSchema = z.discriminatedUnion('type', [
  GotoActionSchema,
  ClickActionSchema,
])

export const ActionBeginEventSchema = z.object({
  eventId: z.string(),
  timestamp: z.number(),
  action: BrowserActionSchema,
})

export const ActionSuccessSchema = z.object({
  type: z.literal('success'),
  returnValue: z.unknown().optional(),
})

export const ActionErrorSchema = z.object({
  type: z.literal('error'),
  error: z.string(),
})

export const ActionResult = z.discriminatedUnion('type', [
  ActionSuccessSchema,
  ActionErrorSchema,
])

export const ActionEndEventSchema = ActionBeginEventSchema.extend({
  result: ActionResult,
})

export type ActionBeginEvent = z.infer<typeof ActionBeginEventSchema>
export type ActionEndEvent = z.infer<typeof ActionEndEventSchema>

export type ActionResult = z.infer<typeof ActionResult>

export type GotoAction = z.infer<typeof GotoActionSchema>
export type ClickAction = z.infer<typeof ClickActionSchema>
export type BrowserAction = z.infer<typeof BrowserActionSchema>
